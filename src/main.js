import 'vazirmatn/Vazirmatn-font-face.css'
import './theme.css'
import { icon } from './icons.js'
import { getState, subscribe } from './store.js'
import { views } from './views/index.js'
import { setNav } from './nav.js'

const TABS = ['calendar', 'tasks', 'home', 'agenda', 'settings']
let current = 'home'

const app = document.getElementById('app')

// شل اپ فقط یک‌بار ساخته می‌شود؛ فقط محتوای نما به‌روز می‌شود (بهینه)
function buildShell() {
  app.innerHTML = `
    <main class="screen" id="screen"><div class="view" id="view-root"></div></main>
    <nav class="tabbar" id="tabbar"></nav>
    <button class="home-fab" id="home-fab" data-tab="home" aria-label="خانه">${icon('home')}</button>
    <div class="toast" id="toast"></div>
  `
  buildTabbar()
  app.querySelector('#home-fab').addEventListener('click', () => go('home'))
}

function buildTabbar() {
  const tabbar = app.querySelector('#tabbar')
  const item = (id, label, ic) =>
    `<button class="tab" data-tab="${id}">${icon(ic)}<span>${label}</span></button>`
  tabbar.innerHTML = `
    ${item('calendar', 'تقویم', 'calendar')}
    ${item('tasks', 'وظایف', 'tasks')}
    <div class="tab spacer"></div>
    ${item('agenda', 'برنامه', 'timeline')}
    ${item('settings', 'تنظیمات', 'settings')}
  `
  tabbar.querySelectorAll('[data-tab]').forEach((el) =>
    el.addEventListener('click', () => go(el.dataset.tab)))
}

function syncTabbarActive() {
  app.querySelectorAll('#tabbar .tab').forEach((el) =>
    el.classList.toggle('active', el.dataset.tab === current))
  app.querySelector('#home-fab').classList.toggle('active', current === 'home')
}

// فقط محتوای نمای فعال را رندر می‌کند (بدون بازساخت شل)
function renderView(animate = true) {
  const view = views[current] || views.home
  const root = app.querySelector('#view-root')
  root.classList.remove('view')
  // اجبار به ری‌فلو برای اجرای دوباره‌ی انیمیشن ورود
  if (animate) { void root.offsetWidth; root.classList.add('view') }
  root.innerHTML = view.render()
  if (view.mount) view.mount(root)
  syncTabbarActive()
  app.querySelector('#screen').scrollTop = 0
}

// به‌روزرسانی درجای نمای فعلی (بدون انیمیشن و بدون اسکرول به بالا)
function refresh() {
  const view = views[current] || views.home
  const root = app.querySelector('#view-root')
  const scroll = app.querySelector('#screen').scrollTop
  root.innerHTML = view.render()
  if (view.mount) view.mount(root)
  app.querySelector('#screen').scrollTop = scroll
}

function go(tab) {
  if (!TABS.includes(tab) || tab === current) return
  current = tab
  renderView(true)
}

let toastTimer
function toast(msg) {
  const t = app.querySelector('#toast')
  if (!t) return
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.remove('show'), 1700)
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', getState().theme)
}

setNav({ go, toast, refresh })
subscribe(applyTheme)

applyTheme()
buildShell()
renderView(true)
