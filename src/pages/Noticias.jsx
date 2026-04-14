import { useState, useEffect } from "react";
import { getNoticias } from "../lib/supabase";

const MOCK = [
  {
    id: 1,
    titulo: "Jornada de adopción masiva en el Parque México",
    resumen:
      "Este domingo llevamos 40 perros al Parque México. El evento es de 10am a 4pm, entrada libre. Veterinarios en sitio y microchipeo gratuito.",
    tipo: "announce",
    published_at: "2025-04-05",
    imagen: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80",
  },
  {
    id: 2,
    titulo: "Récord histórico: $180,000 donados en marzo",
    resumen: "Gracias a más de 1,200 donadores superamos nuestra meta mensual en un 80%.",
    tipo: "success",
    published_at: "2025-04-01",
    imagen: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?w=900&q=80",
  },
  {
    id: 3,
    titulo: "Nueva clínica veterinaria en Casa Bigotes",
    resumen:
      "Inauguramos la quinta clínica de la red, con dos cirujanos de planta y sala de recuperación.",
    tipo: "news",
    published_at: "2025-03-28",
    imagen: "https://images.unsplash.com/photo-1534361960057-19f4434a4428?w=900&q=80",
  },
  {
    id: 4,
    titulo: "840 voluntarios activos — ¡Únete!",
    resumen:
      "Rompemos nuestro récord de voluntariado. Inscríbete los sábados a las 9am en cualquier albergue.",
    tipo: "news",
    published_at: "2025-03-20",
    imagen: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=900&q=80",
  },
  {
    id: 5,
    titulo: "Luna encontró su hogar después de 2 años",
    resumen:
      "La pastora alemana más querida de Refugio Esperanza fue adoptada por la familia Reyes de Coyoacán.",
    tipo: "success",
    published_at: "2025-03-14",
    imagen: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=900&q=80",
  },
  {
    id: 6,
    titulo: "Nuevo convenio con SEDEMA CDMX",
    resumen:
      "Firmamos un convenio para ampliar nuestra red de rescate a 5 alcaldías más antes del 2026.",
    tipo: "announce",
    published_at: "2025-03-03",
    imagen: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=900&q=80",
  },
];

const ANUNCIOS = [
  {
    titulo: "Campaña de esterilización gratuita — Abril 2025",
    desc: "Del 14 al 25 de abril ofrecemos esterilizaciones sin costo en los 12 albergues. Cupo: 200 cirugías.",
    hasta: "Hasta 25 Abr",
    color: "var(--terracotta)",
    icon: "📢",
  },
  {
    titulo: "Nuevo convenio con SEDEMA CDMX",
    desc: "Ampliaremos nuestra red de rescate a 5 alcaldías más antes del 2026.",
    hasta: "3 Abr 2025",
    color: "var(--sage)",
    icon: "🤝",
  },
  {
    titulo: 'Programa "Patas en las Escuelas"',
    desc: "Talleres de tenencia responsable en primarias de la CDMX. Inscribe tu escuela gratis al 800 PATITAS.",
    hasta: "Todo mayo 2025",
    color: "var(--gold)",
    icon: "🎓",
  },
];

const TIPO_LABELS = { announce: "📢 Anuncio", success: "🏆 Logro", news: "📰 Noticia" };
const TIPO_BADGE = { announce: "badge-announce", success: "badge-success", news: "badge-news" };

