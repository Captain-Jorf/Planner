import { icon } from '../icons.js'
import { emptyTasksSvg, celebrateSvg } from '../illus.js'
import {
  getState, update, nextId, sortTasks,
  tasksForDay, toggleTaskDone, taskEnd, getTag,
} from '../store.js'
import { toast, refresh } from '../nav.js'
import { todayKey, toFa } from '../jalali.js'

export const PRIO = {
  high: { label: 'مهم',   color: 'var(--c-danger)',    bg: 'rgba(245,56,74,.14)' },
  mid:  { label: 'متوسط', color: 'var(--c-tangerine)', bg: 'rgba(255,138,61,.14)' },
  low:  { label: 'عادی',  color: 'var(--c-teal)',      bg: 'rgba(18,165,179,.14)' },
}

export const REPEAT = {
  none:    { label: 'یک‌بار',  icon: 'target' },
  daily:   { label: 'روزانه',  icon: 'flame' },
  weekly:  { label: 'هفتگی',   icon: 'calendar' },
  monthly: { label: 'ماهانه',  icon: 'star' },
}

// اتصال چک‌باکس‌های وظیفه در هر نمایی — روزمحور (تکرارشونده‌ها برای همان روز)
export function bindTaskChecks(root, cb, key = todayKey()) {
  root.querySelectorAll('[data-toggle]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      toggleTaskDone(+el.dataset.toggle, key)
      if (cb) cb()
    })
  })
}

let filter = 'all'          // all | open | done
let tagFilter = null        // شناسه‌ی تگ یا null
let newPrio = 'mid'
let newTags = []
let newRepeat = 'none'
let showOptions = false     // نمایش گزینه‌های پیشرفته‌ی افزودن

