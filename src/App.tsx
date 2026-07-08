import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { ScanResultPage } from '@/pages/ScanResultPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage'
import { AdminLayout } from '@/pages/admin/AdminLayout'
import { RequireAdmin } from '@/pages/admin/RequireAdmin'
import { AdminProductsListPage } from '@/pages/admin/AdminProductsListPage'
import { AdminProductFormPage } from '@/pages/admin/AdminProductFormPage'
import { AdminBrandsListPage } from '@/pages/admin/AdminBrandsListPage'
import { AdminBrandFormPage } from '@/pages/admin/AdminBrandFormPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="scan/:retailId/:index?" element={<ScanResultPage />} />
          </Route>

          <Route path="admin/login" element={<AdminLoginPage />} />
          <Route element={<RequireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="admin/products" element={<AdminProductsListPage />} />
              <Route path="admin/products/new" element={<AdminProductFormPage />} />
              <Route path="admin/products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="admin/brands" element={<AdminBrandsListPage />} />
              <Route path="admin/brands/new" element={<AdminBrandFormPage />} />
              <Route path="admin/brands/:id/edit" element={<AdminBrandFormPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
