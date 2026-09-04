// پل ارتباطی سبک بین نماها و اپ اصلی (برای جلوگیری از وابستگی حلقوی)
const bus = { go: () => {}, toast: () => {}, refresh: () => {} }

export function setNav({ go, toast, refresh }) {
  if (go) bus.go = go
  if (toast) bus.toast = toast
  if (refresh) bus.refresh = refresh
}

export const go = (tab) => bus.go(tab)
export const toast = (msg) => bus.toast(msg)
// به‌روزرسانی درجای نمای فعلی (بدون پرش/انیمیشن) — بهینه
export const refresh = () => bus.refresh()
