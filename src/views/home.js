import { icon } from '../icons.js'
import heroImg from '../assets/hero.png'
import { getState, sortTasks } from '../store.js'
import { go, refresh } from '../nav.js'
import { todayJalali, longDate, toFa, todayKey } from '../jalali.js'
import { PRIO, bindTaskChecks } from './tasks.js'

function ring(pct, color) {
  const r = 40, c = 2 * Math.PI * r
  const off = c * (1 - pct / 100)
  return `
    <div class="ring">
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="9"/>
        <circle cx="46" cy="46" r="${r}" fill="none" stroke="${color}" stroke-width="9"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
      </svg>
      <div class="ring-label" style="color:${color}">${toFa(pct)}٪</div>
    </div>`
}

// انتخاب آیکون خوشامد بر اساس ساعت روز رویداد تایم‌لاین
function timeBadge(time) {
  const h = parseInt((time || '12').split(':')[0], 10)
  if (h < 9) return { ic: 'sunrise', color: 'var(--c-tangerine)' }
  if (h < 12) return { ic: 'coffee', color: 'var(--c-teal)' }
  if (h < 18) return { ic: 'briefcase', color: 'var(--c-azure)' }
  return { ic: 'moon', color: 'var(--c-indigo)' }
}

export const home = {
  render() {
    const s = getState()
    const t = todayJalali()
    const tk = todayKey()
    const todays = sortTasks(s.tasks.filter((x) => x.day === tk))
    const doneCount = todays.filter((x) => x.done).length
    const taskPct = todays.length ? Math.round((doneCount / todays.length) * 100) : 0
    const evs = s.events[tk] || []
    const next = todays.find((x) => !x.done)

    // تایم‌لاین کوچک: حداکثر ۴ مورد بعدی (کارهای انجام‌نشده اول، به‌ترتیب زمان)
    const timeline = todays.slice(0, 5)

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">${greeting()}</div>
          <h1>${escape(s.user)} 👋</h1>
        </div>
        <div class="avatar">${(s.user || '؟').trim().charAt(0)}</div>
      </div>

      <div class="hero">
        <div class="hero-content">
          <div class="hero-date">${longDate(t.jy, t.jm, t.jd, t.dow)}</div>
          <div class="hero-big">${next ? escape(next.text) : 'همه چیز عالیه!'}</div>
          <div class="hero-sub">${next
            ? `کار بعدی${next.time ? ' ساعت ' + toFa(next.time) : ''} ✨`
            : 'امروز کار بازی نداری. وقت استراحت 🌿'}</div>
        </div>
        <img class="hero-illust" src="${heroImg}" alt="" />
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-indigo)"></span> پیشرفت امروز</div>
      <div class="card">
        <div style="display:flex; gap:16px; align-items:center;">
          ${ring(taskPct, 'var(--c-indigo)')}
          <div style="flex:1">
            <div style="font-weight:800; font-size:16px; margin-bottom:6px">
              ${toFa(doneCount)} از ${toFa(todays.length)} کار انجام شد
            </div>
            <div class="pbar"><span style="width:${taskPct}%; background:var(--c-indigo)"></span></div>
            <div style="font-size:12px; color:var(--text-soft); font-weight:700; margin-top:8px">
              ${taskPct === 100 ? 'کارت عالی بود! 🎉' : `${toFa(todays.length - doneCount)} کار باقی مانده`}
            </div>
          </div>
        </div>
      </div>

      <div class="section-title">
        <span class="dot" style="background:var(--c-tangerine)"></span> تایم‌لاین امروز
        <span class="grow"></span>
        <button class="link" data-jump="tasks">همه</button>
      </div>
      ${timeline.length === 0
        ? `<div class="card" style="text-align:center; color:var(--text-soft); font-weight:700; padding:22px">
             هنوز کاری برای امروز نداری</div>`
        : `<div class="timeline">${timeline.map((x) => tlItem(x)).join('')}</div>`}

      <div class="section-title"><span class="dot" style="background:var(--c-mint)"></span> یک نگاه سریع</div>
      <div class="stat-grid">
        <div class="stat" style="background:var(--c-sunflower); color:var(--c-ink)" data-jump="tasks">
          <div class="num">${toFa(todays.length - doneCount)}</div>
          <div class="cap">کار باقی‌مانده</div>
          <div class="bg-ic">${icon('tasks')}</div>
        </div>
        <div class="stat" style="background:var(--c-mint)" data-jump="agenda">
          <div class="num">${toFa(doneCount)}</div>
          <div class="cap">انجام‌شده</div>
          <div class="bg-ic">${icon('check')}</div>
        </div>
        <div class="stat" style="background:var(--c-rose)" data-jump="calendar">
          <div class="num">${toFa(evs.length)}</div>
          <div class="cap">رویداد امروز</div>
          <div class="bg-ic">${icon('calendar')}</div>
        </div>
        <div class="stat" style="background:var(--c-azure)" data-jump="agenda">
          <div class="num">${toFa(todays.length)}</div>
          <div class="cap">کل برنامه</div>
          <div class="bg-ic">${icon('timeline')}</div>
        </div>
      </div>

      <div style="height:14px"></div>
      <button class="btn btn-brand btn-block" data-jump="tasks">
        ${icon('plus', 'width="20" height="20"')} افزودن کار جدید
      </button>
    `
  },

  mount(root) {
    root.querySelectorAll('[data-jump]').forEach((el) =>
      el.addEventListener('click', () => go(el.dataset.jump)))
    bindTaskChecks(root, refresh)
  },
}

function tlItem(t) {
  const b = timeBadge(t.time)
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
      </div>
    </div>`
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'شب بخیر'
  if (h < 12) return 'صبح بخیر'
  if (h < 17) return 'ظهر بخیر'
  if (h < 20) return 'عصر بخیر'
  return 'شب بخیر'
}

function escape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
