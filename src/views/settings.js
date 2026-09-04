import { icon } from '../icons.js'
import { getState, update, resetAll } from '../store.js'
import { toast, rerender } from '../nav.js'
import { toFa } from '../jalali.js'
import { escapeHtml } from './util.js'

export const settings = {
  render() {
    const s = getState()
    const dark = s.theme === 'dark'
    const taskCount = s.tasks.length
    const habitCount = s.habits.length
    const evCount = Object.values(s.events).reduce((a, arr) => a + arr.length, 0)

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">شخصی‌سازی</div>
          <h1>تنظیمات</h1>
        </div>
        <div class="avatar">${(s.user || '؟').trim().charAt(0)}</div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-indigo)"></span> نمایه</div>
      <div class="card" style="padding:6px 4px">
        <div class="setting-row">
          <div class="ic" style="background:var(--grad-hero)">${icon('user', 'width="20" height="20"')}</div>
          <div class="txt">
            <b>نام شما</b>
            <small>در سلام و صفحه‌ی خانه نمایش داده می‌شود</small>
          </div>
        </div>
        <div style="padding:0 16px 14px">
          <input class="input" id="user-name" value="${escapeHtml(s.user)}" placeholder="نام شما" />
        </div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-mint)"></span> ظاهر</div>
      <div class="card" style="padding:6px 4px">
        <div class="setting-row">
          <div class="ic" style="background:${dark ? 'var(--grad-hero)' : 'var(--grad-sun)'}">
            ${icon(dark ? 'moon' : 'sun', 'width="20" height="20"')}</div>
          <div class="txt">
            <b>حالت تیره</b>
            <small>${dark ? 'روشن است' : 'خاموش است'}</small>
          </div>
          <button class="switch ${dark ? 'on' : ''}" id="theme-switch"><span class="knob"></span></button>
        </div>
        <div class="setting-row">
          <div class="ic" style="background:var(--grad-rose)">${icon('bell', 'width="20" height="20"')}</div>
          <div class="txt">
            <b>یادآوری‌ها</b>
            <small>اعلان کارها و عادت‌ها</small>
          </div>
          <button class="switch ${s.notif ? 'on' : ''}" id="notif-switch"><span class="knob"></span></button>
        </div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-tangerine)"></span> داده‌ها</div>
      <div class="card">
        <div style="display:flex; justify-content:space-around; text-align:center">
          ${stat(taskCount, 'وظیفه', 'var(--c-indigo)')}
          ${stat(habitCount, 'عادت', 'var(--c-mint)')}
          ${stat(evCount, 'رویداد', 'var(--c-rose)')}
        </div>
        <button class="btn btn-ghost btn-block" id="reset-btn" style="margin-top:16px; color:var(--c-danger)">
          ${icon('trash', 'width="18" height="18"')} پاک‌سازی همه‌ی داده‌ها</button>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-teal)"></span> درباره</div>
      <div class="card">
        <div style="display:flex; align-items:center; gap:12px">
          <div class="ic" style="width:46px;height:46px;background:var(--grad-home);border-radius:14px;display:grid;place-items:center;color:#fff">
            ${icon('star', 'width="24" height="24"')}</div>
          <div>
            <b style="font-size:16px">برنامه‌ریز روزانه</b>
            <div style="font-size:12px;color:var(--text-soft);margin-top:2px">نسخه‌ی ۱٫۰ · تاریخ شمسی · آفلاین</div>
          </div>
        </div>
      </div>
      <div style="height:8px"></div>
    `
  },

  mount(root) {
    const nameEl = root.querySelector('#user-name')
    nameEl.addEventListener('change', () => {
      const v = nameEl.value.trim() || 'دوست خوب'
      update((s) => { s.user = v })
      toast('ذخیره شد ✅')
    })
    root.querySelector('#theme-switch').addEventListener('click', () => {
      update((s) => { s.theme = s.theme === 'dark' ? 'light' : 'dark' })
      rerender()
    })
    root.querySelector('#notif-switch').addEventListener('click', () => {
      update((s) => { s.notif = !s.notif })
      toast(getState().notif ? 'یادآوری‌ها روشن شد 🔔' : 'یادآوری‌ها خاموش شد')
      rerender()
    })
    root.querySelector('#reset-btn').addEventListener('click', () => {
      if (confirm('همه‌ی وظایف، عادت‌ها و رویدادها پاک شوند؟')) {
        resetAll()
        toast('داده‌ها پاک شد')
        rerender()
      }
    })
  },
}

function stat(n, label, color) {
  return `<div>
    <div style="font-size:26px;font-weight:900;color:${color}">${toFa(n)}</div>
    <div style="font-size:12px;color:var(--text-soft);font-weight:700;margin-top:2px">${label}</div>
  </div>`
}
