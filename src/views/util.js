// افکت tilt سه‌بعدی روی کارت‌ها با حرکت اشاره‌گر/لمس
export function attachTilt(root) {
  root.querySelectorAll('.card.tilt').forEach((card) => {
    let raf
    const onMove = (e) => {
      const rect = card.getBoundingClientRect()
      const p = e.touches ? e.touches[0] : e
      const x = (p.clientX - rect.left) / rect.width - 0.5
      const y = (p.clientY - rect.top) / rect.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        card.style.transform =
          `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateZ(6px)`
      })
    }
    const reset = () => {
      cancelAnimationFrame(raf)
      card.style.transform = ''
    }
    card.addEventListener('pointermove', onMove)
    card.addEventListener('pointerleave', reset)
    card.addEventListener('pointerup', reset)
    card.addEventListener('touchmove', onMove, { passive: true })
    card.addEventListener('touchend', reset)
  })
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
