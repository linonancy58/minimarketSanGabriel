import { EstadoStock } from "@/lib/types"
import { Badge } from "./badge"

const MAPA = {
  OK: { tone: 'success', label: 'Normal' },
  BAJO: { tone: 'warning', label: 'Bajo' },
  CRITICO: { tone: 'danger', label: 'Crítico' },
} as const

export function BadgeEstado({ estado }: { estado: EstadoStock }) {
  const { tone, label } = MAPA[estado] ?? MAPA.OK
  return <Badge tone={tone} dot>{label}</Badge>
}
