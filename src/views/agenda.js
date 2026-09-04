import { icon } from '../icons.js'
import emptyImg from '../assets/empty-agenda.png'
import celebrateImg from '../assets/celebrate.png'
import { getState, sortTasks, update } from '../store.js'
import { go, refresh } from '../nav.js'
import { todayKey, toFa, todayJalali, longDate } from '../jalali.js'
import { PRIO, bindTaskChecks } from './tasks.js'

// بازه‌های زمانی روز
const SLOTS = [
  { key: 'morning',   label: 'صبح',       range: [0, 12],  ic: 'sunrise',   color: 'var(--c-tangerine)' },
  { key: 'afternoon', label: 'بعدازظهر',  range: [12, 18], ic: 'briefcase', color: 'var(--c-azure)' },
  { key: 'evening',   label: 'شب',        range: [18, 24], ic: 'moon',      color: 'var(--c-indigo)' },
  { key: 'anytime',   label: 'بدون زمان', range: null,     ic: 'clock',     color: 'var(--c-teal)' },
]

function slotOf(time) {
  if (!time) return 'anytime'
  const h = parseInt(time.split(':')[0], 10)
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}

export const agenda = {
  render() {
    const s = getState()
    const t = todayJalali()
    const tk = todayKey()
    const todays = sortTasks(s.tasks.filter((x) => x.day === tk))
    const done = todays.filter((x) => x.done).length
    const pct = todays.length ? Math.round((done / todays.length) * 100) : 0

    if (todays.length === 0) {
      return `
        ${header(t, done, todays.length)}
        <div class="empty"><img src="${emptyImg}" alt="" />
          <p>برنامه‌ی امروزت خالی است</p></div>
        <button class="btn btn-brand btn-block" data-jump="tasks" style="margin-top:8px">
          ${icon('plus', 'width="20" height="20"')} افزودن کار به برنامه</button>`
    }

    const grouped = SLOTS.map((slot) => ({
      slot,
      items: todays.filter((x) => slotOf(x.time) === slot.key),
    })).filter((g) => g.items.length > 0)

    return `
      ${header(t, done, todays.length)}

      <div class="card" style="margin-bottom:6px">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
          <b style="font-size:15px">پیشرفت روز</b>
          <span style="font-weight:900; color:var(--c-indigo)">${toFa(pct)}٪</span>
        </div>
        <div class="pbar"><span style="width:${pct}%; background:var(--c-indigo)"></span></div>
      </div>

      ${pct === 100
        ? `<div class="empty"><img src="${celebrateImg}" alt="" /><p>کل برنامه‌ی امروز تکمیل شد! 🎉</p></div>`
        : ''}

      ${grouped.map(groupBlock).join('')}
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
        ${icon('check', 'width="14" height="14"')} ${toFa(done)}/${toFa(total)}
      </div>
    </div>`
}

function groupBlock({ slot, items }) {
  return `
    <div class="section-title">
      <span class="tl-badge" style="background:${slot.color}; width:26px; height:26px">
        ${icon(slot.ic, 'width="15" height="15"')}</span>
      ${slot.label}
      <span class="grow"></span>
      <span style="font-size:12px; color:var(--text-soft); font-weight:800">${toFa(items.length)} کار</span>
    </div>
    <div class="timeline">
      ${items.map((x) => tlItem(x, slot.color)).join('')}
    </div>`
}

function tlItem(t, slotColor) {
  const p = PRIO[t.prio] || PRIO.mid
  return `
    <div class="tl-item">
      <div class="tl-rail">
        <div class="tl-node" style="color:${t.done ? 'var(--c-success)' : p.color}; background:${t.done ? 'var(--c-success)' : p.color}"></div>
        <div class="tl-line"></div>
      </div>
      <div class="tl-body ${t.done ? 'done' : ''}">
        <span class="tl-time">${t.time ? toFa(t.time) : '—'}</span>
        <span class="tl-title">${escape(t.text)}</span>
        <div class="check ${t.done ? 'on' : ''}" data-toggle="${t.id}">${icon('check')}</div>
        <button class="del" data-del="${t.id}" style="width:30px; height:30px">${icon('trash', 'width="15" height="15"')}</button>
      </div>
    </div>`
}

function escape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
