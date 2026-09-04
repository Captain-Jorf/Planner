// بنر معرفی برای README: سه اسکرین‌شات را داخل یک صحنه‌ی رنگی می‌چیند.
import { Resvg } from '@resvg/resvg-js'
import { readFileSync, writeFileSync } from 'node:fs'

const BW = 1280, BH = 640
const FONT = 'Vazirmatn, Vira, Tahoma, sans-serif'
const C = {
  bg: '#f3f1fb', indigo: '#6c5ce7', indigoD: '#5a49d6', magenta: '#e04bce',
  azure: '#3f6fff', mint: '#23c98a', sunflower: '#ffc531', coral: '#ff5d73',
  text: '#17123a', soft: '#6f6a92', white: '#ffffff',
}

function b64(path) {
  return 'data:image/png;base64,' + readFileSync(path).toString('base64')
}

// یک تلفن با قاب و اسکرین‌شات داخل آن
function phone(x, y, w, imgPath, rot) {
  const h = w * (844 / 390)
  const cx = x + w / 2, cy = y + h / 2
  const img = b64(imgPath)
  const rad = 34
  return `<g transform="rotate(${rot} ${cx} ${cy})">
    <rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="${rad + 8}"
      fill="#0e0a24"/>
    <rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" rx="${rad + 8}"
      fill="none" stroke="#17123a" stroke-width="2"/>
    <clipPath id="clip${x}${y}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}"/></clipPath>
    <image x="${x}" y="${y}" width="${w}" height="${h}" href="${img}"
      preserveAspectRatio="xMidYMid slice" clip-path="url(#clip${x}${y})"/>
  </g>`
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function t(x, y, str, { size = 15, color, weight = 700, anchor = 'end' } = {}) {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}"
    fill="${color}" text-anchor="${anchor}" direction="rtl">${esc(str)}</text>`
}

let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}">`
// پس‌زمینه: دو شکل بزرگ ساده و رنگ ثابت
s += `<rect width="${BW}" height="${BH}" fill="${C.bg}"/>`
s += `<circle cx="${BW - 120}" cy="90" r="380" fill="${C.indigo}" opacity="0.10"/>`
s += `<circle cx="120" cy="${BH - 40}" r="300" fill="${C.magenta}" opacity="0.08"/>`

// متن سمت راست (RTL)
const RX = BW - 70
s += t(RX, 210, 'برنامه‌ریز روزانه', { size: 68, color: C.text, weight: 900 })
s += `<rect x="${RX - 250}" y="238" width="250" height="10" rx="5" fill="${C.indigo}"/>`
s += t(RX, 300, 'مدیریت کار، رویداد و زمان‌بندی روزتان', { size: 30, color: C.soft, weight: 700 })
s += t(RX, 344, 'به‌همراه تقویم شمسی و حالت تیره', { size: 30, color: C.soft, weight: 700 })

// چیپ‌های ویژگی
const chips = [['تقویم شمسی', C.indigo], ['بدون اینترنت', C.mint], ['بدون تبلیغ', C.coral], ['حالت تیره', C.azure]]
let cx = RX
chips.forEach(([label, col]) => {
  const w = label.length * 17 + 46
  cx -= w
  s += `<rect x="${cx}" y="392" width="${w}" height="52" rx="26" fill="${col}"/>`
  s += t(cx + w - 23, 425, label, { size: 22, color: '#fff', weight: 800 })
  cx -= 16
})

// سه تلفن سمت چپ، هم‌پوشان و کمی چرخیده
s += phone(300, 150, 232, 'docs/screens/performance.png', -8)
s += phone(70, 110, 244, 'docs/screens/home.png', 0)
s += phone(-150, 150, 232, 'docs/screens/agenda.png', 8)

s += `</svg>`

const r = new Resvg(s, {
  font: { fontDirs: ['node_modules/vazirmatn/fonts/webfonts', 'node_modules/vazirmatn/fonts/ttf'], loadSystemFonts: true, defaultFontFamily: 'Vazirmatn' },
})
writeFileSync('docs/banner.png', r.render().asPng())
console.log('wrote docs/banner.png')
