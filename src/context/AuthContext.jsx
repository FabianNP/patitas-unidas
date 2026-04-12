import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [perfil,  setPerfil]  = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadPerfil(userId) {
    if (!userId) { setPerfil(null); return }
    const { data } = await supabase.from('perfiles').select('*').eq('id', userId).single()
    setPerfil(data || null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      loadPerfil(session?.user?.id ?? null).finally(() => setLoading(false))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      loadPerfil(session?.user?.id ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const rol     = perfil?.rol ?? null
  const isAdmin = rol === 'admin'
  const isAlbergue = rol === 'albergue'
  const isUsuario  = rol === 'usuario'

  const refreshPerfil = () => loadPerfil(user?.id)

  return (
    <AuthContext.Provider value={{ user, perfil, loading, rol, isAdmin, isAlbergue, isUsuario, refreshPerfil }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
