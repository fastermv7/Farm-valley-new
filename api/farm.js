// Generated mobile server package. No credentials are bundled.
const modules={"server/store":function(module,exports){
'use strict';
const key='farm-valley:settings:1';
const defaults={version:0,maintenance:false,upgradePrices:{},products:{},map:null};
const available=()=>Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
async function command(...args){
  const r=await fetch(process.env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{
    Authorization:'Bearer '+process.env.UPSTASH_REDIS_REST_TOKEN,'Content-Type':'application/json'
  },body:JSON.stringify(args)});
  if(!r.ok) throw Error('Database unavailable');
  const value=await r.json(); if(value.error) throw Error('Database unavailable'); return value.result;
}
async function read(){return JSON.parse(await command('GET',key)) || defaults;}
async function update(old,next){
  const lua="local v=redis.call('GET',KEYS[1]); if (v and cjson.decode(v).version or 0) ~= tonumber(ARGV[1]) then return 0 end; redis.call('SET',KEYS[1],ARGV[2]); return 1";
  return command('EVAL',lua,1,key,old,JSON.stringify(next));
}
module.exports={defaults,available,command,read,update};

},
"server/auth":function(module,exports){
'use strict';
const {createHmac,randomBytes,timingSafeEqual,createHash}=require('node:crypto');
const {APP_ORIGIN:origin,GITHUB_CLIENT_ID:client,GITHUB_CLIENT_SECRET:secret,ADMIN_GITHUB_ID:admin,SESSION_SECRET:key}=process.env;
const configured=()=>/^https:\/\/[^/?#]+$/.test(origin||'') && client && secret && /^\d+$/.test(admin||'') && key?.length>=32;
const nonce=()=>randomBytes(32).toString('base64url');
function equal(a,b){const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length && timingSafeEqual(x,y);}
const mac=s=>createHmac('sha256',key).update(s).digest('base64url');
function token(value){const body=Buffer.from(JSON.stringify(value)).toString('base64url');return body+'.'+mac(body);}
function decode(raw){try{const [body,tag]=raw.split('.');if(!equal(mac(body),tag))return null;
  const v=JSON.parse(Buffer.from(body,'base64url'));return v.exp>Date.now()?v:null;}catch{return null;}}
function cookie(req,name){return (req.headers.cookie||'').split('; ').find(s=>s.startsWith(name+'='))?.slice(name.length+1)||'';}
const set=(name,v,seconds)=>name+'='+v+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age='+seconds;
function valid(req){const s=configured()&&decode(cookie(req,'__Host-farm-session'));return s?.type==='admin' && s.id===admin;}
function redirect(res,url){return res.redirect(302,url);}
async function login(req,res){
  const state=nonce(),verifier=nonce();
  res.setHeader('Set-Cookie',set('__Host-farm-flow',token({type:'flow',state,verifier,exp:Date.now()+600000}),600));
  const url=new URL('https://github.com/login/oauth/authorize');
  url.search=new URLSearchParams({client_id:client,redirect_uri:origin+'/api/admin?action=callback',state,
    code_challenge:createHash('sha256').update(verifier).digest('base64url'),code_challenge_method:'S256'});return redirect(res,url.href);
}
async function callback(req,res){
  const flow=decode(cookie(req,'__Host-farm-flow'));
  res.setHeader('Set-Cookie',set('__Host-farm-flow','',0));
  if(flow?.type!=='flow'||!equal(flow.state,req.query.state)||typeof req.query.code!=='string')return res.status(403).end();
  const r=await fetch('https://github.com/login/oauth/access_token',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},
    body:JSON.stringify({client_id:client,client_secret:secret,code:req.query.code,redirect_uri:origin+'/api/admin?action=callback',code_verifier:flow.verifier})});
  const t=await r.json(); if(!r.ok||!t.access_token)return res.status(403).end();
  const user=await fetch('https://api.github.com/user',{headers:{Authorization:'Bearer '+t.access_token,'User-Agent':'Farm-Valley'}});
  if(!user.ok||String((await user.json()).id)!==admin)return res.status(403).end();
  res.setHeader('Set-Cookie',[set('__Host-farm-flow','',0),set('__Host-farm-session',token({type:'admin',id:admin,exp:Date.now()+3600000}),3600)]);
  return redirect(res,'/admin');
}
module.exports={valid,configured,login,callback,set,origin};

},
"server/map":function(module,exports){
'use strict';

const FarmData = (() => {
  const crops = {
    wheat: { name: 'Bug‘doy', duration: 12, level: 1, sale: 3 },
    corn: { name: 'Makkajo‘xori', duration: 25, level: 2, sale: 5 },
    carrot: { name: 'Sabzi', duration: 40, level: 3, sale: 7 },
    pumpkin: { name: 'Qovoq', duration: 60, level: 4, sale: 10 }
  };
  const items = {
    ...crops, flour: { name: 'Un', sale: 6 }, egg: { name: 'Tuxum', sale: 8 }, milk: { name: 'Sut', sale: 13 },
    wool: { name: 'Jun', sale: 17 }, bread: { name: 'Non', sale: 12 },
    feed: { name: 'Yem', sale: 4 }
  };
  const buildings = {
    field: { name: 'Dala', price: 15, level: 1, description: 'Ekin ekish uchun yer' },
    chicken: { name: 'Tovuqxona', price: 65, level: 1, recipe: { feed: 1 }, output: 'egg', count: 2, duration: 25 },
    bakery: { name: 'Nonvoyxona', price: 75, level: 1, recipe: { flour: 1 }, output: 'bread', count: 1, duration: 20 },
    windmill: { name: 'Un tegirmoni', price: 95, level: 1, recipe: { wheat: 2 }, output: 'flour', count: 1, duration: 22 },
    mill: { name: 'Yem tegirmoni', price: 85, level: 1, recipe: { wheat: 1 }, output: 'feed', count: 3, duration: 18 },
    cow: { name: 'Molxona', price: 95, level: 2, recipe: { feed: 1 }, output: 'milk', count: 2, duration: 40 },
    sheep: { name: 'Qo‘yxona', price: 130, level: 3, recipe: { feed: 1 }, output: 'wool', count: 2, duration: 55 },
    flowers: { name: 'Gulzor', price: 18, level: 1, description: 'Ferma bezagi' },
    tree: { name: 'Mevali daraxt', price: 25, level: 1, description: 'Ferma bezagi' },
    fence: { name: 'Yog‘och panjara', price: 12, level: 1, description: 'Ferma bezagi' }
  };
  const orders = [
    { id: 'tea', name: 'Choyxona', need: { wheat: 3 }, coins: 24, xp: 10, level: 1 },
    { id: 'breakfast', name: 'Nonushta', need: { egg: 2, bread: 1 }, coins: 42, xp: 14, level: 1 },
    { id: 'market', name: 'Bozor savati', need: { corn: 3, wheat: 1 }, coins: 44, xp: 16, level: 2 },
    { id: 'dairy', name: 'Sut do‘koni', need: { milk: 2, bread: 1 }, coins: 58, xp: 18, level: 2 },
    { id: 'garden', name: 'Sabzavot savati', need: { carrot: 3, corn: 2 }, coins: 65, xp: 21, level: 3 },
    { id: 'weaver', name: 'To‘quvchi', need: { wool: 2 }, coins: 67, xp: 23, level: 3 },
    { id: 'autumn', name: 'Kuzgi bozor', need: { pumpkin: 3, carrot: 1 }, coins: 90, xp: 30, level: 4 }
  ];
  const expansions = [
    { name: 'Sharqiy yaylov', price: 100, level: 2, x: 11, y: 4 },
    { name: 'Janubiy bog‘', price: 170, level: 3, x: 5, y: 11 }
  ];
  const initialObjects = [
    ...[4, 5].flatMap(y => [3, 4, 5].map(x => ({ kind: 'field', x, y }))),
    { kind: 'house', x: 4, y: 2 }, { kind: 'bakery', x: 7, y: 4 },
    { kind: 'mill', x: 8, y: 3 }, { kind: 'chicken', x: 8, y: 6 },
    { kind: 'barn', x: 3, y: 8 }, { kind: 'orders', x: 6, y: 8 },
    { kind: 'flowers', x: 2, y: 3 }, { kind: 'fence', x: 4, y: 8 },
    {kind:'windmill',x:2,y:6}, {kind:'cow',x:9,y:5}, {kind:'sheep',x:7,y:8}
  ];
  function zone(x, y) {
    if (x >= 10 && x <= 13 && y >= 2 && y <= 9) return 1;
    if (x >= 2 && x <= 9 && y >= 10 && y <= 13) return 2;
    return x >= 2 && x <= 9 && y >= 2 && y <= 9 ? 0 : -1;
  }
  function path(x, y) {
    return (y === 7 && x >= 2 && x <= 9) || (x === 6 && y >= 2 && y <= 7)
      || (y === 3 && x >= 4 && x <= 8);
  }
  const caps = { house:10, barn:11, chicken:5, sheep:5, cow:5, bakery:5, windmill:10, mill:10 };
  const plots = [6,8,10,13,16,20,24,29,34,40];
  return { caps, plots, crops, items, buildings, orders, expansions, initialObjects, zone, path };
})();

'use strict';

const FarmWorld = (() => {
  const min = 0;
  const max = 47;
  const key = (x, y) => x + ',' + y;
  const inBounds = (x, y) => Number.isInteger(x) && Number.isInteger(y) &&
    x >= min && y >= min && x <= max && y <= max;
  const validKey = value => {
    if (typeof value !== 'string' || !/^\d{1,2},\d{1,2}$/.test(value)) return false;
    const [x, y] = value.split(',').map(Number);
    return inBounds(x, y) && key(x, y) === value;
  };
  const kinds = Object.freeze({
    ...Object.fromEntries(Object.entries(FarmData.buildings).map(([id, building]) => [id, building.name])),
    house: 'Ferma uyi', barn: 'Ombor', orders: 'Buyurtmalar taxtasi', rock: 'Tosh'
  });
  const essential = new Set(['house', 'barn', 'orders']);
  const empty = () => ({ tiles: {}, areas: [] });
  const clone = value => JSON.parse(JSON.stringify(value));
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  const ordered = value => Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));

  function parse(value) {
    if (!record(value) || !record(value.tiles) || !Array.isArray(value.areas)) throw Error('Xarita formati xato.');
    const tiles = {};
    for (const [cell, type] of Object.entries(value.tiles)) {
      if (!validKey(cell) || !['grass', 'road', 'water'].includes(type)) throw Error('Xaritada yaroqsiz katak bor.');
      tiles[cell] = type;
    }
    if (value.areas.length > (max + 1) ** 2 || !value.areas.every(validKey)) throw Error('Yangi hudud koordinatasi xato.');
    return { tiles: ordered(tiles), areas: [...new Set(value.areas)].sort() };
  }

  function wild(x,y){
    const lake=((x-28)/7)**2+((y-19)/5)**2 < 1;
    const channel=x>=30 && Math.abs(y-(19+Math.sin(x*.31)*2))<1.4;
    return lake || channel ? 'water' : 'grass';
  }
  const ground = (map,x,y) => map.tiles[key(x,y)] || (FarmData.path(x,y)?'road':wild(x,y));
  const areaIndex = new WeakMap();
  function containsArea(areas,cell){
    let set=areaIndex.get(areas);
    if(!set || set.size!==areas.length){set=new Set(areas);areaIndex.set(areas,set);}
    return set.has(cell);
  }
  const open = (map, zones, x, y) => inBounds(x, y) &&
    (Boolean(zones[FarmData.zone(x, y)]) || containsArea(map.areas,key(x, y)));
  const buildable = (map, zones, x, y) => open(map, zones, x, y) && ground(map, x, y) === 'grass';

  function layout(state) {
    return state.objects.map(({ id, kind, x, y }) => ({ id, kind, x, y })).sort((a, b) => a.id - b.id);
  }
  function fingerprint(state) {
    return JSON.stringify([parse(state.landscape), layout(state)]);
  }
  function draft(state) {
    return { format: 'farm-valley-map', version: 1, base: fingerprint(state),
      landscape: clone(state.landscape), objects: layout(state) };
  }
  function parseDraft(value) {
    if (value?.format !== 'farm-valley-map' || value.version !== 1 ||
        typeof value.base !== 'string' || value.base.length > 250000 ||
        !Array.isArray(value.objects) || value.objects.length > (max + 1) ** 2) {
      throw Error('Farm Valley xarita fayli kerak.');
    }
    const landscape = parse(value.landscape);
    const ids = new Set();
    const cells = new Set();
    const objects = value.objects.map(o => {
      if (!record(o) || !Number.isSafeInteger(o.id) || !o.id || !Object.hasOwn(kinds, o.kind) ||
          !inBounds(o.x, o.y) || ids.has(o.id) || cells.has(key(o.x, o.y))) {
        throw Error('Xaritada noma’lum obyekt yoki ustma-ust joylashgan katak bor.');
      }
      ids.add(o.id);
      cells.add(key(o.x, o.y));
      return { id: o.id, kind: o.kind, x: o.x, y: o.y };
    });
    return { format: value.format, version: 1, base: value.base, landscape, objects };
  }
  function checkDraft(map, state) {
    if (map.base !== fingerprint(state)) map = mergeDraft(map, state);
    const live = new Map(state.objects.map(o => [o.id, o]));
    const kept = new Set(map.objects.map(o => o.id));
    if (!map.objects.some(o => o.kind === 'field')) throw Error('Fermada kamida bitta dala qolishi kerak.');
    for (const old of state.objects) {
      if (!kept.has(old.id) && (essential.has(old.kind) || old.ready || old.crop)) {
        throw Error(kinds[old.kind] + ' ishlayotgani yoki ferma uchun zarurligi sababli o‘chirilmaydi.');
      }
    }
    for (const o of map.objects) {
      const old = live.get(o.id);
      if ((o.id > 0 && old?.kind !== o.kind) || (o.id < 0 && essential.has(o.kind))) {
        throw Error('Xaritada saqlangan fermaga mos kelmaydigan obyekt bor.');
      }
      const samePlace = old?.x === o.x && old.y === o.y;
      if (samePlace && ground(map.landscape, o.x, o.y) === ground(state.landscape, o.x, o.y) &&
          open(map.landscape, state.zones, o.x, o.y)) continue;
      if (!buildable(map.landscape, state.zones, o.x, o.y)) {
        throw Error(kinds[o.kind] + ' ochiq va quruq katakda joylashishi kerak.');
      }
    }
    return map;
  }

  function mergeDraft(map, state) {
    let base;
    try {
      const [landscape, objects] = JSON.parse(map.base);
      base = parseDraft({ ...map, landscape, objects });
      if (base.objects.some(o => o.id < 1)) throw Error();
    } catch { throw Error('Qoralamaning boshlang‘ich xaritasi yaroqsiz.'); }
    const conflict = () => Error('Qoralama va joriy ferma bir joyda o‘zgargan. Joylashuvni tekshiring yoki yangi qoralama oching.');
    const landscape = clone(state.landscape);
    const baseObjects = new Map(base.objects.map(o => [o.id, o]));
    const edited = new Map(map.objects.map(o => [o.id, o]));
    const current = new Map(layout(state).map(o => [o.id, o]));
    const same = (a, b) => a === b || (a && b && a.kind === b.kind && a.x === b.x && a.y === b.y);
    for (const [id, old] of baseObjects) {
      const next = edited.get(id);
      const live = current.get(id);
      if (same(next, old) || same(next, live)) continue;
      if (!same(live, old)) throw conflict();
      if (next) current.set(id, next);
      else current.delete(id);
    }
    for (const [id, next] of edited) {
      if (id < 0) current.set(id, next);
      else if (!baseObjects.has(id)) throw conflict();
    }
    for (const cell of new Set([...Object.keys(base.landscape.tiles), ...Object.keys(map.landscape.tiles)])) {
      const old = base.landscape.tiles[cell];
      const next = map.landscape.tiles[cell];
      const live = landscape.tiles[cell];
      if (next === old || next === live) continue;
      if (live !== old) throw conflict();
      if (next) landscape.tiles[cell] = next;
      else delete landscape.tiles[cell];
    }
    const areas = new Set(landscape.areas);
    for (const cell of base.landscape.areas) if (!map.landscape.areas.includes(cell)) areas.delete(cell);
    for (const cell of map.landscape.areas) if (!base.landscape.areas.includes(cell)) areas.add(cell);
    landscape.areas = [...areas];
    return parseDraft({ ...map, base: fingerprint(state), landscape, objects: [...current.values()] });
  }

  return { min, max, key, inBounds, kinds, essential, empty, clone, record, parse, ground, open,
    wild, buildable, draft, parseDraft, checkDraft };
})();

