// ابزار تاریخ شمسی — بر پایه‌ی jalaali-js
import * as jalaali from 'jalaali-js'

export const WEEK_DAYS = ['شنبه', 'یک‌شنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه']
export const WEEK_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
export const MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
]

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

// تبدیل ارقام لاتین به فارسی
export function toFa(input) {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[+d])
}

// شماره‌ی روز هفته به سبک شمسی: شنبه=0 ... جمعه=6
export function jsDowToShamsi(jsDay) {
  // getDay(): یک‌شنبه=0 ... شنبه=6  →  شنبه=0 ... جمعه=6
  return (jsDay + 1) % 7
}

export function todayJalali() {
  const d = new Date()
  const { jy, jm, jd } = jalaali.toJalaali(d)
  return { jy, jm, jd, dow: jsDowToShamsi(d.getDay()) }
}

export function isLeap(jy) {
  return jalaali.isLeapJalaaliYear(jy)
}

export function monthLength(jy, jm) {
  return jalaali.jalaaliMonthLength(jy, jm)
}

// روز هفته‌ی اولِ ماه (شنبه=0..جمعه=6)
export function firstDowOfMonth(jy, jm) {
  const g = jalaali.toGregorian(jy, jm, 1)
  const d = new Date(g.gy, g.gm - 1, g.gd)
  return jsDowToShamsi(d.getDay())
}

// کلید یکتا برای یک روز شمسی (برای ذخیره‌ی داده)
export function dayKey(jy, jm, jd) {
  return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`
}

export function todayKey() {
  const { jy, jm, jd } = todayJalali()
  return dayKey(jy, jm, jd)
}

// متن کامل تاریخ: «سه‌شنبه ۱۳ شهریور ۱۴۰۵»
export function longDate(jy, jm, jd, dow) {
  return `${WEEK_DAYS[dow]} ${toFa(jd)} ${MONTHS[jm - 1]} ${toFa(jy)}`
}

// روز هفته‌ی یک کلید روز (شنبه=0..جمعه=6)
export function dowOfKey(key) {
  const [jy, jm, jd] = String(key).split('-').map(Number)
  const g = jalaali.toGregorian(jy, jm, jd)
  const d = new Date(g.gy, g.gm - 1, g.gd)
  return jsDowToShamsi(d.getDay())
}

// آیا این کلید مربوط به امروز است؟
export function isToday(jy, jm, jd) {
  const t = todayJalali()
  return t.jy === jy && t.jm === jm && t.jd === jd
}
