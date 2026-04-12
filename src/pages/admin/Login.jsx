import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  // Si ya hay sesión activa de admin, redirigir directo
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return
      const { data } = await supabase.from('perfiles').select('rol').eq('id', session.user.id).maybeSingle()
      if (data?.rol === 'admin') navigate('/admin', { replace: true })
    })
  }, [navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await signIn(email, password)
    if (err) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
      return
    }

    // Verify this user is actually admin
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) { setError('Error de sesión.'); setLoading(false); return }

    const { data: perfil } = await supabase
      .from('perfiles').select('rol').eq('id', session.user.id).maybeSingle()

    setLoading(false)

    if (perfil?.rol !== 'admin') {
      await supabase.auth.signOut()
      setError('Esta cuenta no tiene permisos de administrador.')
      return
    }

    navigate('/admin', { replace: true })
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bark)', padding:'2rem' }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>🐾</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--cream)', marginBottom:'0.25rem' }}>Patitas Unidas</h1>
          <p style={{ fontSize:'0.85rem', color:'rgba(245,240,232,0.55)' }}>Panel de administración</p>
        </div>

        <div style={{ background:'var(--cream)', borderRadius:20, padding:'2.5rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--bark)', marginBottom:'0.25rem' }}>Acceso admin</h2>
          <p style={{ fontSize:'0.85rem', color:'var(--bark-light)', marginBottom:'2rem' }}>Solo para administradores autorizados.</p>

          <form onSubmit={handleSubmit}>
            <label style={ls}>Correo electrónico</label>
            <div style={{ position:'relative', marginBottom:'1rem' }}>
              <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--gray)' }} />
              <input type="email" required placeholder="admin@patitas.mx" value={email}
                onChange={e => setEmail(e.target.value)} style={{ ...is, paddingLeft:'2.5rem' }}
                onFocus={e => e.target.style.borderColor='var(--terracotta)'}
                onBlur={e => e.target.style.borderColor='var(--gray-light)'}
              />
            </div>

            <label style={ls}>Contraseña</label>
            <div style={{ position:'relative', marginBottom:'1.5rem' }}>
              <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--gray)' }} />
              <input type={showPw ? 'text' : 'password'} required placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} style={{ ...is, paddingLeft:'2.5rem', paddingRight:'2.75rem' }}
                onFocus={e => e.target.style.borderColor='var(--terracotta)'}
                onBlur={e => e.target.style.borderColor='var(--gray-light)'}
              />
              <button type="button" onClick={() => setShowPw(s => !s)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--gray)', display:'flex' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', background:'#FCEBEB', color:'#A32D2D', borderRadius:8, padding:'0.75rem 1rem', marginBottom:'1rem', fontSize:'0.85rem' }}>
                <AlertCircle size={16} style={{ flexShrink:0 }} /> {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'0.9rem', border:'none', borderRadius:10,
              background: loading ? 'var(--bark-light)' : 'var(--terracotta)',
              color:'var(--warm-white)', fontSize:'1rem', fontWeight:500,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'var(--font-body)',
            }}>
              {loading ? 'Verificando…' : 'Entrar al panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const ls = { fontSize:'0.8rem', color:'var(--bark-light)', display:'block', marginBottom:'0.4rem', fontWeight:500 }
const is = { width:'100%', padding:'0.75rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'0.9rem', outline:'none', background:'var(--warm-white)', color:'var(--bark)', fontFamily:'var(--font-body)', transition:'border-color 0.2s' }
