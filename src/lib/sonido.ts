// Sonido de notificación generado con Web Audio (sin archivos, funciona offline).
// Los navegadores solo permiten audio después de una interacción del usuario,
// por eso el contexto se "desbloquea" en el primer clic o tecla.

let ctx: AudioContext | null = null

function contexto() {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

if (typeof window !== 'undefined') {
  const desbloquear = () => {
    contexto()?.resume().catch(() => {})
    window.removeEventListener('pointerdown', desbloquear)
    window.removeEventListener('keydown', desbloquear)
  }
  window.addEventListener('pointerdown', desbloquear)
  window.addEventListener('keydown', desbloquear)
}

/** Campanita de dos tonos; `urgente` usa tres notas más agudas (stock crítico) */
export function reproducirNotificacion(urgente = false) {
  const ac = contexto()
  if (!ac || ac.state !== 'running') return
  const notas = urgente ? [880, 1174.7, 1568] : [784, 1046.5]
  const t0 = ac.currentTime
  notas.forEach((freq, i) => {
    const t = t0 + i * 0.13
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
    osc.connect(gain).connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.5)
  })
}

const KEY = 'sg-sonido'
export function sonidoActivado() {
  try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
}
export function guardarSonido(activo: boolean) {
  try { localStorage.setItem(KEY, activo ? 'on' : 'off') } catch {}
}
