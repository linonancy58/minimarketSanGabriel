import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock, Mail, Eye, EyeOff, ArrowRight, Loader2, Box, BarChart3, Tag, ShieldCheck, Headset, LogIn,
} from 'lucide-react'

import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/page'
import { BrandLogo } from '@/components/BrandLogo'

const schema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

const FUNCIONES = [
  { icon: Box, titulo: 'Control de inventario', texto: 'Stock por local con alertas de reposición.' },
  { icon: BarChart3, titulo: 'Registro de ventas', texto: 'Punto de venta rápido y reportes diarios.' },
  { icon: Tag, titulo: 'Gestión de productos', texto: 'Catálogo, categorías y proveedores.' },
]

// Corte diagonal del panel de marca (la franja verde usa el mismo polígono, un poco más ancha)
const DIAGONAL = 'polygon(0 0, 100% 0, 74% 100%, 0 100%)'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [ayuda, setAyuda] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true)
      setError(null)
      const { error } = await signIn(values.email, values.password)
      if (error) {
        setError('Correo o contraseña incorrectos, o el usuario está inactivo.')
        return
      }
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="fixed inset-0 overflow-y-auto bg-[#f3f5f1] dark:bg-background">
      {/* ================= Panel de marca con corte diagonal ================= */}
      <div aria-hidden className="absolute inset-y-0 left-0 hidden w-[calc(60%+34px)] lg:block" style={{ clipPath: DIAGONAL }}>
        <div className="h-full w-full bg-gradient-to-b from-emerald-500 via-emerald-500/70 to-transparent" />
      </div>
      <section className="absolute inset-y-0 left-0 hidden w-[60%] overflow-hidden text-white lg:block" style={{ clipPath: DIAGONAL }}>
        <img src="/login-tienda.jpg" alt="" className="absolute inset-0 h-full w-full scale-105 object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#082a1d]/95 via-[#0b3424]/80 to-[#0b3424]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06231a]/90 via-transparent to-[#06231a]/40" />

        <div className="relative flex h-full max-w-[560px] flex-col px-12 py-10 xl:px-14">
          <div className="flex items-center gap-4">
            <BrandLogo className="h-14 w-14 drop-shadow-[0_4px_12px_rgb(0_0_0/0.35)]" />
            <div>
              <p className="text-[30px] font-bold leading-none tracking-tight">
                San <span className="text-[#86efac]">Gabriel</span>
              </p>
              <p className="mt-1.5 text-sm text-white/80">Sistema de gestión para minimarket</p>
            </div>
          </div>

          <div className="my-auto">
            <h1 className="text-[38px] font-bold leading-[1.12] tracking-tight text-white xl:text-[42px]">
              Todo tu minimarket,
              <span className="block text-[#86efac]">bajo control.</span>
            </h1>
            <p className="mt-4 max-w-md text-[17px] leading-7 text-white/85">
              Administra ventas, productos e inventario de tus 4 locales desde un solo lugar.
            </p>

            <ul className="mt-9 space-y-4">
              {FUNCIONES.map((f) => (
                <li key={f.titulo} className="flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                    <f.icon size={20} strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[15px] font-semibold">{f.titulo}</p>
                    <p className="text-[13px] text-white/70">{f.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2.5 text-sm text-white/85">
            <ShieldCheck size={16} /> Seguro <span className="text-white/35">|</span> Confiable <span className="text-white/35">|</span> Eficiente
          </p>
        </div>
      </section>

      {/* ================= Formulario en tarjeta ================= */}
      <div className="relative grid min-h-full lg:grid-cols-[60%_40%] xl:grid-cols-[57%_43%]">
        <div className="hidden lg:block" />

        <section className="flex flex-col px-5 py-8 sm:px-8">
          <p className="hidden items-center justify-end gap-2 text-xs text-muted-foreground sm:flex">
            <ShieldCheck size={14} /> Acceso seguro al sistema
          </p>

          <div className="mx-auto my-auto w-full max-w-[460px] py-8 animate-fade-up">
            {/* Marca en móvil */}
            <div className="mb-6 flex items-center justify-center gap-3 lg:hidden">
              <BrandLogo className="h-12 w-12" />
              <p className="text-2xl font-bold tracking-tight text-[#0f3d27] dark:text-foreground">San Gabriel</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7 shadow-[0_24px_60px_-28px_rgb(15_61_39/0.35)] sm:p-10">
              <span className="block h-1 w-12 rounded-full bg-primary" />
              <h2 className="mt-6 text-[30px] font-bold tracking-tight">Iniciar sesión</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ingresa tus credenciales para acceder al sistema de gestión del minimarket.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
                <div>
                  <Label htmlFor="email" className="font-semibold">Correo electrónico</Label>
                  <InputWithIcon
                    id="email"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@sangabriel.pe"
                    className="h-12 rounded-xl pl-11 text-[15px]"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                  {errors.email && <p className="mt-1.5 text-xs font-medium text-destructive">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <Label htmlFor="password" className="mb-0 font-semibold">Contraseña</Label>
                    <button type="button" onClick={() => setAyuda(true)} className="text-[13px] font-medium text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <InputWithIcon
                      id="password"
                      icon={Lock}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl pl-11 pr-12 text-[15px]"
                      aria-invalid={!!errors.password}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs font-medium text-destructive">{errors.password.message}</p>}
                </div>

                {error && <Alert tone="error">{error}</Alert>}

                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="group h-12 w-full rounded-xl text-base shadow-[0_12px_24px_-12px_rgb(4_120_87/0.8)]"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Ingresando…</>
                  ) : (
                    <><LogIn size={18} /> Ingresar <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </Button>
              </form>

              <div className="mt-7 flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">¿Necesitas ayuda?</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                onClick={() => setAyuda((v) => !v)}
                aria-expanded={ayuda}
                className="mx-auto mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Headset size={16} /> Contacta al administrador del sistema <ArrowRight size={14} />
              </button>
              {ayuda && (
                <p className="mt-3 rounded-lg bg-primary-soft px-3.5 py-2.5 text-center text-[13px] text-primary">
                  La gerencia administra las cuentas desde el módulo <strong>Usuarios</strong>: solicítale el restablecimiento de tu contraseña o el alta de tu usuario.
                </p>
              )}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              © {new Date().getFullYear()} San Gabriel. Todos los derechos reservados.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
