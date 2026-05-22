let isUSDMode = false;
let currentCache = null;

async function initDashboard() {
  const refreshIcon = document.getElementById('refresh-btn');

  // ۱. لود آنی اطلاعات از استوریج
  chrome.storage.local.get(['marketCache'], (result) => {
    if (result.marketCache) {
      currentCache = result.marketCache;
      renderData();
    }
  });

  // ۲. انیمیشن چرخیدن دکمه رفرش
  if (refreshIcon) {
    refreshIcon.classList.add('rotating');
  }

  // ۳. درخواست دیتای لایو از بک‌گراند
  chrome.runtime.sendMessage({ action: "fetchPrices" }, (response) => {
    setTimeout(() => {
      if (refreshIcon) refreshIcon.classList.remove('rotating');
    }, 600);

    if (chrome.runtime.lastError || !response || !response.success) return;

    // گرفتن قیمت‌های قدیمی قبل از آپدیت برای انیمیشن فلاش کارت‌ها
    const oldVals = {};
    const keys = ['dollar', 'euro', 'gold', 'emami', 'rob', 'btc', 'eth', 'usdt', 'sol', 'xrp'];
    keys.forEach(k => {
      const el = document.getElementById(`${k}-price`);
      oldVals[k] = el ? el.textContent : "...";
    });

    currentCache = response;
    renderData();

    // اجرای انیمیشن پالس در صورت تغییر دیتا
    keys.forEach(k => {
      const el = document.getElementById(`${k}-price`);
      const card = document.querySelector(`.crypto-card.${k === 'emami' || k === 'rob' ? 'sekke-' + k : k}`);
      if (el && card && oldVals[k] !== "..." && oldVals[k] !== el.textContent) {
        triggerFlash(card, oldVals[k], el.textContent);
      }
    });
  });
}

function renderData() {
  if (!currentCache) return;

  const marketKeys = ['dollar', 'euro', 'gold', 'emami', 'rob', 'btc', 'eth', 'usdt', 'sol', 'xrp'];
  const numValues = {};

  // پارس کردن تمام قیمت‌ها به عدد خالص برای محاسبات تبدیلی
  marketKeys.forEach(k => {
    if (currentCache[k] && currentCache[k].price) {
      numValues[k] = parseFloat(currentCache[k].price.replace(/,/g, '')) || 0;
    } else {
      numValues[k] = 0;
    }
  });

  const numDollar = numValues['dollar'] || 1; // مبنای تبدیل نرخ‌های تومانی به دلار

  marketKeys.forEach(k => {
    const priceEl = document.getElementById(`${k}-price`);
    const unitEl = document.getElementById(`${k}-unit`);
    const trendEl = document.getElementById(`${k}-trend`);

    if (!currentCache[k]) return;

    // ۱. رندر قیمت بر اساس تومان یا دلار
    if (priceEl) {
      if (isUSDMode) {
        if (k === 'dollar') {
          priceEl.textContent = "1";
        } else if (k === 'btc' || k === 'eth' || k === 'sol' || k === 'xrp' || k === 'usdt') {
          // برای کریپتو، اگر قیمت از قبل دلاریه مستقیما نشون بده، در غیر این صورت به دلار تبدیل کن
          const isAlreadyUSD = currentCache[k].isUSD || false; 
          const usdPrice = isAlreadyUSD ? numValues[k] : (numValues[k] / numDollar);
          
          if (usdPrice >= 100) {
            priceEl.textContent = Math.floor(usdPrice).toLocaleString('en-US');
          } else {
            priceEl.textContent = usdPrice.toFixed(2);
          }
        } else {
          // برای طلا، سکه و یورو (تبدیل قیمت تومانی به دلار)
          const usdValue = numValues[k] / numDollar;
          priceEl.textContent = usdValue >= 100 ? Math.floor(usdValue).toLocaleString('en-US') : usdValue.toFixed(2);
        }
        if (unitEl) unitEl.textContent = "USD";
      } else {
        // حالت تومان (IRT)
        if (k === 'btc' || k === 'eth' || k === 'sol' || k === 'xrp' || k === 'usdt') {
          const isAlreadyUSD = currentCache[k].isUSD || false;
          const irtPrice = isAlreadyUSD ? (numValues[k] * numDollar) : numValues[k];
          priceEl.textContent = Math.floor(irtPrice).toLocaleString('en-US');
        } else {
          priceEl.textContent = currentCache[k].price;
        }
        if (unitEl) unitEl.textContent = "IRT";
      }
    }

    // ۲. رندر درصد تغییرات (Trend)
    if (trendEl && currentCache[k].percent) {
      renderTrend(trendEl, currentCache[k].percent);
    }

    // ۳. رسم مینی چارت (Sparkline)
    if (currentCache[k].percent) {
      drawSparkline(`${k}-chart`, currentCache[k].percent);
    }
  });

  // آپدیت زمان فوتر
  const timeEl = document.getElementById('update-time');
  if (timeEl && currentCache.lastUpdated) {
    timeEl.textContent = `Updated: ${currentCache.lastUpdated}`;
  }
}

