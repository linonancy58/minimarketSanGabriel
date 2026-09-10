import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import LoginPage from '@/features/auth/LoginPage'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AppLayout, { IndexRoute } from '@/routes/AppLayout'
import DashboardPage from '@/features/dashboard/DashboardPage'
import PosPage from '@/features/pos/PosPage'
import InventarioPage from '@/features/inventario/InventarioPage'
import CatalogoPage from '@/features/catalogo/CatalogoPage'
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
                  <Route path="/catalogo" element={<CatalogoPage />} />
                  <Route path="/usuarios" element={<UsuariosPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['cajero']} />}>
                  <Route path="/pos" element={<PosPage />} />
                </Route>

                <Route element={<ProtectedRoute roles={['almacenero', 'gerente']} />}>
                  <Route path="/inventario" element={<InventarioPage />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
