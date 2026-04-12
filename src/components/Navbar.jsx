import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, Building2, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/supabase'

export default function Navbar() {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [profileMenu, setProfileMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, perfil, isAdmin, isAlbergue } = useAuth()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMobileOpen(false); setProfileMenu(false) }, [location])

  const goToDonate = () => {
    setMobileOpen(false)
    navigate('/')
    setTimeout(() => document.getElementById('donate-section')?.scrollIntoView({ behavior:'smooth' }), 150)
  }

  const handleSignOut = async () => {
    await signOut(); navigate('/')
  }

  const isActive = (to) => location.pathname === to

  const links = [
    { to:'/', label:'Inicio' },
    { to:'/albergues', label:'Albergues' },
    { to:'/transparencia', label:'Transparencia' },
    { to:'/noticias', label:'Noticias' },
  ]

  const initials = ((perfil?.nombre?.[0]||'') + (perfil?.apellido?.[0]||'')).toUpperCase() || (user?.email?.[0]||'U').toUpperCase()

  return (
    <>
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background: scrolled?'rgba(253,250,245,0.96)':'rgba(253,250,245,0.85)',
        backdropFilter:'blur(16px)',
        borderBottom: scrolled?'1px solid var(--gray-light)':'1px solid transparent',
        padding:'0 1.5rem', height:'var(--nav-height)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        transition:'all 0.3s ease',
      }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, fontFamily:'var(--font-display)', fontSize:'1.25rem', color:'var(--bark)', textDecoration:'none', flexShrink:0 }}>
          <span style={{ fontSize:'1.4rem' }}>🐾</span> Patitas Unidas
        </Link>

        {/* Desktop links */}
        <ul className="nav-desktop-links" style={{ display:'flex', alignItems:'center', gap:'0.1rem', listStyle:'none', margin:0, padding:0 }}>
          {links.map(l => (
            <li key={l.to}>
              <Link to={l.to} style={{ fontSize:'0.875rem', color:isActive(l.to)?'var(--terracotta)':'var(--bark-light)', textDecoration:'none', padding:'0.45rem 0.85rem', borderRadius:'99px', background:isActive(l.to)?'var(--terra-pale)':'transparent', transition:'all 0.2s', display:'block' }}>
                {l.label}
              </Link>
            </li>
          ))}

          {/* Auth buttons */}
          {!user ? (
            <>
              <li style={{ marginLeft:'0.5rem' }}>
                <Link to="/auth" style={{ fontSize:'0.875rem', color:'var(--bark-light)', textDecoration:'none', padding:'0.45rem 0.9rem', borderRadius:'99px', border:'1px solid var(--gray-light)', transition:'all 0.2s', display:'block' }}>
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <button onClick={goToDonate} style={{ background:'var(--terracotta)', color:'var(--warm-white)', border:'none', borderRadius:'99px', padding:'0.5rem 1.2rem', fontSize:'0.875rem', fontWeight:500, cursor:'pointer', marginLeft:'0.4rem', transition:'all 0.2s' }}>
                  Donar
                </button>
              </li>
            </>
          ) : (
            <li style={{ position:'relative', marginLeft:'0.75rem' }}>
              <button onClick={() => setProfileMenu(p=>!p)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'var(--cream)', border:'1px solid var(--gray-light)', borderRadius:'99px', padding:'0.35rem 0.9rem 0.35rem 0.4rem', cursor:'pointer', transition:'all 0.2s' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--terra-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:600, color:'var(--terracotta)', overflow:'hidden' }}>
                  {perfil?.avatar_url ? <img src={perfil.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : initials}
                </div>
                <span style={{ fontSize:'0.82rem', color:'var(--bark)' }}>{perfil?.nombre || user.email.split('@')[0]}</span>
              </button>

              {profileMenu && (
                <div style={{ position:'absolute', top:'calc(100% + 8px)', right:0, background:'var(--warm-white)', border:'1px solid var(--gray-light)', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)', minWidth:200, overflow:'hidden', zIndex:200 }}>
                  <div style={{ padding:'0.85rem 1rem', borderBottom:'1px solid var(--gray-light)', fontSize:'0.78rem', color:'var(--gray)' }}>
                    {user.email}
                  </div>
                  {[
                    [User, 'Mi perfil', '/perfil', true],
                    isAlbergue && [Building2, 'Panel de albergue', '/albergue/panel', true],
                    isAdmin    && [Shield, 'Panel admin', '/admin', true],
                  ].filter(Boolean).map(([Icon, label, to]) => (
                    <Link key={to} to={to} style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.7rem 1rem', fontSize:'0.85rem', color:'var(--bark-light)', textDecoration:'none', transition:'background 0.15s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--cream)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <Icon size={15}/> {label}
                    </Link>
                  ))}
                  <button onClick={handleSignOut} style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.7rem 1rem', fontSize:'0.85rem', color:'#A32D2D', background:'none', border:'none', width:'100%', textAlign:'left', cursor:'pointer', borderTop:'1px solid var(--gray-light)', fontFamily:'var(--font-body)', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#FCEBEB'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <LogOut size={15}/> Cerrar sesión
                  </button>
                </div>
              )}
            </li>
          )}
        </ul>

        {/* Mobile hamburger */}
        <button className="nav-mobile-btn" onClick={() => setMobileOpen(o=>!o)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--bark)', display:'none', alignItems:'center', padding:'0.5rem', borderRadius:'var(--radius-sm)' }}>
          {mobileOpen ? <X size={24}/> : <Menu size={24}/>}
        </button>
      </nav>

      {/* Mobile menu */}
      <div className="nav-mobile-menu" style={{ display:mobileOpen?'flex':'none', position:'fixed', top:'var(--nav-height)', left:0, right:0, bottom:0, background:'rgba(253,250,245,0.98)', backdropFilter:'blur(12px)', zIndex:99, flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.5rem', padding:'2rem' }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ fontSize:'1.4rem', fontFamily:'var(--font-display)', color:isActive(l.to)?'var(--terracotta)':'var(--bark)', textDecoration:'none', padding:'0.65rem 2rem', borderRadius:'var(--radius-md)', background:isActive(l.to)?'var(--terra-pale)':'transparent', width:'100%', textAlign:'center' }}>{l.label}</Link>
        ))}
        <div style={{ width:'100%', height:'1px', background:'var(--gray-light)', margin:'0.5rem 0' }}/>
        {!user ? (
          <>
            <Link to="/auth" style={{ fontSize:'1rem', color:'var(--bark-light)', textDecoration:'none', padding:'0.65rem 2rem', borderRadius:'var(--radius-md)', border:'1px solid var(--gray-light)', width:'100%', textAlign:'center' }}>Iniciar sesión / Registrarse</Link>
            <button onClick={goToDonate} style={{ background:'var(--terracotta)', color:'var(--warm-white)', border:'none', borderRadius:'99px', padding:'0.85rem 2rem', fontSize:'1.05rem', fontWeight:500, cursor:'pointer', width:'100%', fontFamily:'var(--font-body)' }}>🐾 Donar ahora</button>
          </>
        ) : (
          <>
            <Link to="/perfil" style={{ fontSize:'1rem', color:'var(--bark)', textDecoration:'none', padding:'0.65rem 2rem', borderRadius:'var(--radius-md)', background:'var(--cream)', width:'100%', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}><User size={18}/> Mi perfil</Link>
            {isAlbergue && <Link to="/albergue/panel" style={{ fontSize:'1rem', color:'var(--bark)', textDecoration:'none', padding:'0.65rem 2rem', borderRadius:'var(--radius-md)', background:'var(--cream)', width:'100%', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}><Building2 size={18}/> Panel de albergue</Link>}
            {isAdmin    && <Link to="/admin" style={{ fontSize:'1rem', color:'var(--bark)', textDecoration:'none', padding:'0.65rem 2rem', borderRadius:'var(--radius-md)', background:'var(--cream)', width:'100%', textAlign:'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}><Shield size={18}/> Panel admin</Link>}
            <button onClick={handleSignOut} style={{ background:'#FCEBEB', color:'#A32D2D', border:'none', borderRadius:'99px', padding:'0.85rem 2rem', fontSize:'1rem', cursor:'pointer', width:'100%', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}><LogOut size={16}/> Cerrar sesión</button>
          </>
        )}
      </div>
    </>
  )
}
