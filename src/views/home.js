import { icon } from '../icons.js'
import { heroIllust } from '../illustrations.js'
import { getState } from '../store.js'
import { go } from '../nav.js'
import { todayJalali, longDate, toFa, todayKey } from '../jalali.js'
import { attachTilt } from './util.js'

function progressRing(pct, color) {
  const r = 42, c = 2 * Math.PI * r
  const off = c * (1 - pct / 100)
  return `
    <div class="ring">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="${r}" fill="none" stroke="var(--border)" stroke-width="9"/>
        <circle cx="48" cy="48" r="${r}" fill="none" stroke="${color}" stroke-width="9"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
      </svg>
      <div class="ring-label">${toFa(pct)}٪</div>
    </div>`
}

export const home = {
  render() {
    const s = getState()
    const t = todayJalali()
    const tk = todayKey()
    const todays = s.tasks.filter((x) => x.day === tk)
    const doneCount = todays.filter((x) => x.done).length
    const taskPct = todays.length ? Math.round((doneCount / todays.length) * 100) : 0

    const habitToday = s.habits.filter((h) => h.week[t.dow]).length
    const habitPct = s.habits.length ? Math.round((habitToday / s.habits.length) * 100) : 0

    const next = todays.find((x) => !x.done)

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">${greeting()}</div>
          <h1>${s.user} 👋</h1>
        </div>
        <div class="avatar">${(s.user || '؟').trim().charAt(0)}</div>
      </div>

      <div class="hero card tilt">
        <div class="hero-content">
          <div class="hero-date">${longDate(t.jy, t.jm, t.jd, t.dow)}</div>
          <div class="hero-big">${next ? next.text : 'همه چیز عالیه!'}</div>
          <div class="hero-sub">${next
            ? 'کار بعدی‌ات همین است، بزن بریم ✨'
            : 'امروز وظیفه‌ی باز نداری. وقت استراحت 🌿'}</div>
        </div>
        <div class="hero-illust">${heroIllust}</div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-indigo)"></span> پیشرفت امروز</div>
      <div class="card">
        <div style="display:flex; gap:20px; align-items:center; justify-content:space-around;">
          <div class="ring-wrap" style="flex-direction:column; gap:8px;">
            ${progressRing(taskPct, 'var(--c-indigo)')}
            <div style="font-size:13px; font-weight:700; color:var(--text-soft)">وظایف</div>
          </div>
          <div class="ring-wrap" style="flex-direction:column; gap:8px;">
            ${progressRing(habitPct, 'var(--c-mint)')}
            <div style="font-size:13px; font-weight:700; color:var(--text-soft)">عادت‌ها</div>
          </div>
        </div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-tangerine)"></span> یک نگاه سریع</div>
      <div class="stat-grid">
        <div class="stat" style="background:var(--grad-sun)" data-jump="tasks">
          <div class="num">${toFa(todays.length - doneCount)}</div>
          <div class="cap">وظیفه‌ی باقی‌مانده</div>
          <div class="bg-ic">${icon('tasks')}</div>
        </div>
        <div class="stat" style="background:var(--grad-mint)" data-jump="habits">
          <div class="num">${toFa(habitToday)}</div>
          <div class="cap">عادت امروز</div>
          <div class="bg-ic">${icon('flame')}</div>
        </div>
        <div class="stat" style="background:var(--grad-rose)" data-jump="calendar">
          <div class="num">${toFa(countTodayEvents(s, tk))}</div>
          <div class="cap">رویداد امروز</div>
          <div class="bg-ic">${icon('calendar')}</div>
        </div>
        <div class="stat" style="background:var(--grad-hero)" data-jump="tasks">
          <div class="num">${toFa(doneCount)}</div>
          <div class="cap">انجام‌شده</div>
          <div class="bg-ic">${icon('check')}</div>
        </div>
      </div>

      <div style="height:14px"></div>
      <button class="btn btn-brand btn-block" data-jump="tasks">
        ${icon('plus', 'width="20" height="20"')} افزودن وظیفه‌ی جدید
      </button>
    `
  },

  mount(root) {
    attachTilt(root)
    root.querySelectorAll('[data-jump]').forEach((el) => {
      el.addEventListener('click', () => go(el.dataset.jump))
    })
  },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'شب بخیر'
  if (h < 12) return 'صبح بخیر'
  if (h < 17) return 'ظهر بخیر'
  if (h < 20) return 'عصر بخیر'
  return 'شب بخیر'
}

function countTodayEvents(s, tk) {
  return (s.events[tk] || []).length
}
