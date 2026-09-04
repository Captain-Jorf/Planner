// مدیریت وضعیت با ذخیره‌سازی محلی (localStorage) — آفلاین و ماندگار
import { dowOfKey } from './jalali.js'

const KEY = 'planner.state.v5'

// تگ‌های پیش‌فرض (دسته‌بندی رنگی کارها)
const DEFAULT_TAGS = [
  { id: 't-work',   name: 'کار',     color: '#2ba8f5' },
  { id: 't-study',  name: 'مطالعه',  color: '#9b59f6' },
  { id: 't-health', name: 'سلامتی',  color: '#23c98a' },
  { id: 't-home',   name: 'خانه',    color: '#ff8a3d' },
  { id: 't-fun',    name: 'تفریح',   color: '#e04bce' },
]

const defaultState = {
  user: '',            // خالی = هنوز آنبوردینگ انجام نشده (نام پرسیده می‌شود)
  onboarded: false,    // آیا صفحات راهنما و پرسش نام انجام شده؟
  theme: 'light',
  accent: 'indigo',
  notif: true,
  tags: structuredClone(DEFAULT_TAGS),
  tasks: [
    // حالت پیش‌فرض کاملاً خالی است — هیچ کاری از قبل وجود ندارد
  ],
  events: {
    // dayKey -> [ {id, title, time, end, color} ]
  },
  notes: [
    // حالت پیش‌فرض بدون یادداشت
  ],
  templates: [
    { id: 'tpl-morning', name: 'روتین صبح', items: [
      { text: 'نوشیدن آب', prio: 'low', time: '07:00', dur: 5, tags: ['t-health'] },
      { text: 'مدیتیشن', prio: 'mid', time: '07:15', dur: 15, tags: ['t-health'] },
      { text: 'مرور برنامه‌ی روز', prio: 'mid', time: '08:00', dur: 15, tags: ['t-work'] },
    ] },
    { id: 'tpl-work', name: 'روز کاری', items: [
      { text: 'بررسی ایمیل‌ها', prio: 'mid', time: '09:00', dur: 30, tags: ['t-work'] },
      { text: 'کار عمیق', prio: 'high', time: '10:00', dur: 120, tags: ['t-work'] },
      { text: 'جمع‌بندی روز', prio: 'low', time: '17:00', dur: 20, tags: ['t-work'] },
    ] },
  ],
  seq: 100,
}

let state = load()
const subs = new Set()

// ادغام عمیق با پیش‌فرض تا کلیدهای جدید همیشه وجود داشته باشند
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      const merged = { ...structuredClone(defaultState), ...saved }
      // اطمینان از وجود فیلدهای جدید در هر کار
      merged.tasks = (merged.tasks || []).map((t) => ({
        dur: 30, tags: [], repeat: 'none', doneDays: [], ...t,
      }))
      if (!Array.isArray(merged.tags) || merged.tags.length === 0) merged.tags = structuredClone(DEFAULT_TAGS)
      if (!Array.isArray(merged.notes)) merged.notes = []
      if (!Array.isArray(merged.templates)) merged.templates = structuredClone(defaultState.templates)
      if (typeof merged.onboarded !== 'boolean') merged.onboarded = !!merged.user
      return merged
    }
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

// ============================================================
//  کارها — تکرارشونده، مدت‌زمان، تگ‌ها
// ============================================================

// آیا این کار در روز مشخص‌شده رخ می‌دهد؟ (با احتساب قاعده‌ی تکرار)
export function taskOccursOn(task, key) {
  if (!task.repeat || task.repeat === 'none') return task.day === key
  if (key < task.day) return false                     // قبل از تاریخ لنگر
  switch (task.repeat) {
    case 'daily':   return true
    case 'weekly':  return dowOfKey(key) === dowOfKey(task.day)
    case 'monthly': return key.split('-')[2] === task.day.split('-')[2]
    default:        return task.day === key
  }
}

// وضعیت انجام‌شدن یک کار در روز مشخص
export function isTaskDone(task, key) {
  if (!task.repeat || task.repeat === 'none') return !!task.done
  return Array.isArray(task.doneDays) && task.doneDays.includes(key)
}

// تغییر وضعیت انجام یک کار در روز مشخص (برای تکرارشونده‌ها روزمحور)
export function toggleTaskDone(id, key) {
  update((s) => {
    const t = s.tasks.find((x) => x.id === id)
    if (!t) return
    if (!t.repeat || t.repeat === 'none') { t.done = !t.done; return }
    if (!Array.isArray(t.doneDays)) t.doneDays = []
    const i = t.doneDays.indexOf(key)
    if (i >= 0) t.doneDays.splice(i, 1)
    else t.doneDays.push(key)
  })
}

// فهرست کارهای یک روز، به‌شکل نمونه با فیلد done محاسبه‌شده برای همان روز
export function tasksForDay(key) {
  return getState().tasks
    .filter((t) => taskOccursOn(t, key))
    .map((t) => ({ ...t, done: isTaskDone(t, key), _day: key }))
}

// زمان پایان یک کار از روی شروع + مدت‌زمان
export function taskEnd(time, dur) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + (dur || 0)
  const hh = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// --- کمک‌کارهای مرتب‌سازی ---
export function sortTasks(list) {
  return [...list].sort((a, b) => {
    const ta = a.time || '99:99'
    const tb = b.time || '99:99'
    return ta.localeCompare(tb)
  })
}

// یافتن تگ با شناسه
export function getTag(id) {
  return getState().tags.find((t) => t.id === id)
}

// پایان آنبوردینگ: ذخیره‌ی نام و علامت‌گذاری راهنمای دیده‌شده
export function completeOnboarding(name) {
  update((s) => {
    s.user = (name || '').trim() || 'دوست خوب'
    s.onboarded = true
  })
}
