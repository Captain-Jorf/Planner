import { icon } from '../icons.js'
import { emptyTasksSvg, celebrateSvg } from '../illus.js'
import {
 getState, update, nextId, sortTasks,
 tasksForDay, toggleTaskDone, taskEnd, getTag,
} from '../store.js'
import { toast, refresh } from '../nav.js'
import {
 todayJalali, toFa, MONTHS, WEEK_DAYS_SHORT, longDate,
 monthLength, firstDowOfMonth, dayKey, isToday, todayKey,
} from '../jalali.js'

export const PRIO = {
 high: { label: 'مهم', color: 'var(--c-danger)', bg: 'rgba(245,56,74,.14)' },
 mid: { label: 'متوسط', color: 'var(--c-tangerine)', bg: 'rgba(255,138,61,.14)' },
 low: { label: 'عادی', color: 'var(--c-teal)', bg: 'rgba(18,165,179,.14)' },
}

export const REPEAT = {
 none: { label: 'یک‌بار', icon: 'target' },
 daily: { label: 'روزانه', icon: 'flame' },
 weekly: { label: 'هفتگی', icon: 'calendar' },
 monthly: { label: 'ماهانه', icon: 'star' },
}

const EVENT_COLORS = ['#f5384a', '#ff8a3d', '#ffc531', '#23c98a', '#2ba8f5', '#9b59f6', '#e04bce']

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

// وضعیت نما
const t0 = todayJalali()
let viewY = t0.jy, viewM = t0.jm
let selY = t0.jy, selM = t0.jm, selD = t0.jd
let mode = 'tasks' // tasks | events (زبانه‌ی پایین تقویم)
let calOpen = true // باز/بسته بودن تقویم

// افزودن کار
let newPrio = 'mid'
let newTags = []
let newRepeat = 'none'
let showOptions = false

// افزودن/ویرایش رویداد
let newColor = EVENT_COLORS[5]
let editId = null
let draft = { title: '', start: '', end: '' }

function selKeyStr() { return dayKey(selY, selM, selD) }
function selDow() { return (firstDowOfMonth(selY, selM) + selD - 1) % 7 }
function isSelToday() { return isToday(selY, selM, selD) }

