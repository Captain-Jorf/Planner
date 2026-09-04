import 'vazirmatn/Vazirmatn-font-face.css'
import './theme.css'
import { icon } from './icons.js'
import { getState, subscribe } from './store.js'
import { views } from './views/index.js'
import { setNav } from './nav.js'

// --- روتر ساده ---
const TABS = ['calendar', 'tasks', 'home', 'habits', 'settings']
let current = 'home'

const app = document.getElementById('app')

function applyTheme() {
  document.documentElement.setAttribute('data-theme', getState().theme)
}

function render() {
  applyTheme()
  const view = views[current] || views.home
  app.innerHTML = `
    <main class="screen">
      <div class="view" id="view-root">${view.render()}</div>
    </main>
    ${renderTabbar()}
    <div class="toast" id="toast"></div>
  `
  if (view.mount) view.mount(app.querySelector('#view-root'))
  bindTabbar()
}

function renderTabbar() {
  const item = (id, label, ic) => `
    <button class="tab ${current === id ? 'active' : ''}" data-tab="${id}">
      ${icon(ic)}<span>${label}</span>
    </button>`
  return `
    <nav class="tabbar">
      ${item('calendar', 'تقویم', 'calendar')}
      ${item('tasks', 'وظایف', 'tasks')}
      <div class="tab spacer"></div>
      ${item('habits', 'عادت‌ها', 'habit')}
      ${item('settings', 'تنظیمات', 'settings')}
    </nav>
    <button class="home-fab ${current === 'home' ? 'active' : ''}" data-tab="home" aria-label="خانه">
      ${icon('home')}
    </button>
  `
}

function bindTabbar() {
  app.querySelectorAll('[data-tab]').forEach((el) => {
    el.addEventListener('click', () => go(el.dataset.tab))
  })
}

function go(tab) {
  if (!TABS.includes(tab)) return
  if (tab === current) return
  current = tab
  render()
}

// --- توست سراسری ---
let toastTimer
function toast(msg) {
  const t = document.getElementById('toast')
  if (!t) return
  t.textContent = msg
  t.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800)
}

setNav({ go, toast, rerender: render })

// همگام‌سازی تم زنده هنگام تغییر وضعیت
subscribe(() => { applyTheme() })

render()
