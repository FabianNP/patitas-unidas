import { useState, useEffect } from 'react'
import { getSolicitudes, resolverSolicitud, createAlbergue } from '../../lib/supabase'
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'

export default function SolicitudesTab() {
  const [items, setItems]     = useState([])
  const [expanded, setExpanded] = useState(null)
  const [nota, setNota]       = useState({})
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState(null)

  const load = () => getSolicitudes().then(({ data }) => { setItems(data||[]); setLoading(false) })
  useEffect(() => { load() }, [])

  async function aprobar(s) {
    setActing(s.id)
    // 1. Crear albergue en tabla albergues
    const { data: nuevoAlbergue } = await createAlbergue({
      nombre: s.nombre, alcaldia: s.alcaldia, direccion: s.direccion,
      descripcion: s.descripcion, capacidad: s.capacidad||0,
      perros_actuales:0, status:'open',
      admin_user_id: s.user_id,
    })
    // 2. Marcar solicitud como aprobada y vincular
    await resolverSolicitud(s.id, 'aprobado', nota[s.id]||'¡Bienvenido a la red Patitas Unidas!', nuevoAlbergue?.id||null)
    // 3. Actualizar rol del usuario a 'albergue'
    // Esto se haría desde una Edge Function con permisos de admin
    // await supabase.from('perfiles').update({rol:'albergue'}).eq('id',s.user_id)
    setActing(null); load()
  }

  async function rechazar(id) {
    if (!nota[id]) { alert('Escribe una nota explicando el motivo del rechazo.'); return }
    setActing(id)
    await resolverSolicitud(id, 'rechazado', nota[id])
    setActing(null); load()
  }

  const STATUS_STYLE = {
    pendiente: { bg:'var(--gold-pale)',  color:'var(--gold)',  icon:<Clock size={14}/>,        label:'Pendiente' },
    aprobado:  { bg:'var(--sage-pale)',  color:'var(--sage)',  icon:<CheckCircle size={14}/>,  label:'Aprobado' },
    rechazado: { bg:'#FCEBEB',           color:'#A32D2D',      icon:<XCircle size={14}/>,      label:'Rechazado' },
  }

  const pendientes = items.filter(i=>i.status==='pendiente').length

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--bark)' }}>Solicitudes de albergues</h2>
          {pendientes>0 && <p style={{ fontSize:'0.85rem', color:'var(--terracotta)', marginTop:'0.2rem' }}>⚠️ {pendientes} solicitud{pendientes>1?'es':''} pendiente{pendientes>1?'s':''} de revisión</p>}
        </div>
      </div>

      {loading && <p style={{ color:'var(--gray)', fontStyle:'italic' }}>Cargando solicitudes…</p>}

      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
        {items.map(s => {
          const st = STATUS_STYLE[s.status] || STATUS_STYLE.pendiente
          const isOpen = expanded===s.id
          return (
            <div key={s.id} style={{ background:'var(--warm-white)', borderRadius:'var(--radius-lg)', border:`1.5px solid ${s.status==='pendiente'?'var(--gold)':'var(--gray-light)'}`, overflow:'hidden' }}>
              {/* Header */}
              <div style={{ padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', flexWrap:'wrap' }}
                onClick={() => setExpanded(isOpen?null:s.id)}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--bark)' }}>{s.nombre}</h3>
                    <span style={{ fontSize:'0.7rem', padding:'0.2rem 0.6rem', borderRadius:'99px', background:st.bg, color:st.color, fontWeight:600, display:'flex', alignItems:'center', gap:'0.3rem' }}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                  <p style={{ fontSize:'0.78rem', color:'var(--bark-light)', marginTop:'0.2rem' }}>
                    {s.alcaldia} · {s.perfiles?.nombre||s.responsable} · {new Date(s.created_at).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})}
                  </p>
                </div>
                {isOpen ? <ChevronUp size={18} color="var(--gray)"/> : <ChevronDown size={18} color="var(--gray)"/>}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop:'1px solid var(--gray-light)', padding:'1.5rem' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem', marginBottom:'1.25rem' }}>
                    {[['Responsable',s.responsable],['Email',s.email_contacto],['Teléfono',s.telefono],['Dirección',s.direccion],['Capacidad',`${s.capacidad} perros`],['Horario',s.horario],['Experiencia',s.experiencia],['Solicitado por',s.perfiles?.email||'—']].map(([l,v]) => (
                      <div key={l}>
                        <div style={{ fontSize:'0.7rem', color:'var(--gray)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.2rem' }}>{l}</div>
                        <div style={{ fontSize:'0.88rem', color:'var(--bark)' }}>{v||'—'}</div>
                      </div>
                    ))}
                  </div>

                  {s.descripcion && (
                    <div style={{ background:'var(--cream)', borderRadius:'var(--radius-md)', padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.85rem', color:'var(--bark-light)', lineHeight:1.6 }}>
                      <strong style={{ color:'var(--bark)' }}>Descripción:</strong><br/>{s.descripcion}
                    </div>
                  )}

                  {s.nota_admin && (
                    <div style={{ background: s.status==='aprobado'?'var(--sage-pale)':'#FCEBEB', borderRadius:'var(--radius-md)', padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.85rem', color:s.status==='aprobado'?'var(--sage)':'#A32D2D' }}>
                      <strong>Nota del admin:</strong> {s.nota_admin}
                    </div>
                  )}

                  {s.status==='pendiente' && (
                    <div>
                      <label style={{ fontSize:'0.8rem', color:'var(--bark-light)', display:'block', marginBottom:'0.4rem', fontWeight:500 }}>
                        Nota para el solicitante (recomendado)
                      </label>
                      <textarea
                        value={nota[s.id]||''}
                        onChange={e => setNota(n => ({...n,[s.id]:e.target.value}))}
                        placeholder="Ej: Aprobado — agendaremos visita la próxima semana. / No cumple con el espacio mínimo requerido."
                        rows={3}
                        style={{ width:'100%', padding:'0.75rem', border:'1.5px solid var(--gray-light)', borderRadius:8, fontSize:'0.85rem', outline:'none', resize:'vertical', fontFamily:'var(--font-body)', color:'var(--bark)', marginBottom:'1rem' }}
                      />
                      <div style={{ display:'flex', gap:'0.75rem' }}>
                        <button onClick={() => aprobar(s)} disabled={acting===s.id} style={{
                          display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.65rem 1.25rem',
                          background:'var(--sage)', color:'white', border:'none', borderRadius:10,
                          fontSize:'0.88rem', fontWeight:500, cursor:'pointer', fontFamily:'var(--font-body)',
                          opacity: acting===s.id?0.7:1,
                        }}>
                          <CheckCircle size={15}/> {acting===s.id?'Procesando…':'Aprobar albergue'}
                        </button>
                        <button onClick={() => rechazar(s.id)} disabled={acting===s.id} style={{
                          display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.65rem 1.25rem',
                          background:'#A32D2D', color:'white', border:'none', borderRadius:10,
                          fontSize:'0.88rem', fontWeight:500, cursor:'pointer', fontFamily:'var(--font-body)',
                          opacity: acting===s.id?0.7:1,
                        }}>
                          <XCircle size={15}/> Rechazar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
        {items.length===0 && !loading && <p style={{ color:'var(--gray)', fontStyle:'italic', fontSize:'0.9rem' }}>No hay solicitudes aún.</p>}
      </div>
    </div>
  )
}
