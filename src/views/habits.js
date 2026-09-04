import { icon } from '../icons.js'
import { emptyIllust } from '../illustrations.js'
import { getState, update, nextId } from '../store.js'
import { toast, rerender } from '../nav.js'
import { WEEK_DAYS_SHORT, toFa, todayJalali } from '../jalali.js'
import { escapeHtml } from './util.js'

const ICON_CHOICES = ['drop', 'dumbbell', 'book', 'leaf', 'heart', 'bolt', 'target', 'sun']
const COLORS = ['#38b6ff', '#ff8a3d', '#37d9a0', '#9b59f6', '#ff5fa2', '#ffc531', '#17b7c4', '#e84bd6']

let showForm = false
let formIcon = 'target'
let formColor = COLORS[3]

export const habits = {
  render() {
    const s = getState()
    const dow = todayJalali().dow
    const totalDone = s.habits.reduce((a, h) => a + h.week.filter(Boolean).length, 0)
    const best = bestStreak(s.habits)

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">پیگیری هفتگی</div>
          <h1>عادت‌ها</h1>
        </div>
        <button class="btn btn-mint btn-icon" id="toggle-form">
          ${icon(showForm ? 'chevronL' : 'plus', 'width="22" height="22"')}</button>
      </div>

      <div class="stat-grid" style="margin-bottom:16px">
        <div class="stat" style="background:var(--grad-mint)">
          <div class="num">${toFa(totalDone)}</div>
          <div class="cap">تیک این هفته</div>
          <div class="bg-ic">${icon('check')}</div>
        </div>
        <div class="stat" style="background:var(--grad-sun)">
          <div class="num">${toFa(best)}</div>
          <div class="cap">بهترین زنجیره</div>
          <div class="bg-ic">${icon('flame')}</div>
        </div>
      </div>

      ${showForm ? formCard() : ''}

      <div id="habit-list">
        ${s.habits.length === 0
          ? `<div class="empty">${emptyIllust}<p>هنوز عادتی نساخته‌ای</p></div>`
          : s.habits.map((h) => habitCard(h, dow)).join('')}
      </div>
    `
  },

  mount(root) {
    root.querySelector('#toggle-form').addEventListener('click', () => { showForm = !showForm; rerender() })

    root.querySelectorAll('[data-ficon]').forEach((el) =>
      el.addEventListener('click', () => { formIcon = el.dataset.ficon; rerender() }))
    root.querySelectorAll('[data-fcolor]').forEach((el) =>
      el.addEventListener('click', () => { formColor = el.dataset.fcolor; rerender() }))

    const nameEl = root.querySelector('#habit-name')
    if (nameEl) {
      const addH = () => {
        const name = nameEl.value.trim()
        if (!name) { toast('نام عادت را بنویس'); return }
        const id = nextId()
        update((s) => {
          s.habits.push({ id, name, icon: formIcon, color: formColor, week: [false,false,false,false,false,false,false] })
        })
        showForm = false
        toast('عادت اضافه شد 🌱')
        rerender()
      }
      root.querySelector('#add-habit').addEventListener('click', addH)
      nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') addH() })
    }

    root.querySelectorAll('[data-hd]').forEach((el) => {
      el.addEventListener('click', () => {
        const [id, idx] = el.dataset.hd.split(':').map(Number)
        update((s) => { const h = s.habits.find((x) => x.id === id); if (h) h.week[idx] = !h.week[idx] })
        rerender()
      })
    })
    root.querySelectorAll('[data-delh]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = +el.dataset.delh
        update((s) => { s.habits = s.habits.filter((x) => x.id !== id) })
        toast('حذف شد 🗑️')
        rerender()
      })
    })
  },
}

function formCard() {
  return `
    <div class="card" style="margin-bottom:16px">
      <input class="input" id="habit-name" placeholder="نام عادت جدید..." />
      <div style="font-size:12px;color:var(--text-soft);font-weight:700;margin:14px 4px 8px">آیکون</div>
      <div class="hscroll">
        ${ICON_CHOICES.map((ic) => {
          const on = formIcon === ic
          return `<button data-ficon="${ic}" style="width:44px;height:44px;border-radius:13px;flex-shrink:0;
            display:grid;place-items:center;cursor:pointer;color:${on ? '#fff' : 'var(--text-soft)'};
            background:${on ? formColor : 'var(--surface-2)'};border:1px solid var(--border)">
            ${icon(ic, 'width="22" height="22"')}</button>`
        }).join('')}
      </div>
      <div style="font-size:12px;color:var(--text-soft);font-weight:700;margin:14px 4px 8px">رنگ</div>
      <div class="hscroll">
        ${COLORS.map((c) => {
          const on = formColor === c
          return `<button data-fcolor="${c}" style="width:30px;height:30px;border-radius:50%;flex-shrink:0;
            background:${c};cursor:pointer;border:${on ? '3px solid var(--text)' : '2px solid var(--border)'}"></button>`
        }).join('')}
      </div>
      <button class="btn btn-brand btn-block" id="add-habit" style="margin-top:16px">
        ${icon('plus', 'width="20" height="20"')} ساختن عادت</button>
    </div>`
}

function habitCard(h, todayDow) {
  const doneCount = h.week.filter(Boolean).length
  const pct = Math.round((doneCount / 7) * 100)
  return `
    <div class="habit">
      <div class="habit-top">
        <div class="habit-ic" style="background:${h.color}">${icon(h.icon, 'width="22" height="22"')}</div>
        <div style="flex:1">
          <div style="font-weight:800;font-size:16px">${escapeHtml(h.name)}</div>
          <div style="font-size:12px;color:var(--text-soft)">${toFa(doneCount)} از ۷ روز · ${toFa(pct)}٪</div>
        </div>
        <button class="del" data-delh="${h.id}">${icon('trash', 'width="16" height="16"')}</button>
      </div>
      <div class="week-dots">
        ${WEEK_DAYS_SHORT.map((lbl, i) => {
          const on = h.week[i]
          const isToday = i === todayDow
          return `<div class="wd">
            <div class="lbl" style="${isToday ? `color:${h.color}` : ''}">${lbl}</div>
            <div class="box ${on ? 'on' : ''}" data-hd="${h.id}:${i}"
              style="${on ? `background:${h.color}` : ''}; ${isToday && !on ? `border:2px dashed ${h.color}` : ''}">
            </div>
          </div>`
        }).join('')}
      </div>
      <div style="height:8px;background:var(--surface-2);border-radius:999px;margin-top:14px;overflow:hidden">
        <div style="height:100%;width:${pct}%;background:${h.color};border-radius:999px;transition:width .4s ease"></div>
      </div>
    </div>`
}

function bestStreak(habits) {
  let best = 0
  habits.forEach((h) => {
    let cur = 0
    h.week.forEach((v) => { if (v) { cur++; best = Math.max(best, cur) } else cur = 0 })
  })
  return best
}
