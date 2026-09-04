// تصویرسازی‌های وکتور اختصاصی (SVG) — رنگی و پرجزئیات
// همه با gradient و رنگ‌های پالت ساخته شده‌اند.

// قهرمان صفحه‌ی خانه: شخصیتی که برنامه‌اش را مرور می‌کند
export const heroIllust = `
<svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="hi-clip" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffc531"/><stop offset="1" stop-color="#ff8a3d"/>
    </linearGradient>
    <linearGradient id="hi-page" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e7e5f3"/>
    </linearGradient>
  </defs>
  <ellipse cx="70" cy="126" rx="46" ry="8" fill="#000" opacity="0.14"/>
  <!-- clipboard -->
  <rect x="34" y="30" width="72" height="90" rx="10" fill="url(#hi-clip)"/>
  <rect x="42" y="40" width="56" height="72" rx="7" fill="url(#hi-page)"/>
  <rect x="58" y="24" width="24" height="14" rx="5" fill="#37d9a0"/>
  <!-- checklist -->
  <rect x="49" y="52" width="9" height="9" rx="3" fill="#37d9a0"/>
  <path d="M51 56.5l1.6 1.6 3-3.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="62" y="54" width="28" height="4.5" rx="2.2" fill="#b9b6d1"/>
  <rect x="49" y="68" width="9" height="9" rx="3" fill="#38b6ff"/>
  <path d="M51 72.5l1.6 1.6 3-3.2" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="62" y="70" width="24" height="4.5" rx="2.2" fill="#b9b6d1"/>
  <rect x="49" y="84" width="9" height="9" rx="3" fill="#e7e5f3" stroke="#b9b6d1" stroke-width="1.4"/>
  <rect x="62" y="86" width="30" height="4.5" rx="2.2" fill="#cfcce4"/>
  <!-- sparkles -->
  <path d="M112 40l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffc531"/>
  <circle cx="26" cy="58" r="4" fill="#ff5fa2"/>
  <circle cx="116" cy="92" r="5" fill="#9b59f6"/>
</svg>`

// حالت خالی: جعبه‌ی خالی با گیاه
export const emptyIllust = `
<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="e-box" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6c5ce7"/><stop offset="1" stop-color="#4a7dff"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="140" rx="62" ry="10" fill="#000" opacity="0.08"/>
  <path d="M56 74h88l-10 54a8 8 0 0 1-8 6H74a8 8 0 0 1-8-6z" fill="url(#e-box)"/>
  <path d="M50 62h100l-6 16H56z" fill="#9b59f6"/>
  <rect x="90" y="86" width="20" height="8" rx="4" fill="#4a7dff"/>
  <!-- plant -->
  <path d="M100 60c0-14 10-22 22-22-2 14-10 22-22 22z" fill="#37d9a0"/>
  <path d="M100 60c0-12-9-20-20-20 2 12 9 20 20 20z" fill="#23c483"/>
  <path d="M100 60V40" stroke="#17b7c4" stroke-width="3" stroke-linecap="round"/>
  <circle cx="150" cy="48" r="4" fill="#ffc531"/>
  <circle cx="44" cy="96" r="3.5" fill="#ff5fa2"/>
  <path d="M158 100l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" fill="#ff8a3d"/>
</svg>`

// جشن اتمام: جام و کنفتی
export const celebrateIllust = `
<svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="c-cup" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffc531"/><stop offset="1" stop-color="#ff8a3d"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="142" rx="50" ry="9" fill="#000" opacity="0.1"/>
  <path d="M78 46h44v18a22 22 0 0 1-44 0z" fill="url(#c-cup)"/>
  <path d="M78 50H66a10 10 0 0 0 12 10M122 50h12a10 10 0 0 1-12 10" stroke="#ff8a3d" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="94" y="86" width="12" height="14" fill="#ff8a3d"/>
  <rect x="82" y="100" width="36" height="10" rx="4" fill="#9b59f6"/>
  <path d="M92 58l3 3 6-7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="46" y="34" width="8" height="8" rx="2" fill="#ff5fa2" transform="rotate(20 50 38)"/>
  <rect x="150" y="40" width="8" height="8" rx="2" fill="#38b6ff" transform="rotate(-15 154 44)"/>
  <circle cx="40" cy="70" r="4" fill="#37d9a0"/>
  <circle cx="162" cy="76" r="4" fill="#e84bd6"/>
  <path d="M60 96l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#ffc531"/>
  <path d="M140 96l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#6c5ce7"/>
</svg>`

// نمودار کوچک تزیینی برای هدر تقویم
export const calBadge = `
<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="6" y="10" width="36" height="32" rx="8" fill="#6c5ce7"/>
  <rect x="6" y="10" width="36" height="10" rx="6" fill="#9b59f6"/>
  <circle cx="16" cy="15" r="2" fill="#fff"/><circle cx="32" cy="15" r="2" fill="#fff"/>
  <rect x="12" y="26" width="7" height="7" rx="2" fill="#ffc531"/>
  <rect x="21" y="26" width="7" height="7" rx="2" fill="#37d9a0"/>
  <rect x="30" y="26" width="6" height="7" rx="2" fill="#ff5fa2"/>
</svg>`
