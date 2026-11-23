# Farm Valley v0.3

Bu loyiha fastermv7/Farm-valley reposidagi v0.2 kodidan davom ettirildi. O‘yin o‘zbek tilida. Build uchun Node.js kerak, npm paket o‘rnatish shart emas. O‘yinni ishga tushirish uchun Vercel build buyrug‘i `node build.js`, chiqish papkasi `dist`. Repozitoriy ildizidagi vercel.json bu sozlamalarni beradi. Funktsiyalar api papkasida. server/panel.html va server/map.js build vaqtida hosil bo‘ladi. Vercel faqat dist ichidagi fayllarni statik tarzda tarqatishi kerak.

## Telefonda yangilash

1. Hozirgi o‘yinda **Sozlamalar → Progress zaxirasi → Eksport** tugmasini bosing. Muharrirdagi alohida qoralamangiz kerak bo‘lsa, uni ham JSON sifatida eksport qiling.
2. Samsung **Mening fayllarim → Yuklamalar** orqali Farm-Valley-v0.3.zip faylini ajrating. **telefon** papkasida GitHub uchun uchta fayl bor. **manba** papkasida shu versiyaning o‘qish va o‘zgartirish uchun to‘liq kodi bor.
3. Chrome’da https://github.com/fastermv7/Farm-valley saytini oching. Tugmalar ko‘rinmasa, Chrome menyusida **Kompyuter uchun sayt**ni yoqing. Branch tanlash tugmasida main asosida farm-v03 branchini yarating va shu branchga o‘ting.
4. Repo boshida **Add file → Upload files** orqali telefondagi **telefon/build.js** va **telefon/vercel.json** fayllarini tanlang. **Commit changes**ni bosing.
5. Repo boshida api papkasi bo‘lmasa, **Add file → Create new file**ni tanlang. Fayl nomiga **api/.gitkeep** yozing va saqlang. Keyin repo ichidagi **api** papkasiga kiring. **Add file → Upload files** orqali telefondagi **telefon/api/farm.js** faylini yuklab saqlang. Uchta fayl to‘g‘ri joyda ekanini tekshiring. ZIP yoki telefon papkasining o‘zini GitHub’ga yuklash shart emas.
6. GitHub’da **Compare & pull request → Create pull request**ni bosing. Bazaviy branch main bo‘lsin. Mavjud Vercel loyihasida preview tayyor bo‘lsa, avval unda yangi ferma ochilishini tekshiring. **Merge pull request → Confirm merge** yangilanishni main branchga qo‘shadi.
7. Vercel’da mavjud Farm Valley loyihasini oching. **Settings → Git** ichida fastermv7/Farm-valley ulanganini tekshiring. Ilk bor ulayotgan bo‘lsangiz, o‘sha mavjud loyiha ichida **Connect Git Repository**ni tanlang. Agar hali Vercel’da umuman Farm Valley loyihasi yo‘q bo‘lsa, bir marta **Add New → Project**, ushbu repo yonidagi **Import**, so‘ng **Deploy**ni bosing.
8. **Deployments** bo‘limida main uchun **Ready** holatini kuting. Avval o‘ynagan asosiy domeningizni oching. Preview domenida boshqa lokal ferma ochiladi. Telefon brauzeri eski saqlovni o‘sha asosiy domenda avtomatik tiklaydi.

## Admin hisobini bir marta ulash

1. Vercel’dan asosiy o‘yin manzilingizni oling. Masalan, https://SIZNING-DOMENINGIZ. Quyidagi manzillarda shu qismni o‘zingizning haqiqiy domeningiz bilan almashtiring.
2. GitHub’da https://github.com/settings/developers sahifasini oching. **OAuth Apps → New OAuth App**. Application name uchun Farm Valley, Homepage URL uchun asosiy manzilni kiriting. **Authorization callback URL** maydoniga asosiy manzilingiz oxiriga **/api/admin?action=callback** qo‘shib yozing. **Register application**ni bosing.
3. GitHub ko‘rsatgan Client ID va **Generate a new client secret** orqali olingan Client Secret keyingi qadamda kerak bo‘ladi. Adminning raqamli ID qiymatini https://api.github.com/users/fastermv7 sahifasidagi aynan **id** maydonidan oling.
4. Vercel → mavjud loyiha → **Settings → Environment Variables** orqali Production uchun quyidagi qiymatlarni alohida kiriting.

