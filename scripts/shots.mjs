// ژنراتور اسکرین‌شات: ماکِت‌های صفحات برنامه را به‌صورت SVG می‌سازد و به PNG رَستر می‌کند.
// از وکتورهای واقعی برنامه (navicons + illus) استفاده می‌کند.
import { Resvg } from '@resvg/resvg-js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { navIcons } from '../src/navicons.js'
import { heroSvg, emptyTasksSvg, celebrateSvg } from '../src/illus.js'

mkdirSync('docs/screens', { recursive: true })

// ----- پالت -----
const C = {
  bg: '#f3f1fb', surface: '#ffffff', surface2: '#f6f4fd',
  text: '#17123a', soft: '#6f6a92', border: '#e6e3f4', line: '#17123a',
  indigo: '#6c5ce7', magenta: '#e04bce', azure: '#3f6fff', mint: '#23c98a',
  teal: '#12a5b3', tangerine: '#ff8a3d', sunflower: '#ffc531', coral: '#ff5d73',
  rose: '#ff4f97', danger: '#f5384a', success: '#1fb877', white: '#fff', dark: false,
}
// تیره
const D = {
  bg: '#0e0a24', surface: '#1a1544', surface2: '#221c56',
  text: '#f3f2fc', soft: '#a7a2cf', border: '#2c2666', line: '#000000',
  indigo: '#8b7cff', magenta: '#e04bce', azure: '#3f6fff', mint: '#23c98a',
  teal: '#12a5b3', tangerine: '#ff8a3d', sunflower: '#ffc531', coral: '#ff5d73',
  rose: '#ff4f97', danger: '#f5384a', success: '#1fb877', white: '#1a1544', dark: true,
}

const W = 390, H = 844
const FONT = 'Vazirmatn, Vira, Tahoma, sans-serif'

// اسکِیل و جای‌گذاری یک svg وکتور
function place(svg, x, y, w, h) {
  const inner = svg.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 48 48'
  const [, , vw, vh] = vb.split(/\s+/).map(Number)
  return `<g transform="translate(${x} ${y}) scale(${w / vw} ${h / vh})">${inner}</g>`
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

// متن راست‌چین فارسی
function t(x, y, str, { size = 15, color, weight = 700, anchor = 'end' } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}"
    fill="${color}" text-anchor="${anchor}" direction="rtl">${esc(str)}</text>`
}

function card(x, y, w, h, T, r = 20, fill) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"
    fill="${fill || T.surface}" stroke="${T.border}" stroke-width="1.5"/>`
}

function chip(xRight, y, label, T, { bg, fg, w = 96 } = {}) {
  return `<rect x="${xRight - w}" y="${y}" width="${w}" height="30" rx="15" fill="${bg}"/>
    ${t(xRight - 14, y + 20, label, { size: 12.5, color: fg, weight: 800 })}`
}

// ----- نوار پایین -----
function tabbar(T, active) {
  const y = H - 92
  const tabs = [
    { id: 'tasks', label: 'وظایف', ic: navIcons.tasks },
    { id: 'performance', label: 'عملکرد', ic: navIcons.performance },
    { id: 'spacer' },
    { id: 'agenda', label: 'برنامه', ic: navIcons.agenda },
    { id: 'settings', label: 'تنظیمات', ic: navIcons.settings },
  ]
  const barX = 14, barW = W - 28, barH = 66
  let out = `<rect x="${barX}" y="${y}" width="${barW}" height="${barH}" rx="26"
    fill="${T.surface}" stroke="${T.line}" stroke-width="2.5"/>`
  const slotW = barW / 5
  tabs.forEach((tab, i) => {
    if (tab.id === 'spacer') return
    const cx = barX + slotW * (i + 0.5)
    const on = tab.id === active
    if (on) out += `<rect x="${cx - 22}" y="${y + 10}" width="44" height="40" rx="14"
      fill="${T.indigo}22"/>`
    out += place(tab.ic, cx - 13.5, y + 14, 27, 27)
    out += `<text x="${cx}" y="${y + 58}" font-family="${FONT}" font-size="10.5" font-weight="800"
      fill="${on ? T.indigo : T.soft}" text-anchor="middle">${tab.label}</text>`
  })
  // دکمه‌ی خانه‌ی مرکزی با خط مشکی
  const hx = W / 2, hy = y - 8
  out += `<rect x="${hx - 33}" y="${hy - 25}" width="66" height="66" rx="24"
    fill="${T.indigo}" stroke="#111018" stroke-width="1.5"/>`
  out += place(navIcons.home, hx - 18, hy - 10, 36, 36)
  return out
}

