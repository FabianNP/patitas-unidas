import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getAlbergue } from '../lib/supabase'
import DonationForm from '../components/DonationForm'
import { ArrowLeft, MapPin, Phone, Mail, Clock, Users } from 'lucide-react'

const MOCK_MAP = {
  1: { id:1, nombre:'Casa Bigotes', alcaldia:'Iztapalapa', direccion:'Calle Texcoco #48', telefono:'55 4821 9034', email:'bigotes@patitas.mx', horario:'Mar–Dom 10–17h', director:'Ing. Roberto Sosa', descripcion:'Casa Bigotes nació de la iniciativa de vecinos de Iztapalapa. Hoy es uno de los albergues más reconocidos, especializado en perros adultos y razas grandes que tienen menos probabilidad de ser adoptados.', perros_actuales:68, capacidad:80, adoptados_mes:24, rescatados_mes:18, esterilizaciones_mes:31, consultas_mes:62, status:'open', imagen:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80', necesidades:['Croquetas de alta proteína (50 kg/semana)','Medicamentos antiparasitarios','Mantas y camas resistentes','Voluntarios para paseos 6–8am y 5–7pm'] },
  2: { id:2, nombre:'Refugio Esperanza', alcaldia:'Coyoacán', direccion:'Av. Universidad #2850', telefono:'55 5572 3811', email:'esperanza@patitas.mx', horario:'Lun–Sáb 9–16h', director:'Dra. Fernanda Lira', descripcion:'El único albergue especializado en rehabilitación de perros con traumas severos. Nuestro equipo incluye etólogos y veterinarios conductuales.', perros_actuales:42, capacidad:60, adoptados_mes:18, rescatados_mes:12, esterilizaciones_mes:20, consultas_mes:45, status:'open', imagen:'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=1200&q=80', necesidades:['Juguetes de enriquecimiento cognitivo','Suplementos ansiolíticos naturales','Voluntarios con experiencia canina','Fondos para hidroterapia'] },
  3: { id:3, nombre:'Patitas Libre', alcaldia:'Tlalpan', direccion:'Periférico Sur #7400', telefono:'55 7743 2200', email:'libre@patitas.mx', horario:'Todos los días 8–18h', director:'Lic. Jorge Méndez', descripcion:'Albergue fundador de la red y el más grande en extensión. Sus 5,000 m² incluyen piscina canina, campos de juego techados y sede principal de Patitas Unidas.', perros_actuales:110, capacidad:120, adoptados_mes:31, rescatados_mes:28, esterilizaciones_mes:40, consultas_mes:88, status:'full', imagen:'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1200&q=80', necesidades:['Croquetas premium (urgente)','Collares y correas','Voluntarios fines de semana','Fondos para ampliar área de cachorros'] },
}

export default function AlbergueDetalle() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const [albergue, setAlbergue] = useState(MOCK_MAP[Number(id)] || MOCK_MAP[1])
  const [showDonate, setShowDonate] = useState(false)

  useEffect(() => {
    getAlbergue(id).then(({ data }) => { if (data) setAlbergue(data) })
    window.scrollTo({ top:0, behavior:'smooth' })
  }, [id])

  const pct = Math.round((albergue.perros_actuales / albergue.capacidad) * 100)

  return (
    <div>
      {/* Back btn */}
      <button onClick={() => navigate('/albergues')} style={{
        position:'fixed', top:'calc(var(--nav-height) + 0.75rem)', left:'1rem', zIndex:50,
        display:'flex', alignItems:'center', gap:'0.4rem', background:'rgba(253,250,245,0.92)',
        backdropFilter:'blur(8px)', border:'1px solid var(--gray-light)', borderRadius:'99px',
        padding:'0.45rem 1.1rem', fontSize:'0.82rem', cursor:'pointer', color:'var(--bark-light)',
      }}>
        <ArrowLeft size={15} /> Albergues
      </button>

      {/* Hero */}
      <div style={{ height:'clamp(220px,40vw,380px)', overflow:'hidden', position:'relative', marginTop:'var(--nav-height)' }}>
        <img src={albergue.imagen} alt={albergue.nombre} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(61,43,31,0.85) 0%, transparent 55%)', display:'flex', alignItems:'flex-end', padding:'clamp(1.5rem,4vw,2.5rem)' }}>
          <div>
            <span className={`badge ${albergue.status==='open'?'badge-open':'badge-full'}`} style={{ marginBottom:'0.5rem' }}>
              {albergue.status==='open'?'Abierto':'Casi lleno'}
            </span>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.6rem,4vw,2.5rem)', color:'var(--cream)', marginBottom:'0.3rem' }}>{albergue.nombre}</h1>
            <p style={{ color:'rgba(245,240,232,0.7)', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'0.4rem' }}>
              <MapPin size={13} /> {albergue.alcaldia}, Ciudad de México
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="detail-grid detail-pad" style={{ padding:'2.5rem 5rem', display:'grid', gridTemplateColumns:'2fr 1fr', gap:'2.5rem' }}>

        {/* Main */}
        <div>
          {[
            ['Sobre este albergue', albergue.descripcion],
          ].map(([title, text]) => (
            <section key={title} style={{ marginBottom:'2rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--bark)', marginBottom:'0.85rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--terra-pale)' }}>{title}</h2>
              <p style={{ fontSize:'0.92rem', lineHeight:1.75, color:'var(--bark-light)' }}>{text}</p>
            </section>
          ))}

          <section style={{ marginBottom:'2rem' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--bark)', marginBottom:'0.85rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--terra-pale)' }}>Qué necesita ahora</h2>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              {(albergue.necesidades||[]).map((n,i) => (
                <li key={i} style={{ display:'flex', gap:'0.7rem', alignItems:'center', fontSize:'0.88rem', color:'var(--bark-light)' }}>
                  <span style={{ width:7, height:7, minWidth:7, borderRadius:'50%', background:'var(--terracotta)', display:'inline-block' }} /> {n}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--bark)', marginBottom:'0.85rem', paddingBottom:'0.5rem', borderBottom:'2px solid var(--terra-pale)' }}>Cómo visitarnos</h2>
            <p style={{ fontSize:'0.92rem', lineHeight:1.75, color:'var(--bark-light)' }}>Visitas abiertas {albergue.horario}. Para adoptar, agenda una cita previa. Voluntarios nuevos: inducción sábados 9am.</p>
          </section>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--bark)', marginBottom:'0.85rem' }}>Información</h3>
            {[[<MapPin size={13}/>,albergue.direccion],[<Phone size={13}/>,albergue.telefono],[<Mail size={13}/>,albergue.email],[<Clock size={13}/>,albergue.horario],[<Users size={13}/>,albergue.director]].map(([icon,val],i) => (
              val && <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start', padding:'0.5rem 0', borderBottom: i<4?'1px solid var(--gray-light)':'none', fontSize:'0.83rem', color:'var(--bark-light)' }}>
                <span style={{ color:'var(--gray)', marginTop:2, flexShrink:0 }}>{icon}</span><span>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--bark)', marginBottom:'0.85rem' }}>Capacidad</h3>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'var(--bark-light)', marginBottom:'0.4rem' }}>
              <span>{albergue.perros_actuales} perros</span><span>{albergue.capacidad} máx</span>
            </div>
            <div style={{ background:'var(--gray-light)', borderRadius:'99px', height:8, overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:'99px', background:pct>85?'var(--gold)':'var(--terracotta)', width:`${pct}%` }} />
            </div>
            <p style={{ fontSize:'0.72rem', color:'var(--gray)', marginTop:'0.4rem' }}>{pct}% · {albergue.capacidad-albergue.perros_actuales} lugares libres</p>
            <button className="btn-primary" onClick={() => setShowDonate(d=>!d)} style={{ width:'100%', justifyContent:'center', marginTop:'1rem', borderRadius:10 }}>
              {showDonate?'Cerrar':'Donar a este albergue'}
            </button>
          </div>

          {showDonate && (
            <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.5rem' }}>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--bark)', marginBottom:'1rem' }}>Donar a {albergue.nombre}</h3>
              <DonationForm albergue={albergue} />
            </div>
          )}

          <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.5rem' }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--bark)', marginBottom:'0.85rem' }}>Este mes</h3>
            {[['Adoptados',albergue.adoptados_mes,'var(--sage)'],['Rescatados',albergue.rescatados_mes,'var(--bark)'],['Esterilizaciones',albergue.esterilizaciones_mes,'var(--bark)'],['Consultas vet.',albergue.consultas_mes,'var(--bark)']].map(([l,v,c]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'0.45rem 0', borderBottom:'1px solid var(--gray-light)', fontSize:'0.83rem' }}>
                <span style={{ color:'var(--gray)' }}>{l}</span><span style={{ color:c, fontWeight:500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
