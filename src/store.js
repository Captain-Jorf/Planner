// مدیریت وضعیت با ذخیره‌سازی محلی (localStorage) — آفلاین و ماندگار
import { todayKey } from './jalali.js'

const KEY = 'planner.state.v1'

const defaultState = {
  user: 'دوست خوب',
  theme: 'light',
  notif: true,
  tasks: [
    { id: 1, text: 'مرور برنامه‌ی امروز', done: true, prio: 'mid', day: todayKey() },
    { id: 2, text: 'نوشتن گزارش هفتگی', done: false, prio: 'high', day: todayKey() },
    { id: 3, text: 'تماس با خانواده', done: false, prio: 'low', day: todayKey() },
  ],
  events: {
    // dayKey -> [ {id, title, time, color} ]
  },
  habits: [
    { id: 1, name: 'نوشیدن آب', icon: 'drop', color: '#38b6ff', week: [true, true, false, true, false, false, false] },
    { id: 2, name: 'ورزش صبحگاهی', icon: 'dumbbell', color: '#ff8a3d', week: [true, false, true, false, false, false, false] },
    { id: 3, name: 'مطالعه', icon: 'book', color: '#37d9a0', week: [false, true, true, true, false, false, false] },
    { id: 4, name: 'مدیتیشن', icon: 'leaf', color: '#9b59f6', week: [true, true, true, false, false, false, false] },
  ],
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
