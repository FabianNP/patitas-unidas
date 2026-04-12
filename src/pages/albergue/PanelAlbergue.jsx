import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getMiAlbergue, updateMiAlbergue, uploadImage } from '../../lib/supabase'
import { Save, Upload, Users, Heart, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react'

export default function PanelAlbergue() {
  const { user } = useAuth()
  const [albergue, setAlbergue] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [ok,       setOk]       = useState(false)
  const [err,      setErr]      = useState('')
  const [imgFile,  setImgFile]  = useState(null)
  const [activeTab, setActiveTab] = useState('info')

  const [form, setForm] = useState({})
  const f = k => e => setForm(p => ({...p,[k]:e.target.value}))
  const fn = k => e => setForm(p => ({...p,[k]:Number(e.target.value)||0}))

  useEffect(() => {
    if (!user) return
    getMiAlbergue(user.id).then(({ data }) => {
      setAlbergue(data)
      if (data) setForm({
        descripcion: data.descripcion||'',
        perros_actuales: data.perros_actuales||0,
        adoptados_mes: data.adoptados_mes||0,
        rescatados_mes: data.rescatados_mes||0,
        esterilizaciones_mes: data.esterilizaciones_mes||0,
        consultas_mes: data.consultas_mes||0,
        capacidad: data.capacidad||0,
        status: data.status||'open',
        horario: data.horario||'',
        telefono: data.telefono||'',
        email: data.email||'',
        director: data.director||'',
        direccion: data.direccion||'',
        necesidades: (data.necesidades||[]).join('\n'),
        imagen: data.imagen||'',
      })
      setLoading(false)
    })
  }, [user])

  async function handleSave(e) {
    e.preventDefault(); setSaving(true); setOk(false); setErr('')
    let imagen = form.imagen
    if (imgFile) {
      const { url, error: imgErr } = await uploadImage(imgFile)
      if (imgErr) { setErr('Error al subir la imagen.'); setSaving(false); return }
      imagen = url
    }
    const { error } = await updateMiAlbergue(user.id, {
      ...form,
      imagen,
      perros_actuales: Number(form.perros_actuales),
      adoptados_mes:   Number(form.adoptados_mes),
      rescatados_mes:  Number(form.rescatados_mes),
      esterilizaciones_mes: Number(form.esterilizaciones_mes),
      consultas_mes:   Number(form.consultas_mes),
      capacidad:       Number(form.capacidad),
      necesidades: typeof form.necesidades === 'string'
        ? form.necesidades.split('\n').filter(Boolean)
        : form.necesidades||[],
    })
    setSaving(false)
    if (error) { setErr('Error al guardar. Intenta de nuevo.'); return }
    setOk(true); setTimeout(() => setOk(false), 3000)
    getMiAlbergue(user.id).then(({ data }) => setAlbergue(data))
  }

  if (loading) return <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'var(--nav-height)', flexDirection:'column', gap:'1rem' }}><div style={{ fontSize:'2.5rem' }}>🐾</div><p style={{ color:'var(--bark-light)' }}>Cargando tu albergue…</p></div>

  if (!albergue) return (
    <div style={{ minHeight:'80vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:'var(--nav-height)', padding:'4rem 1.5rem', textAlign:'center' }}>
      <div>
        <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🏡</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--bark)', marginBottom:'0.75rem' }}>Tu albergue aún no está vinculado</h2>
        <p style={{ color:'var(--bark-light)', marginBottom:'1.5rem' }}>Si enviaste una solicitud, espera a que un administrador la apruebe.</p>
      </div>
    </div>
  )

  const pct = Math.round((Number(form.perros_actuales)/Number(form.capacidad||1))*100)

  const TABS_P = [['info','Información'],['ocupacion','Ocupación'],['requerimientos','Requerimientos']]

  return (
    <div style={{ paddingTop:'var(--nav-height)', minHeight:'100vh', background:'var(--cream)' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'2.5rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <span style={{ fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--terracotta)', fontWeight:500 }}>Panel de albergue</span>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--bark)' }}>{albergue.nombre}</h1>
            <p style={{ fontSize:'0.85rem', color:'var(--bark-light)' }}>{albergue.alcaldia} · Última actualización: hoy</p>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            {ok  && <span style={{ fontSize:'0.85rem', color:'var(--sage)', display:'flex', gap:'0.3rem', alignItems:'center' }}><CheckCircle size={15}/>Guardado</span>}
            {err && <span style={{ fontSize:'0.85rem', color:'#A32D2D', display:'flex', gap:'0.3rem', alignItems:'center' }}><AlertCircle size={15}/>{err}</span>}
          </div>
        </div>

        {/* Métricas rápidas */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
          {[[Users, form.perros_actuales, 'Perros actuales','var(--terracotta)'],[Heart, form.adoptados_mes, 'Adoptados/mes','var(--sage)'],[Stethoscope, form.consultas_mes, 'Consultas/mes','var(--gold)']].map(([Icon,val,label,color]) => (
            <div key={label} style={{ background:'var(--warm-white)', borderRadius:'var(--radius-lg)', padding:'1.25rem', border:'1px solid var(--gray-light)', textAlign:'center' }}>
              <Icon size={22} color={color} style={{ margin:'0 auto 0.5rem' }}/>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color }}>{val}</div>
              <div style={{ fontSize:'0.68rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--gray)', marginTop:'0.2rem' }}>{label}</div>
            </div>
          ))}
          <div style={{ background:'var(--warm-white)', borderRadius:'var(--radius-lg)', padding:'1.25rem', border:'1px solid var(--gray-light)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'var(--gray)', marginBottom:'0.4rem' }}>
              <span>Ocupación</span><span style={{ fontWeight:500, color:pct>85?'var(--gold)':'var(--bark-light)' }}>{pct}%</span>
            </div>
            <div style={{ background:'var(--gray-light)', borderRadius:'99px', height:8, overflow:'hidden' }}>
              <div style={{ width:`${Math.min(pct,100)}%`, height:'100%', background:pct>85?'var(--gold)':'var(--terracotta)', borderRadius:'99px' }}/>
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--gray)', marginTop:'0.4rem', textAlign:'center' }}>{form.perros_actuales}/{form.capacidad}</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'0.25rem', background:'var(--warm-white)', borderRadius:'var(--radius-lg)', padding:'0.35rem', border:'1px solid var(--gray-light)', marginBottom:'1.5rem', width:'fit-content' }}>
          {TABS_P.map(([id,label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              padding:'0.5rem 1.1rem', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer', fontSize:'0.85rem',
              background: activeTab===id?'var(--terracotta)':'transparent',
              color: activeTab===id?'var(--warm-white)':'var(--bark-light)',
              fontFamily:'var(--font-body)', transition:'all 0.2s',
            }}>{label}</button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div style={{ background:'var(--warm-white)', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-light)', padding:'2rem' }}>

            {/* ── Info básica ── */}
            {activeTab==='info' && <>
              <Field label="Descripción del albergue">
                <textarea value={form.descripcion} onChange={f('descripcion')} rows={4} style={taStyle} onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
              </Field>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                <Field label="Horario"><Input value={form.horario} onChange={f('horario')} placeholder="Lun–Dom 9am–5pm"/></Field>
                <Field label="Estado">
                  <select value={form.status} onChange={f('status')} style={{ ...iStyle }}>
                    <option value="open">Abierto</option>
                    <option value="full">Casi lleno</option>
                    <option value="closed">Temporalmente cerrado</option>
                  </select>
                </Field>
                <Field label="Teléfono"><Input value={form.telefono} onChange={f('telefono')} placeholder="55 XXXX XXXX"/></Field>
                <Field label="Email de contacto"><Input type="email" value={form.email} onChange={f('email')} placeholder="albergue@correo.mx"/></Field>
                <Field label="Dirección"><Input value={form.direccion} onChange={f('direccion')} /></Field>
                <Field label="Director / Responsable"><Input value={form.director} onChange={f('director')} /></Field>
              </div>
              <Field label="Foto principal">
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <Input value={form.imagen} onChange={f('imagen')} placeholder="URL de imagen" style={{ flex:1 }}/>
                  <label style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.7rem 1rem', border:'1.5px solid var(--gray-light)', borderRadius:8, cursor:'pointer', fontSize:'0.85rem', color:'var(--bark-light)', whiteSpace:'nowrap' }}>
                    <Upload size={14}/> Subir
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => { setImgFile(e.target.files[0]) }}/>
                  </label>
                </div>
                {imgFile && <p style={{ fontSize:'0.72rem', color:'var(--sage)', marginTop:'0.3rem' }}>✓ {imgFile.name} — se subirá al guardar</p>}
                {form.imagen && !imgFile && <img src={form.imagen} alt="" style={{ width:120, height:80, objectFit:'cover', borderRadius:8, marginTop:'0.5rem' }}/>}
              </Field>
            </>}

            {/* ── Ocupación y stats ── */}
            {activeTab==='ocupacion' && <>
              <p style={{ fontSize:'0.85rem', color:'var(--bark-light)', marginBottom:'1.5rem', lineHeight:1.6 }}>
                Actualiza los números de tu albergue. Estos datos se muestran públicamente en la página de albergues.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem' }}>
                {[['Capacidad total','capacidad','🏠'],['Perros actuales','perros_actuales','🐕'],['Adoptados este mes','adoptados_mes','🏡'],['Rescatados este mes','rescatados_mes','🚑'],['Esterilizaciones','esterilizaciones_mes','💉'],['Consultas veterinarias','consultas_mes','🩺']].map(([label,key,icon]) => (
                  <div key={key} style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.25rem', border:'1px solid var(--gray-light)' }}>
                    <div style={{ fontSize:'1.5rem', marginBottom:'0.4rem' }}>{icon}</div>
                    <label style={{ fontSize:'0.72rem', color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.06em', display:'block', marginBottom:'0.4rem' }}>{label}</label>
                    <input type="number" min="0" value={form[key]||0} onChange={fn(key)}
                      style={{ width:'100%', padding:'0.6rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'1.1rem', fontFamily:'var(--font-display)', color:'var(--bark)', outline:'none', background:'var(--warm-white)', textAlign:'center' }}
                      onFocus={e=>e.target.style.borderColor='var(--terracotta)'}
                      onBlur={e=>e.target.style.borderColor='var(--gray-light)'}
                    />
                  </div>
                ))}
              </div>
            </>}

            {/* ── Requerimientos ── */}
            {activeTab==='requerimientos' && <>
              <p style={{ fontSize:'0.85rem', color:'var(--bark-light)', marginBottom:'1.25rem', lineHeight:1.6 }}>
                Lista qué necesita tu albergue ahora mismo. Esto se muestra en tu página pública para que donadores y voluntarios puedan ayudar de forma específica. Escribe una necesidad por línea.
              </p>
              <textarea
                value={form.necesidades}
                onChange={f('necesidades')}
                placeholder={"Croquetas de mediana proteína (50 kg/semana)\nMedicamentos antiparasitarios\nVoluntarios para paseos 6am–8am\nFondos para medicamentos de emergencia"}
                rows={10}
                style={{ ...taStyle, fontFamily:'var(--font-body)' }}
                onFocus={e=>e.target.style.borderColor='var(--terracotta)'}
                onBlur={e=>e.target.style.borderColor='var(--gray-light)'}
              />
              <p style={{ fontSize:'0.75rem', color:'var(--gray)', marginTop:'0.5rem' }}>
                {form.necesidades.split('\n').filter(Boolean).length} requerimientos listados
              </p>
            </>}

          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1.25rem', gap:'0.75rem', alignItems:'center' }}>
            {ok && <span style={{ fontSize:'0.85rem', color:'var(--sage)', display:'flex', gap:'0.3rem', alignItems:'center' }}><CheckCircle size={15}/>Guardado correctamente</span>}
            <button type="submit" disabled={saving} className="btn-primary" style={{ borderRadius:10 }}>
              <Save size={16}/> {saving?'Guardando…':'Guardar cambios'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

const Field = ({label,children}) => <div style={{ marginBottom:'1rem' }}><label style={{ fontSize:'0.8rem', color:'var(--bark-light)', display:'block', marginBottom:'0.35rem', fontWeight:500 }}>{label}</label>{children}</div>
const iStyle = { width:'100%', padding:'0.75rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'0.9rem', outline:'none', background:'var(--warm-white)', color:'var(--bark)', fontFamily:'var(--font-body)', transition:'border-color 0.2s' }
const taStyle = { ...iStyle, resize:'vertical', display:'block', lineHeight:1.6 }
const Input = (props) => <input {...props} style={{ ...iStyle, ...props.style }} onFocus={e=>e.target.style.borderColor='var(--terracotta)'} onBlur={e=>e.target.style.borderColor='var(--gray-light)'} />
