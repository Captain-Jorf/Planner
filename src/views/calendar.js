import { icon } from '../icons.js'
import { emptyAgendaSvg } from '../illus.js'
import { getState, update, nextId } from '../store.js'
import { toast, refresh } from '../nav.js'
import {
  todayJalali, toFa, MONTHS, WEEK_DAYS_SHORT, longDate,
  monthLength, firstDowOfMonth, dayKey, isToday,
} from '../jalali.js'

const EVENT_COLORS = ['#f5384a', '#ff8a3d', '#ffc531', '#23c98a', '#2ba8f5', '#9b59f6', '#e04bce']

const t0 = todayJalali()
let viewY = t0.jy
let viewM = t0.jm
let selY = t0.jy, selM = t0.jm, selD = t0.jd
let newColor = EVENT_COLORS[5]
let editId = null          // شناسه‌ی رویدادِ در حال ویرایش (null = افزودن)
let draft = { title: '', start: '', end: '' }  // نگه‌داشتن ورودی هنگام رفرش

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
             data-day="${d}">${toFa(d)}${hasEv ? '<span class="evdot"></span>' : ''}</div>`
    }

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">تقویم شمسی</div>
          <h1>${MONTHS[viewM - 1]} ${toFa(viewY)}</h1>
        </div>
        <div style="display:flex; gap:8px">
          <button class="btn btn-ghost btn-icon" id="prev-m">${icon('chevronR', 'width="20" height="20"')}</button>
          <button class="btn btn-ghost btn-icon" id="next-m">${icon('chevronL', 'width="20" height="20"')}</button>
        </div>
      </div>

      <div class="card pop">
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

      <div class="section-title">
        <span class="dot" style="background:var(--c-magenta)"></span>
        رویدادهای ${longDate(selY, selM, selD, selDow())}
      </div>

      <div class="card ${editId ? 'editing' : ''}" style="padding:14px">
        ${editId ? `<div class="edit-banner">
          ${icon('edit', 'width="15" height="15"')} در حال ویرایش رویداد
          <button class="edit-cancel" id="ev-cancel">انصراف</button></div>` : ''}
        <input class="input" id="ev-input" placeholder="عنوان رویداد..." value="${escape(draft.title)}" />
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
        <div class="color-row">
          ${EVENT_COLORS.map(colorDot).join('')}
        </div>
        <button class="btn btn-brand btn-block" id="add-ev" style="margin-top:14px">
          ${icon(editId ? 'check' : 'plus', 'width="18" height="18"')} ${editId ? 'ذخیره‌ی تغییرات' : 'افزودن رویداد'}</button>
      </div>

      <div style="margin-top:14px" id="ev-list">
        ${dayEvents.length === 0
          ? `<div class="empty">${emptyAgendaSvg}<p>برای این روز رویدادی ثبت نشده</p></div>`
          : dayEvents.map(evRow).join('')}
      </div>
    `
  },

  mount(root) {
    root.querySelector('#prev-m').addEventListener('click', () => { shift(-1); refresh() })
    root.querySelector('#next-m').addEventListener('click', () => { shift(1); refresh() })
    root.querySelector('#go-today').addEventListener('click', () => {
      viewY = t0.jy; viewM = t0.jm; selY = t0.jy; selM = t0.jm; selD = t0.jd; refresh()
    })
    root.querySelectorAll('[data-day]').forEach((el) =>
      el.addEventListener('click', () => {
        if (el.classList.contains('empty')) return
        selY = viewY; selM = viewM; selD = +el.dataset.day; refresh()
      }))
    root.querySelectorAll('[data-color]').forEach((el) =>
      el.addEventListener('click', () => { newColor = el.dataset.color; refresh() }))

    const input = root.querySelector('#ev-input')
    const startEl = root.querySelector('#ev-start')
    const endEl = root.querySelector('#ev-end')

    // نگه‌داشتن پیش‌نویس هنگام تایپ تا رفرش‌ها آن را پاک نکنند
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
      const key = dayKey(selY, selM, selD)
      if (editId != null) {
        // ذخیره‌ی ویرایش
        update((s) => {
          const ev = (s.events[key] || []).find((e) => e.id === editId)
          if (ev) { ev.title = title; ev.time = start; ev.end = end; ev.color = newColor }
          if (s.events[key]) s.events[key].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
        })
        toast('تغییرات ذخیره شد ✅')
        editId = null
      } else {
        const id = nextId()
        update((s) => {
          if (!s.events[key]) s.events[key] = []
          s.events[key].push({ id, title, time: start, end, color: newColor })
          s.events[key].sort((a, b) => (a.time || '99').localeCompare(b.time || '99'))
        })
        toast('رویداد ثبت شد 📌')
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

    // ضربه روی رویداد → ورود به حالت ویرایش (پیش‌پرشدن فرم)
    root.querySelectorAll('[data-editev]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = +el.dataset.editev
        const key = dayKey(selY, selM, selD)
        const ev = (getState().events[key] || []).find((e) => e.id === id)
        if (!ev) return
        editId = id
        draft = { title: ev.title, start: ev.time || '', end: ev.end || '' }
        newColor = ev.color || newColor
        refresh()
        setTimeout(() => root.querySelector('#ev-input') && root.querySelector('#ev-input').focus(), 0)
      }))

    root.querySelectorAll('[data-delev]').forEach((el) =>
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = +el.dataset.delev
        const key = dayKey(selY, selM, selD)
        update((s) => { if (s.events[key]) s.events[key] = s.events[key].filter((ev) => ev.id !== id) })
        if (editId === id) { editId = null; draft = { title: '', start: '', end: '' } }
        toast('حذف شد 🗑️')
        refresh()
      }))
  },
}

function selDow() {
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
        <div class="li-text">${escape(e.title)}</div>
        ${tt ? `<div class="li-sub" style="display:inline-flex;align-items:center;gap:4px">
          ${icon('clock', 'width="12" height="12"')} ${tt}</div>` : ''}
      </div>
      <span class="del" title="ویرایش" style="color:var(--c-indigo); pointer-events:none">
        ${icon('edit', 'width="15" height="15"')}</span>
      <button class="del" data-delev="${e.id}">${icon('trash', 'width="16" height="16"')}</button>
    </div>`
}

// نرمال‌سازی زمان: پذیرش ارقام فارسی/لاتین → «HH:MM»
function normalizeTime(v) {
  const raw = String(v || '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).trim()
  if (!raw) return ''
  const m = raw.match(/^(\d{1,2})[:٫.]?(\d{0,2})$/)
  if (!m) return ''
  const hh = String(Math.min(23, +m[1])).padStart(2, '0')
  const mm = String(Math.min(59, +(m[2] || 0))).padStart(2, '0')
  return `${hh}:${mm}`
}

function escape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
