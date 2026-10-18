import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/features/auth/AuthContext'
import { useStockCritico } from '@/hooks/useInventario'
import { StockCritico } from '@/lib/types'
import { reproducirNotificacion, sonidoActivado, guardarSonido } from '@/lib/sonido'

export type Alerta = StockCritico & { clave: string; leida: boolean }

// La clave incluye el estado: si un producto pasa de BAJO a CRITICO cuenta como alerta nueva
const claveDe = (s: StockCritico) => `${s.id_producto}:${s.id_local}:${s.estado}`

function leerSet(key: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(key) ?? '[]')) } catch { return new Set() }
}

/**
 * Alertas de reposición del usuario actual:
 * - gerente: todos los locales; cajero/almacenero: solo su local
 * - estado leída/no leída persistido por usuario en este dispositivo
 * - `nuevas` dispara sonido + aviso cuando aparece una alerta que no estaba antes
 */
export function useNotificaciones() {
  const { usuario } = useAuth()
  const { data } = useStockCritico()
  const storageKey = `sg-alertas-leidas:${usuario?.id_usuario ?? 'anon'}`
  const [leidas, setLeidas] = useState<Set<string>>(() => leerSet(storageKey))
  const [sonido, setSonido] = useState(sonidoActivado)
  const [nuevas, setNuevas] = useState<StockCritico[]>([])
  const anteriores = useRef<Set<string> | null>(null)

  useEffect(() => setLeidas(leerSet(storageKey)), [storageKey])

  const propias = useMemo(() => {
    const lista = ((data ?? []) as StockCritico[]).filter(
      (s) => usuario?.rol === 'gerente' || s.id_local === usuario?.id_local
    )
    // Críticas primero, luego por menor stock
    return lista.sort((a, b) => (a.estado === b.estado ? a.stock_actual - b.stock_actual : a.estado === 'CRITICO' ? -1 : 1))
  }, [data, usuario])

  const alertas: Alerta[] = useMemo(
    () => propias.map((s) => ({ ...s, clave: claveDe(s), leida: leidas.has(claveDe(s)) })),
    [propias, leidas]
  )

  // Detecta alertas nuevas entre una consulta y la siguiente (no en la primera carga)
  useEffect(() => {
    if (!data) return
    const actuales = new Set(propias.map(claveDe))
    if (anteriores.current) {
      const recien = propias.filter((s) => !anteriores.current!.has(claveDe(s)))
      if (recien.length > 0) {
        setNuevas(recien)
        if (sonido) reproducirNotificacion(recien.some((s) => s.estado === 'CRITICO'))
      }
    }
    anteriores.current = actuales
  }, [data, propias, sonido])

  const persistir = useCallback(
    (set: Set<string>) => {
      setLeidas(set)
      try { localStorage.setItem(storageKey, JSON.stringify([...set])) } catch {}
    },
    [storageKey]
  )

  const marcarLeida = useCallback((clave: string) => persistir(new Set([...leidas, clave])), [leidas, persistir])

  // Solo guarda las claves vigentes para que el almacenamiento no crezca sin límite
  const marcarTodas = useCallback(() => persistir(new Set(alertas.map((a) => a.clave))), [alertas, persistir])

  function alternarSonido() {
    const v = !sonido
    setSonido(v)
    guardarSonido(v)
    if (v) reproducirNotificacion()
  }

  return {
    alertas,
    noLeidas: alertas.filter((a) => !a.leida).length,
    marcarLeida,
    marcarTodas,
    sonido,
    alternarSonido,
    probarSonido: () => reproducirNotificacion(true),
    nuevas,
    descartarNuevas: () => setNuevas([]),
  }
}