export const tasks = {
 render() {
 const s = getState()
 const selKey = selKeyStr()

 // کارهای روز انتخاب‌شده
 let dayTasks = sortTasks(tasksForDay(selKey))
 const doneT = dayTasks.filter((x) => x.done).length
 const allDone = dayTasks.length > 0 && doneT === dayTasks.length
 const dayEvents = s.events[selKey] || []

 // تقویم
 const len = monthLength(viewY, viewM)
 const startDow = firstDowOfMonth(viewY, viewM)
 let cells = ''
 for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell empty"></div>`
 for (let d = 1; d <= len; d++) {
 const k = dayKey(viewY, viewM, d)
 const hasEv = (s.events[k] || []).length > 0
 const hasTask = tasksForDay(k).length > 0
 const today = isToday(viewY, viewM, d)
 const sel = viewY === selY && viewM === selM && d === selD
 const isFriday = (startDow + d - 1) % 7 === 6
 cells += `
 <div class="cal-cell ${today ? 'today' : ''} ${sel && !today ? 'selected' : ''} ${isFriday ? 'friday' : ''}"
 data-day="${d}">${toFa(d)}
 ${hasEv ? '<span class="evdot"></span>' : ''}${hasTask ? '<span class="evdot task"></span>' : ''}</div>`
 }

 return `
 <div class="topbar">
 <div>
 <div class="eyebrow">${isSelToday() ? 'امروز' : longDate(selY, selM, selD, selDow())}</div>
 <h1>وظایف</h1>
 </div>
 <button class="chip" id="cal-toggle"
 style="background:rgba(108,92,231,.14); color:var(--c-indigo); cursor:pointer">
 ${icon('calendar', 'width="14" height="14"')} ${MONTHS[viewM - 1]} ${toFa(viewY)}</button>
 </div>

 <div class="cal-collapse ${calOpen ? 'open' : ''}">
 <div class="card pop">
 <div class="cal-nav">
 <button class="btn btn-ghost btn-icon" id="prev-m">${icon('chevronR', 'width="20" height="20"')}</button>
 <div class="cal-title">${MONTHS[viewM - 1]} ${toFa(viewY)}</div>
 <button class="btn btn-ghost btn-icon" id="next-m">${icon('chevronL', 'width="20" height="20"')}</button>
 </div>
 <div class="cal-grid" style="margin-bottom:8px">
 ${WEEK_DAYS_SHORT.map((d, i) =>
 `<div class="cal-head" style="${i === 6 ? 'color:var(--c-coral)' : ''}">${d}</div>`).join('')}
 </div>
 <div class="cal-grid" id="cal-days">${cells}</div>
 <div style="text-align:center; margin-top:12px">
 <button class="chip" id="go-today"
 style="background:rgba(108,92,231,.14); color:var(--c-indigo)">برو به امروز</button>
 </div>
 </div>
 </div>

 <div class="seg" style="margin-top:4px">
 <button class="seg-btn ${mode === 'tasks' ? 'on' : ''}" data-mode="tasks">
 ${icon('tasks', 'width="15" height="15"')} کارها ${dayTasks.length ? `(${toFa(dayTasks.length)})` : ''}</button>
 <button class="seg-btn ${mode === 'events' ? 'on' : ''}" data-mode="events">
 ${icon('calendar', 'width="15" height="15"')} رویدادها ${dayEvents.length ? `(${toFa(dayEvents.length)})` : ''}</button>
 </div>

 ${mode === 'tasks' ? this.renderTasks(s, dayTasks, doneT, allDone) : this.renderEvents(s, dayEvents)}
 `
 },

 // ---- بخش کارها ----
 renderTasks(s, dayTasks, doneT, allDone) {
 const list = dayTasks
 return `
 <div class="card pop" style="padding:14px; margin-top:12px">
 <input class="input" id="task-input" placeholder="یک کار جدید بنویس..." />
 <div style="display:flex; gap:10px; margin-top:10px; align-items:center">
 <input class="input" id="task-time" type="text" inputmode="numeric"
 placeholder="ساعت (۰۹:۳۰)" style="max-width:120px; text-align:center" />
 <input class="input" id="task-dur" type="text" inputmode="numeric"
 placeholder="مدت (دقیقه)" style="max-width:120px; text-align:center" />
 <button class="btn btn-ghost btn-icon" id="opt-toggle" title="گزینه‌ها"
 style="flex-shrink:0">${icon('bolt', 'width="18" height="18"')}</button>
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
 ${icon('plus', 'width="20" height="20"')} افزودن کار</button>
 </div>

 <div style="margin-top:12px" id="task-list">
 ${allDone
 ? `<div class="empty">${celebrateSvg}<p>آفرین! همه‌ی کارهای این روز انجام شد</p></div>`
 : list.length === 0
 ? `<div class="empty">${emptyTasksSvg}<p>هیچ کاری برای این روز نیست. یکی اضافه کن</p></div>`
 : list.map(taskRow).join('')}
 </div>
 `
 },

 // ---- بخش رویدادها (تقویم قبلی) ----
 renderEvents(s, dayEvents) {
 return `
 <div class="card ${editId ? 'editing' : ''}" style="padding:14px; margin-top:12px">
 ${editId ? `<div class="edit-banner">
 ${icon('edit', 'width="15" height="15"')} در حال ویرایش رویداد
 <button class="edit-cancel" id="ev-cancel">انصراف</button></div>` : ''}
 <input class="input" id="ev-input" placeholder="عنوان رویداد..." value="${escapeAttr(draft.title)}" />
 <div class="time-fields">
 <div class="tf">
 <label>از ساعت</label>
 <input class="input" id="ev-start" type="text" inputmode="numeric"
 placeholder="۰۹:۰۰" style="text-align:center" value="${draft.start ? toFa(draft.start) : ''}" />
 </div>
 <span class="tf-arrow">${icon('arrowLeft', 'width="18" height="18"')}</span>
 <div class="tf">
 <label>تا ساعت</label>
 <input class="input" id="ev-end" type="text" inputmode="numeric"
 placeholder="۱۰:۳۰" style="text-align:center" value="${draft.end ? toFa(draft.end) : ''}" />
 </div>
 </div>
 <div style="font-size:12px; color:var(--text-soft); font-weight:800; margin:14px 2px 8px">رنگ رویداد</div>
 <div class="color-row">${EVENT_COLORS.map(colorDot).join('')}</div>
 <button class="btn btn-brand btn-block" id="add-ev" style="margin-top:14px">
 ${icon(editId ? 'check' : 'plus', 'width="18" height="18"')} ${editId ? 'ذخیره‌ی تغییرات' : 'افزودن رویداد'}</button>
 </div>

 <div style="margin-top:12px" id="ev-list">
 ${dayEvents.length === 0
 ? `<div class="empty">${emptyTasksSvg}<p>برای این روز رویدادی ثبت نشده</p></div>`
 : dayEvents.map(evRow).join('')}
 </div>
 `
 },

 mount(root) {
 // تقویم
 root.querySelector('#cal-toggle').addEventListener('click', () => { calOpen = !calOpen; refresh() })
 const prevM = root.querySelector('#prev-m'); if (prevM) prevM.addEventListener('click', () => { shift(-1); refresh() })
 const nextM = root.querySelector('#next-m'); if (nextM) nextM.addEventListener('click', () => { shift(1); refresh() })
 const goT = root.querySelector('#go-today')
 if (goT) goT.addEventListener('click', () => {
 viewY = t0.jy; viewM = t0.jm; selY = t0.jy; selM = t0.jm; selD = t0.jd; refresh()
 })
 root.querySelectorAll('[data-day]').forEach((el) =>
 el.addEventListener('click', () => {
 if (el.classList.contains('empty')) return
 selY = viewY; selM = viewM; selD = +el.dataset.day
 editId = null; draft = { title: '', start: '', end: '' }
 refresh()
 }))

 // زبانه
 root.querySelectorAll('[data-mode]').forEach((el) =>
 el.addEventListener('click', () => { mode = el.dataset.mode; refresh() }))

 if (mode === 'tasks') this.mountTasks(root)
 else this.mountEvents(root)
 },

 mountTasks(root) {
 const input = root.querySelector('#task-input')
 const timeEl = root.querySelector('#task-time')
 const durEl = root.querySelector('#task-dur')
 const add = () => {
 const val = input.value.trim()
 if (!val) { toast('چیزی بنویس'); input.focus(); return }
 const id = nextId()
 const time = normalizeTime(timeEl.value)
 const dur = parseDur(durEl.value)
 update((st) => {
 st.tasks.push({
 id, text: val, done: false, prio: newPrio, time, dur,
 day: selKeyStr(), tags: [...newTags], repeat: newRepeat, doneDays: [],
 })
 })
 input.value = ''; timeEl.value = ''; durEl.value = ''
 toast('اضافه شد')
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
 if (showOptions) root.querySelector('#opt-panel').classList.add('open')

 bindTaskChecks(root, refresh, selKeyStr())

 root.querySelectorAll('[data-del]').forEach((el) =>
 el.addEventListener('click', () => {
 const id = +el.dataset.del
 update((st) => { st.tasks = st.tasks.filter((x) => x.id !== id) })
 toast('حذف شد')
 refresh()
 }))
 },

 mountEvents(root) {
 root.querySelectorAll('[data-color]').forEach((el) =>
 el.addEventListener('click', () => { newColor = el.dataset.color; refresh() }))

 const input = root.querySelector('#ev-input')
 const startEl = root.querySelector('#ev-start')
 const endEl = root.querySelector('#ev-end')
 const syncDraft = () => {
 draft.title = input.value
 draft.start = normalizeTime(startEl.value)
 draft.end = normalizeTime(endEl.value)
 }
 input.addEventListener('input', syncDraft)
 startEl.addEventListener('input', syncDraft)
 endEl.addEventListener('input', syncDraft)

 root.querySelector('#add-ev').addEventListener('click', () => {
 const title = input.value.trim()
 if (!title) { toast('عنوان رویداد را بنویس'); input.focus(); return }
 const start = normalizeTime(startEl.value)
 const end = normalizeTime(endEl.value)
 if (start && end && end <= start) { toast('زمان پایان باید بعد از شروع باشد'); endEl.focus(); return }
 const key = selKeyStr()
 if (editId != null) {
 update((st) => {
 const ev = (st.events[key] || []).find((e) => e.id === editId)
 if (ev) { ev.title = title; ev.time = start; ev.end = end; ev.color = newColor }
 if (st.events[key]) st.events[key].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
 })
 toast('تغییرات ذخیره شد'); editId = null
 } else {
 const id = nextId()
 update((st) => {
 if (!st.events[key]) st.events[key] = []
 st.events[key].push({ id, title, time: start, end, color: newColor })
 st.events[key].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
 })
 toast('رویداد ثبت شد')
 }
 draft = { title: '', start: '', end: '' }
 refresh()
 })
 input.addEventListener('keydown', (e) => { if (e.key === 'Enter') startEl.focus() })
 endEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') root.querySelector('#add-ev').click() })

 const cancelBtn = root.querySelector('#ev-cancel')
 if (cancelBtn) cancelBtn.addEventListener('click', () => {
 editId = null; draft = { title: '', start: '', end: '' }; refresh()
 })

 root.querySelectorAll('[data-editev]').forEach((el) =>
 el.addEventListener('click', () => {
 const id = +el.dataset.editev
 const key = selKeyStr()
 const ev = (getState().events[key] || []).find((e) => e.id === id)
 if (!ev) return
 editId = id
 draft = { title: ev.title, start: ev.time || '', end: ev.end || '' }
 newColor = ev.color || newColor
 refresh()
 }))

 root.querySelectorAll('[data-delev]').forEach((el) =>
 el.addEventListener('click', (e) => {
 e.stopPropagation()
 const id = +el.dataset.delev
 const key = selKeyStr()
 update((st) => { if (st.events[key]) st.events[key] = st.events[key].filter((ev) => ev.id !== id) })
 if (editId === id) { editId = null; draft = { title: '', start: '', end: '' } }
 toast('حذف شد')
 refresh()
 }))
 },
}

function shift(dir) {
 viewM += dir
 if (viewM > 12) { viewM = 1; viewY += 1 }
 if (viewM < 1) { viewM = 12; viewY -= 1 }
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
 ${icon(r.icon, 'width="13" height="13"')} ${r.label}</button>`
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
 ${icon(REPEAT[t.repeat].icon, 'width="12" height="12"')} ${REPEAT[t.repeat].label}</span>` : ''
 return `
 <div class="list-item ${t.done ? 'done' : ''}">
 <div class="check ${t.done ? 'on' : ''}" data-toggle="${t.id}">${icon('check')}</div>
 <div style="flex:1; min-width:0">
 <div class="li-text">${escapeHtml(t.text)}</div>
 <div class="li-sub" style="display:flex; align-items:center; gap:10px; flex-wrap:wrap">
 <span style="display:inline-flex; align-items:center; gap:5px; color:${p.color}">
 <span class="prio-tag" style="background:${p.color}"></span>${p.label}</span>
 ${t.time ? `<span style="display:inline-flex; align-items:center; gap:4px">
 ${icon('clock', 'width="12" height="12"')} ${toFa(t.time)}${end ? '–' + toFa(end) : ''}</span>` : ''}
 ${rep}
 </div>
 ${tagChips ? `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px">${tagChips}</div>` : ''}
 </div>
 <button class="del" data-del="${t.id}">${icon('trash', 'width="16" height="16"')}</button>
 </div>`
}

function colorDot(c) {
 const on = newColor === c
 return `<button data-color="${c}"
 style="width:28px;height:28px;border-radius:50%;background:${c};
 border:${on ? '3px solid var(--text)' : '2px solid var(--border)'};cursor:pointer;flex-shrink:0"></button>`
}

function timeText(e) {
 if (e.time && e.end) return `${toFa(e.time)} – ${toFa(e.end)}`
 if (e.time) return `از ${toFa(e.time)}`
 if (e.end) return `تا ${toFa(e.end)}`
 return ''
}

function evRow(e) {
 const tt = timeText(e)
 return `
 <div class="list-item ev-row" data-editev="${e.id}">
 <div style="width:6px;height:42px;border-radius:6px;background:${e.color};flex-shrink:0"></div>
 <div style="flex:1; min-width:0">
 <div class="li-text">${escapeHtml(e.title)}</div>
 ${tt ? `<div class="li-sub" style="display:inline-flex;align-items:center;gap:4px">
 ${icon('clock', 'width="12" height="12"')} ${tt}</div>` : ''}
 </div>
 <span class="del" title="ویرایش" style="color:var(--c-indigo); pointer-events:none">
 ${icon('edit', 'width="15" height="15"')}</span>
 <button class="del" data-delev="${e.id}">${icon('trash', 'width="16" height="16"')}</button>
 </div>`
}

function escapeHtml(str) {
 return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function escapeAttr(str) {
 return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