'use strict';

const FarmSave = (() => {
  const KEY = 'farm-valley-save-v1';
  const PREVIOUS = 'farm-valley-save-v2-previous';
  const safeInt = value => Number.isSafeInteger(value) && value >= 0;
  const positive = value => Number.isSafeInteger(value) && value > 0;

  function parse(value) {
    if (!FarmWorld.record(value) || ![1, 2, 3].includes(value.version) || !safeInt(value.coins) ||
        !safeInt(value.xp) || !positive(value.nextId) || !Array.isArray(value.objects) ||
        !FarmWorld.record(value.inventory) || !FarmWorld.record(value.orderReady) ||
        !Array.isArray(value.zones) || value.zones.length !== 3 || value.zones[0] !== true ||
        !value.zones.every(flag => typeof flag === 'boolean') ||
        !safeInt(value.lesson) || value.lesson > 4 || typeof value.sound !== 'boolean' || typeof value.motion !== 'boolean') {
      throw Error('O‘yin progressi fayli yaroqsiz.');
    }
    const landscape = value.version >= 2 ? FarmWorld.parse(value.landscape) : FarmWorld.empty();
    const inventory = {};
    for (const [kind, count] of Object.entries(value.inventory)) {
      if (!Object.hasOwn(FarmData.items, kind) || !safeInt(count)) throw Error('Ombor ma’lumoti yaroqsiz.');
      inventory[kind] = count;
    }
    const orderReady = {};
    for (const [id, ready] of Object.entries(value.orderReady)) {
      if (!FarmData.orders.some(order => order.id === id) || !safeInt(ready)) throw Error('Buyurtma ma’lumoti yaroqsiz.');
      orderReady[id] = ready;
    }
    const ids = new Set();
    const cells = new Set();
    const presentKinds = new Set();
    const objects = value.objects.map(o => {
      if (!FarmWorld.record(o) || !positive(o.id) || o.id >= value.nextId || ids.has(o.id) ||
          !Object.hasOwn(FarmWorld.kinds, o.kind) || !FarmWorld.open(landscape, value.zones, o.x, o.y) ||
          cells.has(FarmWorld.key(o.x, o.y)) || FarmWorld.ground(landscape, o.x, o.y) === 'water') {
        throw Error('Saqlangan obyekt joylashuvi yaroqsiz.');
      }
      ids.add(o.id);
      cells.add(FarmWorld.key(o.x, o.y));
      presentKinds.add(o.kind);
      const clean = { id: o.id, kind: o.kind, x: o.x, y: o.y };
      if (FarmData.caps[o.kind]) {
        clean.rank = o.rank ?? 1;
        if (!positive(clean.rank) || clean.rank > FarmData.caps[o.kind]) throw Error('Bino darajasi xato.');
      }
      if (o.kind === 'field' && o.crop !== undefined) {
        if (!Object.hasOwn(FarmData.crops, o.crop) || !safeInt(o.started) || !positive(o.ready) || o.ready <= o.started) {
          throw Error('Ekin taymeri yaroqsiz.');
        }
        Object.assign(clean, { crop: o.crop, started: o.started, ready: o.ready });
      } else if (o.ready !== undefined) {
        if (!FarmData.buildings[o.kind]?.output || !positive(o.ready)) throw Error('Ishlab chiqarish taymeri yaroqsiz.');
        clean.ready = o.ready;
        if(o.batch!==undefined) {
          if(!positive(o.batch)||o.batch>10000)throw Error('Mahsulot miqdori xato.');
          clean.batch=o.batch;
        }
      }
      return clean;
    });
    if (![...FarmWorld.essential, 'field'].every(kind => presentKinds.has(kind))) throw Error('Fermaning zarur obyektlari yetishmaydi.');
    const c = value.camera;
    const camera = c && [c.x, c.y, c.zoom].every(Number.isFinite) && c.zoom >= .68 && c.zoom <= 2.45 ?
      { x: c.x, y: c.y, zoom: c.zoom } : { x: -12, y: 229, zoom: 1 };
    const skins = value.skins ?? [0], skin = value.skin ?? 0;
    if (!Array.isArray(skins) || !skins.includes(0) || !skins.includes(skin) ||
        skins.some(n => !Number.isInteger(n) || n < 0 || n > 3)) throw Error('Fermer kiyimi xato.');
    const farmer = value.farmer || {x:6,y:7};
    if (!FarmWorld.inBounds(farmer.x,farmer.y)) throw Error('Fermer joyi xato.');
    const published=value.published?FarmWorld.parse(value.published):null;
    return { version: 3, published, skins:[...new Set(skins)], skin, farmer:{x:farmer.x,y:farmer.y}, coins: value.coins, xp: value.xp, inventory, objects,
      nextId: value.nextId, zones: [...value.zones], orderReady, lesson: value.lesson,
      sound: value.sound, motion: value.motion, lowQuality: value.lowQuality === true, landscape, camera };
  }

  function create(storage) {
    let previousRaw = null;
    let primaryRaw;
    let recovered = false;
    let problem = false;
    function load() {
      for (const key of [KEY, PREVIOUS]) {
        try {
          const raw = storage?.getItem(key);
          if (key === KEY) primaryRaw = raw;
          if (!raw) continue;
          const state = parse(JSON.parse(raw));
          previousRaw = raw;
          recovered = key === PREVIOUS;
          return state;
        } catch { problem = true; }
      }
      return null;
    }
    function write(state) {
      if (!storage) return false;
      try {
        const raw = JSON.stringify(state);
        if (storage.getItem(KEY) !== primaryRaw) return false;
        if (raw === previousRaw && !recovered) return true;
        if (previousRaw !== null) {
          try { storage.setItem(PREVIOUS, previousRaw); } catch { /* Primary may still fit. */ }
        }
        storage.setItem(KEY, raw);
        previousRaw = primaryRaw = raw;
        recovered = false;
        return true;
      } catch { return false; }
    }
    const state = load();
    return { state, write, recovered, damaged: !state && problem };
  }
  return { parse, create };
})();

