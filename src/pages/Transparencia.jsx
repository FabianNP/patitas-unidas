import { useState, useEffect } from 'react'
import { getGastos, getResumenFinanciero } from '../lib/supabase'

const MOCK_GASTOS = [
  { id:1, fecha:'2025-04-08', descripcion:'Croquetas Purina Pro Plan 20kg × 40', categoria:'alimento', albergue:'Patitas Libre', proveedor:'Nutrizoo SA de CV', monto:42800 },
  { id:2, fecha:'2025-04-07', descripcion:'Vacunas antirrábicas lote 200 dosis', categoria:'medico', albergue:'Red completa', proveedor:'BioVet México', monto:18400 },
  { id:3, fecha:'2025-04-05', descripcion:'Reparación techumbre zona D', categoria:'infraestructura', albergue:'Casa Bigotes', proveedor:'Construcciones Ramos', monto:27500 },
  { id:4, fecha:'2025-04-03', descripcion:'Medicamentos antiparasitarios lote mensual', categoria:'medico', albergue:'Red completa', proveedor:'Farmacia Vet Central', monto:9870 },
  { id:5, fecha:'2025-04-01', descripcion:'Croquetas cachorro Hills 15kg × 25', categoria:'alimento', albergue:'La Guarida', proveedor:'Nutrizoo SA de CV', monto:31250 },
  { id:6, fecha:'2025-03-29', descripcion:'Equipo de cirugía: bisturís y retractores', categoria:'medico', albergue:'Refugio Esperanza', proveedor:'MedVet Equipos', monto:14600 },
  { id:7, fecha:'2025-03-26', descripcion:'Instalación calefactores zona cachorros', categoria:'infraestructura', albergue:'La Guarida', proveedor:'Electro Instalaciones MX', monto:19300 },
  { id:8, fecha:'2025-03-22', descripcion:'Alimento húmedo Royal Canin latas × 480', categoria:'alimento', albergue:'Casa Bigotes', proveedor:'Planeta Animal', monto:22080 },
  { id:9, fecha:'2025-03-18', descripcion:'Cirugías de esterilización 45 hembras', categoria:'medico', albergue:'Red completa', proveedor:'Clínica Vet Solidaria', monto:67500 },
  { id:10, fecha:'2025-03-15', descripcion:'Casetas plástico × 30 unidades', categoria:'infraestructura', albergue:'Amigos del Sur', proveedor:'AgroPet', monto:24000 },
]

const CAT_STYLE = {
  alimento:       { label:'Alimento',        bg:'var(--gold-pale)',  color:'var(--gold)' },
  medico:         { label:'Médico',           bg:'var(--terra-pale)', color:'var(--terracotta)' },
  infraestructura:{ label:'Infraestructura', bg:'var(--sage-pale)',  color:'var(--sage)' },
  otro:           { label:'Otro',             bg:'var(--gray-light)', color:'var(--gray)' },
}

const DISTRIBUCION = [
  { label:'Alimentación',   pct:38, color:'var(--terracotta)' },
  { label:'Veterinaria',    pct:31, color:'var(--sage-light)' },
  { label:'Infraestructura',pct:15, color:'var(--gold)' },
  { label:'Rescate',        pct:10, color:'var(--bark-light)' },
  { label:'Administración', pct:5.8,color:'var(--gray-light)' },
]

