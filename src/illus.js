// تصویرسازی‌های وکتوری دست‌ساز (SVG) — سبک نئوپاپ، پس‌زمینه‌ی کاملاً شفاف
// جایگزین تصاویر PNG که الگوی شطرنجی داشتند.
// همه با کانتور تیره‌ی ضخیم و پرشدگی رنگی سالید.

const S = '#17123a' // رنگ کانتور

// ---- قهرمانِ صفحه‌ی خانه: صحنه‌ی برنامه‌ریزی ----
export const heroSvg = `
<svg class="il il-hero" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg"
  stroke="${S}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
  <!-- شکل‌های تزئینی پس‌زمینه -->
  <circle cx="44" cy="46" r="15" fill="#ffd23f" stroke="none"/>
  <path d="M255 30c6 4 6 12 0 16" stroke="#ff5d73"/>
  <circle cx="272" cy="150" r="7" fill="#23c98a" stroke="none"/>
  <path d="M30 150l6-6 6 6-6 6z" fill="#2ba8f5" stroke="none"/>

  <!-- کلیپ‌بورد بزرگ -->
  <rect x="96" y="40" width="108" height="132" rx="12" fill="#6c5ce7"/>
  <rect x="106" y="52" width="88" height="110" rx="7" fill="#fdfbf3"/>
  <rect x="132" y="30" width="36" height="18" rx="7" fill="#ff8a3d"/>
  <!-- خطوط چک‌لیست -->
  <circle cx="122" cy="78" r="6" fill="#23c98a"/>
  <path d="M119 78l2.5 2.5 4-4.5" stroke="#fff" stroke-width="2.4"/>
  <path d="M136 78h44" stroke="#c9c4e8"/>
  <circle cx="122" cy="100" r="6" fill="#ffd23f"/>
  <path d="M136 100h44" stroke="#c9c4e8"/>
  <circle cx="122" cy="122" r="6" fill="#ff5d73"/>
  <path d="M136 122h34" stroke="#c9c4e8"/>

  <!-- گیاه کوچک کنار کلیپ‌بورد -->
  <path d="M214 172c0-20 6-34 18-40" stroke="#12a5b3"/>
  <path d="M232 132c10-2 18 4 18 14-10 2-18-4-18-14z" fill="#23c98a"/>
  <path d="M232 150c-10-2-18 4-18 14 10 2 18-4 18-14z" fill="#2fd39a"/>
  <rect x="206" y="170" width="30" height="16" rx="5" fill="#ff8a3d"/>

  <!-- مداد -->
  <g transform="rotate(38 60 110)">
    <rect x="46" y="86" width="18" height="60" rx="4" fill="#ffd23f"/>
    <path d="M46 86h18l-9-14z" fill="#ff5d73"/>
    <rect x="46" y="140" width="18" height="10" fill="#12a5b3"/>
  </g>
</svg>`

// ---- خالی: هیچ کاری نیست (کلیپ‌بورد + گیاه) ----
export const emptyTasksSvg = `
<svg class="il il-empty" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
  stroke="${S}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="100" cy="176" rx="66" ry="10" fill="#efe9ff" stroke="none"/>
  <circle cx="34" cy="40" r="9" fill="#ffd23f" stroke="none"/>
  <circle cx="168" cy="52" r="6" fill="#ff5d73" stroke="none"/>
  <path d="M164 120c5 3 5 9 0 12" stroke="#2ba8f5"/>

  <rect x="58" y="56" width="84" height="104" rx="11" fill="#6c5ce7"/>
  <rect x="66" y="66" width="68" height="84" rx="6" fill="#fdfbf3"/>
  <rect x="86" y="46" width="28" height="16" rx="6" fill="#23c98a"/>
  <path d="M80 92h44M80 108h44M80 124h28" stroke="#cfc9ea"/>

  <!-- جوانه از بالای کلیپ‌بورد -->
  <path d="M100 46c0-14 4-22 12-26" stroke="#12a5b3"/>
  <path d="M112 16c9-1 15 4 15 12-9 1-15-4-15-12z" fill="#23c98a"/>
  <path d="M112 30c-9-1-15 4-15 12 9 1 15-4 15-12z" fill="#2fd39a"/>
</svg>`

