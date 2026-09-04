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

  // چرخ‌دنده‌ی تنظیمات (۸ دندانه، متقارن)
  settings: wrap(`
    <path d="M24 4.5l3.1 3.4 4.5-1.4 1.4 4.5 4.5 1.4-1.4 4.5 3.4 3.1-3.4 3.1 1.4 4.5-4.5 1.4-1.4 4.5-4.5-1.4L24 43.5l-3.1-3.4-4.5 1.4-1.4-4.5-4.5-1.4 1.4-4.5L8.5 28l3.4-3.1-1.4-4.5 4.5-1.4 1.4-4.5 4.5 1.4z"
      fill="#9b59f6"/>
    <circle cx="24" cy="24" r="8.5" fill="#ffffff"/>
    <circle cx="24" cy="24" r="4.5" fill="#2ba8f5" stroke="none"/>
  `),
}
