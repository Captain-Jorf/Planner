// پل ارتباطی سبک بین نماها و اپ اصلی (برای جلوگیری از وابستگی حلقوی)
const bus = { go: () => {}, toast: () => {}, rerender: () => {} }

export function setNav({ go, toast, rerender }) {
  if (go) bus.go = go
  if (toast) bus.toast = toast
  if (rerender) bus.rerender = rerender
}

export const go = (tab) => bus.go(tab)
export const toast = (msg) => bus.toast(msg)
export const rerender = () => bus.rerender()
