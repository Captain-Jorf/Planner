import { icon } from '../icons.js'
import { emptyIllust, celebrateIllust } from '../illustrations.js'
import { getState, update, nextId } from '../store.js'
import { toast, rerender } from '../nav.js'
import { todayKey, toFa } from '../jalali.js'
import { escapeHtml } from './util.js'

const PRIO = {
  high: { label: 'مهم', color: 'var(--c-danger)', bg: 'rgba(255,77,94,.14)' },
  mid:  { label: 'متوسط', color: 'var(--c-tangerine)', bg: 'rgba(255,138,61,.14)' },
  low:  { label: 'عادی', color: 'var(--c-teal)', bg: 'rgba(23,183,196,.14)' },
}

let filter = 'all' // all | open | done
let newPrio = 'mid'

export const tasks = {
  render() {
    const s = getState()
    const tk = todayKey()
    const all = s.tasks.filter((x) => x.day === tk)
    const list = all.filter((x) =>
      filter === 'all' ? true : filter === 'open' ? !x.done : x.done)
    const done = all.filter((x) => x.done).length
    const allDone = all.length > 0 && done === all.length

    return `
      <div class="topbar">
        <div>
          <div class="eyebrow">کارهای امروز</div>
          <h1>وظایف</h1>
        </div>
        <div class="chip" style="background:rgba(108,92,231,.14); color:var(--c-indigo)">
          ${toFa(done)} از ${toFa(all.length)} انجام شد
        </div>
      </div>

      <div class="card" style="padding:14px">
        <div style="display:flex; gap:10px">
          <input class="input" id="task-input" placeholder="یک کار جدید بنویس..." />
          <button class="btn btn-brand btn-icon" id="add-task">${icon('plus', 'width="22" height="22"')}</button>
        </div>
        <div class="hscroll" style="margin-top:12px">
          ${prioChip('high')} ${prioChip('mid')} ${prioChip('low')}
        </div>
      </div>

      <div class="hscroll" style="margin-top:16px">
        ${filterChip('all', 'همه')}
        ${filterChip('open', 'باز')}
        ${filterChip('done', 'انجام‌شده')}
      </div>

      <div style="margin-top:8px" id="task-list">
        ${allDone && filter !== 'open' ? celebrate() : ''}
        ${list.length === 0 && !(allDone && filter !== 'open')
          ? empty()
          : list.map(taskRow).join('')}
      </div>
    `
  },

  mount(root) {
    const input = root.querySelector('#task-input')
    const add = () => {
      const val = input.value.trim()
      if (!val) { toast('چیزی بنویس ✍️'); return }
      const id = nextId()
      update((s) => {
        s.tasks.push({ id, text: val, done: false, prio: newPrio, day: todayKey() })
      })
      input.value = ''
      toast('اضافه شد ✅')
      rerender()
    }
    root.querySelector('#add-task').addEventListener('click', add)
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add() })

    root.querySelectorAll('[data-prio]').forEach((el) => {
      el.addEventListener('click', () => { newPrio = el.dataset.prio; rerender() })
    })
    root.querySelectorAll('[data-filter]').forEach((el) => {
      el.addEventListener('click', () => { filter = el.dataset.filter; rerender() })
    })
    root.querySelectorAll('[data-toggle]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = +el.dataset.toggle
        update((s) => { const t = s.tasks.find((x) => x.id === id); if (t) t.done = !t.done })
        rerender()
      })
    })
    root.querySelectorAll('[data-del]').forEach((el) => {
      el.addEventListener('click', () => {
        const id = +el.dataset.del
        update((s) => { s.tasks = s.tasks.filter((x) => x.id !== id) })
        toast('حذف شد 🗑️')
        rerender()
      })
    })
  },
}

function prioChip(k) {
  const p = PRIO[k]
  const on = newPrio === k
  return `<button class="chip" data-prio="${k}"
    style="background:${on ? p.color : p.bg}; color:${on ? '#fff' : p.color}; border:none">
    ● ${p.label}</button>`
}

function filterChip(k, label) {
  const on = filter === k
  return `<button class="chip" data-filter="${k}"
    style="background:${on ? 'var(--brand)' : 'var(--surface-2)'};
           color:${on ? '#fff' : 'var(--text-soft)'};
           border:1px solid var(--border)">${label}</button>`
}

function taskRow(t) {
  const p = PRIO[t.prio] || PRIO.mid
  return `
    <div class="list-item ${t.done ? 'done' : ''}">
      <div class="check ${t.done ? 'on' : ''}" data-toggle="${t.id}">${icon('check')}</div>
      <div style="flex:1">
        <div class="li-text">${escapeHtml(t.text)}</div>
        <div class="li-sub"><span style="color:${p.color}; font-weight:700">● ${p.label}</span></div>
      </div>
      <button class="del" data-del="${t.id}">${icon('trash', 'width="16" height="16"')}</button>
    </div>`
}

function empty() {
  return `<div class="empty">${emptyIllust}<p>هیچ کاری اینجا نیست. یکی اضافه کن!</p></div>`
}

function celebrate() {
  return `<div class="empty">${celebrateIllust}<p>آفرین! همه‌ی کارهای امروز انجام شد 🎉</p></div>`
}
