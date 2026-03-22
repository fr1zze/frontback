import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProductsPage from './pages/ProductsPage/ProductsPage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import UsersPage from './pages/UsersPage/UsersPage'
import { getAccessToken, getCurrentUser } from './api'

function ProtectedRoute({ children, roles }) {
  const token = getAccessToken()
  const user = getCurrentUser()

  if (!token) return <Navigate to='/login' replace />
  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to='/products' replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/products' replace />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />

        <Route
          path='/products'
          element={
            <ProtectedRoute roles={['user', 'seller', 'admin']}>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path='/users'
          element={
            <ProtectedRoute roles={['admin']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App