import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updatePerfil, uploadAvatar, getMisDonaciones, getMisSuscripciones, getMetodosPago, addMetodoPago, deleteMetodoPago, cancelarSuscripcion } from '../../lib/supabase'
import { User, CreditCard, Heart, Bell, Camera, Trash2, Check, CheckCircle, AlertCircle, ChevronRight, Plus } from 'lucide-react'

const TABS = [['perfil','Perfil',User],['donaciones','Donaciones',Heart],['suscripciones','Suscripciones',Bell],['pagos','Métodos de pago',CreditCard]]

const CARD_BRAND_ICON = { visa:'💳', mastercard:'💳', amex:'💳' }

function SidebarTab({ id, label, Icon, active, onClick, badge }) {
  return (
    <button onClick={() => onClick(id)} style={{
      width:'100%', display:'flex', alignItems:'center', gap:'0.75rem',
      padding:'0.7rem 1rem', borderRadius:'var(--radius-sm)', border:'none',
      background: active ? 'var(--terra-pale)' : 'transparent',
      color: active ? 'var(--terracotta)' : 'var(--bark-light)',
      fontSize:'0.875rem', cursor:'pointer', textAlign:'left', transition:'all 0.2s',
      position:'relative',
    }}>
      <Icon size={17} /> {label}
      {badge > 0 && <span style={{ marginLeft:'auto', background:'var(--terracotta)', color:'white', borderRadius:'99px', fontSize:'0.68rem', padding:'0.1rem 0.45rem', fontWeight:600 }}>{badge}</span>}
    </button>
  )
}