export default function Transparencia() {
  const [gastos, setGastos]   = useState(MOCK_GASTOS)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    getGastos().then(({ data }) => { if (data?.length) setGastos(data) })
  }, [])

  const filtered = filter==='all' ? gastos : gastos.filter(g => g.categoria===filter)
  const fmt = (n) => `$${Number(n).toLocaleString('es-MX')}`

  return (
    <div>
      <div className="page-hero">
        <span className="section-tag">Rendición de cuentas</span>
        <h1 className="section-title">Transparencia financiera</h1>
        <p className="section-lead">Cada peso que entra y cómo se utiliza. Donataria Autorizada SAT con auditoría anual independiente.</p>
      </div>

      {/* Métricas */}
      <div className="section-pad-h metrics-grid" style={{ padding:'3rem 5rem 2rem', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1.25rem' }}>
        {[['$2,340,800','Total recaudado 2025','Ene–Abr · Meta: $4,000,000'],['$1,987,650','Total gastado 2025','Ene–Abr 2025'],['$353,150','Reserva operativa','Fondo de emergencias'],['94.2%','Va directo a los perros','Solo 5.8% administración']].map(([num,label,sub]) => (
          <div key={label} style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.5rem', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.4rem,3vw,2rem)', color:'var(--terracotta)', marginBottom:'0.2rem' }}>{num}</div>
            <div style={{ fontSize:'0.7rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray)', marginBottom:'0.3rem' }}>{label}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--bark-light)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Distribución */}
      <div className="section-pad-h" style={{ padding:'0 5rem 3rem' }}>
        <div style={{ background:'var(--cream)', borderRadius:'var(--radius-lg)', padding:'1.75rem' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--bark)', marginBottom:'1.25rem' }}>¿Cómo se distribuye tu donación?</h3>
          {DISTRIBUCION.map(d => (
            <div key={d.label} style={{ marginBottom:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.83rem', color:'var(--bark-light)', marginBottom:'0.35rem' }}>
                <span>{d.label}</span><span style={{ fontWeight:500 }}>{d.pct}%</span>
              </div>
              <div style={{ background:'var(--gray-light)', borderRadius:'99px', height:9, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:'99px', background:d.color, width:`${d.pct}%`, transition:'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="section-pad-h" style={{ padding:'0 5rem 5rem' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--bark)' }}>Registro de compras y gastos</h2>
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
            {[['all','Todos'],['alimento','Alimento'],['medico','Médico'],['infraestructura','Infraestructura']].map(([val,label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{
                padding:'0.35rem 0.85rem', borderRadius:'99px', border:'1px solid var(--gray-light)',
                background:filter===val?'var(--bark)':'transparent', color:filter===val?'var(--warm-white)':'var(--bark-light)',
                fontSize:'0.78rem', cursor:'pointer', transition:'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div className="table-scroll" style={{ borderRadius:'var(--radius-lg)', border:'1px solid var(--gray-light)', overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--gray-light)' }}>
                {['Fecha','Descripción','Categoría','Albergue','Monto'].map(h => (
                  <th key={h} style={{ fontSize:'0.68rem', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--gray)', fontWeight:500, padding:'0.75rem 1rem', textAlign:'left', background:'var(--cream)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(g => {
                const cat = CAT_STYLE[g.categoria] || CAT_STYLE.otro
                return (
                  <tr key={g.id} style={{ borderBottom:'1px solid rgba(212,206,198,0.4)', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--cream)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'0.85rem 1rem', fontSize:'0.82rem', color:'var(--bark-light)', whiteSpace:'nowrap' }}>{new Date(g.fecha).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td style={{ padding:'0.85rem 1rem', fontSize:'0.82rem', color:'var(--bark)', maxWidth:220 }}>{g.descripcion}</td>
                    <td style={{ padding:'0.85rem 1rem' }}><span style={{ fontSize:'0.7rem', padding:'0.2rem 0.6rem', borderRadius:'99px', background:cat.bg, color:cat.color, fontWeight:500, whiteSpace:'nowrap' }}>{cat.label}</span></td>
                    <td style={{ padding:'0.85rem 1rem', fontSize:'0.82rem', color:'var(--bark-light)', whiteSpace:'nowrap' }}>{g.albergue}</td>
                    <td style={{ padding:'0.85rem 1rem', fontSize:'0.9rem', color:'var(--bark)', fontWeight:500, whiteSpace:'nowrap' }}>{fmt(g.monto)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop:'0.75rem', fontSize:'0.75rem', color:'var(--gray)', textAlign:'right' }}>
          Subtotal filtrado: <strong>{fmt(filtered.reduce((s,g)=>s+Number(g.monto),0))}</strong>
        </p>
      </div>
    </div>
  )
}
