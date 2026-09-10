import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { useAuth } from './AuthContext'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import {
  ShoppingCart,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Package,
  ShieldCheck,
  BarChart3,
} from 'lucide-react'

/* =========================================================
   VALIDACIÓN
========================================================= */

const schema = z.object({
  email: z
    .string()
    .email('Ingresa un correo válido'),

  password: z
    .string()
    .min(6, 'La contraseña debe tener mínimo 6 caracteres'),
})

type FormValues = z.infer<typeof schema>

/* =========================================================
   LOGIN PAGE
========================================================= */

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  /* =======================================================
     LOGIN
  ======================================================= */

  async function onSubmit(values: FormValues) {
    try {
      setLoading(true)
      setError(null)

      const { error } = await signIn(
        values.email,
        values.password
      )

      if (error) {
        setError(
          'Correo o contraseña incorrectos, o el usuario está inactivo.'
        )
        return
      }

      navigate('/', {
        replace: true,
      })
    } finally {
      setLoading(false)
    }
  }

  /* =======================================================
     VISTA
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#061f3c]">

      {/* =====================================================
          IMAGEN DE FONDO
      ====================================================== */}

      <img
        src="/login-img.png"
        alt="Almacén San Gabriel"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Overlay general */}
      <div className="absolute inset-0 bg-[#06294d]/35" />

      {/* Oscurecer lado izquierdo */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-r
          from-[#041c36]/95
          via-[#06294d]/60
          to-[#06294d]/15
        "
      />

      {/* Oscurecer inferior */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-t
          from-[#03182f]/80
          via-transparent
          to-[#03182f]/15
        "
      />

      {/* =====================================================
          CONTENEDOR GENERAL
      ====================================================== */}

      <div
        className="
          relative z-10
          mx-auto
          grid min-h-screen
          w-full
          max-w-[1600px]
          items-center
          gap-12
          px-6
          py-8
          md:px-10
          lg:grid-cols-[1fr_520px]
          lg:px-14
          xl:px-20
        "
      >

        {/* ===================================================
            LADO IZQUIERDO
        ==================================================== */}

        <section
          className="
            hidden
            h-full
            flex-col
            justify-between
            py-6
            lg:flex
          "
        >

          {/* LOGO */}
          <div className="flex items-center gap-4">

            <div
              className="
                flex h-16 w-16
                items-center justify-center
                rounded-2xl
                bg-white
                shadow-2xl
              "
            >
              <ShoppingCart
                size={34}
                strokeWidth={2.2}
                className="text-[#ff7900]"
              />
            </div>

            <div>
              <h1
                className="
                  text-3xl
                  font-bold
                  tracking-tight
                  text-white
                "
              >
                San Gabriel
              </h1>

              <p className="mt-1 text-sm text-white/80">
                Sistema de Gestión de Inventarios
              </p>
            </div>

          </div>

          {/* CONTENIDO CENTRAL */}
          <div className="max-w-2xl">

            {/* Línea */}
            <div className="mb-7 h-1 w-14 rounded-full bg-[#ff7900]" />

            <h2
              className="
                text-5xl
                font-bold
                leading-[1.08]
                tracking-tight
                text-white
                xl:text-6xl
              "
            >
              Controla tu stock.
              <br />

              <span className="text-[#ff7900]">
                Impulsa tu negocio.
              </span>
            </h2>

            <p
              className="
                mt-7
                max-w-xl
                text-lg
                leading-8
                text-white/85
              "
            >
              Administra inventarios, controla movimientos
              y toma mejores decisiones desde una sola
              plataforma.
            </p>

            {/* BENEFICIOS */}
            <div
              className="
                mt-12
                grid
                max-w-2xl
                grid-cols-3
              "
            >

              {/* Inventario */}
              <div className="border-r border-white/20 pr-7">

                <div
                  className="
                    mb-4
                    flex h-11 w-11
                    items-center justify-center
                    rounded-full
                    bg-[#0a3765]/80
                    backdrop-blur-sm
                  "
                >
                  <Package
                    size={22}
                    className="text-white"
                  />
                </div>

                <p className="text-sm font-bold text-white">
                  Inventario
                </p>

                <p className="mt-1 text-xs text-white/70">
                  En tiempo real
                </p>

              </div>

              {/* Seguridad */}
              <div className="border-r border-white/20 px-7">

                <div
                  className="
                    mb-4
                    flex h-11 w-11
                    items-center justify-center
                    rounded-full
                    bg-[#0a3765]/80
                    backdrop-blur-sm
                  "
                >
                  <ShieldCheck
                    size={22}
                    className="text-white"
                  />
                </div>

                <p className="text-sm font-bold text-white">
                  Mayor control
                </p>

                <p className="mt-1 text-xs text-white/70">
                  Seguridad y precisión
                </p>

              </div>

              {/* Decisiones */}
              <div className="pl-7">

                <div
                  className="
                    mb-4
                    flex h-11 w-11
                    items-center justify-center
                    rounded-full
                    bg-[#0a3765]/80
                    backdrop-blur-sm
                  "
                >
                  <BarChart3
                    size={22}
                    className="text-white"
                  />
                </div>

                <p className="text-sm font-bold text-white">
                  Decisiones
                </p>

                <p className="mt-1 text-xs text-white/70">
                  Más inteligentes
                </p>

              </div>

            </div>

          </div>

          {/* FOOTER IZQUIERDO */}
          <div className="flex items-center justify-between">

            <p className="text-xs text-white/65">
              © {new Date().getFullYear()} San Gabriel
            </p>

            <p className="text-xs text-white/65">
              Gestión y control empresarial
            </p>

          </div>

        </section>

        {/* ===================================================
            PANEL LOGIN
        ==================================================== */}

        <section
          className="
            mx-auto
            w-full
            max-w-[520px]
          "
        >

          <div
            className="
              rounded-[28px]
              border
              border-white/70
              bg-white/95
              p-6
              shadow-[0_30px_80px_rgba(0,0,0,0.30)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >

            {/* LOGO MÓVIL */}
            <div
              className="
                mb-8
                flex items-center
                gap-3
                lg:hidden
              "
            >

              <div
                className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-xl
                  bg-[#092b50]
                "
              >
                <ShoppingCart
                  size={25}
                  className="text-[#ff7900]"
                />
              </div>

              <div>

                <h1 className="text-xl font-bold text-[#092b50]">
                  San Gabriel
                </h1>

                <p className="text-xs text-slate-500">
                  Gestión de Inventarios
                </p>

              </div>

            </div>

            {/* CABECERA */}
            <div className="mb-8">

              <div
                className="
                  mb-4
                  h-1
                  w-12
                  rounded-full
                  bg-[#ff7900]
                "
              />

              <p
                className="
                  mb-2
                  text-sm
                  font-semibold
                  text-slate-500
                "
              >
                Bienvenido de nuevo
              </p>

              <h2
                className="
                  text-4xl
                  font-bold
                  tracking-tight
                  text-[#092b50]
                "
              >
                Inicia sesión
              </h2>

              <p
                className="
                  mt-3
                  max-w-md
                  text-sm
                  leading-6
                  text-slate-500
                "
              >
                Accede a tu cuenta para administrar tu
                inventario de forma segura y rápida.
              </p>

            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >

              {/* EMAIL */}
              <div>

                <Label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#092b50]
                  "
                >
                  Correo electrónico
                </Label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="usuario@sangabriel.pe"
                    className="
                      h-14
                      rounded-xl
                      border-slate-200
                      bg-white
                      pl-12
                      text-[15px]
                      shadow-sm
                      transition
                      placeholder:text-slate-400

                      focus:border-[#ff7900]
                      focus:ring-2
                      focus:ring-[#ff7900]/15
                    "
                    {...register('email')}
                  />

                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}

              </div>

              {/* PASSWORD */}
              <div>

                <Label
                  htmlFor="password"
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-[#092b50]
                  "
                >
                  Contraseña
                </Label>

                <div className="relative">

                  <Lock
                    size={19}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <Input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    className="
                      h-14
                      rounded-xl
                      border-slate-200
                      bg-white
                      pl-12
                      pr-12
                      text-[15px]
                      shadow-sm
                      transition
                      placeholder:text-slate-400

                      focus:border-[#ff7900]
                      focus:ring-2
                      focus:ring-[#ff7900]/15
                    "
                    {...register('password')}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(prev => !prev)
                    }
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      transition
                      hover:text-[#092b50]
                    "
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}

              </div>

              {/* RECORDAR + OLVIDÓ CONTRASEÑA */}
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <label
                  className="
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    text-sm
                    text-[#092b50]
                  "
                >

                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) =>
                      setRemember(e.target.checked)
                    }
                    className="
                      h-4 w-4
                      cursor-pointer
                      rounded
                      border-slate-300
                      accent-[#ff7900]
                    "
                  />

                  <span className="font-medium">
                    Recordarme
                  </span>

                </label>

                <button
                  type="button"
                  className="
                    text-sm
                    font-semibold
                    text-[#1769aa]
                    transition
                    hover:text-[#ff7900]
                  "
                >
                  ¿Olvidaste tu contraseña?
                </button>

              </div>

              {/* ERROR */}
              {error && (
                <div
                  className="
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                  "
                >
                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>
                </div>
              )}

              {/* LOGIN BUTTON */}
              <Button
                type="submit"
                disabled={loading}
                className="
                  group
                  mt-2
                  h-14
                  w-full
                  rounded-xl
                  bg-[#ff7900]
                  text-base
                  font-bold
                  text-white
                  shadow-[0_12px_30px_rgba(255,121,0,0.28)]
                  transition-all
                  duration-200

                  hover:-translate-y-[1px]
                  hover:bg-[#eb6f00]
                  hover:shadow-[0_16px_35px_rgba(255,121,0,0.35)]

                  disabled:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {loading ? (
                  'Ingresando...'
                ) : (
                  <>
                    Ingresar

                    <ArrowRight
                      size={19}
                      className="
                        ml-2
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </>
                )}

              </Button>

            </form>

            {/* =================================================
                SEPARADOR
            ================================================== */}

            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  tracking-wider
                  text-slate-400
                "
              >
                ACCESO SEGURO
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* =================================================
                ROLES
            ================================================== */}

            <div
              className="
                rounded-2xl
                border
                border-slate-200
                bg-slate-50/90
                p-4
              "
            >

              <div className="flex items-start gap-3">

                <div
                  className="
                    flex h-11 w-11
                    shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-[#092b50]
                  "
                >
                  <ShieldCheck
                    size={20}
                    className="text-[#ff7900]"
                  />
                </div>

                <div>

                  <p className="text-sm font-bold text-[#092b50]">
                    Acceso según tu rol
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-slate-500
                    "
                  >
                    Cajero, almacenero o gerente.
                    Las funciones disponibles dependen
                    de tus permisos.
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* FOOTER MÓVIL */}
          <p
            className="
              mt-5
              text-center
              text-xs
              text-white/70
              lg:hidden
            "
          >
            © {new Date().getFullYear()} San Gabriel
          </p>

        </section>

      </div>

    </main>
  )
}