import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children, requiredRol = null }) {
  const [state, setState] = useState({ ready: false, session: null, rol: null })

  useEffect(() => {
    let cancelled = false

    async function load(session) {
      let rol = null
      if (session?.user) {
        // Retry up to 3 times — trigger may not have fired yet right after signup
        for (let i = 0; i < 3; i++) {
          const { data } = await supabase
            .from('perfiles').select('rol').eq('id', session.user.id).maybeSingle()
          if (data?.rol) { rol = data.rol; break }
          await new Promise(r => setTimeout(r, 600))
        }
      }
      if (!cancelled) setState({ ready: true, session, rol })
    }

    supabase.auth.getSession().then(({ data: { session } }) => load(session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!cancelled) load(session)
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [])

  if (!state.ready) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bark)' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--cream)' }}>🐾 Cargando…</div>
      </div>
    )
  }

  if (!state.session) return <Navigate to="/auth" replace />

  if (requiredRol && state.rol !== requiredRol) {
    // Admin sin acceso redirige a home, no a login infinito
    return <Navigate to="/" replace />
  }

  return children
}
