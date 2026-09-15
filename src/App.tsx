import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import LoginPage from '@/features/auth/LoginPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AppLayout, { IndexRoute } from '@/routes/AppLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import PosPage from '@/features/pos/PosPage'
import ProductosPage from '@/features/catalogo/ProductosPage'
import CategoriasPage from '@/features/catalogo/CategoriasPage'
import StockPage from '@/features/inventario/StockPage'
import EntradasPage from '@/features/movimientos/EntradasPage'
import SalidasPage from '@/features/movimientos/SalidasPage'
import ComprasPage from '@/features/compras/ComprasPage'
import ProveedoresPage from '@/features/proveedores/ProveedoresPage'
import ReportesPage from '@/features/reportes/ReportesPage'
import ConfiguracionPage from '@/features/configuracion/ConfiguracionPage'
import UsuariosPage from '@/features/usuarios/UsuariosPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
})

export default function App() {
  return (
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

                <Route element={<ProtectedRoute roles={['cajero']} />}>
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
    </QueryClientProvider>
  )
}