// ── Pestaña Perfil ────────────────────────────────────────────────────────
function TabPerfil({ user, perfil, refreshPerfil }) {
  const [form, setForm]   = useState({ nombre: perfil?.nombre||'', apellido: perfil?.apellido||'' })
  const [saving, setSaving] = useState(false)
  const [ok, setOk]       = useState(false)
  const fileRef           = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(perfil?.avatar_url||null)
  const [avatarFile, setAvatarFile]       = useState(null)

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setOk(false)
    let avatar_url = perfil?.avatar_url
    if (avatarFile) {
      const { url } = await uploadAvatar(user.id, avatarFile)
      if (url) avatar_url = url
    }
    await updatePerfil(user.id, { ...form, avatar_url })
    await refreshPerfil()
    setSaving(false); setOk(true)
    setTimeout(() => setOk(false), 2500)
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const initials = ((form.nombre[0]||'') + (form.apellido[0]||'')).toUpperCase() || (user?.email[0]||'U').toUpperCase()

  return (
    <form onSubmit={handleSave}>
      <h2 style={h2s}>Mi perfil</h2>

      {/* Avatar */}
      <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', marginBottom:'2rem' }}>
        <div style={{ position:'relative' }}>
          <div style={{ width:80, height:80, borderRadius:'50%', overflow:'hidden', background:'var(--terra-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontFamily:'var(--font-display)', color:'var(--terracotta)', border:'3px solid var(--warm-white)', boxShadow:'var(--shadow-sm)' }}>
            {avatarPreview ? <img src={avatarPreview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'var(--terracotta)', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Camera size={13} color="white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFileChange} />
        </div>
        <div>
          <p style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--bark)' }}>{form.nombre || user?.email}</p>
          <p style={{ fontSize:'0.83rem', color:'var(--bark-light)' }}>{user?.email}</p>
          {avatarFile && <p style={{ fontSize:'0.75rem', color:'var(--sage)', marginTop:'0.25rem' }}>✓ Nueva foto lista para guardar</p>}
        </div>
      </div>

      {/* Campos */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        {[['nombre','Nombre','Tu nombre'],['apellido','Apellido','Tu apellido']].map(([k,label,ph]) => (
          <div key={k}>
            <label style={ls}>{label}</label>
            <input value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph}
              style={{ ...is }}
              onFocus={e => e.target.style.borderColor='var(--terracotta)'}
              onBlur={e => e.target.style.borderColor='var(--gray-light)'}
            />
          </div>
        ))}
      </div>
      <div style={{ marginBottom:'1.5rem' }}>
        <label style={ls}>Correo electrónico</label>
        <input value={user?.email} disabled style={{ ...is, background:'var(--cream)', color:'var(--gray)' }} />
        <p style={{ fontSize:'0.72rem', color:'var(--gray)', marginTop:'0.3rem' }}>El correo no se puede cambiar desde aquí.</p>
      </div>

      <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
        <button type="submit" disabled={saving} className="btn-primary" style={{ borderRadius:10 }}>
          <Check size={16} /> {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
        {ok && <span style={{ fontSize:'0.85rem', color:'var(--sage)', display:'flex', gap:'0.3rem', alignItems:'center' }}><CheckCircle size={15}/>Guardado</span>}
      </div>
    </form>
  )
}

// ── Pestaña Donaciones ───────────────────────────────────────────────────
function TabDonaciones({ userId }) {
  const [items, setItems] = useState([])
  useEffect(() => { getMisDonaciones(userId).then(({ data }) => setItems(data||[])) }, [userId])

  const total = items.filter(d=>d.status==='paid').reduce((s,d)=>s+Number(d.monto),0)

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={h2s}>Mis donaciones</h2>
        <div style={{ background:'var(--terra-pale)', borderRadius:'var(--radius-md)', padding:'0.5rem 1rem', textAlign:'center' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--terracotta)' }}>${total.toLocaleString('es-MX')}</div>
          <div style={{ fontSize:'0.68rem', color:'var(--bark-light)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Total donado</div>
        </div>
      </div>
      {items.length === 0 && <p style={{ color:'var(--gray)', fontStyle:'italic', fontSize:'0.9rem' }}>Aún no tienes donaciones registradas. ¡Cada peso cuenta! 🐾</p>}
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {items.map(d => (
          <div key={d.id} style={{ background:'var(--cream)', borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
            <div>
              <div style={{ fontSize:'0.88rem', color:'var(--bark)', fontWeight:500 }}>
                {d.albergues?.nombre || 'Patitas Unidas (general)'}
              </div>
              <div style={{ fontSize:'0.75rem', color:'var(--bark-light)', marginTop:'0.2rem' }}>
                {d.metodo==='card'?'💳 Tarjeta':'🏪 OXXO'} · {d.frecuencia==='once'?'Una vez':d.frecuencia==='monthly'?'Mensual':'Anual'} · {d.created_at?new Date(d.created_at).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'}):'—'}
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--terracotta)' }}>${Number(d.monto).toLocaleString('es-MX')}</span>
              <span style={{ fontSize:'0.7rem', padding:'0.2rem 0.6rem', borderRadius:'99px', background:d.status==='paid'?'var(--sage-pale)':'var(--gold-pale)', color:d.status==='paid'?'var(--sage)':'var(--gold)', fontWeight:600 }}>
                {d.status==='paid'?'✓ Pagado':'⏳ Pendiente'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pestaña Suscripciones ─────────────────────────────────────────────────
function TabSuscripciones({ userId }) {
  const [items, setItems] = useState([])
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => { getMisSuscripciones(userId).then(({ data }) => setItems(data||[])) }, [userId])

  async function cancelar(id) {
    if (!confirm('¿Seguro que deseas cancelar esta suscripción?')) return
    setCancelling(id)
    const { data } = await cancelarSuscripcion(id)
    setItems(items => items.map(i => i.id===id ? { ...i, status:'cancelled' } : i))
    setCancelling(null)
  }

  const activas = items.filter(i => i.status==='active')

  return (
    <div>
      <h2 style={h2s}>Mis suscripciones</h2>
      {activas.length === 0 && <p style={{ color:'var(--gray)', fontStyle:'italic', fontSize:'0.9rem', marginBottom:'1rem' }}>No tienes suscripciones activas. ¡Una donación mensual hace la diferencia! 🐾</p>}
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {items.map(s => (
          <div key={s.id} style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.25rem 1.5rem', border:`1.5px solid ${s.status==='active'?'var(--sage-pale)':'var(--gray-light)'}` }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem' }}>
              <div>
                <div style={{ display:'flex', align:'center', gap:'0.5rem', marginBottom:'0.35rem' }}>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--bark)' }}>{s.albergues?.nombre||'Patitas Unidas'}</span>
                  <span style={{ fontSize:'0.7rem', padding:'0.2rem 0.6rem', borderRadius:'99px', background:s.status==='active'?'var(--sage-pale)':'var(--gray-light)', color:s.status==='active'?'var(--sage)':'var(--gray)', fontWeight:600, marginLeft:'0.4rem' }}>
                    {s.status==='active'?'Activa':s.status==='paused'?'Pausada':'Cancelada'}
                  </span>
                </div>
                <div style={{ fontSize:'0.82rem', color:'var(--bark-light)' }}>
                  ${Number(s.monto).toLocaleString('es-MX')} MXN · {s.frecuencia==='monthly'?'cada mes':'cada año'}
                  {s.proximo_cobro && ` · próximo cobro: ${new Date(s.proximo_cobro).toLocaleDateString('es-MX',{day:'numeric',month:'long'})}`}
                </div>
              </div>
              {s.status === 'active' && (
                <button onClick={() => cancelar(s.id)} disabled={cancelling===s.id} style={{ fontSize:'0.8rem', color:'#A32D2D', background:'none', border:'1px solid #F7C1C1', borderRadius:'99px', padding:'0.35rem 0.85rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.3rem', fontFamily:'var(--font-body)' }}>
                  {cancelling===s.id ? 'Cancelando…' : <><Trash2 size={13}/> Cancelar</>}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pestaña Métodos de Pago ───────────────────────────────────────────────
function TabPagos({ userId }) {
  const [metodos, setMetodos] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ numero:'', nombre:'', mes:'', anio:'', cvc:'' })
  const [saving, setSaving]   = useState(false)
  const [err, setErr]         = useState('')

  useEffect(() => { getMetodosPago(userId).then(({ data }) => setMetodos(data||[])) }, [userId])

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true); setErr('')
    // En producción aquí tokenizarías con Conekta antes de guardar
    const { error } = await addMetodoPago({
      user_id: userId,
      tipo: 'card',
      ultimos4: form.numero.slice(-4),
      marca: form.numero.startsWith('4') ? 'visa' : 'mastercard',
      conekta_source_id: 'src_mock_' + Date.now(),
      es_principal: metodos.length === 0,
    })
    setSaving(false)
    if (error) { setErr('Error al guardar la tarjeta. Intenta de nuevo.'); return }
    getMetodosPago(userId).then(({ data }) => setMetodos(data||[]))
    setShowAdd(false); setForm({ numero:'', nombre:'', mes:'', anio:'', cvc:'' })
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este método de pago?')) return
    await deleteMetodoPago(id)
    setMetodos(m => m.filter(x => x.id !== id))
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <h2 style={h2s}>Métodos de pago</h2>
        <button onClick={() => setShowAdd(s=>!s)} className="btn-primary" style={{ borderRadius:10, fontSize:'0.85rem', padding:'0.55rem 1.1rem' }}>
          <Plus size={15} /> Agregar tarjeta
        </button>
      </div>

      {metodos.length === 0 && !showAdd && (
        <p style={{ color:'var(--gray)', fontStyle:'italic', fontSize:'0.9rem' }}>No tienes métodos de pago guardados.</p>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1rem' }}>
        {metodos.map(m => (
          <div key={m.id} style={{ background:'var(--cream)', borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', border:`1.5px solid ${m.es_principal?'var(--terracotta)':'var(--gray-light)'}` }}>
            <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
              <span style={{ fontSize:'1.8rem' }}>💳</span>
              <div>
                <div style={{ fontSize:'0.88rem', color:'var(--bark)', fontWeight:500 }}>
                  {m.marca?.charAt(0).toUpperCase()+m.marca?.slice(1)||'Tarjeta'} •••• {m.ultimos4}
                  {m.es_principal && <span style={{ marginLeft:'0.5rem', fontSize:'0.7rem', background:'var(--terra-pale)', color:'var(--terracotta)', padding:'0.15rem 0.5rem', borderRadius:'99px', fontWeight:600 }}>Principal</span>}
                </div>
                <div style={{ fontSize:'0.75rem', color:'var(--bark-light)' }}>Guardada el {new Date(m.created_at).toLocaleDateString('es-MX',{month:'short',year:'numeric'})}</div>
              </div>
            </div>
            <button onClick={() => handleDelete(m.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray)', display:'flex' }}><Trash2 size={16}/></button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.5rem', border:'1.5px solid var(--gray-light)' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--bark)', marginBottom:'1.25rem' }}>Nueva tarjeta</h3>
          {err && <div style={{ color:'#A32D2D', background:'#FCEBEB', borderRadius:8, padding:'0.65rem 0.9rem', fontSize:'0.83rem', marginBottom:'1rem', display:'flex', gap:'0.4rem', alignItems:'center' }}><AlertCircle size={15}/>{err}</div>}
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom:'0.85rem' }}>
              <label style={ls}>Número de tarjeta</label>
              <input placeholder="1234 5678 9012 3456" value={form.numero} onChange={e=>setForm(f=>({...f,numero:e.target.value.replace(/\D/g,'').slice(0,16)}))} required style={is} onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
            </div>
            <div style={{ marginBottom:'0.85rem' }}>
              <label style={ls}>Nombre en la tarjeta</label>
              <input placeholder="Como aparece en la tarjeta" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} required style={is} onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem', marginBottom:'1.25rem' }}>
              {[['mes','MM','2'],['anio','AAAA','4'],['cvc','CVC','3']].map(([k,ph,max]) => (
                <div key={k}>
                  <label style={ls}>{ph}</label>
                  <input placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value.replace(/\D/g,'').slice(0,Number(max))}))} required style={is} onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                </div>
              ))}
            </div>
            <p style={{ fontSize:'0.72rem', color:'var(--gray)', marginBottom:'1rem' }}>🔒 Tu tarjeta se tokeniza de forma segura vía Conekta. Nunca almacenamos datos sensibles.</p>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button type="button" onClick={()=>setShowAdd(false)} className="btn-ghost">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary" style={{ borderRadius:10 }}>{saving?'Guardando…':'Guardar tarjeta'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ── Página principal Perfil ───────────────────────────────────────────────
export default function PerfilUsuario() {
  const { user, perfil, refreshPerfil } = useAuth()
  const [tab, setTab] = useState('perfil')

  if (!user) return null

  const initials = ((perfil?.nombre?.[0]||'') + (perfil?.apellido?.[0]||'')).toUpperCase() || user.email[0].toUpperCase()

  return (
    <div style={{ paddingTop:'var(--nav-height)', minHeight:'100vh', background:'var(--cream)' }}>
      <div style={{ maxWidth:1000, margin:'0 auto', padding:'2.5rem 1.5rem', display:'grid', gridTemplateColumns:'220px 1fr', gap:'2rem', alignItems:'start' }}>

        {/* Sidebar */}
        <aside style={{ background:'var(--warm-white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-light)', padding:'1.5rem', position:'sticky', top:'calc(var(--nav-height) + 1rem)' }}>
          <div style={{ textAlign:'center', marginBottom:'1.5rem', paddingBottom:'1.25rem', borderBottom:'1px solid var(--gray-light)' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--terra-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', fontFamily:'var(--font-display)', color:'var(--terracotta)', margin:'0 auto 0.6rem', overflow:'hidden' }}>
              {perfil?.avatar_url ? <img src={perfil.avatar_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials}
            </div>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'var(--bark)', marginBottom:'0.15rem' }}>{perfil?.nombre||user.email.split('@')[0]}</p>
            <p style={{ fontSize:'0.72rem', color:'var(--bark-light)' }}>{user.email}</p>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem' }}>
            {TABS.map(([id, label, Icon]) => (
              <SidebarTab key={id} id={id} label={label} Icon={Icon} active={tab===id} onClick={setTab} />
            ))}
          </div>
        </aside>

        {/* Content */}
        <div style={{ background:'var(--warm-white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-light)', padding:'2rem' }}>
          {tab==='perfil'        && <TabPerfil user={user} perfil={perfil} refreshPerfil={refreshPerfil}/>}
          {tab==='donaciones'    && <TabDonaciones userId={user.id}/>}
          {tab==='suscripciones' && <TabSuscripciones userId={user.id}/>}
          {tab==='pagos'         && <TabPagos userId={user.id}/>}
        </div>

      </div>
    </div>
  )
}

const h2s = { fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--bark)', marginBottom:'1.5rem' }
const ls  = { fontSize:'0.8rem', color:'var(--bark-light)', display:'block', marginBottom:'0.35rem', fontWeight:500 }
const is  = { width:'100%', padding:'0.7rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'0.9rem', outline:'none', background:'var(--warm-white)', color:'var(--bark)', fontFamily:'var(--font-body)', transition:'border-color 0.2s' }
