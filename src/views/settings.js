import { icon } from '../icons.js'
import { getState, update, nextId, resetAll } from '../store.js'
import { toast, refresh, go } from '../nav.js'
import { toFa, todayKey } from '../jalali.js'
import { requestAlarmPermission, fireTestAlarm, syncAlarms } from '../alarms.js'

const TAG_COLORS = ['#f5384a', '#ff8a3d', '#ffc531', '#23c98a', '#2ba8f5', '#9b59f6', '#e04bce', '#12a5b3']
let newTagColor = TAG_COLORS[5]

export const settings = {
  render() {
    const s = getState()
    const dark = s.theme === 'dark'
    const taskCount = s.tasks.length
    const doneCount = s.tasks.filter((x) => x.done).length
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
          <div class="ic" style="background:var(--c-indigo)">${icon('user', 'width=\"20\" height=\"20\"')}</div>
          <div class="txt"><b>نام شما</b><small>در صفحه‌ی خانه نمایش داده می‌شود</small></div>
        </div>
        <div style="padding:0 16px 14px">
          <input class="input" id="user-name" value="${escape(s.user)}" placeholder="نام شما" />
        </div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-mint)"></span> ظاهر</div>
      <div class="card" style="padding:6px 4px">
        <div class="setting-row">
          <div class="ic" style="background:${dark ? 'var(--c-indigo)' : 'var(--c-sunflower)'}; color:${dark ? '#fff' : 'var(--c-ink)'}">
            ${icon(dark ? 'moon' : 'sun', 'width=\"20\" height=\"20\"')}</div>
          <div class="txt"><b>حالت تیره</b><small>${dark ? 'روشن است' : 'خاموش است'}</small></div>
          <button class="switch ${dark ? 'on' : ''}" id="theme-switch"><span class="knob"></span></button>
        </div>
        <div class="setting-row">
          <div class="ic" style="background:var(--c-rose)">${icon('bell', 'width=\"20\" height=\"20\"')}</div>
          <div class="txt"><b>یادآوری‌ها</b><small>اعلان کارها و رویدادها سر ساعت</small></div>
          <button class="switch ${s.notif ? 'on' : ''}" id="notif-switch"><span class="knob"></span></button>
        </div>
        ${s.notif ? `<div style="padding:0 16px 14px">
          <button class="btn btn-ghost btn-block" id="test-alarm">
            ${icon('bell', 'width=\"16\" height=\"16\"')} آزمایش آلارم</button>
          <div id="alarm-note" style="font-size:12px; font-weight:700; color:var(--text-soft); text-align:center; margin-top:8px"></div>
        </div>` : ''}
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-magenta)"></span> دسته‌ها (تگ)</div>
      <div class="card" style="padding:14px">
        <div class="tag-list">
          ${s.tags.length
            ? s.tags.map(tagItem).join('')
            : '<div style="color:var(--text-soft); font-weight:700; font-size:13px">دسته‌ای نداری</div>'}
        </div>
        <div style="display:flex; gap:10px; align-items:center; margin-top:14px">
          <input class="input" id="tag-name" placeholder="نام دسته‌ی جدید..." style="flex:1" />
          <button class="btn btn-brand btn-icon" id="add-tag" style="flex-shrink:0">
            ${icon('plus', 'width=\"18\" height=\"18\"')}</button>
        </div>
        <div class="color-row" style="margin-top:12px">${TAG_COLORS.map(colorDot).join('')}</div>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-teal)"></span> قالب‌ها</div>
      <div class="card" style="padding:14px">
        <div style="font-size:12.5px; color:var(--text-soft); font-weight:700; margin-bottom:10px">
          با یک ضربه، چند کار آماده را به امروز اضافه کن.</div>
        ${s.templates.length
          ? s.templates.map(templateItem).join('')
          : '<div style="color:var(--text-soft); font-weight:700; font-size:13px">قالبی نداری</div>'}
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-tangerine)"></span> داده‌ها</div>
      <div class="card">
        <div style="display:flex; justify-content:space-around; text-align:center">
          ${stat(taskCount, 'کل کارها', 'var(--c-indigo)')}
          ${stat(doneCount, 'انجام‌شده', 'var(--c-mint)')}
          ${stat(evCount, 'رویداد', 'var(--c-rose)')}
        </div>
        <button class="btn btn-ghost btn-block" id="reset-btn" style="margin-top:16px; color:var(--c-danger)">
          ${icon('trash', 'width=\"18\" height=\"18\"')} پاک‌سازی همه‌ی داده‌ها</button>
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-teal)"></span> درباره</div>
      <div class="card">
        <div style="display:flex; align-items:center; gap:12px">
          <div class="ic" style="width:46px;height:46px;background:var(--c-indigo);border-radius:14px;display:grid;place-items:center;color:#fff">
            ${icon('star', 'width=\"24\" height=\"24\"')}</div>
          <div>
            <b style="font-size:16px">برنامه‌ریز روزانه</b>
            <div style="font-size:12px;color:var(--text-soft);margin-top:2px;font-weight:600">نسخه‌ی ۹٫۰ · تاریخ شمسی · آفلاین</div>
          </div>
        </div>
        <div class="dev-credit">
          <div class="ic" style="width:40px;height:40px;background:var(--c-magenta);border-radius:12px;display:grid;place-items:center;color:#fff">
            ${icon('user', 'width=\"20\" height=\"20\"')}</div>
          <div>
            <small style="color:var(--text-soft); font-weight:800">طراحی و توسعه</small>
            <b style="font-size:15px; display:block">علیرضا رنجبر</b>
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
      refresh()
    })
    root.querySelector('#notif-switch').addEventListener('click', async () => {
      const turningOn = !getState().notif
      update((s) => { s.notif = !s.notif })
      if (turningOn) {
        const res = await requestAlarmPermission()
        if (res === 'granted') { toast('یادآوری‌ها روشن شد'); syncAlarms().catch(() => {}) }
        else if (res === 'denied') toast('برای یادآوری، دسترسی اعلان لازم است')
        else toast('یادآوری‌ها روشن شد')
      } else {
        toast('یادآوری‌ها خاموش شد')
        syncAlarms().catch(() => {})
      }
      refresh()
    })

    const testBtn = root.querySelector('#test-alarm')
    if (testBtn) testBtn.addEventListener('click', async () => {
      const note = root.querySelector('#alarm-note')
      testBtn.disabled = true
      const res = await fireTestAlarm()
      testBtn.disabled = false
      if (note) {
        if (res === 'granted') note.textContent = 'یک اعلان آزمایشی تا چند ثانیه‌ی دیگر می‌رسد.'
        else if (res === 'denied') note.textContent = 'دسترسی اعلان رد شده است.'
        else note.textContent = 'روی این دستگاه در دسترس نیست (در نسخه‌ی نصب‌شده کار می‌کند).'
      }
    })

    // دسته‌ها
    root.querySelectorAll('[data-tagcolor]').forEach((el) =>
      el.addEventListener('click', () => { newTagColor = el.dataset.tagcolor; refresh() }))
    const tagNameEl = root.querySelector('#tag-name')
    const addTag = () => {
      const v = tagNameEl.value.trim()
      if (!v) { toast('نام دسته را بنویس'); tagNameEl.focus(); return }
      update((s) => { s.tags.push({ id: 'tag-' + nextId(), name: v, color: newTagColor }) })
      tagNameEl.value = ''
      toast('دسته اضافه شد 🏷️')
      refresh()
    }
    root.querySelector('#add-tag').addEventListener('click', addTag)
    tagNameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTag() })
    root.querySelectorAll('[data-deltag]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = el.dataset.deltag
        update((s) => {
          s.tags = s.tags.filter((t) => t.id !== id)
          s.tasks.forEach((t) => { if (t.tags) t.tags = t.tags.filter((x) => x !== id) })
        })
        toast('حذف شد 🗑️')
        refresh()
      }))

    // قالب‌ها
    root.querySelectorAll('[data-tpl]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = el.dataset.tpl
        const tpl = getState().templates.find((t) => t.id === id)
        if (!tpl) return
        const tk = todayKey()
        update((s) => {
          tpl.items.forEach((it) => {
            s.seq += 1
            s.tasks.push({
              id: s.seq, text: it.text, done: false, prio: it.prio || 'mid',
              time: it.time || '', dur: it.dur || 0, day: tk,
              tags: [...(it.tags || [])], repeat: 'none', doneDays: [],
            })
          })
        })
        toast(`«${tpl.name}» اضافه شد ✅`)
        go('tasks')
      }))

    root.querySelector('#reset-btn').addEventListener('click', () => {
      if (confirm('همه‌ی کارها، رویدادها و یادداشت‌ها پاک شوند؟')) {
        resetAll()
        toast('داده‌ها پاک شد')
        refresh()
      }
    })
  },
}

