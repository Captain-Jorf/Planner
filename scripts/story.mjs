// بنر استوری اینستاگرام (۱۰۸۰×۱۹۲۰) برای معرفی برنامه.
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'

const W = 1080, H = 1920
const FONT = 'Vazirmatn, Vira, Tahoma, sans-serif'
const C = {
  bg: '#0e0a24', bg2: '#171041', surface: '#1a1544',
  indigo: '#6c5ce7', indigoL: '#8b7cff', magenta: '#e04bce',
  azure: '#3f6fff', mint: '#23c98a', sunflower: '#ffc531',
  coral: '#ff5d73', rose: '#ff4f97', teal: '#12a5b3',
  text: '#f3f2fc', soft: '#a7a2cf', white: '#ffffff',
}

function b64(p) { return 'data:image/png;base64,' + readFileSync(p).toString('base64') }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function t(x, y, str, { size = 40, color, weight = 700, anchor = 'middle', ls = 0 } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}"
    fill="${color}" text-anchor="${anchor}" direction="rtl" letter-spacing="${ls}">${esc(str)}</text>`
}

// یک تلفن با قاب و اسکرین‌شات
function phone(x, y, w, imgPath, rot, glow) {
  const h = w * (844 / 390)
  const cx = x + w / 2, cy = y + h / 2
  const rad = 46
  const id = ('c' + x + y).replace(/[^a-z0-9]/gi, '')
  let g = ''
  if (glow) g = `<rect x="${x - 24}" y="${y - 24}" width="${w + 48}" height="${h + 48}" rx="${rad + 20}" fill="${glow}" opacity="0.35"/>`
  return `<g transform="rotate(${rot} ${cx} ${cy})">
    ${g}
    <rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}" rx="${rad + 10}" fill="#05030f"/>
    <rect x="${x - 14}" y="${y - 14}" width="${w + 28}" height="${h + 28}" rx="${rad + 10}" fill="none" stroke="#2c2666" stroke-width="3"/>
    <clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}"/></clipPath>
    <image x="${x}" y="${y}" width="${w}" height="${h}" href="${b64(imgPath)}"
      preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>
  </g>`
}

let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`

// پس‌زمینه‌ی تیره + دو شکل بزرگ ساده و رنگ ثابت (بدون گرادیان)
s += `<rect width="${W}" height="${H}" fill="${C.bg}"/>`
s += `<circle cx="${W - 60}" cy="220" r="520" fill="${C.indigo}" opacity="0.16"/>`
s += `<circle cx="120" cy="${H - 120}" r="460" fill="${C.magenta}" opacity="0.12"/>`
s += `<circle cx="90" cy="380" r="200" fill="${C.azure}" opacity="0.10"/>`

// نوار بالای استوری: نشان برنامه
s += `<rect x="${W / 2 - 150}" y="120" width="300" height="70" rx="35" fill="${C.surface}" stroke="${C.indigo}" stroke-width="2"/>`
s += `<circle cx="${W / 2 + 108}" cy="155" r="16" fill="${C.mint}"/>`
s += t(W / 2 + 60, 168, 'اپلیکیشن رایگان', { size: 30, color: C.text, weight: 800 })

// عنوان اصلی
s += t(W / 2, 320, 'برنامه‌ریز روزانه', { size: 100, color: C.white, weight: 900 })
s += `<rect x="${W / 2 - 170}" y="352" width="340" height="12" rx="6" fill="${C.indigoL}"/>`
s += t(W / 2, 430, 'کارها، رویدادها و زمان‌بندی روزت', { size: 42, color: C.soft, weight: 700 })
s += t(W / 2, 492, 'را حرفه‌ای مدیریت کن', { size: 42, color: C.soft, weight: 700 })

// سه تلفن هم‌پوشان در مرکز
s += phone(560, 620, 300, 'docs/screens/performance.png', 9, C.azure)
s += phone(150, 620, 300, 'docs/screens/agenda.png', -9, C.magenta)
s += phone(365, 560, 340, 'docs/screens/home-dark.png', 0, C.indigo)

// چیپ‌های ویژگی
const chips = [
  ['تقویم شمسی', C.indigo], ['حالت تیره', C.azure],
  ['بدون اینترنت', C.mint], ['بدون تبلیغ', C.coral],
]
let cy = 1500
for (let i = 0; i < chips.length; i += 2) {
  const row = chips.slice(i, i + 2)
  const gap = 30
  const ws = row.map(([l]) => l.length * 24 + 70)
  const total = ws.reduce((a, b) => a + b, 0) + gap
  let x = W / 2 + total / 2
  row.forEach(([label, col], j) => {
    const w = ws[j]
    x -= w
    s += `<rect x="${x}" y="${cy}" width="${w}" height="76" rx="38" fill="${col}"/>`
    s += t(x + w / 2, cy + 50, label, { size: 32, color: '#fff', weight: 800 })
    x -= gap
  })
  cy += 96
}

// دکمه‌ی دانلود
s += `<rect x="${W / 2 - 300}" y="1710" width="600" height="110" rx="55" fill="${C.indigoL}"/>`
s += t(W / 2, 1780, 'همین حالا دانلود کن', { size: 44, color: '#12093a', weight: 900 })

s += `</svg>`

const r = new Resvg(s, {
  font: { fontDirs: ['node_modules/vazirmatn/fonts/webfonts', 'node_modules/vazirmatn/fonts/ttf'], loadSystemFonts: true, defaultFontFamily: 'Vazirmatn' },
})
writeFileSync('docs/instagram-story.png', r.render().asPng())
console.log('wrote docs/instagram-story.png')