// ---- خالی: تایم‌لاین/برنامه (تقویم + ساعت) ----
export const emptyAgendaSvg = `
<svg class="il il-empty" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
  stroke="${S}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="100" cy="178" rx="70" ry="10" fill="#efe9ff" stroke="none"/>
  <circle cx="36" cy="44" r="8" fill="#ff8a3d" stroke="none"/>
  <circle cx="166" cy="36" r="6" fill="#e04bce" stroke="none"/>

  <!-- تقویم -->
  <rect x="44" y="52" width="98" height="94" rx="11" fill="#fdfbf3"/>
  <rect x="44" y="52" width="98" height="24" rx="11" fill="#6c5ce7"/>
  <path d="M64 44v14M122 44v14"/>
  <path d="M44 88h98" stroke="#cfc9ea"/>
  <path d="M64 106h58M64 124h40" stroke="#cfc9ea"/>
  <rect x="60" y="100" width="10" height="10" rx="2.5" fill="#ffd23f"/>
  <rect x="60" y="118" width="10" height="10" rx="2.5" fill="#23c98a"/>

  <!-- ساعت -->
  <circle cx="140" cy="140" r="30" fill="#ff8a3d"/>
  <circle cx="140" cy="140" r="30" fill="none"/>
  <path d="M140 124v16l11 8" stroke="#fff" stroke-width="3.6"/>
  <path d="M122 116l-8-8M158 116l8-8" stroke="#ff5d73"/>
</svg>`

// ---- جشن/تکمیل: جام + کاغذرنگی ----
export const celebrateSvg = `
<svg class="il il-empty" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
  stroke="${S}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="100" cy="180" rx="60" ry="9" fill="#efe9ff" stroke="none"/>
  <!-- کاغذرنگی -->
  <rect x="34" y="40" width="12" height="12" rx="2" fill="#ff5d73" stroke="none" transform="rotate(20 40 46)"/>
  <rect x="156" y="36" width="12" height="12" rx="2" fill="#2ba8f5" stroke="none" transform="rotate(-15 162 42)"/>
  <circle cx="30" cy="96" r="6" fill="#ffd23f" stroke="none"/>
  <circle cx="172" cy="100" r="6" fill="#23c98a" stroke="none"/>
  <path d="M150 70c5 3 5 9 0 12" stroke="#e04bce"/>
  <path d="M50 66c-5 3-5 9 0 12" stroke="#ff8a3d"/>

  <!-- جام -->
  <path d="M74 54h52v18c0 18-12 30-26 30S74 90 74 72z" fill="#ffd23f"/>
  <path d="M74 60H60c0 14 8 20 18 20" fill="#ffe27a"/>
  <path d="M126 60h14c0 14-8 20-18 20" fill="#ffe27a"/>
  <rect x="92" y="112" width="16" height="16" fill="#ff8a3d"/>
  <rect x="78" y="126" width="44" height="12" rx="4" fill="#6c5ce7"/>
  <path d="M100 70l3 6 6 .6-4.5 4 1.3 6-5.8-3-5.8 3 1.3-6-4.5-4 6-.6z" fill="#fff" stroke="none"/>
</svg>`

// ---- تصویر خوش‌آمد آنبوردینگ (دست تکان‌دهنده + تقویم) ----
export const welcomeSvg = `
<svg class="il il-onb" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg"
  stroke="${S}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="120" cy="96" r="74" fill="#efe9ff" stroke="none"/>
  <circle cx="46" cy="40" r="9" fill="#ffd23f" stroke="none"/>
  <circle cx="200" cy="150" r="7" fill="#ff5d73" stroke="none"/>
  <path d="M198 44c5 3 5 9 0 12" stroke="#2ba8f5"/>

  <!-- گوشی/کارت اپ -->
  <rect x="80" y="44" width="80" height="112" rx="16" fill="#6c5ce7"/>
  <rect x="90" y="60" width="60" height="80" rx="8" fill="#fdfbf3"/>
  <circle cx="120" cy="150" r="4" fill="#fdfbf3" stroke="none"/>
  <circle cx="104" cy="80" r="6" fill="#23c98a"/>
  <path d="M101 80l2.4 2.4 4-4.4" stroke="#fff" stroke-width="2.4"/>
  <path d="M116 80h24" stroke="#cfc9ea"/>
  <circle cx="104" cy="100" r="6" fill="#ffd23f"/>
  <path d="M116 100h24" stroke="#cfc9ea"/>
  <circle cx="104" cy="120" r="6" fill="#ff5d73"/>
  <path d="M116 120h16" stroke="#cfc9ea"/>
</svg>`

// ---- تگ/دسته برای صفحه‌ی راهنمای سازمان‌دهی ----
export const organizeSvg = `
<svg class="il il-onb" viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg"
  stroke="${S}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="120" cy="96" r="74" fill="#efe9ff" stroke="none"/>
  <rect x="70" y="58" width="100" height="26" rx="9" fill="#2ba8f5"/>
  <circle cx="84" cy="71" r="4" fill="#fff" stroke="none"/>
  <rect x="70" y="92" width="82" height="26" rx="9" fill="#23c98a"/>
  <circle cx="84" cy="105" r="4" fill="#fff" stroke="none"/>
  <rect x="70" y="126" width="92" height="26" rx="9" fill="#ff8a3d"/>
  <circle cx="84" cy="139" r="4" fill="#fff" stroke="none"/>
  <circle cx="46" cy="46" r="8" fill="#ffd23f" stroke="none"/>
  <circle cx="196" cy="150" r="7" fill="#e04bce" stroke="none"/>
</svg>`
