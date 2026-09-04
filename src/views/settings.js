import { icon } from '../icons.js'
import { getState, update, nextId, resetAll } from '../store.js'
import { toast, refresh, go } from '../nav.js'
import { toFa, todayKey } from '../jalali.js'

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
      </div>

      <div class="section-title"><span class="dot" style="background:var(--c-teal)"></span> قالب‌های من</div>
      <div class="card" style="padding:14px">
        <div style="font-size:12.5px; color:var(--text-soft); font-weight:700; margin-bottom:10px">
          قالب بساز تا با یک ضربه چند کار آماده را به روز انتخاب‌شده اضافه کنی.</div>
        <div id="tpl-list">
          ${s.templates.length
            ? s.templates.map(templateItem).join('')
            : '<div style="color:var(--text-soft); font-weight:700; font-size:13px">هنوز قالبی نساخته‌ای</div>'}
        </div>
        <button class="btn btn-ghost btn-block" id="new-tpl" style="margin-top:12px">
          ${icon('plus', 'width=\"18\" height=\"18\"')} ساخت قالب جدید</button>
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
 <div style="font-size:12px;color:var(--text-soft);margin-top:2px;font-weight:600">نسخه‌ی ۱۰٫۰ · تاریخ شمسی · آفلاین</div>
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
 toast('ذخیره شد ')
 })
    root.querySelector('#theme-switch').addEventListener('click', () => {
      update((s) => { s.theme = s.theme === 'dark' ? 'light' : 'dark' })
      refresh()
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
 toast('دسته اضافه شد ')
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
 toast('حذف شد ')
 refresh()
 }))

    // اعمال قالب روی امروز
    root.querySelectorAll('[data-tpl]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = el.dataset.tpl
        const tpl = getState().templates.find((t) => t.id === id)
        if (!tpl || !tpl.items.length) { toast('این قالب خالی است'); return }
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
        toast(`«${tpl.name}» به امروز اضافه شد`)
        go('tasks')
      }))

    // حذف قالب
    root.querySelectorAll('[data-deltpl]').forEach((el) =>
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        const id = el.dataset.deltpl
        update((s) => { s.templates = s.templates.filter((t) => t.id !== id) })
        toast('قالب حذف شد')
        refresh()
      }))

    // ساخت قالب جدید (سازنده‌ی قالب)
    const newTplBtn = root.querySelector('#new-tpl')
    if (newTplBtn) newTplBtn.addEventListener('click', () => openTemplateBuilder(root))

    // پاک‌سازی داده‌ها با پنجره‌ی تأیید
    root.querySelector('#reset-btn').addEventListener('click', () => openResetConfirm(root))
  },
}

// ---- پنجره‌ی تأیید پاک‌سازی داده‌ها ----
function openResetConfirm(root) {
  const host = document.createElement('div')
  host.className = 'modal-back'
  host.innerHTML = `
    <div class="modal-card">
      <div class="modal-ic" style="background:rgba(245,56,74,.14); color:var(--c-danger)">
        ${icon('trash', 'width="26" height="26"')}</div>
      <h2 class="modal-title">مطمئنی؟</h2>
      <p class="modal-text">همه‌ی کارها، رویدادها، یادداشت‌ها و قالب‌ها برای همیشه پاک می‌شوند.
        این کار قابل بازگشت نیست.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="rc-cancel">انصراف</button>
        <button class="btn btn-block" id="rc-ok"
          style="background:var(--c-danger); color:#fff; flex:1">بله، پاک کن</button>
      </div>
    </div>`
  document.body.appendChild(host)
  requestAnimationFrame(() => host.classList.add('show'))
  const close = () => { host.classList.remove('show'); setTimeout(() => host.remove(), 200) }
  host.querySelector('#rc-cancel').addEventListener('click', close)
  host.addEventListener('click', (e) => { if (e.target === host) close() })
  host.querySelector('#rc-ok').addEventListener('click', () => {
    resetAll()
    close()
    toast('داده‌ها پاک شد')
    refresh()
  })
}

