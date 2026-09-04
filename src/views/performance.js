import { icon } from '../icons.js'
import { celebrateSvg } from '../illus.js'
import { getState, tasksForDay, getTag } from '../store.js'
import { go } from '../nav.js'
import { toFa, todayKey, dayKey, todayJalali, WEEK_DAYS_SHORT, jsDowToShamsi } from '../jalali.js'
import { PRIO } from './tasks.js'
import * as jalaali from 'jalaali-js'

// کلید روز شمسی برای «n روز قبلِ امروز»
function keyDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const { jy, jm, jd } = jalaali.toJalaali(d)
  return { key: dayKey(jy, jm, jd), dow: jsDowToShamsi(d.getDay()) }
}

function ring(pct, color, size = 92) {
  const r = size / 2 - 6, c = 2 * Math.PI * r
  const off = c * (1 - pct / 100)
  const cx = size / 2
  return `
    <div class="ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="9"/>
        <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${color}" stroke-width="9"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"
          transform="rotate(-90 ${cx} ${cx})"/>
      </svg>
      <div class="ring-label" style="color:${color}">${toFa(pct)}٪</div>
    </div>`
}

export const performance = {
  render() {
    const s = getState()
    const tk = todayKey()

    // آمار امروز
    const todays = tasksForDay(tk)
    const todayDone = todays.filter((x) => x.done).length
    const todayPct = todays.length ? Math.round((todayDone / todays.length) * 100) : 0

    // هفت روز اخیر
    const week = []
    for (let i = 6; i >= 0; i--) {
      const { key, dow } = keyDaysAgo(i)
      const list = tasksForDay(key)
      const done = list.filter((x) => x.done).length
      const pct = list.length ? Math.round((done / list.length) * 100) : 0
      week.push({ key, dow, total: list.length, done, pct, isToday: key === tk })
    }
    const weekDoneTotal = week.reduce((a, w) => a + w.done, 0)
    const weekTaskTotal = week.reduce((a, w) => a + w.total, 0)
    const weekPct = weekTaskTotal ? Math.round((weekDoneTotal / weekTaskTotal) * 100) : 0
    const maxBar = Math.max(1, ...week.map((w) => w.total))

    // رشته‌ی روزهای فعال (streak): روزهای پیاپی با حداقل یک کار انجام‌شده تا امروز
    let streak = 0
    for (let i = 0; i < 60; i++) {
      const { key } = keyDaysAgo(i)
      const list = tasksForDay(key)
      const done = list.filter((x) => x.done).length
      if (done > 0) streak += 1
      else if (i === 0) continue  // امروز اگر هنوز کاری نکرده، رشته را نمی‌شکند
      else break
    }

    // توزیع بر اساس دسته (تگ) در کل کارها
    const tagCount = {}
    s.tasks.forEach((t) => (t.tags || []).forEach((id) => { tagCount[id] = (tagCount[id] || 0) + 1 }))
    const tagRows = Object.entries(tagCount)
      .map(([id, n]) => ({ tag: getTag(id), n }))
      .filter((x) => x.tag)
      .sort((a, b) => b.n - a.n)
    const tagMax = Math.max(1, ...tagRows.map((r) => r.n))

    // توزیع اولویت
    const prioCount = { high: 0, mid: 0, low: 0 }
    s.tasks.forEach((t) => { prioCount[t.prio] = (prioCount[t.prio] || 0) + 1 })

    // کل‌ها
    const totalTasks = s.tasks.length
    const totalDone = s.tasks.filter((x) => x.done).length
    const totalEvents = Object.values(s.events).reduce((a, arr) => a + arr.length, 0)

    const empty = totalTasks === 0 && totalEvents === 0

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">تحلیل و آمار</div>
          <h1>عملکرد</h1>
        </div>
        <div class="chip" style="background:rgba(255,138,61,.16); color:var(--c-tangerine)">
          ${icon('flame', 'width="14" height="14"')} ${toFa(streak)} روز پیاپی</div>
      </div>

      ${empty ? `
        <div class="empty">${celebrateSvg}<p>هنوز داده‌ای برای تحلیل نیست</p></div>
        <button class="btn btn-brand btn-block" data-jump="tasks">
          ${icon('plus', 'width="20" height="20"')} افزودن اولین کار</button>
      ` : `
      <div class="section-title"><span class="dot" style="background:var(--c-indigo)"></span> امروز در یک نگاه</div>
      <div class="card">
        <div style="display:flex; gap:16px; align-items:center">
          ${ring(todayPct, 'var(--c-indigo)')}
          <div style="flex:1">
            <div style="font-weight:800; font-size:16px; margin-bottom:6px">
              ${toFa(todayDone)} از ${toFa(todays.length)} کار انجام شد</div>
            <div class="pbar"><span style="width:${todayPct}%; background:var(--c-indigo)"></span></div>
            <div style="font-size:12px; color:var(--text-soft); font-weight:700; margin-top:8px">
              ${todayPct === 100 && todays.length ? 'روز کامل و بی‌نقصی داشتی' : `${toFa(todays.length - todayDone)} کار باقی مانده`}</div>
          </div>
        </div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-tangerine)"></span> هفت روز اخیر</div>
      <div class="card">
        <div class="wk-chart">
          ${week.map((w) => {
            const h = Math.round((w.total / maxBar) * 90) + 6
            const doneH = w.total ? Math.round((w.done / w.total) * h) : 0
            return `
              <div class="wk-col">
                <div class="wk-bar" style="height:${h}px" title="${toFa(w.done)}/${toFa(w.total)}">
                  <div class="wk-fill" style="height:${doneH}px; background:${w.isToday ? 'var(--c-indigo)' : 'var(--c-azure)'}"></div>
                </div>
                <div class="wk-lbl ${w.isToday ? 'on' : ''}">${WEEK_DAYS_SHORT[w.dow]}</div>
              </div>`
          }).join('')}
        </div>
        <div class="wk-legend">
          <span><span class="lg-dot" style="background:var(--c-indigo)"></span>امروز</span>
          <span><span class="lg-dot" style="background:var(--c-azure)"></span>روزهای دیگر</span>
          <span style="margin-inline-start:auto; color:var(--text-soft); font-weight:800">میانگین ${toFa(weekPct)}٪</span>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat" style="background:var(--c-sunflower); color:var(--c-ink)" data-jump="tasks">
          <div class="num">${toFa(totalTasks)}</div><div class="cap">کل کارها</div>
          <div class="bg-ic">${icon('tasks')}</div>
        </div>
        <div class="stat" style="background:var(--c-mint)" data-jump="agenda">
          <div class="num">${toFa(totalDone)}</div><div class="cap">انجام‌شده</div>
          <div class="bg-ic">${icon('check')}</div>
        </div>
        <div class="stat" style="background:var(--c-rose)" data-jump="tasks">
          <div class="num">${toFa(totalEvents)}</div><div class="cap">رویدادها</div>
          <div class="bg-ic">${icon('calendar')}</div>
        </div>
        <div class="stat" style="background:var(--c-azure)">
          <div class="num">${toFa(streak)}</div><div class="cap">رشته‌ی روزها</div>
          <div class="bg-ic">${icon('flame')}</div>
        </div>
      </div>

      ${tagRows.length ? `
      <div class="section-title"><span class="dot" style="background:var(--c-magenta)"></span> توزیع دسته‌ها</div>
      <div class="card">
        ${tagRows.map((r) => `
          <div class="dist-row">
            <div class="dist-name" style="color:${r.tag.color}">
              <span class="prio-tag" style="background:${r.tag.color}"></span>${escape(r.tag.name)}</div>
            <div class="dist-bar"><span style="width:${Math.round((r.n / tagMax) * 100)}%; background:${r.tag.color}"></span></div>
            <div class="dist-num">${toFa(r.n)}</div>
          </div>`).join('')}
      </div>` : ''}

      <div class="section-title"><span class="dot" style="background:var(--c-teal)"></span> توزیع اولویت</div>
      <div class="card">
        ${['high', 'mid', 'low'].map((k) => {
          const p = PRIO[k]; const n = prioCount[k] || 0
          const pctv = totalTasks ? Math.round((n / totalTasks) * 100) : 0
          return `
            <div class="dist-row">
              <div class="dist-name" style="color:${p.color}">
                <span class="prio-tag" style="background:${p.color}"></span>${p.label}</div>
              <div class="dist-bar"><span style="width:${pctv}%; background:${p.color}"></span></div>
              <div class="dist-num">${toFa(n)}</div>
            </div>`
        }).join('')}
      </div>
      `}
      <div style="height:8px"></div>
    `
  },

  mount(root) {
    root.querySelectorAll('[data-jump]').forEach((el) =>
      el.addEventListener('click', () => go(el.dataset.jump)))
  },
}

function escape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
