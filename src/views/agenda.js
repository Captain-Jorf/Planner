import { icon } from '../icons.js'
import { emptyAgendaSvg, celebrateSvg } from '../illus.js'
import { getState, update, tasksForDay, taskEnd, getTag } from '../store.js'
import { go, refresh } from '../nav.js'
import { todayKey, toFa, todayJalali, longDate } from '../jalali.js'
import { PRIO, bindTaskChecks } from './tasks.js'

// نام بازه‌ی زمانی برای برچسب بخش
function periodLabel(time) {
 if (!time) return 'بدون زمان'
 const h = parseInt(time.split(':')[0], 10)
 if (h < 12) return 'صبح'
 if (h < 18) return 'بعدازظهر'
 return 'شب'
}

function toMin(tm) { if (!tm) return 99999; const [h, m] = tm.split(':').map(Number); return h * 60 + m }

// ادغام کارها و رویدادها در یک جریان زمانی واحد
function buildStream(s, tk) {
 const items = []
 tasksForDay(tk).forEach((t) => items.push({
 kind: 'task', id: t.id, title: t.text, time: t.time,
 end: t.time && t.dur ? taskEnd(t.time, t.dur) : '', dur: t.dur,
 prio: t.prio, tags: t.tags || [], done: t.done, repeat: t.repeat,
 }))
 ;(s.events[tk] || []).forEach((e) => items.push({
 kind: 'event', id: e.id, title: e.title, time: e.time,
 end: e.end || '', color: e.color, done: false,
 }))
 return items.sort((a, b) => toMin(a.time) - toMin(b.time))
}

export const agenda = {
 render() {
 const s = getState()
 const t = todayJalali()
 const tk = todayKey()
 const stream = buildStream(s, tk)
 const taskItems = stream.filter((x) => x.kind === 'task')
 const done = taskItems.filter((x) => x.done).length
 const pct = taskItems.length ? Math.round((done / taskItems.length) * 100) : 0

 if (stream.length === 0) {
 return `
 ${header(t, done, taskItems.length)}
 <div class="empty">${emptyAgendaSvg}
 <p>تایم‌لاین امروزت خالی است</p></div>
 <button class="btn btn-brand btn-block" data-jump="tasks" style="margin-top:8px">
 ${icon('plus', 'width=\"20\" height=\"20\"')} افزودن کار به برنامه</button>`
 }

 // نشانگر «اکنون»
 const now = new Date()
 const nowMin = now.getHours() * 60 + now.getMinutes()

 let lastPeriod = null
 let nowInserted = false
 const rows = []
 stream.forEach((item, idx) => {
 if (!nowInserted && item.time && toMin(item.time) > nowMin) {
 rows.push(nowMarker()); nowInserted = true
 }
 const per = periodLabel(item.time)
 if (per !== lastPeriod) { rows.push(periodDivider(per)); lastPeriod = per }
 rows.push(streamItem(item, idx === stream.length - 1))
 })

 return `
 ${header(t, done, taskItems.length)}

 <div class="agenda-summary card">
 <div class="ring-mini">${miniRing(pct)}</div>
 <div style="flex:1; min-width:0">
 <div style="font-weight:900; font-size:16px">تایم‌لاین امروز</div>
 <div style="font-size:12.5px; color:var(--text-soft); font-weight:700; margin-top:3px">
 ${toFa(done)} از ${toFa(taskItems.length)} کار · ${toFa((s.events[tk] || []).length)} رویداد</div>
 </div>
 <span class="chip" style="background:${pct === 100 ? 'rgba(31,184,119,.16)' : 'rgba(108,92,231,.14)'};
 color:${pct === 100 ? 'var(--c-success)' : 'var(--c-indigo)'}">
 ${pct === 100 ? 'کامل' : 'در جریان'}</span>
 </div>

 ${pct === 100 && taskItems.length
 ? `<div class="empty">${celebrateSvg}<p>همه‌ی کارهای امروز تکمیل شد! </p></div>`
 : ''}

 <div class="pipe">${rows.join('')}</div>

 <button class="btn btn-ghost btn-block" data-jump="tasks" style="margin-top:6px">
 ${icon('plus', 'width=\"18\" height=\"18\"')} افزودن کار جدید</button>
 `
 },

 mount(root) {
 root.querySelectorAll('[data-jump]').forEach((el) =>
 el.addEventListener('click', () => go(el.dataset.jump)))
 bindTaskChecks(root, refresh)
 root.querySelectorAll('[data-del]').forEach((el) =>
 el.addEventListener('click', () => {
 const id = +el.dataset.del
 update((s) => { s.tasks = s.tasks.filter((x) => x.id !== id) })
 refresh()
 }))
 root.querySelectorAll('[data-delev]').forEach((el) =>
 el.addEventListener('click', () => {
 const id = +el.dataset.delev
 const tk = todayKey()
 update((s) => { if (s.events[tk]) s.events[tk] = s.events[tk].filter((e) => e.id !== id) })
 refresh()
 }))
 },
}