// ---- سازنده‌ی قالب دلخواه ----
function openTemplateBuilder(root) {
  const items = []
  const host = document.createElement('div')
  host.className = 'modal-back'
  const draw = () => {
    host.innerHTML = `
      <div class="modal-card tpl-builder">
        <h2 class="modal-title">قالب جدید</h2>
        <input class="input" id="tb-name" placeholder="نام قالب (مثلاً روتین صبح)" value="${escapeAttr(nameCache.v)}" />
        <div class="opt-label" style="margin-top:12px">کارهای قالب</div>
        <div class="tb-items">
          ${items.length
            ? items.map((it, i) => `
              <div class="tb-item">
                <span class="tb-txt">${escape(it.text)}${it.time ? ' · ' + toFa(it.time) : ''}</span>
                <button class="tag-x" data-tbdel="${i}">${icon('trash', 'width="12" height="12"')}</button>
              </div>`).join('')
            : '<div style="color:var(--text-soft); font-weight:700; font-size:12.5px">هنوز کاری اضافه نشده</div>'}
        </div>
        <div style="display:flex; gap:8px; margin-top:10px; align-items:center">
          <input class="input" id="tb-item-text" placeholder="عنوان کار..." style="flex:1" />
          <input class="input" id="tb-item-time" inputmode="numeric" placeholder="ساعت" style="max-width:84px; text-align:center" />
          <button class="btn btn-ghost btn-icon" id="tb-add-item" style="flex-shrink:0">
            ${icon('plus', 'width="18" height="18"')}</button>
        </div>
        <div class="modal-actions" style="margin-top:16px">
          <button class="btn btn-ghost" id="tb-cancel">انصراف</button>
          <button class="btn btn-brand btn-block" id="tb-save" style="flex:1">ذخیره‌ی قالب</button>
        </div>
      </div>`
    bind()
  }
  const nameCache = { v: '' }
  const close = () => { host.classList.remove('show'); setTimeout(() => host.remove(), 200) }
  function bind() {
    const nameEl = host.querySelector('#tb-name')
    nameEl.addEventListener('input', () => { nameCache.v = nameEl.value })
    const txtEl = host.querySelector('#tb-item-text')
    const timeEl = host.querySelector('#tb-item-time')
    const addItem = () => {
      const text = txtEl.value.trim()
      if (!text) { toast('عنوان کار را بنویس'); txtEl.focus(); return }
      items.push({ text, prio: 'mid', time: normTime(timeEl.value), dur: 0, tags: [] })
      draw()
      host.querySelector('#tb-item-text').focus()
    }
    host.querySelector('#tb-add-item').addEventListener('click', addItem)
    txtEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem() })
    timeEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addItem() })
    host.querySelectorAll('[data-tbdel]').forEach((el) =>
      el.addEventListener('click', () => { items.splice(+el.dataset.tbdel, 1); draw() }))
    host.querySelector('#tb-cancel').addEventListener('click', close)
    host.querySelector('#tb-save').addEventListener('click', () => {
      const name = nameCache.v.trim()
      if (!name) { toast('نام قالب را بنویس'); host.querySelector('#tb-name').focus(); return }
      if (!items.length) { toast('حداقل یک کار اضافه کن'); return }
      update((s) => { s.templates.push({ id: 'tpl-' + nextId(), name, items: [...items] }) })
      close()
      toast('قالب ساخته شد')
      refresh()
    })
  }
  document.body.appendChild(host)
  draw()
  requestAnimationFrame(() => host.classList.add('show'))
  host.addEventListener('click', (e) => { if (e.target === host) close() })
}

function normTime(v) {
  const raw = String(v || '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).trim()
  if (!raw) return ''
  const m = raw.match(/^(\d{1,2})[:٫.]?(\d{0,2})$/)
  if (!m) return ''
  return `${String(Math.min(23, +m[1])).padStart(2, '0')}:${String(Math.min(59, +(m[2] || 0))).padStart(2, '0')}`
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
      <button class="del" data-deltpl="${tpl.id}" style="flex-shrink:0">
        ${icon('trash', 'width=\"15\" height=\"15\"')}</button>
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
function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
