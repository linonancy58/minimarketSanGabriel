import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from './AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Lock, Mail } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    setLoading(true)
    setError(null)
    const { error } = await signIn(values.email, values.password)
    setLoading(false)
    if (error) {
      setError('Credenciales inválidas o usuario inactivo.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange/10 rounded-full blur-3xl" />
      <Card className="w-full max-w-sm relative z-10 shadow-2xl">
        <CardContent className="pt-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center mb-3">
              <ShoppingCart className="text-orange" size={28} />
            </div>
            <h1 className="text-xl font-bold text-navy">San Gabriel</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestión de Inventarios</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                <Input id="email" type="email" placeholder="usuario@sangabriel.pe" className="pl-9" {...register('email')} />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-muted-foreground" size={18} />
                <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>

            {error && <p className="text-sm text-destructive bg-red-50 rounded-lg p-2">{error}</p>}

            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Acceso según rol: cajero, almacenero o gerente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
