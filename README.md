# 📊 SinPrice

<p align="center">
  <a href="#-english">English</a> •
  <a href="#-فارسی">فارسی</a>
</p>

---

## 🇬🇧 English

<p align="left">
  <img src="https://img.shields.io/badge/Version-1.0.0-38bdf8?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Manifest-V3-10b981?style=for-the-badge" alt="Manifest V3">
  <img src="https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge" alt="License">
</p>

**SinPrice** is a lightweight, ultra-fast, and high-performance multi-market tracking Chrome extension. It delivers a seamless, real-time dashboard monitoring domestic fiat/gold prices, major cryptocurrencies, and global Forex currency pairs simultaneously—built purely on modern web standards with zero external UI framework overhead.

### ✨ Key Features
- **🗂️ Triple-Tab Terminal:** Seamlessly switch between **Domestic Markets** (Dollar, Euro, Gold, Coins), **Crypto Assets** (BTC, ETH, USDT, SOL, XRP), and **Forex Pairs** (XAU, EUR/USD, GBP/USD, USD/JPY, DXY).
- **🔀 Dynamic Conversion Engine:** A custom, neon-animated UI switcher that instantly toggles all global markets between **USD** and **Iranian Tomans (IRT)** with precise mathematical cross-rates.
- **🍏 Local Apple Typography:** Embedded offline **SF Pro Text** fonts (`.otf`), perfectly tuned via subpixel antialiasing to guarantee a uniform, premium visual aesthetic across Windows, macOS, and Linux.
- **📈 Micro-Sparklines:** Inline, feather-weight SVG charts that map live trend movements dynamically without bloating memory footprint.
- **⚡ Non-Blocking Architecture:** Asynchronous parallel fetching (`Promise.all`) driven by a robust background Service Worker and scheduled Chrome Alarms to ensure zero UI lags and strict resource efficiency.

### 🛠️ Tech Stack & Architecture
- **Core:** Vanilla JavaScript (ES6+), HTML5, CSS3 Variables
- **API Engine:** Async Fetch API, RegEx Parsing & Data Structuring
- **Platform:** Chrome Extensions API (Manifest V3 Compliance)
- **Design System:** Dark Mode Aesthetic, Custom Micro-Animations, Glassmorphism Elements

---

## 🇮🇷 فارسی

<p align="right">
  <img src="https://img.shields.io/badge/%D9%8نسخه-1.0.0-38bdf8?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/%D9%8Manifest-V3-10b981?style=for-the-badge" alt="Manifest V3">
  <img src="https://img.shields.io/badge/%D9%8مجوز-MIT-f59e0b?style=for-the-badge" alt="License">
</p>

**SinPrice** یک اکستنشن سبک، فوق‌العاده سریع و با کارایی بالا برای مرورگر کروم است. این ابزار یک داشبورد مینی‌مال و زنده برای نظارت همزمان بر قیمت‌های بازار داخلی (ارز و طلا)، رمزارزهای شاخص و جفت‌ارزهای جهانی فارکس فراهم می‌کند که کاملاً بر پایه استانداردهای مدرن وب و بدون وابستگی به فریم‌ورک‌های سنگین ساخته شده است.



### 🛠️ تکنولوژی‌های مورد استفاده
- **هسته برنامه‌نویسی:** Vanilla JavaScript (ES6+), HTML5, CSS3 Variables
- **موتور دریافت داده:** Async Fetch API, RegEx Parsing & Data Structuring
- **سیستم دیزاین:** تم تاریک مدرن، میکرواینترکشن‌های اختصاصی، المان‌های شیشه‌ای (Glassmorphism)

---

## 📂 Project Structure / ساختار پروژه

```text
SinPrice/
├── assets/
│   ├── fonts/
│   │   ├── SFPRODISPLAYREGULAR.OTF   # Local SF Pro Regular Font
│   │   └── SFPRODISPLAYBOLD.OTF      # Local SF Pro Bold Font
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── background.js                     # Async Fetching & Chrome Alarms Service Worker
├── popup.html                        # Dashboard Layout & Triple-Tab Structure
├── popup.js                          # Dynamic UI Rendering, Toggling & Sparklines
├── style.css                         # Custom Neon Design System & Responsive Layouts
├── manifest.json                     # Extension Configuration (MV3)
└── README.md                         # Project Documentation






