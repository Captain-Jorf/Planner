import { icon } from '../icons.js'
import heroImg from '../assets/hero.png'
import { getState, update, nextId, sortTasks, tasksForDay, taskEnd } from '../store.js'
import { go, refresh, toast } from '../nav.js'
import { todayJalali, longDate, toFa, todayKey } from '../jalali.js'
import { PRIO, bindTaskChecks } from './tasks.js'

const NOTE_COLORS = ['#ffc531', '#ff8a3d', '#23c98a', '#2ba8f5', '#9b59f6', '#e04bce']
let noteColor = NOTE_COLORS[0]

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

export const home = {
  render() {
    const s = getState()
    const t = todayJalali()
    const tk = todayKey()
    const todays = sortTasks(tasksForDay(tk))
    const doneCount = todays.filter((x) => x.done).length
    const taskPct = todays.length ? Math.round((doneCount / todays.length) * 100) : 0
    const evs = s.events[tk] || []
    const next = todays.find((x) => !x.done)
    const notes = s.notes || []

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
        <div class="hero-art"><img src="${heroImg}" alt="" /></div>
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
        <button class="link" data-jump="agenda">همه</button>
      </div>
      ${timeline.length === 0
        ? `<div class="card" style="text-align:center; color:var(--text-soft); font-weight:700; padding:22px">
             هنوز کاری برای امروز نداری</div>`
        : `<div class="timeline">${timeline.map((x) => tlItem(x)).join('')}</div>`}

      <div class="section-title">
        <span class="dot" style="background:var(--c-sunflower)"></span> یادداشت‌ها
        <span class="grow"></span>
      </div>
      <div class="card" style="padding:14px">
        <div style="display:flex; gap:10px; align-items:center">
          <input class="input" id="note-input" placeholder="یک یادداشت سریع بنویس..." style="flex:1" />
          <button class="btn btn-brand btn-icon" id="add-note" style="flex-shrink:0">
            ${icon('plus', 'width=\"18\" height=\"18\"')}</button>
        </div>
        <div class="color-row" style="margin-top:12px">${NOTE_COLORS.map(noteDot).join('')}</div>
      </div>
      ${notes.length
        ? `<div class="notes-grid">${notes.map(noteCard).join('')}</div>`
        : `<div class="card" style="text-align:center; color:var(--text-soft); font-weight:700; padding:16px; margin-top:10px">
             هنوز یادداشتی نداری</div>`}

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
        ${icon('plus', 'width=\"20\" height=\"20\"')} افزودن کار جدید
      </button>
    `
  },

  mount(root) {
    root.querySelectorAll('[data-jump]').forEach((el) =>
      el.addEventListener('click', () => go(el.dataset.jump)))
    bindTaskChecks(root, refresh)

    // یادداشت‌ها
    root.querySelectorAll('[data-notecolor]').forEach((el) =>
      el.addEventListener('click', () => { noteColor = el.dataset.notecolor; refresh() }))
    const noteInput = root.querySelector('#note-input')
    const addNote = () => {
      const v = noteInput.value.trim()
      if (!v) { toast('چیزی بنویس ✍️'); noteInput.focus(); return }
      const id = nextId()
      update((s) => { s.notes.unshift({ id, text: v, color: noteColor, ts: Date.now() }) })
      noteInput.value = ''
      toast('یادداشت ذخیره شد 📝')
      refresh()
    }
    root.querySelector('#add-note').addEventListener('click', addNote)
    noteInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addNote() })
    root.querySelectorAll('[data-delnote]').forEach((el) =>
      el.addEventListener('click', () => {
        const id = +el.dataset.delnote
        update((s) => { s.notes = s.notes.filter((n) => n.id !== id) })
        toast('حذف شد 🗑️')
        refresh()
      }))
  },
}

function noteDot(c) {
  const on = noteColor === c
  return `<button data-notecolor="${c}"
    style="width:26px;height:26px;border-radius:50%;background:${c};
    border:${on ? '3px solid var(--text)' : '2px solid var(--border)'};cursor:pointer;flex-shrink:0"></button>`
}

function noteCard(n) {
  return `
    <div class="note-card" style="background:${n.color}22; border-color:${n.color}">
      <span class="note-tab" style="background:${n.color}"></span>
      <div class="note-text">${escape(n.text)}</div>
      <button class="note-del" data-delnote="${n.id}">${icon('trash', 'width=\"14\" height=\"14\"')}</button>
    </div>`
}

function tlItem(t) {
  const p = PRIO[t.prio] || PRIO.mid
  const end = t.time && t.dur ? taskEnd(t.time, t.dur) : ''
  return `
    <div class="tl-item">
      <div class="tl-rail">
        <div class="tl-node" style="color:${t.done ? 'var(--c-success)' : p.color}; background:${t.done ? 'var(--c-success)' : p.color}"></div>
        <div class="tl-line"></div>
      </div>
      <div class="tl-body ${t.done ? 'done' : ''}">
        <span class="tl-time">${t.time ? toFa(t.time) + (end ? '–' + toFa(end) : '') : '—'}</span>
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