function statusbar(T) {
  return `<text x="26" y="34" font-family="${FONT}" font-size="13" font-weight="800"
    fill="${T.text}" text-anchor="start">۹:۴۱</text>
    <circle cx="${W - 30}" cy="30" r="4" fill="${T.text}"/>
    <circle cx="${W - 44}" cy="30" r="4" fill="${T.text}"/>
    <circle cx="${W - 58}" cy="30" r="4" fill="${T.soft}"/>`
}

function frame(T, body) {
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${T.bg}"/>
    <circle cx="${W - 40}" cy="120" r="150" fill="${T.indigo}" opacity="${T.dark ? 0.18 : 0.12}"/>
    <circle cx="30" cy="${H - 240}" r="130" fill="${T.azure}" opacity="${T.dark ? 0.16 : 0.1}"/>
    ${statusbar(T)}
    ${body}
    ${tabbar(T, T.__active)}
  </svg>`
}

function topbar(T, eyebrow, title, chipEl = '') {
  return `${t(W - 24, 74, eyebrow, { size: 12.5, color: T.soft, weight: 800 })}
    ${t(W - 24, 104, title, { size: 27, color: T.text, weight: 900 })}
    ${chipEl}`
}

// چک‌باکس
function check(x, y, on, T, color) {
  return `<rect x="${x}" y="${y}" width="30" height="30" rx="10"
    fill="${on ? T.success : 'none'}" stroke="${on ? T.success : T.border}" stroke-width="2"/>
    ${on ? `<path d="M${x + 8} ${y + 15}l4 4 8-9" stroke="#fff" stroke-width="2.6" fill="none"
      stroke-linecap="round" stroke-linejoin="round"/>` : ''}`
}

// ردیف کار
function taskRow(x, y, w, T, { title, meta, done, color, tags }) {
  let out = card(x, y, w, 66, T, 18)
  out += check(x + w - 44, y + 18, done, T)
  out += t(x + w - 56, y + 28, title, { size: 15, color: done ? T.soft : T.text, weight: 800 })
  if (done) out += `<line x1="${x + w - 56 - title.length * 8}" y1="${y + 23}" x2="${x + w - 56}" y2="${y + 23}"
    stroke="${T.soft}" stroke-width="1.5"/>`
  out += `<circle cx="${x + w - 60}" cy="${y + 44}" r="4" fill="${color}"/>`
  out += t(x + w - 70, y + 48, meta, { size: 11.5, color: T.soft, weight: 700 })
  // تگ‌ها
  if (tags) {
    let tx = x + 14
    tags.forEach((tg) => {
      const tw = tg.name.length * 8 + 26
      out += `<rect x="${tx}" y="${y + 34}" width="${tw}" height="20" rx="10" fill="${tg.color}22"/>
        <circle cx="${tx + tw - 10}" cy="${y + 44}" r="3.5" fill="${tg.color}"/>
        ${t(tx + tw - 18, y + 48, tg.name, { size: 10.5, color: tg.color, weight: 800 })}`
      tx += tw + 6
    })
  }
  return out
}

// ============ صفحه ۱: خانه ============
function homeScreen(T) {
  let b = topbar(T, 'صبح بخیر', 'علیرضا 👋'.replace(' 👋', ''),
    `<circle cx="34" cy="86" r="22" fill="${T.indigo}"/>
     <text x="34" y="94" font-family="${FONT}" font-size="20" font-weight="900" fill="#fff" text-anchor="middle">ع</text>`)
  // قهرمان
  b += `<rect x="24" y="126" width="${W - 48}" height="132" rx="22" fill="${T.indigo}"/>`
  b += place(heroSvg, 34, 150, 116, 88)
  b += t(W - 40, 162, 'سه‌شنبه ۱۳ شهریور ۱۴۰۵', { size: 12, color: '#e7e3ff', weight: 800 })
  b += t(W - 40, 196, 'نوشتن گزارش', { size: 21, color: '#fff', weight: 900 })
  b += t(W - 40, 224, 'کار بعدی ساعت ۱۱:۳۰', { size: 13, color: '#e7e3ff', weight: 700 })
  // پیشرفت
  b += t(W - 24, 296, 'پیشرفت امروز', { size: 15, color: T.text, weight: 900 })
  b += card(24, 312, W - 48, 118, T)
  // حلقه
  const cx = W - 78, cy = 371, r = 34, circ = 2 * Math.PI * r, pct = 40
  b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.surface2}" stroke-width="9"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.indigo}" stroke-width="9"
      stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - pct / 100)}"
      transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy + 6}" font-family="${FONT}" font-size="17" font-weight="900" fill="${T.indigo}" text-anchor="middle">۴۰٪</text>`
  b += t(W - 130, 356, '۲ از ۵ کار انجام شد', { size: 14.5, color: T.text, weight: 800 })
  b += `<rect x="48" y="372" width="${W - 130 - 48 + 20}" height="10" rx="5" fill="${T.surface2}"/>
    <rect x="${W - 130 - (W - 130 - 48 + 20) * 0.4}" y="372" width="${(W - 130 - 48 + 20) * 0.4}" height="10" rx="5" fill="${T.indigo}"/>`
  b += t(W - 130, 406, '۳ کار باقی مانده', { size: 12, color: T.soft, weight: 700 })
  // تایم‌لاین
  b += t(W - 24, 466, 'تایم‌لاین امروز', { size: 15, color: T.text, weight: 900 })
  b += t(48, 466, 'همه', { size: 12.5, color: T.indigo, weight: 800, anchor: 'start' })
  const tl = [
    { time: '۰۸:۰۰', title: 'مرور برنامه', done: true, c: T.tangerine },
    { time: '۱۱:۳۰', title: 'نوشتن گزارش هفتگی', done: false, c: T.danger },
    { time: '۱۴:۰۰', title: 'جلسه‌ی تیم', done: false, c: T.danger },
  ]
  let yy = 484
  tl.forEach((it) => {
    b += card(24, yy, W - 48, 52, T, 16)
    b += `<circle cx="${W - 42}" cy="${yy + 26}" r="6" fill="${it.c}"/>`
    b += t(W - 58, yy + 31, it.title, { size: 14, color: it.done ? T.soft : T.text, weight: 800 })
    b += t(60, yy + 31, it.time, { size: 12.5, color: T.soft, weight: 800, anchor: 'start' })
    yy += 60
  })
  T.__active = 'home'
  return frame(T, b)
}

