import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signIn, signUp, crearSolicitud } from '../lib/supabase'
import { Eye, EyeOff, Lock, Mail, User, Building2, AlertCircle, CheckCircle, MapPin, Phone, ChevronRight, ArrowLeft } from 'lucide-react'

// ── Shared field styles ────────────────────────────────────────────────────
const ls = { fontSize:'0.8rem', color:'var(--bark-light)', display:'block', marginBottom:'0.4rem', fontWeight:500 }
const is = { width:'100%', padding:'0.75rem 0.75rem 0.75rem 2.5rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'0.9rem', outline:'none', background:'var(--warm-white)', color:'var(--bark)', fontFamily:'var(--font-body)', transition:'border-color 0.2s', boxSizing:'border-box' }
const isPlain = { ...is, paddingLeft:'0.75rem' }

function IconInput({ icon:Icon, type='text', placeholder, value, onChange, required, right, autoComplete }) {
  return (
    <div style={{ position:'relative' }}>
      <Icon size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray)', pointerEvents:'none' }} />
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} autoComplete={autoComplete}
        style={is}
        onFocus={e => e.target.style.borderColor='var(--terracotta)'}
        onBlur={e => e.target.style.borderColor='var(--gray-light)'}
      />
      {right && <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)' }}>{right}</div>}
    </div>
  )
}

// ── PASO 1: Formulario de datos del albergue (modal) ──────────────────────
const STEPS_ALBERGUE = ['Datos básicos', 'Instalaciones', 'Contacto']

