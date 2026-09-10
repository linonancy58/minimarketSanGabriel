import { EstadoStock } from "@/lib/types"

export function BadgeEstado({ estado }: { estado: EstadoStock }) {
  const cls = estado === 'OK' ? 'badge-ok' : estado === 'BAJO' ? 'badge-bajo' : 'badge-critico'
  return <span className={cls}>{estado}</span>
}
