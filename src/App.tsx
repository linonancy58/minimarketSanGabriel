import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import LoginPage from '@/features/auth/LoginPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AppLayout, { IndexRoute } from '@/routes/AppLayout'
import { ThemeProvider } from '@/lib/theme'
import PwaPrompts from '@/components/PwaPrompts'

const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const PosPage = lazy(() => import('@/features/pos/PosPage'))
const ProductosPage = lazy(() => import('@/features/catalogo/ProductosPage'))
const CategoriasPage = lazy(() => import('@/features/catalogo/CategoriasPage'))
const StockPage = lazy(() => import('@/features/inventario/StockPage'))
const EntradasPage = lazy(() => import('@/features/movimientos/EntradasPage'))
const SalidasPage = lazy(() => import('@/features/movimientos/SalidasPage'))
const ComprasPage = lazy(() => import('@/features/compras/ComprasPage'))
const ProveedoresPage = lazy(() => import('@/features/proveedores/ProveedoresPage'))
const ReportesPage = lazy(() => import('@/features/reportes/ReportesPage'))
const ConfiguracionPage = lazy(() => import('@/features/configuracion/ConfiguracionPage'))
const UsuariosPage = lazy(() => import('@/features/usuarios/UsuariosPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
})

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route index element={<IndexRoute />} />

                  <Route element={<ProtectedRoute roles={['gerente']} />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/inventario/productos" element={<ProductosPage />} />
                    <Route path="/inventario/categorias" element={<CategoriasPage />} />
                    <Route path="/proveedores" element={<ProveedoresPage />} />
                    <Route path="/reportes" element={<ReportesPage />} />
                    <Route path="/usuarios" element={<UsuariosPage />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['cajero', 'gerente']} />}>
                    <Route path="/pos" element={<PosPage />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['almacenero', 'gerente']} />}>
                    <Route path="/inventario/stock" element={<StockPage />} />
                    <Route path="/compras" element={<ComprasPage />} />
                  </Route>

                  <Route element={<ProtectedRoute roles={['gerente', 'almacenero', 'cajero']} />}>
                    <Route path="/movimientos/entradas" element={<EntradasPage />} />
                    <Route path="/movimientos/salidas" element={<SalidasPage />} />
                    <Route path="/configuracion" element={<ConfiguracionPage />} />
                  </Route>
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        <PwaPrompts />
      </QueryClientProvider>
    </ThemeProvider>
  )
}