| Nomi | Qiymati |
|---|---|
| APP_ORIGIN | Asosiy HTTPS manzili, oxirida / bo‘lmasin |
| GITHUB_CLIENT_ID | GitHub OAuth App Client ID |
| GITHUB_CLIENT_SECRET | GitHub OAuth App Client Secret |
| ADMIN_GITHUB_ID | Ruxsat etilgan GitHub hisobining raqamli ID qiymati |
| SESSION_SECRET | Parol menejerida yaratilgan kamida 32 belgili tasodifiy maxfiy qiymat |

5. Har bir qiymatni saqlang. Client Secret va SESSION_SECRET faqat Vercel server sozlamalariga kiritiladi. **Deployments → oxirgi deploy → Redeploy**.
6. Telefoningizda asosiy domen oxiriga **/admin** yozib oching. **GitHub orqali kirish**ni bosing va fastermv7 hisobingiz bilan tasdiqlang. Server GitHub bergan ID ni tekshiradi. Sessiya bir soat amal qiladi. O‘yinchilar uchun sozlamalar menyusida Admin tugmasi yo‘q.
7. Umumiy nashr, narxlar, ishlab chiqarish parametrlari, oxirgi tashriflar va texnik xizmat rejimi uchun Upstash Redis REST bilan ishlaydigan baza kerak. Upstash konsolida bepul reja mavjud bo‘lsa, shu rejani tanlang. Bazadagi **REST URL** va yozish huquqiga ega **REST TOKEN** qiymatlarini Vercel’ga **UPSTASH_REDIS_REST_URL** va **UPSTASH_REDIS_REST_TOKEN** nomlari bilan qo‘shing. Yana **Redeploy** qiling. Baza ulanmaganda mahalliy o‘yin va tasdiqlangan adminning mahalliy tahriri ishlaydi, umumiy nashr tugmasi o‘chiq.
8. **/admin → Server sozlamalari** ichida narx, partiya miqdori, davomiylik, texnik xizmat va nashrni boshqarasiz. Narx va dunyo yangilanishi o‘yinchilar sahifani qayta ochganda yuklanadi. O‘yinchi ro‘yxatida oxirgi 100 brauzer profilining taxallus identifikatori va tashrif vaqti chiqadi. O‘yinchilarning shaxsiy inventari lokal saqlanadi.

## Birinchi yo‘l va ko‘lni chizish

1. **/admin → GitHub orqali kirish → Xarita muharriri → Ochish**. O‘yin xaritasida kataklar chiqadi.
2. **Surish** rejimida nonvoyxonani toping. **Yo‘l**ni tanlab nonvoyxona yonidagi bo‘sh katakka bosing. Keyingi kataklar bo‘ylab barmog‘ingizni torting.
3. **Suv**ni tanlab yo‘l chetidagi bo‘sh kataklarga chizing. Yonma-yon kataklar tutashadi. Xato bo‘lsa **Qaytarish**, qayta qo‘yish uchun **Tiklash**ni bosing.
4. **Daraxt**, **Tosh**, **Bino** yoki **Bezak**ni bo‘sh katakka qo‘ying. Yangi yer uchun **Hudud**ni tanlang. Mavjud obyekt uchun **Tanlash → obyekt → Ko‘chirish → yangi katak**.
5. **Ko‘rib chiqish** toza o‘yinchi ko‘rinishini ochadi. **Muharrirga qaytish → Qoralamalar** orqali nom bilan saqlang. Qoralamalar JSON orqali eksport/import qilinadi.
6. **Fermaga qo‘llash** xaritani joriy fermaga saqlaydi. Hammani yangi xaritaga o‘tkazish uchun **Server sozlamalari → Joriy fermani nashr qilish**ni tasdiqlang.
7. Yangi ferma nashr qilingan boshlang‘ich obyektlarni oladi. Eski fermalar mos keladigan yer o‘zgarishlarini oladi. Shaxsiy bino, ekin va oldin ochilgan hududlar saqlanadi. Eski fermalarda binolar avtomatik ko‘chirib yuborilmaydi.