function drawSparkline(svgId, percentText) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  
  const percent = parseFloat(percentText.replace(/[^\d.-]/g, '')) || 0;
  const width = 100;
  let points = [15, 16, 14, 15, 14, 16, 15]; 
  
  if (percent > 0) {
    const intensity = Math.min(percent * 3, 12);
    points = [22, 24 - intensity, 18, 20 - intensity, 12, 14 - intensity, 5];
  } else if (percent < 0) {
    const intensity = Math.min(Math.abs(percent) * 3, 12);
    points = [6, 4 + intensity, 12, 10 + intensity, 18, 16 + intensity, 25];
  }

  const step = width / (points.length - 1);
  let pathD = `M 0 ${points[0]}`;
  
  for (let i = 1; i < points.length; i++) {
    const cpX1 = (i - 1) * step + step / 2;
    const cpY1 = points[i - 1];
    const cpX2 = (i - 1) * step + step / 2;
    const cpY2 = points[i];
    pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${i * step} ${points[i]}`;
  }
  svg.innerHTML = `<path d="${pathD}"></path>`;
}

function triggerFlash(el, oldV, newV) {
  if (!el) return;
  const nOld = parseFloat(oldV.replace(/,/g, '')) || 0;
  const nNew = parseFloat(newV.replace(/,/g, '')) || 0;
  el.classList.remove('flash-up', 'flash-down');
  void el.offsetWidth; // Reflow هک
  el.classList.add(nNew > nOld ? 'flash-up' : 'flash-down');
}

function renderTrend(element, percentText) {
  if (!element) return;
  let cleanPercent = percentText.replace(/[()]/g, '').trim();
  element.textContent = cleanPercent;
  element.classList.remove('trend-up', 'trend-down');
  
  if (cleanPercent.includes('-')) {
    element.classList.add('trend-down');
  } else {
    if (!cleanPercent.includes('+')) {
      element.textContent = `+${cleanPercent}`;
    }
    element.classList.add('trend-up');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', initDashboard);
  }

  // لیسنر سوییچر ارز دکمه‌ای
  const toggleContainer = document.getElementById('unit-toggle');
  if (toggleContainer) {
    toggleContainer.addEventListener('click', () => {
      isUSDMode = !isUSDMode;
      
      const labelToman = document.getElementById('label-toman');
      const labelUsd = document.getElementById('label-usd');
      
      if (isUSDMode) {
        toggleContainer.classList.add('usd-active');
        if (labelToman) labelToman.classList.remove('active');
        if (labelUsd) labelUsd.classList.add('active');
      } else {
        toggleContainer.classList.remove('usd-active');
        if (labelToman) labelToman.classList.add('active');
        if (labelUsd) labelUsd.classList.remove('active');
      }
      renderData();
    });
  }

  // جابه‌جایی تب‌ها
  const tabButtons = document.querySelectorAll('.tab-btn');
  const underline = document.querySelector('.tab-underline');
  
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab && underline) {
    underline.style.left = `${activeTab.offsetLeft}px`;
    underline.style.width = `${activeTab.offsetWidth}px`;
  }
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      if (underline) {
        underline.style.left = `${btn.offsetLeft}px`;
        underline.style.width = `${btn.offsetWidth}px`;
      }

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) panel.classList.add('active');
    });
  });
});