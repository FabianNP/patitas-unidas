import { Link, useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()
  const goToDonate = () => {
    navigate('/')
    setTimeout(() => document.getElementById('donate-section')?.scrollIntoView({ behavior:'smooth' }), 150)
  }

  return (
    <footer className="footer-wrap" style={{ background:'var(--bark)', padding:'4rem 5rem 2rem' }}>
      <div className="footer-grid" style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:'3rem', marginBottom:'3rem' }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--cream)', marginBottom:'0.75rem' }}>🐾 Patitas Unidas</div>
          <p style={{ fontSize:'0.85rem', lineHeight:1.7, color:'rgba(245,240,232,0.6)', marginBottom:'1rem' }}>
            Asociación civil dedicada al rescate, rehabilitación y adopción de perros en situación de calle en la CDMX desde 2015.
          </p>
          <p style={{ fontSize:'0.75rem', color:'rgba(245,240,232,0.4)' }}>Donataria Autorizada SAT · PAUN151120TI8</p>
        </div>

        {[
          { title:'Nosotros', items:[['/', 'Inicio'],['/transparencia','Transparencia'],['/noticias','Noticias']] },
          { title:'Participar', items:null },
          { title:'Contacto', items:null },
        ].map((col, i) => (
          <div key={i}>
            <h4 style={{ fontSize:'0.72rem', letterSpacing:'0.15em', textTransform:'uppercase', color:'var(--cream)', marginBottom:'1rem' }}>
              {col.title}
            </h4>
            {i === 0 && col.items.map(([to, label]) => (
              <Link key={to} to={to} style={{ display:'block', fontSize:'0.85rem', color:'rgba(245,240,232,0.5)', marginBottom:'0.5rem', textDecoration:'none', transition:'color 0.2s' }}
                onMouseEnter={e => e.target.style.color='var(--terra-light)'}
                onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.5)'}
              >{label}</Link>
            ))}
            {i === 1 && ['Donar','Adoptar','Voluntariado','Ser padrino'].map(label => (
              <button key={label} onClick={label==='Donar'?goToDonate:label==='Adoptar'?()=>navigate('/albergues'):()=>{}}
                style={{ display:'block', background:'none', border:'none', fontSize:'0.85rem', color:'rgba(245,240,232,0.5)', marginBottom:'0.5rem', cursor:'pointer', padding:0, textAlign:'left', transition:'color 0.2s' }}
                onMouseEnter={e => e.target.style.color='var(--terra-light)'}
                onMouseLeave={e => e.target.style.color='rgba(245,240,232,0.5)'}
              >{label}</button>
            ))}
            {i === 2 && ['hola@patitas.mx','800 PATITAS','Instagram','Facebook'].map(item => (
              <span key={item} style={{ display:'block', fontSize:'0.85rem', color:'rgba(245,240,232,0.5)', marginBottom:'0.5rem' }}>{item}</span>
            ))}
          </div>
        ))}
      </div>

      <div style={{ paddingTop:'2rem', borderTop:'1px solid rgba(245,240,232,0.1)', display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', fontSize:'0.75rem', color:'rgba(245,240,232,0.3)' }}>
        <span>© 2025 Patitas Unidas A.C. — Todos los derechos reservados</span>
        <span>Hecho con ❤️ por sus voluntarios</span>
      </div>
    </footer>
  )
}