exports.validate = function(m) {
  if(!m || !Array.isArray(m.objects) || m.objects.length>2304)throw Error();
  const clean=FarmSave.parse({version:3,coins:0,xp:0,inventory:{},orderReady:{},objects:m.objects,nextId:Math.max(...m.objects.map(o=>o.id))+1,
    zones:m.zones,landscape:m.landscape,lesson:0,sound:true,motion:true});
  return {zones:clean.zones,landscape:clean.landscape,objects:clean.objects.map(({x,y,id,kind})=>({x,y,id,kind}))};
};
},
"api/world":function(module,exports){
'use strict';
const db=load('server/store');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET')return res.status(405).end();
  if(!db.available())return res.json({...db.defaults,shared:false});
  try{return res.json({...await db.read(),shared:true});}catch{return res.status(503).end();}
};

},
"api/visit":function(module,exports){
'use strict';
const db=load('server/store');
const {createHmac}=require('node:crypto');
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST'||req.headers.origin!==process.env.APP_ORIGIN)return res.status(403).end();
  if(!db.available()||!process.env.SESSION_SECRET)return res.status(204).end();
  const id=req.body?.id;
  if(!/^[a-f0-9-]{36}$/.test(id||''))return res.status(400).end();
  const label=createHmac('sha256',process.env.SESSION_SECRET).update(id).digest('hex').slice(0,12);
  try{await db.command('ZADD','farm:visitors',Date.now(),label);return res.status(204).end();}catch{return res.status(503).end();}
};

},
"api/admin":function(module,exports){
'use strict';
const auth=load('server/auth');
const db=load('server/store');
const fs=require('node:fs');
const path=require('node:path');
const kinds=['house','barn','chicken','cow','sheep','mill','windmill','bakery'];
const items=['wheat','corn','carrot','pumpkin','egg','milk','wool','bread','flour','feed'];
function rates(v,keys){
  if(!v||typeof v!=='object'||Array.isArray(v))throw Error();
  const clean={};
  for(const [k,n] of Object.entries(v)){
    if(!keys.includes(k)||!Number.isInteger(n)||n<1||n>10000)throw Error();
    clean[k]=n;
  }
  return clean;
}
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Frame-Options','DENY');
  if(!auth.configured())return res.status(503).send('Admin kirishi serverda sozlanmagan.');
  const a=req.query.action;
  try{
    if(req.method==='GET'&&a==='login')return await auth.login(req,res);
    if(req.method==='GET'&&a==='callback')return await auth.callback(req,res);
    if(!auth.valid(req))return res.status(401).setHeader('Content-Type','text/html; charset=utf-8').end('<meta name="viewport" content="width=device-width,initial-scale=1"><p><a href="/api/admin?action=login">GitHub orqali kirish</a></p>');
    if(req.method==='GET'&&!a){
      return res.status(200).setHeader('Content-Type','text/html; charset=utf-8').end(require('node:zlib').gunzipSync(Buffer.from("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",'base64')));
    }
    if(req.method==='POST'&&req.headers.origin!==auth.origin)return res.status(403).end();
    if(req.method==='POST'&&a==='logout'){
      res.setHeader('Set-Cookie',auth.set('__Host-farm-session','',0)); return res.redirect(303,'/');
    }
    if(!db.available())return res.status(503).json({error:'Umumiy saqlash bazasi ulanmagan.'});
    if(req.method==='GET'&&a==='players')return res.json(await db.command('ZREVRANGE','farm:visitors',0,99,'WITHSCORES'));
    if(req.method==='POST'&&a==='settings'){
      const b=req.body;
      let next;
      try{
        if(!b||typeof b.maintenance!=='boolean'||!Number.isSafeInteger(b.version))throw Error();
        const current=await db.read();
        if(current.version!==b.version)return res.status(409).json({error:'Boshqa tahrir saqlangan. Sahifani yangilang.'});
        next={...current,version:b.version+1,maintenance:b.maintenance,upgradePrices:rates(b.upgradePrices,kinds),products:rates(b.products,items),durations:rates(b.durations,kinds.slice(2)),yields:rates(b.yields,kinds.slice(2))};
        if(b.map)next.map=load('server/map').validate(b.map);
      }catch{return res.status(400).json({error:'Sozlamalar yoki xarita xato.'});}
      if(!await db.update(b.version,next))return res.status(409).json({error:'Sahifani yangilang.'});
      return res.json(next);
    }
    return res.status(404).end();
  }catch{return res.status(502).send('Server bilan aloqa uzildi.');}
};

}};const cache=new Map();
function load(name){
 if(!cache.has(name)){
  const m={exports:{}};cache.set(name,m);modules[name](m,m.exports);
 }
 return cache.get(name).exports;
}
module.exports=(req,res)=>{
 const route=req.query.route;
 if(!['admin','world','visit'].includes(route))return res.status(404).end();
 return load('api/'+route)(req,res);
};
