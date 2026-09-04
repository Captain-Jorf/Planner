// مدیریت وضعیت با ذخیره‌سازی محلی (localStorage) — آفلاین و ماندگار
import { todayKey } from './jalali.js'

const KEY = 'planner.state.v2'

const tk = todayKey()

const defaultState = {
  user: 'دوست خوب',
  theme: 'light',
  notif: true,
  tasks: [
    { id: 1, text: 'مرور برنامه‌ی امروز', done: true,  prio: 'mid',  time: '08:00', day: tk },
    { id: 2, text: 'ورزش صبحگاهی',        done: true,  prio: 'low',  time: '09:00', day: tk },
    { id: 3, text: 'نوشتن گزارش هفتگی',   done: false, prio: 'high', time: '11:30', day: tk },
    { id: 4, text: 'جلسه‌ی تیم',           done: false, prio: 'high', time: '14:00', day: tk },
    { id: 5, text: 'تماس با خانواده',      done: false, prio: 'low',  time: '19:30', day: tk },
    { id: 6, text: 'مطالعه‌ی کتاب',        done: false, prio: 'mid',  time: '22:00', day: tk },
  ],
  events: {
    // dayKey -> [ {id, title, time, color} ]
  },
  seq: 100,
}

let state = load()
const subs = new Set()

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...structuredClone(defaultState), ...JSON.parse(raw) }
  } catch (e) { /* ignore */ }
  return structuredClone(defaultState)
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) { /* ignore */ }
}

export function getState() { return state }
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn) }

export function update(mutator) {
  mutator(state)
  persist()
  subs.forEach((fn) => fn(state))
}

export function nextId() {
  let id
  update((s) => { s.seq += 1; id = s.seq })
  return id
}

export function resetAll() {
  state = structuredClone(defaultState)
  persist()
  subs.forEach((fn) => fn(state))
}

// --- کمک‌کارهای وظایف ---
export function sortTasks(list) {
  return [...list].sort((a, b) => {
    const ta = a.time || '99:99'
    const tb = b.time || '99:99'
    return ta.localeCompare(tb)
  })
}