// ============ صفحه ۲: وظایف (تقویم + کارها) ============
function tasksScreen(T) {
  let b = topbar(T, 'امروز', 'وظایف', '')
  // تقویم
  b += card(24, 126, W - 48, 250, T)
  b += t(W - 44, 158, 'شهریور ۱۴۰۵', { size: 15, color: T.text, weight: 900 })
  const days = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
  const gx = 40, gw = (W - 48 - 32) / 7
  days.forEach((d, i) => {
    b += `<text x="${W - 44 - i * gw}" y="188" font-family="${FONT}" font-size="12" font-weight="800"
      fill="${i === 6 ? T.coral : T.soft}" text-anchor="middle">${d}</text>`
  })
  // شبکه‌ی روزها
  let dnum = 1
  for (let row = 0; row < 5 && dnum <= 31; row++) {
    for (let col = 0; col < 7 && dnum <= 31; col++) {
      const cxx = W - 44 - col * gw, cyy = 214 + row * 30
      const isToday = dnum === 13
      const hasDot = [3, 8, 13, 20].includes(dnum)
      if (isToday) b += `<rect x="${cxx - 13}" y="${cyy - 13}" width="26" height="26" rx="9" fill="${T.indigo}"/>`
      const faNum = String(dnum).replace(/\d/g, (x) => '۰۱۲۳۴۵۶۷۸۹'[x])
      b += `<text x="${cxx}" y="${cyy + 4}" font-family="${FONT}" font-size="12.5" font-weight="${isToday ? 900 : 700}"
        fill="${isToday ? '#fff' : T.text}" text-anchor="middle">${faNum}</text>`
      if (hasDot && !isToday) b += `<circle cx="${cxx}" cy="${cyy + 11}" r="2.5" fill="${T.magenta}"/>`
      dnum++
    }
  }
  // سگمنت
  const segW = W - 48, half = (segW - 12) / 2
  b += `<rect x="24" y="392" width="${segW}" height="46" rx="14" fill="${T.surface2}" stroke="${T.border}" stroke-width="1.5"/>`
  b += `<rect x="${W - 24 - 6 - half}" y="398" width="${half}" height="34" rx="11" fill="${T.surface}"/>`
  b += t(W - 24 - 6 - half / 2, 421, 'کارها (۴)', { size: 13, color: T.indigo, weight: 800, anchor: 'middle' })
  b += t(24 + 6 + half / 2, 421, 'رویدادها (۱)', { size: 13, color: T.soft, weight: 800, anchor: 'middle' })
  // فرم افزودن
  b += card(24, 450, W - 48, 60, T, 18)
  b += t(W - 40, 485, 'یک کار جدید بنویس...', { size: 13.5, color: T.soft, weight: 600 })
  // لیست کارها
  const tasks = [
    { title: 'نوشتن گزارش هفتگی', meta: '۱۱:۳۰–۱۳:۰۰   مهم', done: false, color: T.danger, tags: [{ name: 'کار', color: T.azure }] },
    { title: 'جلسه‌ی تیم', meta: '۱۴:۰۰   مهم', done: false, color: T.danger, tags: [{ name: 'کار', color: T.azure }] },
    { title: 'ورزش صبحگاهی', meta: '۰۹:۰۰   عادی', done: true, color: T.teal, tags: [{ name: 'سلامتی', color: T.mint }] },
  ]
  let yy = 522
  tasks.forEach((tk) => { b += taskRow(24, yy, W - 48, T, tk); yy += 74 })
  T.__active = 'tasks'
  return frame(T, b)
}

