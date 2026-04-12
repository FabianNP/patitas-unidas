import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { crearSolicitud, getMiSolicitud } from '../../lib/supabase'
import { Building2, CheckCircle, Clock, XCircle, Send } from 'lucide-react'

const STEPS = ['Datos básicos','Instalaciones','Contacto']

export default function SolicitudAlbergue() {
  const { user, perfil } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]       = useState(0)
  const [solicitud, setSolicitud] = useState(null)  // solicitud existente
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [form, setForm]       = useState({
    nombre:'', alcaldia:'', direccion:'', descripcion:'',
    capacidad:'', responsable:'', telefono:'', email_contacto:'',
    horario:'', experiencia:'',
  })
  const f = k => e => setForm(p => ({...p,[k]:e.target.value}))

  useEffect(() => {
    if (!user) return
    getMiSolicitud(user.id).then(({ data }) => {
      setSolicitud(data); setLoading(false)
    })
  }, [user])

  async function handleSubmit(e) {
    e.preventDefault(); setSending(true)
    const { data, error } = await crearSolicitud({
      user_id: user.id,
      ...form,
      capacidad: Number(form.capacidad),
    })
    setSending(false)
    if (!error) setSolicitud(data)
  }

  if (loading) return <div style={centeredStyle}><div style={{ fontSize:'2.5rem' }}>🐾</div><p style={{ color:'var(--bark-light)' }}>Cargando…</p></div>

  // ── Estado de solicitud existente ─────────────────────────────
  if (solicitud) {
    const STATUS = {
      pendiente: { icon: <Clock size={36} color="var(--gold)"/>, color:'var(--gold)', bg:'var(--gold-pale)', title:'Solicitud en revisión', desc:'Hemos recibido tu solicitud. Un administrador la revisará en persona y te contactará por correo para coordinar la visita. Este proceso puede tomar de 5 a 15 días hábiles.' },
      aprobado:  { icon: <CheckCircle size={36} color="var(--sage)"/>, color:'var(--sage)', bg:'var(--sage-pale)', title:'¡Solicitud aprobada!', desc:'Tu albergue ha sido verificado y aprobado. Ya puedes gestionar tu información desde el panel de albergue.' },
      rechazado: { icon: <XCircle size={36} color="#A32D2D"/>, color:'#A32D2D', bg:'#FCEBEB', title:'Solicitud no aprobada', desc:'Lamentablemente tu solicitud no fue aprobada en esta ocasión.' },
    }
    const s = STATUS[solicitud.status] || STATUS.pendiente

    return (
      <div style={{ paddingTop:'var(--nav-height)', minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'4rem 1.5rem' }}>
        <div style={{ maxWidth:520, width:'100%', textAlign:'center' }}>
          <div style={{ background:s.bg, borderRadius:'var(--radius-xl)', padding:'3rem 2rem', marginBottom:'1.5rem' }}>
            <div style={{ marginBottom:'1rem' }}>{s.icon}</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:s.color, marginBottom:'0.75rem' }}>{s.title}</h2>
            <p style={{ fontSize:'0.9rem', color:'var(--bark-light)', lineHeight:1.65 }}>{s.desc}</p>
            {solicitud.nota_admin && (
              <div style={{ background:'rgba(255,255,255,0.6)', borderRadius:'var(--radius-md)', padding:'0.85rem 1rem', marginTop:'1rem', fontSize:'0.85rem', color:'var(--bark-light)', textAlign:'left' }}>
                <strong style={{ color:'var(--bark)' }}>Nota del administrador:</strong><br/>{solicitud.nota_admin}
              </div>
            )}
          </div>
          <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.25rem', textAlign:'left', fontSize:'0.83rem', color:'var(--bark-light)' }}>
            <strong style={{ color:'var(--bark)' }}>Datos enviados:</strong>
            <div style={{ marginTop:'0.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.3rem' }}>
              {[['Nombre',solicitud.nombre],['Alcaldía',solicitud.alcaldia],['Responsable',solicitud.responsable],['Enviado',new Date(solicitud.created_at).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})]].map(([l,v]) => (
                <div key={l}><span style={{ color:'var(--gray)' }}>{l}: </span>{v}</div>
              ))}
            </div>
          </div>
          {solicitud.status === 'aprobado' && (
            <button onClick={() => navigate('/albergue/panel')} className="btn-primary" style={{ marginTop:'1.5rem', width:'100%', justifyContent:'center', borderRadius:12 }}>
              Ir al panel de mi albergue →
            </button>
          )}
          {solicitud.status === 'rechazado' && (
            <button onClick={() => setSolicitud(null)} className="btn-outline" style={{ marginTop:'1.5rem', width:'100%', justifyContent:'center', borderRadius:12 }}>
              Enviar nueva solicitud
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Formulario multi-paso ─────────────────────────────────────
  return (
    <div style={{ paddingTop:'var(--nav-height)', minHeight:'100vh', background:'var(--cream)', padding:'4rem 1.5rem' }}>
      <div style={{ maxWidth:600, margin:'0 auto' }}>

        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <Building2 size={40} color="var(--terracotta)" style={{ margin:'0 auto 0.75rem' }}/>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--bark)', marginBottom:'0.5rem' }}>Registra tu albergue</h1>
          <p style={{ fontSize:'0.9rem', color:'var(--bark-light)', lineHeight:1.6 }}>
            Completa la información de tu albergue. Un administrador la revisará y te contactará para agendar una visita de verificación.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:'0.5rem', marginBottom:'2rem' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex:1, height:4, borderRadius:'99px', background: i<=step?'var(--terracotta)':'var(--gray-light)', transition:'background 0.3s' }} />
          ))}
        </div>
        <p style={{ fontSize:'0.8rem', color:'var(--bark-light)', marginBottom:'1.5rem', textAlign:'right' }}>Paso {step+1} de {STEPS.length}: <strong>{STEPS[step]}</strong></p>

        <form onSubmit={handleSubmit}>
          <div style={{ background:'var(--warm-white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-light)', padding:'2rem' }}>

            {/* Paso 0: Datos básicos */}
            {step === 0 && <>
              <Field label="Nombre del albergue *"><Input value={form.nombre} onChange={f('nombre')} placeholder="Nombre oficial del albergue" required /></Field>
              <Field label="Alcaldía / Municipio *"><Input value={form.alcaldia} onChange={f('alcaldia')} placeholder="Ej: Coyoacán" required /></Field>
              <Field label="Dirección completa *"><Input value={form.direccion} onChange={f('direccion')} placeholder="Calle, número, colonia" required /></Field>
              <Field label="Descripción del albergue *">
                <textarea value={form.descripcion} onChange={f('descripcion')} placeholder="Describe tu albergue: tipo de animales, enfoque, historia…" required rows={4} style={{ width:'100%', padding:'0.75rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'0.9rem', outline:'none', resize:'vertical', fontFamily:'var(--font-body)', color:'var(--bark)' }} />
              </Field>
            </>}

            {/* Paso 1: Instalaciones */}
            {step === 1 && <>
              <Field label="Capacidad aproximada (número de perros) *">
                <Input type="number" value={form.capacidad} onChange={f('capacidad')} placeholder="Ej: 50" required />
              </Field>
              <Field label="Horario de atención *">
                <Input value={form.horario} onChange={f('horario')} placeholder="Ej: Lun–Vie 9am–5pm" required />
              </Field>
              <Field label="Años de experiencia en rescate animal *">
                <Input value={form.experiencia} onChange={f('experiencia')} placeholder="Ej: 3 años" required />
              </Field>
            </>}

            {/* Paso 2: Contacto */}
            {step === 2 && <>
              <Field label="Nombre del responsable *"><Input value={form.responsable} onChange={f('responsable')} placeholder="Nombre completo" required /></Field>
              <Field label="Teléfono de contacto *"><Input value={form.telefono} onChange={f('telefono')} placeholder="55 XXXX XXXX" required /></Field>
              <Field label="Correo de contacto del albergue *"><Input type="email" value={form.email_contacto} onChange={f('email_contacto')} placeholder="albergue@correo.mx" required /></Field>
              <div style={{ background:'var(--gold-pale)', borderRadius:'var(--radius-md)', padding:'0.85rem 1rem', fontSize:'0.82rem', color:'var(--bark-light)', lineHeight:1.55, marginTop:'0.5rem' }}>
                ⚠️ Al enviar esta solicitud aceptas que un administrador de Patitas Unidas visite tu albergue para verificar las instalaciones antes de aprobar el registro.
              </div>
            </>}

          </div>

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1.5rem' }}>
            <button type="button" onClick={() => setStep(s=>s-1)} disabled={step===0} className="btn-ghost">← Anterior</button>
            {step < STEPS.length-1
              ? <button type="button" onClick={() => setStep(s=>s+1)} className="btn-primary" style={{ borderRadius:10 }}>Siguiente →</button>
              : <button type="submit" disabled={sending} className="btn-primary" style={{ borderRadius:10 }}>
                  <Send size={15}/> {sending?'Enviando…':'Enviar solicitud'}
                </button>
            }
          </div>
        </form>
      </div>
    </div>
  )
}

const centeredStyle = { minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1rem', paddingTop:'var(--nav-height)' }
const Field = ({label,children}) => <div style={{ marginBottom:'1rem' }}><label style={{ fontSize:'0.8rem', color:'var(--bark-light)', display:'block', marginBottom:'0.35rem', fontWeight:500 }}>{label}</label>{children}</div>
const Input = (props) => <input {...props} style={{ width:'100%', padding:'0.75rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'0.9rem', outline:'none', background:'var(--warm-white)', color:'var(--bark)', fontFamily:'var(--font-body)', ...props.style }} onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