function header(t, done, total) {
 return `
 <div class="topbar">
 <div>
 <div class="eyebrow">${longDate(t.jy, t.jm, t.jd, t.dow)}</div>
 <h1>برنامه‌ی روز</h1>
 </div>
 <div class="chip" style="background:rgba(31,184,119,.15); color:var(--c-success)">
 ${icon('check', 'width=\"14\" height=\"14\"')} ${toFa(done)}/${toFa(total)}
 </div>
 </div>`
}

function miniRing(pct) {
 const r = 26, c = 2 * Math.PI * r, off = c * (1 - pct / 100)
 return `
 <svg width="64" height="64" viewBox="0 0 64 64">
 <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="7"/>
 <circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--c-indigo)" stroke-width="7"
 stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
 transform="rotate(-90 32 32)"/>
 <text x="32" y="32" text-anchor="middle" dominant-baseline="central"
 font-size="15" font-weight="900" fill="var(--text)">${toFa(pct)}</text>
 </svg>`
}

function periodDivider(label) {
 return `
 <div class="pipe-divider">
 <span class="pd-dot"></span>
 <span class="pd-label">${label}</span>
 <span class="pd-line"></span>
 </div>`
}

function nowMarker() {
 const d = new Date()
 const now = toFa(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
 return `
 <div class="pipe-now">
 <span class="pn-dot"></span>
 <span class="pn-line"></span>
 <span class="pn-label">اکنون · ${now}</span>
 </div>`
}

// یک ایستگاه از تایم‌لاین یکپارچه — کار یا رویداد
function streamItem(item, isLast) {
 if (item.kind === 'event') return eventStation(item, isLast)
 return taskStation(item, isLast)
}

function taskStation(t, isLast) {
 const p = PRIO[t.prio] || PRIO.mid
 const color = t.done ? 'var(--c-success)' : p.color
 const timeLabel = t.time
 ? `${toFa(t.time)}${t.end ? '<span class="pi-end">' + toFa(t.end) + '</span>' : ''}`
 : '—'
 const tagChips = (t.tags || []).map((id) => {
 const tag = getTag(id); if (!tag) return ''
 return `<span class="tag-pill" style="background:${tag.color}1f; color:${tag.color}">
 <span class="prio-tag" style="background:${tag.color}"></span>${escape(tag.name)}</span>`
 }).join('')
 return `
 <div class="pipe-item ${t.done ? 'done' : ''}">
 <div class="pi-time"><span class="pi-hh">${timeLabel}</span></div>
 <div class="pi-rail">
 <span class="pi-node" style="background:${color}; box-shadow:0 0 0 4px color-mix(in srgb, ${color} 22%, transparent)"></span>
 ${isLast ? '' : '<span class="pi-line"></span>'}
 </div>
 <div class="pi-card" style="border-inline-start:5px solid ${color}">
 <div class="pi-main">
 <span class="pi-title">${escape(t.title)}</span>
 <div class="pi-meta">
 <span class="pi-prio" style="background:${p.bg}; color:${p.color}">
 <span class="prio-tag" style="background:${p.color}"></span>${p.label}</span>
 ${tagChips}
 </div>
 </div>
 <div class="pi-actions">
 <div class="check ${t.done ? 'on' : ''}" data-toggle="${t.id}">${icon('check')}</div>
 <button class="del" data-del="${t.id}">${icon('trash', 'width=\"15\" height=\"15\"')}</button>
 </div>
 </div>
 </div>`
}

function eventStation(e, isLast) {
 const color = e.color || 'var(--c-magenta)'
 const timeLabel = e.time
 ? `${toFa(e.time)}${e.end ? '<span class="pi-end">' + toFa(e.end) + '</span>' : ''}`
 : '—'
 return `
 <div class="pipe-item is-event">
 <div class="pi-time"><span class="pi-hh">${timeLabel}</span></div>
 <div class="pi-rail">
 <span class="pi-node ev" style="background:${color}; box-shadow:0 0 0 4px color-mix(in srgb, ${color} 22%, transparent)"></span>
 ${isLast ? '' : '<span class="pi-line"></span>'}
 </div>
 <div class="pi-card" style="border-inline-start:5px solid ${color}; background:color-mix(in srgb, ${color} 8%, var(--surface))">
 <div class="pi-main">
 <span class="pi-title">${escape(e.title)}</span>
 <div class="pi-meta">
 <span class="pi-prio" style="background:${color}22; color:${color}">
 ${icon('calendar', 'width=\"12\" height=\"12\"')} رویداد</span>
 </div>
 </div>
 <div class="pi-actions">
 <button class="del" data-delev="${e.id}">${icon('trash', 'width=\"15\" height=\"15\"')}</button>
 </div>
 </div>
 </div>`
}

function escape(str) {
 return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
