import { icon } from '../icons.js'
import emptyImg from '../assets/empty-agenda.png'
import celebrateImg from '../assets/celebrate.png'
import { getState, sortTasks, update } from '../store.js'
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
          <p>پایپ‌لاین امروزت خالی است</p></div>
        <button class="btn btn-brand btn-block" data-jump="tasks" style="margin-top:8px">
          ${icon('plus', 'width="20" height="20"')} افزودن کار به برنامه</button>`
    }

    // نشانگر «اکنون» بین کارها
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const toMin = (tm) => { if (!tm) return 99999; const [h, m] = tm.split(':').map(Number); return h * 60 + m }

    // ساخت ردیف‌های پایپ‌لاین با برچسب بخش وقتی تغییر می‌کند
    let lastPeriod = null
    let nowInserted = false
    const rows = []
    todays.forEach((task, idx) => {
      // درج نشانگر اکنون قبل از اولین کار آینده
      if (!nowInserted && toMin(task.time) > nowMin && task.time) {
        rows.push(nowMarker())
        nowInserted = true
      }
      const per = periodLabel(task.time)
      if (per !== lastPeriod) { rows.push(periodDivider(per)); lastPeriod = per }
      rows.push(pipeItem(task, idx === todays.length - 1))
    })

    return `
      ${header(t, done, todays.length)}

      <div class="agenda-summary card">
        <div class="ring-mini">
          ${miniRing(pct)}
        </div>
        <div style="flex:1; min-width:0">
          <div style="font-weight:900; font-size:16px">پایپ‌لاین امروز</div>
          <div style="font-size:12.5px; color:var(--text-soft); font-weight:700; margin-top:3px">
            ${toFa(done)} از ${toFa(todays.length)} کار انجام شد · ${toFa(pct)}٪</div>
        </div>
        <span class="chip" style="background:${pct === 100 ? 'rgba(31,184,119,.16)' : 'rgba(108,92,231,.14)'};
          color:${pct === 100 ? 'var(--c-success)' : 'var(--c-indigo)'}">
          ${pct === 100 ? 'کامل ✓' : 'در جریان'}</span>
      </div>

      ${pct === 100
        ? `<div class="empty"><img src="${celebrateImg}" alt="" /><p>کل پایپ‌لاین امروز تکمیل شد! 🎉</p></div>`
        : ''}

      <div class="pipe">${rows.join('')}</div>

      <button class="btn btn-ghost btn-block" data-jump="tasks" style="margin-top:6px">
        ${icon('plus', 'width="18" height="18"')} افزودن کار جدید</button>
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

// برچسب بخش (صبح/بعدازظهر/شب) روی پایپ‌لاین
function periodDivider(label) {
  return `
    <div class="pipe-divider">
      <span class="pd-dot"></span>
      <span class="pd-label">${label}</span>
      <span class="pd-line"></span>
    </div>`
}

// نشانگر «اکنون»
function nowMarker() {
  const now = todayJalaliTime()
  return `
    <div class="pipe-now">
      <span class="pn-dot"></span>
      <span class="pn-line"></span>
      <span class="pn-label">اکنون · ${now}</span>
    </div>`
}

function todayJalaliTime() {
  const d = new Date()
  return toFa(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`)
}

// یک ایستگاه از پایپ‌لاین
function pipeItem(t, isLast) {
  const p = PRIO[t.prio] || PRIO.mid
  const color = t.done ? 'var(--c-success)' : p.color
  return `
    <div class="pipe-item ${t.done ? 'done' : ''}">
      <div class="pi-time">
        <span class="pi-hh">${t.time ? toFa(t.time) : '—'}</span>
      </div>
      <div class="pi-rail">
        <span class="pi-node" style="background:${color}; box-shadow:0 0 0 4px color-mix(in srgb, ${color} 22%, transparent)"></span>
        ${isLast ? '' : '<span class="pi-line"></span>'}
      </div>
      <div class="pi-card" style="border-inline-start:5px solid ${color}">
        <div class="pi-main">
          <span class="pi-title">${escape(t.text)}</span>
          <span class="pi-prio" style="background:${p.bg}; color:${p.color}">
            <span class="prio-tag" style="background:${p.color}"></span>${p.label}</span>
        </div>
        <div class="pi-actions">
          <div class="check ${t.done ? 'on' : ''}" data-toggle="${t.id}">${icon('check')}</div>
          <button class="del" data-del="${t.id}">${icon('trash', 'width="15" height="15"')}</button>
        </div>
      </div>
    </div>`
}

function escape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