// ============ صفحه ۳: عملکرد ============
function perfScreen(T) {
  let b = topbar(T, 'تحلیل و آمار', 'عملکرد',
    chip(24 + 118, 92, '۵ روز پیاپی', T, { bg: `${T.tangerine}28`, fg: T.tangerine, w: 118 }))
  // حلقه‌ی امروز
  b += t(W - 24, 150, 'امروز در یک نگاه', { size: 15, color: T.text, weight: 900 })
  b += card(24, 166, W - 48, 116, T)
  const cx = W - 78, cy = 224, r = 34, circ = 2 * Math.PI * r
  b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.surface2}" stroke-width="9"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.indigo}" stroke-width="9"
      stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ * 0.6}" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy + 6}" font-family="${FONT}" font-size="17" font-weight="900" fill="${T.indigo}" text-anchor="middle">۴۰٪</text>`
  b += t(W - 130, 212, '۲ از ۵ کار انجام شد', { size: 14.5, color: T.text, weight: 800 })
  b += t(W - 130, 250, '۳ کار باقی مانده', { size: 12, color: T.soft, weight: 700 })
  // نمودار هفتگی
  b += t(W - 24, 318, 'هفت روز اخیر', { size: 15, color: T.text, weight: 900 })
  b += card(24, 334, W - 48, 168, T)
  const bars = [60, 100, 45, 80, 90, 70, 40]
  const dayL = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
  const chartX = 44, chartW = W - 48 - 40, colW = chartW / 7
  bars.forEach((v, i) => {
    const bx = W - 44 - i * colW - 11
    const bh = (v / 100) * 100 + 6
    const by = 334 + 118 - bh
    const isT = i === 6
    b += `<rect x="${bx}" y="${by}" width="22" height="${bh}" rx="7"
      fill="${T.surface2}" stroke="${T.border}" stroke-width="1.5"/>`
    const fh = bh * 0.7
    b += `<rect x="${bx}" y="${by + bh - fh}" width="22" height="${fh}" rx="6" fill="${isT ? T.indigo : T.azure}"/>`
    b += `<text x="${bx + 11}" y="${334 + 138}" font-family="${FONT}" font-size="11" font-weight="800"
      fill="${isT ? T.indigo : T.soft}" text-anchor="middle">${dayL[i]}</text>`
  })
  b += t(W - 40, 334 + 158, 'میانگین ۶۹٪', { size: 11.5, color: T.soft, weight: 800 })
  // کارت‌های آمار
  const stats = [
    { n: '۱۲', c: 'کل کارها', bg: T.sunflower, fg: T.text },
    { n: '۷', c: 'انجام‌شده', bg: T.mint, fg: '#fff' },
    { n: '۳', c: 'رویدادها', bg: T.rose, fg: '#fff' },
    { n: '۵', c: 'رشته‌ی روزها', bg: T.azure, fg: '#fff' },
  ]
  const sw = (W - 48 - 12) / 2
  stats.forEach((st, i) => {
    const sx = i % 2 === 0 ? W - 24 - sw : 24
    const sy = 518 + Math.floor(i / 2) * 72
    b += `<rect x="${sx}" y="${sy}" width="${sw}" height="64" rx="18" fill="${st.bg}"/>`
    b += `<text x="${sx + sw - 16}" y="${sy + 34}" font-family="${FONT}" font-size="24" font-weight="900" fill="${st.fg}" text-anchor="end">${st.n}</text>`
    b += `<text x="${sx + sw - 16}" y="${sy + 52}" font-family="${FONT}" font-size="11.5" font-weight="800" fill="${st.fg}" text-anchor="end" opacity="0.85">${st.c}</text>`
  })
  T.__active = 'performance'
  return frame(T, b)
}

// ============ صفحه ۴: برنامه (تایم‌لاین) ============
function agendaScreen(T) {
  let b = topbar(T, 'سه‌شنبه ۱۳ شهریور ۱۴۰۵', 'برنامه‌ی روز',
    chip(24 + 64, 92, '۲/۵', T, { bg: `${T.success}26`, fg: T.success, w: 64 }))
  // خلاصه
  b += card(24, 126, W - 48, 86, T)
  const cx = 60, cy = 169, r = 24, circ = 2 * Math.PI * r
  b += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.surface2}" stroke-width="7"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${T.indigo}" stroke-width="7"
      stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${circ * 0.6}" transform="rotate(-90 ${cx} ${cy})"/>
    <text x="${cx}" y="${cy + 5}" font-family="${FONT}" font-size="14" font-weight="900" fill="${T.text}" text-anchor="middle">۴۰</text>`
  b += t(W - 44, 162, 'تایم‌لاین امروز', { size: 15.5, color: T.text, weight: 900 })
  b += t(W - 44, 186, '۲ از ۵ کار · ۱ رویداد', { size: 12.5, color: T.soft, weight: 700 })
  // پایپ‌لاین
  const railX = W - 60
  b += t(W - 44, 244, 'صبح', { size: 12, color: T.soft, weight: 900, anchor: 'middle' })
  b += `<line x1="24" y1="240" x2="${W - 84}" y2="240" stroke="${T.border}" stroke-width="2"/>`
  const items = [
    { time: '۰۸:۰۰', title: 'مرور برنامه‌ی امروز', c: T.tangerine, done: true, kind: 'مهم' },
    { time: '۱۱:۳۰', title: 'نوشتن گزارش هفتگی', c: T.danger, done: false, kind: 'مهم' },
    { time: '۱۲:۰۰', title: 'قرار ملاقات مهم', c: T.magenta, done: false, kind: 'رویداد', ev: true },
    { time: '۱۴:۰۰', title: 'جلسه‌ی تیم', c: T.danger, done: false, kind: 'مهم' },
  ]
  let yy = 262
  items.forEach((it, i) => {
    // نشانگر اکنون قبل از دومین آیتم
    if (i === 1) {
      b += `<circle cx="${railX}" cy="${yy - 6}" r="6" fill="${T.coral}" stroke="${T.surface}" stroke-width="2"/>
        <line x1="24" y1="${yy - 6}" x2="${railX - 14}" y2="${yy - 6}" stroke="${T.coral}" stroke-width="2.5" opacity="0.5"/>
        ${t(28, yy - 2, 'اکنون · ۱۰:۱۵', { size: 11, color: T.coral, weight: 900, anchor: 'start' })}`
      yy += 22
    }
    // گره + خط
    if (i < items.length - 1) b += `<line x1="${railX}" y1="${yy + 20}" x2="${railX}" y2="${yy + 84}" stroke="${T.border}" stroke-width="3"/>`
    b += `<circle cx="${railX}" cy="${yy + 18}" r="8" fill="${it.done ? T.success : it.c}" stroke="${T.surface}" stroke-width="3"/>`
    // کارت
    const cw = railX - 34 - 24
    b += `<rect x="24" y="${yy}" width="${cw}" height="60" rx="16" fill="${it.ev ? it.c + '14' : T.surface}" stroke="${T.border}" stroke-width="1.5"/>`
    b += `<rect x="${24 + cw - 5}" y="${yy}" width="5" height="60" rx="2.5" fill="${it.c}"/>`
    b += t(24 + cw - 16, yy + 27, it.title, { size: 14, color: it.done ? T.soft : T.text, weight: 800 })
    b += `<rect x="${24 + cw - 16 - (it.kind.length * 8 + 22)}" y="${yy + 38}" width="${it.kind.length * 8 + 22}" height="20" rx="10" fill="${it.c}22"/>
      ${t(24 + cw - 24, yy + 52, it.kind, { size: 10.5, color: it.c, weight: 800 })}`
    b += t(40, yy + 52, it.time, { size: 12, color: T.soft, weight: 800, anchor: 'start' })
    yy += 70
  })
  T.__active = 'agenda'
  return frame(T, b)
}

