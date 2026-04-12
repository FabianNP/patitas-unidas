import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/globals.css'
import { AuthProvider } from './context/AuthContext'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

// Public pages
import Home            from './pages/Home'
import Albergues       from './pages/Albergues'
import AlbergueDetalle from './pages/AlbergueDetalle'
import Transparencia   from './pages/Transparencia'
import Noticias        from './pages/Noticias'
import Auth            from './pages/Auth'

// Usuario pages
import PerfilUsuario   from './pages/usuario/Perfil'

// Albergue pages
import SolicitudAlbergue from './pages/albergue/Solicitud'
import PanelAlbergue   from './pages/albergue/PanelAlbergue'

// Admin pages
import AdminLogin      from './pages/admin/Login'
import AdminDashboard  from './pages/admin/Dashboard'

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Públicas ── */}
          <Route path="/"                element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/albergues"       element={<PublicLayout><Albergues /></PublicLayout>} />
          <Route path="/albergues/:id"   element={<PublicLayout><AlbergueDetalle /></PublicLayout>} />
          <Route path="/transparencia"   element={<PublicLayout><Transparencia /></PublicLayout>} />
          <Route path="/noticias"        element={<PublicLayout><Noticias /></PublicLayout>} />
          <Route path="/auth"            element={<PublicLayout><Auth /></PublicLayout>} />

          {/* ── Usuario autenticado ── */}
          <Route path="/perfil" element={
            <PublicLayout>
              <ProtectedRoute>
                <PerfilUsuario />
              </ProtectedRoute>
            </PublicLayout>
          } />

          {/* ── Albergue ── */}
          <Route path="/albergue/solicitud" element={
            <PublicLayout>
              <ProtectedRoute>
                <SolicitudAlbergue />
              </ProtectedRoute>
            </PublicLayout>
          } />
          <Route path="/albergue/panel" element={
            <PublicLayout>
              <ProtectedRoute requiredRol="albergue">
                <PanelAlbergue />
              </ProtectedRoute>
            </PublicLayout>
          } />

          {/* ── Admin ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredRol="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* ── 404 ── */}
          <Route path="*" element={
            <PublicLayout>
              <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', paddingTop:'var(--nav-height)' }}>
                <div style={{ fontSize:'5rem' }}>🐾</div>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--bark)' }}>Página no encontrada</h1>
                <a href="/" style={{ color:'var(--terracotta)', fontWeight:500 }}>← Volver al inicio</a>
              </div>
            </PublicLayout>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