## O‘yin

- Yangi fermada 6 dala bor. Ekin ekish uchun dalani bosing. Fermer uyini bosib **Yaxshilash** shartlarini ko‘ring. Jami dalalar 6, 8, 10, 13, 16, 20, 24, 29, 34, 40 gacha ortadi. Eski fermadagi ortiqcha dalalar saqlanadi.
- Bug‘doyni un tegirmoniga, unni nonvoyxonaga yuboring. Yem tegirmoni hayvonlar uchun yem beradi. Tovuq, qo‘y va sigirdan tuxum, jun va sut oling. Eski fermada kerakli yangi tegirmonni do‘kondan qurish mumkin.
- Ombor sig‘imi 80 dan boshlanadi, har yaxshilash 25 joy beradi. Lv.11 uchun Lv.10 fermer uyi kerak. Narxlar dastlabki balans. Faol ishlab chiqarish boshlanganidagi tayyor bo‘lish vaqti va yangi partiyalardagi miqdor saqlanadi.
- **Do‘kon → Fermer kiyimlari** orqali uchta qo‘shimcha kiyim tanlang. **Do‘kon → Tog‘ ko‘li → Xaritada ko‘rish** manzaraga olib boradi. Nishon shaklidagi tugma fermaga qaytaradi.
- Bir barmoq xaritani suradi, ikki barmoq zoom qiladi. Bo‘sh ochiq yerga bosilsa, fermer yuradi. Texnik jihatdan egallangan kataklar va suv yo‘l qidirishda to‘siq hisoblanadi. Obyektlar bitta katak egallaydi.
- **Sozlamalar → Ferma profili** bir telefonda bir necha lokal ferma ochadi. Asosiy eski saqlovga qaytish uchun nom maydonini bo‘sh qoldiring. Lokal profilni bilgan shu brauzer foydalanuvchisi uni ocha oladi. Brauzer xotirasi tozalansa tiklash uchun JSON zaxira kerak bo‘ladi. Vaqt tamg‘alari o‘yin yopiq bo‘lgan vaqtni hisoblaydi.
- Animatsiyalar og‘ir tushsa **Sozlamalar → Grafika → Tejamkor** rejimini yoqing.

## Tekshiruvlar

Node bilan manba papkasida quyidagilar bajariladi.

    node build.js
    node tests/editor.cjs
    node tests/progression.cjs
    node tests/admin.cjs

Sinovdan o‘tgan holatlar: eski saqlov migratsiyasi va oldingi nusxaga qaytish, offline ekin taymeri, bino darajalari va shartlari, barcha 10 dala limiti, ombor Lv.11, beshta mahsulot, skin sotib olish va qayta yuklash, xarita moslashtirish, yo‘l qidirish. Alohida Canvas sinovida 360×640 va 640×360 o‘lchamlarda render, sun’iy sensor hodisalari, surish, pinch, undo/redo, preview, qoralama va JSON amallari tekshirildi.

Server sinovida OAuth va Redis javoblari sinov ma’lumotlari bilan almashtirildi. Begona foydalanuvchi, oddiy so‘rov, ruxsatli admin, nashr versiyasi to‘qnashuvi, sessiyadan chiqish va server sozlamalari tekshirildi. Jismoniy A03 Core’dagi FPS, haqiqiy GitHub login, jonli Redis va Vercel deploy hali tasdiqlanmagan. Bulutda o‘yinchi progressini sinxronlash va nashr tarixidan avtomatik rollback bu versiyaga kirmagan.

## Rasmiy yo‘riqnomalar

- https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/git/vercel-for-github
- https://upstash.com/docs/redis/features/restapi