export default function Noticias() {
  const [noticias, setNoticias] = useState(MOCK);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getNoticias().then(({ data }) => {
      if (data?.length) setNoticias(data);
    });
  }, []);

  const filtered = filter === "all" ? noticias : noticias.filter((n) => n.tipo === filter);
  const destacada = filtered[0];
  const resto = filtered.slice(1);
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      {/* Hero */}
      <div className="page-hero">
        <span className="section-tag">Comunidad</span>
        <h1 className="section-title">Noticias y anuncios</h1>
        <p className="section-lead">
          Eventos, rescates, historias de adopción y comunicados importantes.
        </p>
      </div>

      {/* Filtros */}
      <div
        style={{
          padding: "1.75rem 1.5rem 1rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {[
          ["all", "Todos"],
          ["news", "Noticias"],
          ["announce", "Anuncios"],
          ["success", "Logros"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "99px",
              border: "1px solid var(--gray-light)",
              background: filter === val ? "var(--bark)" : "transparent",
              color: filter === val ? "var(--warm-white)" : "var(--bark-light)",
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-body)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Noticia destacada + sidebar — se apila en móvil */}
      {destacada && (
        <div
          className="news-main-grid"
          style={{
            padding: "0 1.5rem",
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Principal */}
          <div
            style={{
              background: "var(--warm-white)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--gray-light)",
              overflow: "hidden",
            }}
          >
            <div style={{ height: "clamp(180px,35vw,300px)", overflow: "hidden" }}>
              <img
                src={destacada.imagen}
                alt={destacada.titulo}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ padding: "1.5rem" }}>
              <span
                className={`badge ${TIPO_BADGE[destacada.tipo]}`}
                style={{ marginBottom: "0.75rem" }}
              >
                {TIPO_LABELS[destacada.tipo]}
              </span>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.1rem,2.5vw,1.5rem)",
                  color: "var(--bark)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.3,
                }}
              >
                {destacada.titulo}
              </h2>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  color: "var(--bark-light)",
                  marginBottom: "1rem",
                }}
              >
                {destacada.resumen}
              </p>
              <span style={{ fontSize: "0.78rem", color: "var(--gray)" }}>
                {fmtDate(destacada.published_at)}
              </span>
            </div>
          </div>

          {/* Sidebar noticias */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {resto.slice(0, 4).map((n) => (
              <div
                key={n.id}
                style={{
                  background: "var(--warm-white)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--gray-light)",
                  padding: "0.9rem 1rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--terracotta)";
                  e.currentTarget.style.transform = "translateX(3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--gray-light)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <span
                  className={`badge ${TIPO_BADGE[n.tipo]}`}
                  style={{ fontSize: "0.65rem", marginBottom: "0.4rem" }}
                >
                  {TIPO_LABELS[n.tipo]}
                </span>
                <h4
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--bark)",
                    marginBottom: "0.25rem",
                    lineHeight: 1.4,
                  }}
                >
                  {n.titulo}
                </h4>
                <p
                  style={{
                    fontSize: "0.76rem",
                    color: "var(--bark-light)",
                    lineHeight: 1.5,
                    marginBottom: "0.35rem",
                  }}
                >
                  {n.resumen.slice(0, 90)}…
                </p>
                <span style={{ fontSize: "0.7rem", color: "var(--gray)" }}>
                  {fmtDate(n.published_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid resto */}
      {resto.length > 4 && (
        <div
          style={{
            padding: "0 1.5rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,280px),1fr))",
            gap: "1.25rem",
          }}
        >
          {resto.slice(4).map((n) => (
            <div
              key={n.id}
              style={{
                background: "var(--warm-white)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--gray-light)",
                overflow: "hidden",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ height: 160, overflow: "hidden" }}>
                <img
                  src={n.imagen}
                  alt={n.titulo}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "1.1rem" }}>
                <span className={`badge ${TIPO_BADGE[n.tipo]}`} style={{ marginBottom: "0.5rem" }}>
                  {TIPO_LABELS[n.tipo]}
                </span>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    color: "var(--bark)",
                    marginBottom: "0.35rem",
                    lineHeight: 1.3,
                  }}
                >
                  {n.titulo}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--bark-light)", lineHeight: 1.5 }}>
                  {n.resumen.slice(0, 100)}…
                </p>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--gray)",
                    display: "block",
                    marginTop: "0.65rem",
                  }}
                >
                  {fmtDate(n.published_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anuncios importantes */}
      <div style={{ padding: "1rem 1.5rem 4rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.2rem,2.5vw,1.5rem)",
            color: "var(--bark)",
            marginBottom: "1.25rem",
          }}
        >
          Anuncios importantes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {ANUNCIOS.map((a, i) => (
            <div
              key={i}
              style={{
                background: "var(--bark)",
                borderRadius: "var(--radius-lg)",
                padding: "1.25rem 1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                borderLeft: `4px solid ${a.color}`,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  minWidth: 40,
                  background: a.color,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                }}
              >
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.95rem",
                    color: "var(--cream)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {a.titulo}
                </h3>
                <p
                  style={{ fontSize: "0.82rem", color: "rgba(245,240,232,0.65)", lineHeight: 1.55 }}
                >
                  {a.desc}
                </p>
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "rgba(245,240,232,0.4)",
                  whiteSpace: "nowrap",
                  alignSelf: "center",
                }}
              >
                {a.hasta}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