function ModalSolicitudAlbergue({ userId, onSuccess }) {
  const [step, setStep]     = useState(0)
  const [sending, setSending] = useState(false)
  const [err, setErr]       = useState('')
  const [form, setForm]     = useState({
    nombre:'', alcaldia:'', direccion:'', descripcion:'',
    capacidad:'', horario:'', experiencia:'',
    responsable:'', telefono:'', email_contacto:'',
  })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const canNext = {
    0: form.nombre && form.alcaldia && form.direccion && form.descripcion,
    1: form.capacidad && form.horario,
    2: form.responsable && form.telefono && form.email_contacto,
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canNext[2]) { setErr('Completa todos los campos requeridos.'); return }
    setSending(true); setErr('')
    const { error } = await crearSolicitud({
      user_id: userId,
      ...form,
      capacidad: Number(form.capacidad) || 0,
    })
    setSending(false)
    if (error) { setErr('Error al enviar. Intenta de nuevo.'); return }
    onSuccess()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(61,43,31,0.7)', backdropFilter:'blur(6px)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div style={{ background:'var(--warm-white)', borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ padding:'1.75rem 2rem 1.25rem', borderBottom:'1px solid var(--gray-light)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem' }}>
              <Building2 size={20} color="var(--terracotta)" />
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--bark)' }}>Registra tu albergue</h2>
            </div>
            <p style={{ fontSize:'0.82rem', color:'var(--bark-light)', lineHeight:1.5 }}>
              Esta información se enviará al admin para revisión. Te contactaremos para agendar una visita de verificación.
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding:'1rem 2rem 0' }}>
          <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.5rem' }}>
            {STEPS_ALBERGUE.map((s, i) => (
              <div key={i} style={{ flex:1, height:4, borderRadius:'99px', background:i<=step?'var(--terracotta)':'var(--gray-light)', transition:'background 0.3s' }} />
            ))}
          </div>
          <p style={{ fontSize:'0.75rem', color:'var(--bark-light)', textAlign:'right', marginBottom:'1rem' }}>
            Paso {step+1} de {STEPS_ALBERGUE.length}: <strong>{STEPS_ALBERGUE[step]}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding:'0 2rem 1.5rem' }}>

            {/* ── Paso 0: Datos básicos ── */}
            {step === 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                <div>
                  <label style={ls}>Nombre del albergue *</label>
                  <input value={form.nombre} onChange={f('nombre')} placeholder="Nombre oficial" required style={isPlain}
                    onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div>
                    <label style={ls}>Alcaldía / Municipio *</label>
                    <input value={form.alcaldia} onChange={f('alcaldia')} placeholder="Ej: Coyoacán" required style={isPlain}
                      onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                  </div>
                  <div>
                    <label style={ls}>Dirección *</label>
                    <input value={form.direccion} onChange={f('direccion')} placeholder="Calle, número, colonia" required style={isPlain}
                      onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                  </div>
                </div>
                <div>
                  <label style={ls}>Descripción del albergue *</label>
                  <textarea value={form.descripcion} onChange={f('descripcion')} placeholder="Describe tu albergue: enfoque, tipo de animales, historia, instalaciones…" required rows={4}
                    style={{ ...isPlain, resize:'vertical', lineHeight:1.55 }}
                    onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                </div>
              </div>
            )}

            {/* ── Paso 1: Instalaciones ── */}
            {step === 1 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div>
                    <label style={ls}>Capacidad máxima (perros) *</label>
                    <input type="number" min="1" value={form.capacidad} onChange={f('capacidad')} placeholder="Ej: 50" required style={isPlain}
                      onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                  </div>
                  <div>
                    <label style={ls}>Años de experiencia</label>
                    <input value={form.experiencia} onChange={f('experiencia')} placeholder="Ej: 3 años" style={isPlain}
                      onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                  </div>
                </div>
                <div>
                  <label style={ls}>Horario de atención *</label>
                  <input value={form.horario} onChange={f('horario')} placeholder="Ej: Lun–Vie 9am–5pm, Sáb 10am–2pm" required style={isPlain}
                    onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                </div>

                {/* Info box */}
                <div style={{ background:'var(--sage-pale)', borderRadius:10, padding:'0.85rem 1rem', fontSize:'0.8rem', color:'var(--sage)', lineHeight:1.55, display:'flex', gap:'0.5rem' }}>
                  <MapPin size={15} style={{ flexShrink:0, marginTop:2 }} />
                  <span>Las coordenadas exactas de tu albergue se podrán agregar después desde tu panel, para aparecer en el mapa.</span>
                </div>
              </div>
            )}

            {/* ── Paso 2: Contacto ── */}
            {step === 2 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                <div>
                  <label style={ls}>Nombre del responsable *</label>
                  <input value={form.responsable} onChange={f('responsable')} placeholder="Nombre completo" required style={isPlain}
                    onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  <div>
                    <label style={ls}>Teléfono de contacto *</label>
                    <div style={{ position:'relative' }}>
                      <Phone size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--gray)' }}/>
                      <input value={form.telefono} onChange={f('telefono')} placeholder="55 XXXX XXXX" required
                        style={{ ...is, paddingLeft:'2.2rem' }}
                        onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                    </div>
                  </div>
                  <div>
                    <label style={ls}>Email del albergue *</label>
                    <div style={{ position:'relative' }}>
                      <Mail size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--gray)' }}/>
                      <input type="email" value={form.email_contacto} onChange={f('email_contacto')} placeholder="albergue@correo.mx" required
                        style={{ ...is, paddingLeft:'2.2rem' }}
                        onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
                    </div>
                  </div>
                </div>

                <div style={{ background:'var(--gold-pale)', borderRadius:10, padding:'0.85rem 1rem', fontSize:'0.8rem', color:'var(--bark-light)', lineHeight:1.6 }}>
                  <strong style={{ color:'var(--bark)' }}>¿Qué pasa después?</strong><br/>
                  Al enviar esta solicitud, el equipo de Patitas Unidas la revisará y te contactará al teléfono o email proporcionado para agendar una visita de verificación al albergue. Este proceso toma entre 5 y 15 días hábiles.
                </div>
              </div>
            )}

            {err && (
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', background:'#FCEBEB', color:'#A32D2D', borderRadius:8, padding:'0.7rem 0.9rem', marginTop:'1rem', fontSize:'0.83rem' }}>
                <AlertCircle size={15} style={{ flexShrink:0 }}/> {err}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div style={{ padding:'1.25rem 2rem', borderTop:'1px solid var(--gray-light)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button type="button" onClick={() => setStep(s => s-1)} disabled={step===0}
              style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'none', border:'1px solid var(--gray-light)', borderRadius:'99px', padding:'0.55rem 1.1rem', fontSize:'0.85rem', color:'var(--bark-light)', cursor:step===0?'not-allowed':'pointer', opacity:step===0?0.4:1, fontFamily:'var(--font-body)' }}>
              <ArrowLeft size={14}/> Anterior
            </button>

            {step < STEPS_ALBERGUE.length-1 ? (
              <button type="button" onClick={() => { if(canNext[step]) setStep(s=>s+1); else setErr('Completa los campos requeridos.') }}
                style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'var(--terracotta)', border:'none', borderRadius:'99px', padding:'0.6rem 1.4rem', fontSize:'0.88rem', fontWeight:500, color:'white', cursor:'pointer', fontFamily:'var(--font-body)' }}>
                Siguiente <ChevronRight size={15}/>
              </button>
            ) : (
              <button type="submit" disabled={sending}
                style={{ display:'flex', alignItems:'center', gap:'0.4rem', background: sending?'var(--bark-light)':'var(--terracotta)', border:'none', borderRadius:'99px', padding:'0.6rem 1.4rem', fontSize:'0.88rem', fontWeight:500, color:'white', cursor:sending?'not-allowed':'pointer', fontFamily:'var(--font-body)' }}>
                {sending ? 'Enviando…' : <><CheckCircle size={15}/> Enviar solicitud</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Pantalla de éxito ─────────────────────────────────────────────────────
function SuccessScreen({ tipo }) {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign:'center', padding:'1rem 0' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🐾</div>
      <CheckCircle size={44} color="var(--sage)" style={{ margin:'0 auto 1rem' }}/>
      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--bark)', marginBottom:'0.75rem' }}>
        {tipo === 'albergue' ? '¡Solicitud enviada!' : '¡Cuenta creada!'}
      </h3>
      <p style={{ fontSize:'0.88rem', color:'var(--bark-light)', lineHeight:1.65, marginBottom:'1.5rem' }}>
        {tipo === 'albergue'
          ? 'Tu solicitud fue enviada al equipo de Patitas Unidas. Te contactaremos para agendar la visita de verificación. Revisa tu correo.'
          : 'Tu cuenta ha sido creada. Ya puedes hacer donaciones, seguir albergues y más.'}
      </p>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ width:'100%', justifyContent:'center', borderRadius:10 }}>
        Ir al inicio
      </button>
    </div>
  )
}