// ============ صفحه ۵: تنظیمات ============
function settingsScreen(T) {
  let b = topbar(T, 'شخصی‌سازی', 'تنظیمات',
    `<circle cx="34" cy="86" r="22" fill="${T.indigo}"/>
     <text x="34" y="94" font-family="${FONT}" font-size="20" font-weight="900" fill="#fff" text-anchor="middle">ع</text>`)
  // نمایه
  b += t(W - 24, 148, 'نمایه', { size: 14, color: T.text, weight: 900 })
  b += card(24, 162, W - 48, 96, T)
  b += `<rect x="${W - 68}" y="176" width="36" height="36" rx="11" fill="${T.indigo}"/>`
  b += t(W - 80, 192, 'نام شما', { size: 14, color: T.text, weight: 800 })
  b += t(W - 80, 210, 'در صفحه‌ی خانه نمایش داده می‌شود', { size: 11, color: T.soft, weight: 600 })
  b += `<rect x="40" y="222" width="${W - 80}" height="24" rx="8" fill="${T.surface2}" stroke="${T.border}" stroke-width="1.5"/>`
  b += t(W - 48, 239, 'علیرضا رنجبر', { size: 12.5, color: T.text, weight: 700 })
  // ظاهر (حالت تیره)
  b += t(W - 24, 288, 'ظاهر', { size: 14, color: T.text, weight: 900 })
  b += card(24, 302, W - 48, 56, T)
  b += `<rect x="${W - 68}" y="316" width="36" height="36" rx="11" fill="${T.dark ? T.indigo : T.sunflower}"/>`
  b += t(W - 80, 332, 'حالت تیره', { size: 14, color: T.text, weight: 800 })
  b += t(W - 80, 349, T.dark ? 'روشن است' : 'خاموش است', { size: 11, color: T.soft, weight: 600 })
  const swOn = T.dark
  b += `<rect x="40" y="318" width="48" height="28" rx="14" fill="${swOn ? T.indigo : T.border}"/>
    <circle cx="${swOn ? 74 : 54}" cy="332" r="11" fill="#fff"/>`
  // قالب‌های من
  b += t(W - 24, 388, 'قالب‌های من', { size: 14, color: T.text, weight: 900 })
  b += card(24, 402, W - 48, 150, T)
  const tpls = [['روتین صبح', '۳ کار'], ['روز کاری', '۳ کار']]
  let ty = 418
  tpls.forEach(([n, c]) => {
    b += t(W - 40, ty + 18, n, { size: 14, color: T.text, weight: 800 })
    b += t(W - 40, ty + 36, c, { size: 11.5, color: T.soft, weight: 700 })
    b += `<rect x="40" y="${ty + 6}" width="96" height="34" rx="12" fill="${T.indigo}"/>`
    b += t(40 + 84, ty + 28, 'افزودن', { size: 12.5, color: '#fff', weight: 800 })
    ty += 44
  })
  b += `<rect x="40" y="${ty + 4}" width="${W - 80}" height="34" rx="12" fill="none" stroke="${T.border}" stroke-width="2"/>`
  b += t(W / 2 + 60, ty + 32, 'ساخت قالب جدید', { size: 13, color: T.text, weight: 800, anchor: 'middle' })
  // درباره
  b += t(W - 24, 584, 'درباره', { size: 14, color: T.text, weight: 900 })
  b += card(24, 598, W - 48, 118, T)
  b += `<rect x="${W - 70}" y="614" width="40" height="40" rx="12" fill="${T.indigo}"/>`
  b += t(W - 82, 630, 'برنامه‌ریز روزانه', { size: 15, color: T.text, weight: 900 })
  b += t(W - 82, 648, 'نسخه‌ی ۱۰ · تاریخ شمسی · آفلاین', { size: 11, color: T.soft, weight: 600 })
  b += `<line x1="40" y1="672" x2="${W - 40}" y2="672" stroke="${T.border}" stroke-width="1.5" stroke-dasharray="4 4"/>`
  b += `<rect x="${W - 68}" y="682" width="34" height="34" rx="10" fill="${T.magenta}"/>`
  b += t(W - 80, 696, 'طراحی و توسعه', { size: 11, color: T.soft, weight: 800 })
  b += t(W - 80, 713, 'علیرضا رنجبر', { size: 14.5, color: T.text, weight: 900 })
  T.__active = 'settings'
  return frame(T, b)
}

// ---- رَستر ----
function render(name, svg, scale = 2) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: W * scale },
    font: { fontDirs: ['node_modules/vazirmatn/fonts/webfonts', 'node_modules/vazirmatn/fonts/ttf'], loadSystemFonts: true, defaultFontFamily: 'Vazirmatn' },
  })
  const png = r.render().asPng()
  writeFileSync(`docs/screens/${name}.png`, png)
  console.log('wrote', name, png.length, 'bytes')
}

// خروجی‌ها
render('home', homeScreen({ ...C }))
render('tasks', tasksScreen({ ...C }))
render('performance', perfScreen({ ...C }))
render('agenda', agendaScreen({ ...C }))
render('settings', settingsScreen({ ...C }))
render('home-dark', homeScreen({ ...D }))
render('settings-dark', settingsScreen({ ...D }))
console.log('done')
