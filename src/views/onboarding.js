// آنبوردینگ: صفحات راهنما که برنامه را معرفی می‌کنند + پرسیدن نام کاربر
import { icon } from '../icons.js'
import { welcomeSvg, organizeSvg, emptyAgendaSvg, celebrateSvg } from '../illus.js'
import { completeOnboarding } from '../store.js'

// گام‌های راهنما — آخرین گام پرسش نام است
const STEPS = [
  {
    art: welcomeSvg,
    title: 'به برنامه‌ریز روزانه خوش آمدید',
    body: 'یک دستیار ساده و زیبا برای مدیریت کارها، رویدادها و برنامه‌ی روزانه‌تان — با تقویم شمسی و کاملاً آفلاین.',
    accent: 'var(--c-indigo)',
  },
  {
    art: organizeSvg,
    title: 'کارها را سازمان بده',
    body: 'کارها را با اولویت، ساعت و مدت‌زمان بساز. با دسته‌های رنگی مرتبشان کن و کارهای تکرارشونده را روزانه، هفتگی یا ماهانه تعریف کن.',
    accent: 'var(--c-azure)',
  },
  {
    art: emptyAgendaSvg,
    title: 'تقویم و عملکردت را ببین',
    body: 'در صفحه‌ی وظایف، کارها و رویدادهای هر روز را کنار تقویم شمسی مدیریت کن. در صفحه‌ی عملکرد هم روند پیشرفتت را دنبال کن.',
    accent: 'var(--c-tangerine)',
  },
  {
    art: celebrateSvg,
    title: 'اسم تو چیست؟',
    body: 'برای شخصی‌سازی صفحه‌ی خانه، لطفاً نامت را وارد کن.',
    accent: 'var(--c-magenta)',
    ask: true,
  },
]

let step = 0
let nameValue = ''

export const onboarding = {
  render() {
    const s = STEPS[step]
    const isLast = step === STEPS.length - 1
    return `
      <div class="onb-wrap">
        <div class="onb-top">
          <div class="onb-dots">
            ${STEPS.map((_, i) => `<span class="onb-dot ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}"></span>`).join('')}
          </div>
          ${!isLast ? `<button class="onb-skip" id="onb-skip">رد کردن</button>` : '<span></span>'}
        </div>

        <div class="onb-body">
          <div class="onb-art" style="--onb-accent:${s.accent}">${s.art}</div>
          <h1 class="onb-title">${s.title}</h1>
          <p class="onb-text">${s.body}</p>

          ${s.ask ? `
            <input class="input onb-input" id="onb-name" placeholder="نام شما..."
              value="${escapeAttr(nameValue)}" />` : ''}
        </div>

        <div class="onb-foot">
          <button class="btn btn-brand btn-block" id="onb-next"
            style="background:${s.accent}">
            ${isLast ? 'شروع کنیم' : 'بعدی'}
            ${icon(isLast ? 'check' : 'arrowLeft', 'width="20" height="20"')}
          </button>
        </div>
      </div>
    `
  },

  mount(root, { finish } = {}) {
    const goNext = () => {
      const s = STEPS[step]
      if (s.ask) {
        const el = root.querySelector('#onb-name')
        nameValue = el ? el.value.trim() : ''
        completeOnboarding(nameValue)
        if (finish) finish()
        return
      }
      step += 1
      rerender(root, finish)
    }

    const nextBtn = root.querySelector('#onb-next')
    if (nextBtn) nextBtn.addEventListener('click', goNext)

    const skip = root.querySelector('#onb-skip')
    if (skip) skip.addEventListener('click', () => {
      step = STEPS.length - 1
      rerender(root, finish)
    })

    const nameEl = root.querySelector('#onb-name')
    if (nameEl) {
      nameEl.focus()
      nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') goNext() })
    }
  },

  reset() { step = 0; nameValue = '' },
}

function rerender(root, finish) {
  root.innerHTML = onboarding.render()
  onboarding.mount(root, { finish })
}

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