// ── Página principal Auth ─────────────────────────────────────────────────
export default function Auth() {
  const navigate = useNavigate()
  const [tab, setTab]             = useState('login')
  const [rol, setRol]             = useState('usuario')
  const [showPw, setShowPw]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [status, setStatus]       = useState(null)   // {type, msg}
  const [newUserId, setNewUserId] = useState(null)   // userId after signup
  const [showModal, setShowModal] = useState(false)  // modal solicitud albergue
  const [done, setDone]           = useState(false)  // éxito final

  const [form, setForm] = useState({ nombre:'', email:'', password:'', confirmar:'' })
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleLogin(e) {
    e.preventDefault(); setStatus(null); setLoading(true)
    const { error } = await signIn(form.email, form.password)
    setLoading(false)
    if (error) { setStatus({ type:'error', msg:'Correo o contraseña incorrectos.' }); return }
    navigate('/')
  }

  async function handleRegister(e) {
    e.preventDefault(); setStatus(null)
    if (form.password !== form.confirmar) { setStatus({ type:'error', msg:'Las contraseñas no coinciden.' }); return }
    if (form.password.length < 6) { setStatus({ type:'error', msg:'La contraseña debe tener al menos 6 caracteres.' }); return }
    setLoading(true)
    const { data, error } = await signUp({ email:form.email, password:form.password, nombre:form.nombre, rol })
    setLoading(false)
    if (error) { setStatus({ type:'error', msg:error.message }); return }

    if (rol === 'albergue') {
      // Open the albergue registration modal immediately
      setNewUserId(data?.user?.id)
      setShowModal(true)
    } else {
      setDone(true)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--bark)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', paddingTop:'calc(var(--nav-height) + 1rem)' }}>

      {/* Modal solicitud albergue */}
      {showModal && newUserId && (
        <ModalSolicitudAlbergue
          userId={newUserId}
          onSuccess={() => { setShowModal(false); setDone(true) }}
        />
      )}

      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>🐾</div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:'var(--cream)', marginBottom:'0.2rem' }}>Patitas Unidas</h1>
          <p style={{ fontSize:'0.8rem', color:'rgba(245,240,232,0.5)' }}>Tu comunidad de ayuda animal</p>
        </div>

        <div style={{ background:'var(--cream)', borderRadius:20, padding:'2rem', boxShadow:'0 24px 64px rgba(0,0,0,0.25)' }}>

          {done ? <SuccessScreen tipo={rol} /> : (
            <>
              {/* Tabs login / register */}
              <div style={{ display:'flex', borderRadius:10, overflow:'hidden', border:'1.5px solid var(--gray-light)', marginBottom:'1.75rem' }}>
                {[['login','Iniciar sesión'],['register','Crear cuenta']].map(([t,label]) => (
                  <button key={t} onClick={() => { setTab(t); setStatus(null) }} style={{ flex:1, padding:'0.65rem', border:'none', cursor:'pointer', fontSize:'0.875rem', fontWeight:500, fontFamily:'var(--font-body)', background:tab===t?'var(--terracotta)':'transparent', color:tab===t?'var(--warm-white)':'var(--bark-light)', transition:'all 0.2s' }}>{label}</button>
                ))}
              </div>

              {/* Status */}
              {status && (
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start', padding:'0.75rem 1rem', borderRadius:10, marginBottom:'1.25rem', fontSize:'0.85rem', background:status.type==='error'?'#FCEBEB':'var(--sage-pale)', color:status.type==='error'?'#A32D2D':'var(--sage)' }}>
                  {status.type==='error' ? <AlertCircle size={16} style={{ flexShrink:0, marginTop:1 }}/> : <CheckCircle size={16} style={{ flexShrink:0, marginTop:1 }}/>}
                  {status.msg}
                </div>
              )}

              {/* ── LOGIN ── */}
              {tab === 'login' && (
                <form onSubmit={handleLogin}>
                  <div style={{ marginBottom:'1rem' }}>
                    <label style={ls}>Correo electrónico</label>
                    <IconInput icon={Mail} type="email" placeholder="tu@correo.mx" value={form.email} onChange={f('email')} required autoComplete="email"/>
                  </div>
                  <div style={{ marginBottom:'1.5rem' }}>
                    <label style={ls}>Contraseña</label>
                    <IconInput icon={Lock} type={showPw?'text':'password'} placeholder="••••••••" value={form.password} onChange={f('password')} required autoComplete="current-password"
                      right={<button type="button" onClick={() => setShowPw(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray)', display:'flex' }}>
                        {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>}
                    />
                  </div>
                  <button type="submit" disabled={loading} style={{ width:'100%', padding:'0.9rem', border:'none', borderRadius:10, background:loading?'var(--bark-light)':'var(--terracotta)', color:'var(--warm-white)', fontSize:'1rem', fontWeight:500, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                    {loading ? 'Entrando…' : 'Iniciar sesión'}
                  </button>
                  <p style={{ textAlign:'center', marginTop:'1rem', fontSize:'0.8rem', color:'var(--bark-light)' }}>
                    ¿Administrador? <Link to="/admin/login" style={{ color:'var(--terracotta)' }}>Panel admin →</Link>
                  </p>
                </form>
              )}

              {/* ── REGISTER ── */}
              {tab === 'register' && (
                <form onSubmit={handleRegister}>
                  {/* Tipo de cuenta */}
                  <div style={{ marginBottom:'1.25rem' }}>
                    <label style={ls}>Tipo de cuenta</label>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem' }}>
                      {[['usuario', User, 'Soy donador', 'Donaciones, perfil y más'],
                        ['albergue', Building2, 'Soy albergue', 'Registrar mi refugio']].map(([r,Icon,title,sub]) => (
                        <button key={r} type="button" onClick={() => setRol(r)} style={{ padding:'0.85rem', border:`2px solid ${rol===r?'var(--terracotta)':'var(--gray-light)'}`, borderRadius:12, background:rol===r?'var(--terra-pale)':'transparent', cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}>
                          <Icon size={18} color={rol===r?'var(--terracotta)':'var(--gray)'} style={{ marginBottom:'0.3rem' }}/>
                          <div style={{ fontSize:'0.83rem', fontWeight:600, color:rol===r?'var(--terracotta)':'var(--bark)' }}>{title}</div>
                          <div style={{ fontSize:'0.7rem', color:'var(--bark-light)', marginTop:'0.1rem', lineHeight:1.4 }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom:'0.8rem' }}>
                    <label style={ls}>{rol==='albergue'?'Nombre del responsable':'Tu nombre'}</label>
                    <IconInput icon={User} placeholder="Nombre completo" value={form.nombre} onChange={f('nombre')} required />
                  </div>
                  <div style={{ marginBottom:'0.8rem' }}>
                    <label style={ls}>Correo electrónico</label>
                    <IconInput icon={Mail} type="email" placeholder="tu@correo.mx" value={form.email} onChange={f('email')} required autoComplete="email"/>
                  </div>
                  <div style={{ marginBottom:'0.8rem' }}>
                    <label style={ls}>Contraseña</label>
                    <IconInput icon={Lock} type={showPw?'text':'password'} placeholder="Mínimo 6 caracteres" value={form.password} onChange={f('password')} required autoComplete="new-password"
                      right={<button type="button" onClick={() => setShowPw(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray)', display:'flex' }}>
                        {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>}
                    />
                  </div>
                  <div style={{ marginBottom: rol==='albergue' ? '0.8rem' : '1.5rem' }}>
                    <label style={ls}>Confirmar contraseña</label>
                    <IconInput icon={Lock} type="password" placeholder="Repite tu contraseña" value={form.confirmar} onChange={f('confirmar')} required autoComplete="new-password"/>
                  </div>

                  {rol === 'albergue' && (
                    <div style={{ background:'var(--gold-pale)', borderRadius:10, padding:'0.75rem 0.9rem', marginBottom:'1.25rem', fontSize:'0.78rem', color:'var(--bark-light)', lineHeight:1.55, display:'flex', gap:'0.5rem' }}>
                      <Building2 size={15} color="var(--gold)" style={{ flexShrink:0, marginTop:2 }}/>
                      <span>Al crear tu cuenta, se abrirá un formulario para registrar los datos de tu albergue y enviar la solicitud de aprobación.</span>
                    </div>
                  )}

                  <button type="submit" disabled={loading} style={{ width:'100%', padding:'0.9rem', border:'none', borderRadius:10, background:loading?'var(--bark-light)':'var(--terracotta)', color:'var(--warm-white)', fontSize:'1rem', fontWeight:500, cursor:'pointer', fontFamily:'var(--font-body)' }}>
                    {loading ? 'Creando cuenta…' : rol==='albergue' ? 'Crear cuenta y registrar albergue →' : 'Crear cuenta'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
