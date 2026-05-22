// تابع استخراج قیمت و درصد از متون ساختاریافته TGJU
function parseFiatHTML(html) {
  const priceRegex = /data-col="info\.last_trade\.PDrCotVal"[^>]*>([^<]+)</;
  const percentRegex = /data-col="info\.last_trade\.PDrCotValPercent"[^>]*>([^<]+)</;

  const priceMatch = html.match(priceRegex);
  const percentMatch = html.match(percentRegex);

  let tomansPrice = "N/A";
  let percent = "0%";

  if (priceMatch) {
    // تبدیل ریال به تومان
    const rawPriceRials = parseInt(priceMatch[1].replace(/[^\d]/g, ''), 10);
    if (!isNaN(rawPriceRials)) {
      tomansPrice = Math.floor(rawPriceRials / 10).toLocaleString('en-US');
    }
  }
  if (percentMatch) {
    percent = percentMatch[1].trim();
  }

  return { price: tomansPrice, percent };
}

async function updateBadgeAndFetch() {
  // آدرس‌های فوق‌العاده سبک صفحات چارت TGJU که پایداری بسیار بالاتری دارند
  const URLS = {
    dollar: "https://www.tgju.org/profile/price_dollar_rl",
    euro: "https://www.tgju.org/profile/price_eur",
    gold: "https://www.tgju.org/profile/geram18",
    emami: "https://www.tgju.org/profile/sekee",
  };

  // آدرس API کوین‌گکو ارتقا یافته برای شامل شدن سولانا، ریپل و تتر
  const CRYPTO_API = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,solana,ripple&vs_currencies=usd&include_24hr_change=true";

  // مقادیر پیش‌فرض برای جلوگیری از خطای کرش UI
  const outputData = {
    dollar: { price: "N/A", percent: "0%" },
    euro: { price: "N/A", percent: "0%" },
    gold: { price: "N/A", percent: "0%" },
    emami: { price: "N/A", percent: "0%" },
    btc: { price: "N/A", percent: "0%", isUSD: true },
    eth: { price: "N/A", percent: "0%", isUSD: true },
    usdt: { price: "N/A", percent: "0%" },
    sol: { price: "N/A", percent: "0%", isUSD: true },
    xrp: { price: "N/A", percent: "0%", isUSD: true }
  };

  // ۱. واکشی اطلاعات بازار تهران به صورت موازی (Promise.all) جهت سرعت فوق‌العاده بالا
  try {
    const fetchPromises = Object.keys(URLS).map(key => 
      fetch(URLS[key], { headers: { 'User-Agent': 'Mozilla/5.0' } })
        .then(res => res.text())
        .then(html => {
          outputData[key] = parseFiatHTML(html);
        })
        .catch(err => console.error(`Error fetching ${key}:`, err))
    );
    await Promise.all(fetchPromises);
  } catch (e) {
    console.error("Error in Fiat parallel fetch:", e);
  }

  // ۲. واکشی اطلاعات رمزارزها از کوین‌گکو
  let cryptoJson = null;
  try {
    cryptoJson = await fetch(CRYPTO_API).then(res => res.json());
  } catch (e) { 
    console.error("Error fetching crypto API:", e); 
  }

  const numDollar = outputData.dollar.price !== "N/A" ? parseInt(outputData.dollar.price.replace(/,/g, ''), 10) : 0;

  // ۳. پردازش و تبدیل ارزهای دیجیتال
  if (cryptoJson) {
    const cryptoMapping = {
      bitcoin: 'btc',
      ethereum: 'eth',
      solana: 'sol',
      ripple: 'xrp'
    };

    // پردازش کریپتوهای اصلی (بیت‌کوین، اتریوم، سولانا، ریپل) به صورت دلاری مستقیم
    Object.keys(cryptoMapping).forEach(coinId => {
      const targetKey = cryptoMapping[coinId];
      if (cryptoJson[coinId]) {
        outputData[targetKey].price = cryptoJson[coinId].usd.toLocaleString('en-US');
        outputData[targetKey].percent = (cryptoJson[coinId].usd_24h_change || 0).toFixed(2) + "%";
        outputData[targetKey].isUSD = true; // سیگنال به popup.js که این قیمت در حالت پیش‌فرض خودش دلار است
      }
    });

    // پردازش اختصاصی تتر (USDT) -> برای پاپ‌آپ جذاب‌تره که تتر در حالت تومان، معادل قیمت دلار آزاد باشه
    if (cryptoJson.tether && numDollar > 0) {
      // قیمت تتر معمولاً نوسان جزئی با دلار آزاد دارد، برای دقت بیشتر فرمول: قیمت دلار آزاد * نرخ تتر
      const usdtInToman = Math.floor(cryptoJson.tether.usd * numDollar);
      outputData.usdt.price = usdtInToman.toLocaleString('en-US');
      outputData.usdt.percent = (cryptoJson.tether.usd_24h_change || 0).toFixed(2) + "%";
      outputData.usdt.isUSD = false; // تتر در حالت پایه تومانی رندر شود
    } else if (numDollar > 0) {
      // بک‌آپ اگر کوین‌گکو برای تتر لود نشد، هم‌قیمت دلار آزاد نشان بدهد
      outputData.usdt.price = numDollar.toLocaleString('en-US');
      outputData.usdt.percent = outputData.dollar.percent;
      outputData.usdt.isUSD = false;
    }
  }

  // ۴. تنظیم بج آیکون مرورگر (۳ رقم اول قیمت دلار)
  if (numDollar > 0) {
    const badgeText = numDollar.toString().substring(0, 3);
    chrome.action.setBadgeText({ text: badgeText });
    chrome.action.setBadgeBackgroundColor({ color: '#38bdf8' }); // ست کردن رنگ نئونی برای بج افزونه
  }

  // ثبت زمان به‌روزرسانی
  const now = new Date();
  const timeText = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const cacheData = {
    ...outputData,
    lastUpdated: timeText
  };

  // ذخیره در استوریج داخلی مرورگر
  chrome.storage.local.set({ marketCache: cacheData });
  return cacheData;
}

// گوش‌به‌زنگ برای درخواست‌های پاپ‌آپ
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchPrices") {
    updateBadgeAndFetch()
      .then(data => sendResponse({ success: true, ...data }))
      .catch(error => sendResponse({ success: false, error: error.toString() }));
    return true; // فعال نگه‌داشتن کانال پیام‌رسانی ناهمگام
  }
});

// مدیریت آلارم‌ها برای آپدیت پس‌زمینه هر ۵ دقیقه
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("updatePriceAlarm", { periodInMinutes: 5 });
  // اجرای یک‌باره در بدو نصب یا ریفرش جهت لود شدن کش
  updateBadgeAndFetch().catch(err => console.error(err));
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updatePriceAlarm") {
    updateBadgeAndFetch().catch(err => console.error(err));
  }
});