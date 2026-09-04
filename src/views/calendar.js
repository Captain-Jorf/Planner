import { icon } from '../icons.js'
import { calBadge, emptyIllust } from '../illustrations.js'
import { getState, update, nextId } from '../store.js'
import { toast, rerender } from '../nav.js'
import {
  todayJalali, toFa, MONTHS, WEEK_DAYS_SHORT, longDate,
  monthLength, firstDowOfMonth, dayKey, isToday,
} from '../jalali.js'

const EVENT_COLORS = ['#ff5d73', '#ff8a3d', '#ffc531', '#37d9a0', '#38b6ff', '#9b59f6', '#e84bd6']

const t0 = todayJalali()
let viewY = t0.jy
let viewM = t0.jm
let selY = t0.jy, selM = t0.jm, selD = t0.jd
let newColor = EVENT_COLORS[5]

export const calendar = {
  render() {
    const s = getState()
    const len = monthLength(viewY, viewM)
    const startDow = firstDowOfMonth(viewY, viewM)
    const selKey = dayKey(selY, selM, selD)
    const dayEvents = s.events[selKey] || []

    let cells = ''
    for (let i = 0; i < startDow; i++) cells += `<div class="cal-cell empty"></div>`
    for (let d = 1; d <= len; d++) {
      const k = dayKey(viewY, viewM, d)
      const hasEv = (s.events[k] || []).length > 0
      const today = isToday(viewY, viewM, d)
      const sel = viewY === selY && viewM === selM && d === selD
      const isFriday = (startDow + d - 1) % 7 === 6
      cells += `
        <div class="cal-cell ${today ? 'today' : ''} ${sel && !today ? 'selected' : ''} ${isFriday ? 'friday' : ''}"
             data-day="${d}">
          ${toFa(d)}
          ${hasEv ? '<span class="evdot"></span>' : ''}
        </div>`
    }

    return `
      <div class="topbar">
        <div style="display:flex; align-items:center; gap:12px">
          <div style="width:46px;height:46px">${calBadge}</div>
          <div>
            <div class="eyebrow">تقویم شمسی</div>
            <h1>${MONTHS[viewM - 1]} ${toFa(viewY)}</h1>
          </div>
        </div>
        <div style="display:flex; gap:8px">
          <button class="btn btn-ghost btn-icon" id="prev-m">${icon('chevronR', 'width="20" height="20"')}</button>
          <button class="btn btn-ghost btn-icon" id="next-m">${icon('chevronL', 'width="20" height="20"')}</button>
        </div>
      </div>

      <div class="card">
        <div class="cal-grid" style="margin-bottom:8px">
          ${WEEK_DAYS_SHORT.map((d, i) =>
            `<div class="cal-head" style="${i === 6 ? 'color:var(--c-coral)' : ''}">${d}</div>`).join('')}
        </div>
        <div class="cal-grid" id="cal-days">${cells}</div>
        <div style="text-align:center; margin-top:12px">
          <button class="chip" id="go-today"
            style="background:rgba(108,92,231,.14); color:var(--c-indigo); border:none; cursor:pointer">
            برو به امروز</button>
        </div>
      </div>

      <div class="section-title">
        <span class="dot" style="background:var(--c-magenta)"></span>
        رویدادهای ${longDate(selY, selM, selD, selDow())}
      </div>

      <div class="card" style="padding:14px">
        <div style="display:flex; gap:10px">
          <input class="input" id="ev-input" placeholder="عنوان رویداد..." />
          <input class="input" id="ev-time" type="text" inputmode="numeric" placeholder="۰۹:۳۰"
            style="max-width:90px; text-align:center" />
        </div>
        <div class="hscroll" style="margin-top:12px; align-items:center">
          ${EVENT_COLORS.map(colorDot).join('')}
          <button class="btn btn-brand" id="add-ev" style="margin-inline-start:auto; padding:9px 16px">
            ${icon('plus', 'width="18" height="18"')} افزودن</button>
        </div>
      </div>

      <div style="margin-top:14px" id="ev-list">
        ${dayEvents.length === 0
          ? `<div class="empty">${emptyIllust}<p>برای این روز رویدادی ثبت نشده</p></div>`
          : dayEvents.map(evRow).join('')}
      </div>
    `
  },

  mount(root) {
    root.querySelector('#prev-m').addEventListener('click', () => { shift(-1); rerender() })
    root.querySelector('#next-m').addEventListener('click', () => { shift(1); rerender() })
    root.querySelector('#go-today').addEventListener('click', () => {
      viewY = t0.jy; viewM = t0.jm; selY = t0.jy; selM = t0.jm; selD = t0.jd; rerender()
    })
    root.querySelectorAll('[data-day]').forEach((el) => {
      el.addEventListener('click', () => {
        selY = viewY; selM = viewM; selD = +el.dataset.day; rerender()
      })
    })
    root.querySelectorAll('[data-color]').forEach((el) => {
      el.addEventListener('click', () => { newColor = el.dataset.color; rerender() })
    })
    const input = root.querySelector('#ev-input')
    const time = root.querySelector('#ev-time')
    root.querySelector('#add-ev').addEventListener('click', () => {
      const title = input.value.trim()
      if (!title) { toast('عنوان رویداد را بنویس'); return }
      const id = nextId()
      const key = dayKey(selY, selM, selD)
      update((s) => {
        if (!s.events[key]) s.events[key] = []
        s.events[key].push({ id, title, time: time.value.trim() || '', color: newColor })
        s.events[key].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      })
      toast('رویداد ثبت شد 📌')
      rerender()
    })
    root.querySelectorAll('[data-delev]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = +el.dataset.delev
        const key = dayKey(selY, selM, selD)
        update((s) => { if (s.events[key]) s.events[key] = s.events[key].filter((e) => e.id !== id) })
        toast('حذف شد 🗑️')
        rerender()
      })
    })
  },
}

function selDow() {
  // محاسبه‌ی روز هفته‌ی روز انتخابی
  const off = firstDowOfMonth(selY, selM)
  return (off + selD - 1) % 7
}

function shift(dir) {
  viewM += dir
  if (viewM > 12) { viewM = 1; viewY += 1 }
  if (viewM < 1) { viewM = 12; viewY -= 1 }
}

function colorDot(c) {
  const on = newColor === c
  return `<button data-color="${c}"
    style="width:26px;height:26px;border-radius:50%;background:${c};border:${on ? '3px solid var(--text)' : '2px solid var(--border)'};cursor:pointer;flex-shrink:0"></button>`
}

function evRow(e) {
  return `
    <div class="list-item">
      <div style="width:6px;height:38px;border-radius:6px;background:${e.color};flex-shrink:0"></div>
      <div style="flex:1">
        <div class="li-text">${escapeTitle(e.title)}</div>
        ${e.time ? `<div class="li-sub">${icon('clock', 'width="12" height="12" style="vertical-align:-2px"')} ${toFa(e.time)}</div>` : ''}
      </div>
      <button class="del" data-delev="${e.id}">${icon('trash', 'width="16" height="16"')}</button>
    </div>`
}

function escapeTitle(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