function tagItem(t) {
  return `
    <span class="tag-chip" style="background:${t.color}1f; color:${t.color}; border:1.5px solid ${t.color}">
      <span class="prio-tag" style="background:${t.color}"></span>${escape(t.name)}
      <button class="tag-x" data-deltag="${t.id}">${icon('trash', 'width=\"12\" height=\"12\"')}</button>
    </span>`
}

function colorDot(c) {
  const on = newTagColor === c
  return `<button data-tagcolor="${c}"
    style="width:28px;height:28px;border-radius:50%;background:${c};
    border:${on ? '3px solid var(--text)' : '2px solid var(--border)'};cursor:pointer;flex-shrink:0"></button>`
}

function templateItem(tpl) {
  return `
    <div class="tpl-row">
      <div class="tpl-info">
        <b>${escape(tpl.name)}</b>
        <small>${toFa(tpl.items.length)} کار</small>
      </div>
      <button class="btn btn-brand tpl-add" data-tpl="${tpl.id}">
        ${icon('plus', 'width=\"16\" height=\"16\"')} افزودن</button>
    </div>`
}

function stat(n, label, color) {
  return `<div>
    <div style="font-size:26px;font-weight:900;color:${color}">${toFa(n)}</div>
    <div style="font-size:12px;color:var(--text-soft);font-weight:800;margin-top:2px">${label}</div>
  </div>`
}

function escape(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
