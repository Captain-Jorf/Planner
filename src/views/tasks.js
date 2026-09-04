import { icon } from '../icons.js'
import emptyImg from '../assets/empty-tasks.png'
import celebrateImg from '../assets/celebrate.png'
import { getState, update, nextId, sortTasks } from '../store.js'
import { toast, refresh } from '../nav.js'
import { todayKey, toFa } from '../jalali.js'

export const PRIO = {
  high: { label: 'مهم',   color: 'var(--c-danger)',    bg: 'rgba(245,56,74,.14)' },
  mid:  { label: 'متوسط', color: 'var(--c-tangerine)', bg: 'rgba(255,138,61,.14)' },
  low:  { label: 'عادی',  color: 'var(--c-teal)',      bg: 'rgba(18,165,179,.14)' },
}

// اتصال چک‌باکس‌های وظیفه در هر نمایی (تایم‌لاین، فهرست، ...) — به‌روزرسانی درجا
export function bindTaskChecks(root, cb) {
  root.querySelectorAll('[data-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      const id = +el.dataset.toggle
      update((s) => { const t = s.tasks.find((x) => x.id === id); if (t) t.done = !t.done })
      if (cb) cb()
    })
  })
}

let filter = 'all'      // all | open | done
let newPrio = 'mid'

export const tasks = {
  render() {
    const s = getState()
    const tk = todayKey()
    const all = sortTasks(s.tasks.filter((x) => x.day === tk))
    const list = all.filter((x) =>
      filter === 'all' ? true : filter === 'open' ? !x.done : x.done)
    const done = all.filter((x) => x.done).length
    const allDone = all.length > 0 && done === all.length

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">کارهای امروز</div>
          <h1>وظایف</h1>
        </div>
        <div class="chip" style="background:rgba(108,92,231,.14); color:var(--c-indigo)">
          ${toFa(done)} از ${toFa(all.length)} انجام شد
        </div>
      </div>

      <div class="card pop" style="padding:14px">
        <input class="input" id="task-input" placeholder="یک کار جدید بنویس..." />
        <div style="display:flex; gap:10px; margin-top:10px; align-items:center">
          <input class="input" id="task-time" type="text" inputmode="numeric"
            placeholder="ساعت (۰۹:۳۰)" style="max-width:130px; text-align:center" />
          <button class="btn btn-brand" id="add-task" style="flex:1">
            ${icon('plus', 'width="20" height="20"')} افزودن</button>
        </div>
        <div class="hscroll" style="margin-top:12px">
          ${prioChip('high')} ${prioChip('mid')} ${prioChip('low')}
        </div>
      </div>

      <div class="hscroll" style="margin-top:16px">
        ${filterChip('all', 'همه')}
        ${filterChip('open', 'باز')}
        ${filterChip('done', 'انجام‌شده')}
      </div>

      <div style="margin-top:8px" id="task-list">
        ${allDone && filter !== 'open'
          ? `<div class="empty"><img src="${celebrateImg}" alt="" /><p>آفرین! همه‌ی کارهای امروز انجام شد 🎉</p></div>`
          : list.length === 0
            ? `<div class="empty"><img src="${emptyImg}" alt="" /><p>هیچ کاری اینجا نیست. یکی اضافه کن!</p></div>`
            : list.map(taskRow).join('')}
      </div>
    `
  },

  mount(root) {
    const input = root.querySelector('#task-input')
    const timeEl = root.querySelector('#task-time')
    const add = () => {
      const val = input.value.trim()
      if (!val) { toast('چیزی بنویس ✍️'); input.focus(); return }
      const id = nextId()
      const time = normalizeTime(timeEl.value)
      update((s) => {
        s.tasks.push({ id, text: val, done: false, prio: newPrio, time, day: todayKey() })
      })
      input.value = ''; timeEl.value = ''
      toast('اضافه شد ✅')
      refresh()
    }
    root.querySelector('#add-task').addEventListener('click', add)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add() })
    timeEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') add() })

    root.querySelectorAll('[data-prio]').forEach((el) =>
      el.addEventListener('click', () => { newPrio = el.dataset.prio; refresh() }))
    root.querySelectorAll('[data-filter]').forEach((el) =>
      el.addEventListener('click', () => { filter = el.dataset.filter; refresh() }))

    bindTaskChecks(root, refresh)

    root.querySelectorAll('[data-del]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = +el.dataset.del
        update((s) => { s.tasks = s.tasks.filter((x) => x.id !== id) })
        toast('حذف شد 🗑️')
        refresh()
      }))
  },
}

function normalizeTime(v) {
  const raw = String(v || '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).trim()
  if (!raw) return ''
  const m = raw.match(/^(\d{1,2})[:٫.]?(\d{0,2})$/)
  if (!m) return ''
  const hh = String(Math.min(23, +m[1])).padStart(2, '0')
  const mm = String(Math.min(59, +(m[2] || 0))).padStart(2, '0')
  return `${hh}:${mm}`
}

function prioChip(k) {
  const p = PRIO[k]
  const on = newPrio === k
  return `<button class="chip" data-prio="${k}"
    style="background:${on ? p.color : p.bg}; color:${on ? '#fff' : p.color}">
    <span class="prio-tag" style="background:${on ? '#fff' : p.color}"></span> ${p.label}</button>`
}

function filterChip(k, label) {
  const on = filter === k
  return `<button class="chip" data-filter="${k}"
    style="background:${on ? 'var(--brand)' : 'var(--surface-2)'};
           color:${on ? '#fff' : 'var(--text-soft)'};
           border:1.5px solid var(--border)">${label}</button>`
}

function taskRow(t) {
  const p = PRIO[t.prio] || PRIO.mid
  return `
    <div class="list-item ${t.done ? 'done' : ''}">
      <div class="check ${t.done ? 'on' : ''}" data-toggle="${t.id}">${icon('check')}</div>
      <div style="flex:1">
        <div class="li-text">${escapeHtml(t.text)}</div>
        <div class="li-sub" style="display:flex; align-items:center; gap:10px">
          <span style="display:inline-flex; align-items:center; gap:5px; color:${p.color}">
            <span class="prio-tag" style="background:${p.color}"></span>${p.label}</span>
          ${t.time ? `<span style="display:inline-flex; align-items:center; gap:4px">
            ${icon('clock', 'width="12" height="12"')} ${toFa(t.time)}</span>` : ''}
        </div>
      </div>
      <button class="del" data-del="${t.id}">${icon('trash', 'width="16" height="16"')}</button>
    </div>`
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
