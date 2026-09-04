// مدیریت آلارم/یادآوری با اعلان محلی اندروید (Capacitor Local Notifications).
// روی وب (پیش‌نمایش) بی‌خطر کار می‌کند و فقط لاگ می‌زند.
// نکته‌ی مهم: طبق درخواست کاربر، در متن هیچ اعلانی هیچ اموجی به کار نمی‌رود.

import * as jalaali from 'jalaali-js'
import { getState } from './store.js'
import { todayKey } from './jalali.js'

let LN = null
let isNative = false

// بارگذاری تنبل افزونه؛ در محیط وب ممکن است نیتیو نباشد
async function ensurePlugin() {
  if (LN) return LN
  try {
    const cap = await import('@capacitor/core')
    isNative = cap.Capacitor?.isNativePlatform?.() || false
    const mod = await import('@capacitor/local-notifications')
    LN = mod.LocalNotifications
  } catch (e) {
    LN = null
  }
  return LN
}

// درخواست دسترسی به اعلان‌ها/آلارم. خروجی: 'granted' | 'denied' | 'unavailable'
export async function requestAlarmPermission() {
  const ln = await ensurePlugin()
  if (!ln) return 'unavailable'
  try {
    const res = await ln.requestPermissions()
    // در اندروید ۱۲+ برای آلارم دقیق، افزونه خودش کانال را می‌سازد
    if (isNative) {
      try {
        await ln.createChannel({
          id: 'planner-alarms',
          name: 'یادآوری‌های برنامه‌ریز',
          description: 'اعلان کارها و رویدادها',
          importance: 5,
          visibility: 1,
          vibration: true,
        })
      } catch (e) { /* ignore */ }
    }
    return res.display === 'granted' ? 'granted' : 'denied'
  } catch (e) {
    return 'unavailable'
  }
}

export async function checkAlarmPermission() {
  const ln = await ensurePlugin()
  if (!ln) return 'unavailable'
  try {
    const res = await ln.checkPermissions()
    return res.display === 'granted' ? 'granted' : 'denied'
  } catch (e) {
    return 'unavailable'
  }
}

// شناسه‌ی عددی پایدار برای هر کار/رویداد (باید در بازه‌ی int معتبر بماند)
function notifId(prefix, id) {
  const base = prefix === 'ev' ? 200000 : 100000
  return base + (Number(id) % 90000)
}

function atTime(jy, jm, jd, hhmm) {
  const g = jalaali.toGregorian(jy, jm, jd)
  const [h, m] = hhmm.split(':').map(Number)
  return new Date(g.gy, g.gm - 1, g.gd, h, m, 0, 0)
}

// همگام‌سازی کامل: همه‌ی اعلان‌های قبلی را پاک و اعلان‌های آینده را دوباره می‌چیند
export async function syncAlarms() {
  const ln = await ensurePlugin()
  if (!ln) return { scheduled: 0, status: 'unavailable' }
  const s = getState()
  if (!s.notif) {
    try { await cancelAll(ln) } catch (e) { /* ignore */ }
    return { scheduled: 0, status: 'off' }
  }

  const perm = await checkAlarmPermission()
  if (perm !== 'granted') return { scheduled: 0, status: perm }

  try { await cancelAll(ln) } catch (e) { /* ignore */ }

  const now = new Date()
  const tk = todayKey()
  const [tjy, tjm, tjd] = tk.split('-').map(Number)
  const notifications = []

  // کارهای امروز که ساعت دارند و انجام‌نشده‌اند
  s.tasks.forEach((t) => {
    const occursToday = (!t.repeat || t.repeat === 'none') ? t.day === tk : true
    if (!occursToday || !t.time) return
    const when = atTime(tjy, tjm, tjd, t.time)
    if (when <= now) return
    notifications.push({
      id: notifId('task', t.id),
      title: 'یادآوری کار',
      body: `زمان انجام: ${t.text}`,
      schedule: { at: when, allowWhileIdle: true },
      channelId: 'planner-alarms',
      smallIcon: 'ic_stat_icon',
    })
  })

  // رویدادهای امروز
  ;(s.events[tk] || []).forEach((e) => {
    if (!e.time) return
    const when = atTime(tjy, tjm, tjd, e.time)
    if (when <= now) return
    notifications.push({
      id: notifId('ev', e.id),
      title: 'یادآوری رویداد',
      body: `${e.title}${e.end ? ' تا ' + e.end : ''}`,
      schedule: { at: when, allowWhileIdle: true },
      channelId: 'planner-alarms',
      smallIcon: 'ic_stat_icon',
    })
  })

  if (notifications.length === 0) return { scheduled: 0, status: 'granted' }
  try {
    await ln.schedule({ notifications })
    return { scheduled: notifications.length, status: 'granted' }
  } catch (e) {
    return { scheduled: 0, status: 'error' }
  }
}

async function cancelAll(ln) {
  const pending = await ln.getPending()
  if (pending?.notifications?.length) {
    await ln.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) })
  }
}

// ارسال یک اعلان فوری (برای دکمه‌ی «آزمایش آلارم») — بدون اموجی
export async function fireTestAlarm() {
  const ln = await ensurePlugin()
  if (!ln) return 'unavailable'
  const perm = await checkAlarmPermission()
  if (perm !== 'granted') {
    const asked = await requestAlarmPermission()
    if (asked !== 'granted') return asked
  }
  try {
    await ln.schedule({
      notifications: [{
        id: 999001,
        title: 'آزمایش یادآوری',
        body: 'این یک اعلان آزمایشی از برنامه‌ریز روزانه است.',
        schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true },
        channelId: 'planner-alarms',
        smallIcon: 'ic_stat_icon',
      }],
    })
    return 'granted'
  } catch (e) {
    return 'error'
  }
}
