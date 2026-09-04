// آیکون‌های نوار پایین — SVG رنگی و پرجزئیات (illustration-style)
// پس‌زمینه‌ی کاملاً شفاف، بدون هیچ پنل/حاشیه‌ای.
// همه با کانتور تیره‌ی ضخیم و پرشدگی رنگی سالید (سبک نئوپاپ).

const wrap = (inner) =>
  `<svg class="nav-svg" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
     stroke="#17123a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`

export const navIcons = {
  // تقویم + ساعت کوچک
  calendar: wrap(`
    <rect x="7" y="9" width="28" height="27" rx="5" fill="#ffffff"/>
    <path d="M7 16h28" />
    <rect x="7" y="9" width="28" height="7" rx="5" fill="#6c5ce7"/>
    <path d="M14 6v6M28 6v6"/>
    <rect x="12" y="21" width="5" height="5" rx="1.4" fill="#ffc531"/>
    <rect x="20" y="21" width="5" height="5" rx="1.4" fill="#ff5d73"/>
    <circle cx="33" cy="33" r="8" fill="#23c98a"/>
    <path d="M33 29.5V33l2.4 2" stroke="#ffffff" stroke-width="2.2"/>
  `),

  // کلیپ‌بورد چک‌لیست
  tasks: wrap(`
    <rect x="10" y="8" width="28" height="34" rx="5" fill="#12a5b3"/>
    <rect x="14" y="12" width="20" height="26" rx="3" fill="#ffffff"/>
    <rect x="18" y="5.5" width="12" height="6" rx="3" fill="#ff8a3d"/>
    <rect x="18" y="18" width="5" height="5" rx="1.4" fill="#23c98a"/>
    <path d="M19 20.4l1.3 1.3 2-2.3" stroke="#ffffff" stroke-width="1.8"/>
    <path d="M26 20.5h5"/>
    <rect x="18" y="27" width="5" height="5" rx="1.4" fill="#ffc531"/>
    <path d="M26 29.5h5"/>
  `),

  // خانه (روی دکمه‌ی مرکزی)
  home: wrap(`
    <path d="M9 23 24 10l15 13" fill="none" stroke-width="2.6"/>
    <path d="M12 21v16h24V21" fill="#ffffff"/>
    <path d="M9 23 24 10l15 13" fill="#e04bce"/>
    <path d="M12 21v16h24V21" fill="#ffffff" stroke="#17123a"/>
    <rect x="20.5" y="27" width="7" height="10" rx="1.5" fill="#ff5d73"/>
    <rect x="14.5" y="25" width="5" height="5" rx="1.2" fill="#ffc531"/>
  `),

  // پایپ‌لاین / تایم‌لاین
  agenda: wrap(`
    <path d="M13 10v28" stroke-width="2.6"/>
    <circle cx="13" cy="14" r="4" fill="#3f6fff"/>
    <circle cx="13" cy="24" r="4" fill="#ff8a3d"/>
    <circle cx="13" cy="34" r="4" fill="#23c98a"/>
    <rect x="21" y="11.5" width="18" height="5" rx="2.5" fill="#3f6fff"/>
    <rect x="21" y="21.5" width="15" height="5" rx="2.5" fill="#ff8a3d"/>
    <rect x="21" y="31.5" width="17" height="5" rx="2.5" fill="#23c98a"/>
  `),

  // نمودار عملکرد (میله‌ها + خط روند)
  performance: wrap(`
    <rect x="7" y="9" width="34" height="30" rx="5" fill="#ffffff"/>
    <rect x="13" y="26" width="6" height="8" rx="2" fill="#2ba8f5"/>
    <rect x="21" y="20" width="6" height="14" rx="2" fill="#23c98a"/>
    <rect x="29" y="14" width="6" height="20" rx="2" fill="#ff8a3d"/>
    <path d="M13 22l8-5 8-6" stroke="#e04bce" stroke-width="2.6"/>
    <circle cx="29" cy="11" r="2.6" fill="#e04bce" stroke="none"/>
  `),

  // چرخ‌دنده‌ی تنظیمات (۸ دندانه‌ی ذوزنقه‌ای، تولیدشده‌ی ریاضی و کاملاً متقارن)
  settings: wrap(`
    <path d="M18.70 9.97 L19.31 3.02 L28.69 3.02 L29.30 9.97 L30.17 10.33 L35.52 5.85 L42.15 12.48 L37.67 17.83 L38.03 18.70 L44.98 19.31 L44.98 28.69 L38.03 29.30 L37.67 30.17 L42.15 35.52 L35.52 42.15 L30.17 37.67 L29.30 38.03 L28.69 44.98 L19.31 44.98 L18.70 38.03 L17.83 37.67 L12.48 42.15 L5.85 35.52 L10.33 30.17 L9.97 29.30 L3.02 28.69 L3.02 19.31 L9.97 18.70 L10.33 17.83 L5.85 12.48 L12.48 5.85 L17.83 10.33 Z"
      fill="#9b59f6" stroke-linejoin="round"/>
    <circle cx="24" cy="24" r="8" fill="#ffffff"/>
    <circle cx="24" cy="24" r="4" fill="#2ba8f5" stroke="none"/>
  `),
}