export const tasks = {
  render() {
    const s = getState()
    const tk = todayKey()
    let all = sortTasks(tasksForDay(tk))
    if (tagFilter) all = all.filter((x) => (x.tags || []).includes(tagFilter))
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
            placeholder="ساعت (۰۹:۳۰)" style="max-width:120px; text-align:center" />
          <input class="input" id="task-dur" type="text" inputmode="numeric"
            placeholder="مدت (دقیقه)" style="max-width:120px; text-align:center" />
          <button class="btn btn-ghost btn-icon" id="opt-toggle" title="گزینه‌ها"
            style="flex-shrink:0">${icon('bolt', 'width=\"18\" height=\"18\"')}</button>
        </div>

        <div class="opt-panel ${showOptions ? 'open' : ''}" id="opt-panel">
          <div class="opt-label">اولویت</div>
          <div class="hscroll">${prioChip('high')} ${prioChip('mid')} ${prioChip('low')}</div>
          <div class="opt-label">دسته (تگ)</div>
          <div class="hscroll">${s.tags.map(tagPick).join('')}</div>
          <div class="opt-label">تکرار</div>
          <div class="hscroll">${Object.keys(REPEAT).map(repeatPick).join('')}</div>
        </div>

        <button class="btn btn-brand btn-block" id="add-task" style="margin-top:12px">
          ${icon('plus', 'width=\"20\" height=\"20\"')} افزودن کار</button>
      </div>

      <div class="hscroll" style="margin-top:16px">
        ${filterChip('all', 'همه')}
        ${filterChip('open', 'باز')}
        ${filterChip('done', 'انجام‌شده')}
        <span style="width:1px; background:var(--border); margin:0 2px"></span>
        ${tagFilterChip(null, 'همه‌ی دسته‌ها')}
        ${s.tags.map((t) => tagFilterChip(t.id, t.name)).join('')}
      </div>

      <div style="margin-top:8px" id="task-list">
        ${allDone && filter !== 'open'
          ? `<div class="empty">${celebrateSvg}<p>آفرین! همه‌ی کارهای امروز انجام شد 🎉</p></div>`
          : list.length === 0
            ? `<div class="empty">${emptyTasksSvg}<p>هیچ کاری اینجا نیست. یکی اضافه کن!</p></div>`
            : list.map(taskRow).join('')}
      </div>
    `
  },

  mount(root) {
    const input = root.querySelector('#task-input')
    const timeEl = root.querySelector('#task-time')
    const durEl = root.querySelector('#task-dur')
    const add = () => {
      const val = input.value.trim()
      if (!val) { toast('چیزی بنویس ✍️'); input.focus(); return }
      const id = nextId()
      const time = normalizeTime(timeEl.value)
      const dur = parseDur(durEl.value)
      update((s) => {
        s.tasks.push({
          id, text: val, done: false, prio: newPrio, time, dur,
          day: todayKey(), tags: [...newTags], repeat: newRepeat, doneDays: [],
        })
      })
      input.value = ''; timeEl.value = ''; durEl.value = ''
      toast('اضافه شد ✅')
      refresh()
    }
    root.querySelector('#add-task').addEventListener('click', add)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add() })
    timeEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') add() })
    durEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') add() })

    root.querySelector('#opt-toggle').addEventListener('click', () => {
      showOptions = !showOptions
      root.querySelector('#opt-panel').classList.toggle('open', showOptions)
    })

    root.querySelectorAll('[data-prio]').forEach((el) =>
      el.addEventListener('click', () => { newPrio = el.dataset.prio; refresh() }))
    root.querySelectorAll('[data-tagpick]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = el.dataset.tagpick
        const i = newTags.indexOf(id)
        if (i >= 0) newTags.splice(i, 1); else newTags.push(id)
        refresh()
      }))
    root.querySelectorAll('[data-repeat]').forEach((el) =>
      el.addEventListener('click', () => { newRepeat = el.dataset.repeat; refresh() }))
    root.querySelectorAll('[data-filter]').forEach((el) =>
      el.addEventListener('click', () => { filter = el.dataset.filter; refresh() }))
    root.querySelectorAll('[data-tagfilter]').forEach((el) =>
      el.addEventListener('click', () => {
        const v = el.dataset.tagfilter
        tagFilter = v === '' ? null : v
        refresh()
      }))

    // نگه‌داشتن پنل گزینه‌ها باز اگر کاربر بازش کرده
    if (showOptions) root.querySelector('#opt-panel').classList.add('open')

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

function parseDur(v) {
  const raw = String(v || '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\D/g, '')
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? Math.min(1440, n) : 0
}

function prioChip(k) {
  const p = PRIO[k]
  const on = newPrio === k
  return `<button class="chip" data-prio="${k}"
    style="background:${on ? p.color : p.bg}; color:${on ? '#fff' : p.color}">
    <span class="prio-tag" style="background:${on ? '#fff' : p.color}"></span> ${p.label}</button>`
}

function tagPick(t) {
  const on = newTags.includes(t.id)
  return `<button class="chip" data-tagpick="${t.id}"
    style="background:${on ? t.color : 'var(--surface-2)'}; color:${on ? '#fff' : t.color};
    border:1.5px solid ${t.color}">
    <span class="prio-tag" style="background:${on ? '#fff' : t.color}"></span> ${escapeHtml(t.name)}</button>`
}

function repeatPick(k) {
  const r = REPEAT[k]
  const on = newRepeat === k
  return `<button class="chip" data-repeat="${k}"
    style="background:${on ? 'var(--c-indigo)' : 'var(--surface-2)'};
    color:${on ? '#fff' : 'var(--text-soft)'}; border:1.5px solid var(--border)">
    ${icon(r.icon, 'width=\"13\" height=\"13\"')} ${r.label}</button>`
}

function filterChip(k, label) {
  const on = filter === k
  return `<button class="chip" data-filter="${k}"
    style="background:${on ? 'var(--brand)' : 'var(--surface-2)'};
           color:${on ? '#fff' : 'var(--text-soft)'};
           border:1.5px solid var(--border)">${label}</button>`
}

function tagFilterChip(id, label) {
  const on = tagFilter === id
  const color = id ? (getTag(id)?.color || 'var(--brand)') : 'var(--c-indigo)'
  return `<button class="chip" data-tagfilter="${id || ''}"
    style="background:${on ? color : 'var(--surface-2)'};
           color:${on ? '#fff' : 'var(--text-soft)'};
           border:1.5px solid ${on ? color : 'var(--border)'}">${escapeHtml(label)}</button>`
}

function taskRow(t) {
  const p = PRIO[t.prio] || PRIO.mid
  const end = t.time && t.dur ? taskEnd(t.time, t.dur) : ''
  const tagChips = (t.tags || []).map((id) => {
    const tag = getTag(id); if (!tag) return ''
    return `<span class="tag-pill" style="background:${tag.color}1f; color:${tag.color}">
      <span class="prio-tag" style="background:${tag.color}"></span>${escapeHtml(tag.name)}</span>`
  }).join('')
  const rep = t.repeat && t.repeat !== 'none'
    ? `<span style="display:inline-flex;align-items:center;gap:3px;color:var(--c-indigo)">
        ${icon(REPEAT[t.repeat].icon, 'width=\"12\" height=\"12\"')} ${REPEAT[t.repeat].label}</span>` : ''
  return `
    <div class="list-item ${t.done ? 'done' : ''}">
      <div class="check ${t.done ? 'on' : ''}" data-toggle="${t.id}">${icon('check')}</div>
      <div style="flex:1; min-width:0">
        <div class="li-text">${escapeHtml(t.text)}</div>
        <div class="li-sub" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap">
          <span style="display:inline-flex; align-items:center; gap:5px; color:${p.color}">
            <span class="prio-tag" style="background:${p.color}"></span>${p.label}</span>
          ${t.time ? `<span style="display:inline-flex; align-items:center; gap:4px">
            ${icon('clock', 'width=\"12\" height=\"12\"')} ${toFa(t.time)}${end ? '–' + toFa(end) : ''}</span>` : ''}
          ${rep}
        </div>
        ${tagChips ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px">${tagChips}</div>` : ''}
      </div>
      <button class="del" data-del="${t.id}">${icon('trash', 'width=\"16\" height=\"16\"')}</button>
    </div>`
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
