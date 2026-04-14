import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAlbergues, getNoticias } from "../lib/supabase";
import DonationForm from "../components/DonationForm";

const MOCK_ALBERGUES = [
  {
    id: 1,
    nombre: "Casa Bigotes",
    alcaldia: "Iztapalapa",
    descripcion: "Albergue familiar especializado en perros adultos y razas grandes.",
    perros_actuales: 68,
    capacidad: 80,
    adoptados_mes: 24,
    status: "open",
    imagen: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80",
  },
  {
    id: 2,
    nombre: "Refugio Esperanza",
    alcaldia: "Coyoacán",
    descripcion: "Centro de rehabilitación para perros con traumas severos.",
    perros_actuales: 42,
    capacidad: 60,
    adoptados_mes: 18,
    status: "open",
    imagen: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=500&q=80",
  },
  {
    id: 3,
    nombre: "Patitas Libre",
    alcaldia: "Tlalpan",
    descripcion: "El albergue más grande de la red, 5,000 m² de área verde.",
    perros_actuales: 110,
    capacidad: 120,
    adoptados_mes: 31,
    status: "full",
    imagen: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=500&q=80",
  },
  {
    id: 4,
    nombre: "La Guarida",
    alcaldia: "Azcapotzalco",
    descripcion: "Especializado en cachorros y madres lactantes.",
    perros_actuales: 35,
    capacidad: 50,
    adoptados_mes: 22,
    status: "open",
    imagen: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=500&q=80",
  },
];
const MOCK_NOTICIAS = [
  {
    id: 1,
    titulo: "Jornada de adopción en el Parque México",
    resumen: "Este domingo 40 perros buscan hogar. Entrada libre, 10am a 4pm.",
    tipo: "announce",
    published_at: "2025-04-05",
    imagen: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=500&q=80",
  },
  {
    id: 2,
    titulo: "Donativo récord: $180,000 en marzo",
    resumen: "Gracias a 1,200 donadores superamos nuestra meta mensual.",
    tipo: "success",
    published_at: "2025-04-01",
    imagen: "https://images.unsplash.com/photo-1559190394-df5a28aab5c5?w=500&q=80",
  },
  {
    id: 3,
    titulo: "Nueva clínica veterinaria en Casa Bigotes",
    resumen: "Inauguramos la quinta clínica de la red con 2 cirujanos.",
    tipo: "news",
    published_at: "2025-03-28",
    imagen: "https://images.unsplash.com/photo-1534361960057-19f4434a4428?w=500&q=80",
  },
  {
    id: 4,
    titulo: "840 voluntarios activos",
    resumen: "¡Rompimos el récord! Inscripciones todos los sábados a las 9am.",
    tipo: "news",
    published_at: "2025-03-20",
    imagen: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&q=80",
  },
];

function Carousel({ items, renderCard }) {
  const trackRef = useRef(null);
  const [pos, setPos] = useState(0);

  const move = (dir) => {
    const card = trackRef.current?.querySelector("[data-card]");
    if (!card) return;
    const w = card.offsetWidth + 20;
    const max = Math.max(
      0,
      trackRef.current.scrollWidth - trackRef.current.parentElement.offsetWidth,
    );
    setPos((p) => Math.max(0, Math.min(max, p + dir * w)));
  };

  useEffect(() => {
    if (trackRef.current) trackRef.current.style.transform = `translateX(-${pos}px)`;
  }, [pos]);

  return (
    <div>
      <div style={{ overflow: "hidden", paddingBottom: "0.25rem" }}>
        <div
          ref={trackRef}
          style={{
            display: "flex",
            gap: "1.25rem",
            transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              data-card
              style={{ minWidth: "min(300px, calc(85vw - 3rem))", flexShrink: 0 }}
            >
              {renderCard(item)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
        {[
          ["←", -1],
          ["→", 1],
        ].map(([lbl, d]) => (
          <button
            key={d}
            onClick={() => move(d)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1.5px solid var(--bark)",
              background: "transparent",
              fontSize: "1rem",
              color: "var(--bark)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bark)";
              e.currentTarget.style.color = "var(--warm-white)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--bark)";
            }}
          >
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [albergues, setAlbergues] = useState(MOCK_ALBERGUES);
  const [noticias, setNoticias] = useState(MOCK_NOTICIAS);

  useEffect(() => {
    getAlbergues().then(({ data }) => {
      if (data?.length) setAlbergues(data);
    });
    getNoticias().then(({ data }) => {
      if (data?.length) setNoticias(data);
    });
  }, []);

  return (
    /* FIX: contenedor con overflow-x hidden */
    <div style={{ overflowX: "hidden", width: "100%" }}>
      {/* ── HERO ── */}
      <section
        className="hero-grid"
        style={{
          minHeight: "100vh",
          paddingTop: "var(--nav-height)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <div
          className="hero-left"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "5rem 4rem 5rem 5rem",
            background: "var(--cream)",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--terracotta)",
              fontWeight: 500,
              marginBottom: "1.25rem",
            }}
          >
            Desde 2015 · Ciudad de México
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem,5vw,3.8rem)",
              lineHeight: 1.1,
              color: "var(--bark)",
              marginBottom: "1.25rem",
            }}
          >
            Cada perro merece
            <br />
            un hogar <em style={{ color: "var(--terracotta)" }}>lleno</em>
            <br />
            de amor.
          </h1>
          <p
            style={{
              fontSize: "clamp(0.9rem,2vw,1.05rem)",
              lineHeight: 1.7,
              color: "var(--bark-light)",
              maxWidth: 420,
              marginBottom: "2rem",
            }}
          >
            Patitas Unidas rescata, rehabilita y reubica a perros en situación de calle en la CDMX.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              onClick={() =>
                document.getElementById("donate-section")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Hacer una donación
            </button>
            <button className="btn-outline" onClick={() => navigate("/albergues")}>
              Ver albergues
            </button>
          </div>
        </div>

        <div
          className="hero-img-panel"
          style={{
            position: "relative",
            background: "var(--bark)",
            overflow: "hidden",
            minHeight: 400,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gridTemplateRows: "1fr 1fr",
              gap: 3,
            }}
          >
            <div style={{ gridRow: "1/3", overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&q=80"
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&q=80"
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ overflow: "hidden" }}>
              <img
                src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80"
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "rgba(61,43,31,0.85)",
              backdropFilter: "blur(8px)",
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
              padding: "1.25rem 1rem",
              gap: "0.5rem",
            }}
          >
            {[
              ["4,820", "Rescatados"],
              ["3,190", "Adoptados"],
              ["12", "Albergues"],
              ["840", "Voluntarios"],
            ].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.1rem,3vw,1.8rem)",
                    color: "var(--terra-light)",
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(245,240,232,0.65)",
                    marginTop: 2,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISIÓN ── */}
      <section className="section-pad" style={{ padding: "5rem 5rem", background: "var(--cream)" }}>
        <div
          className="mission-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          <div
            className="mission-img-wrap"
            style={{ borderRadius: 20, overflow: "hidden", aspectRatio: "4/3" }}
          >
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80"
              alt="Voluntarios"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div>
            <span className="section-tag">Nuestra misión</span>
            <h2 className="section-title">Construir un México donde ningún perro quede atrás</h2>
            <p className="section-lead">
              Rescate responsable, atención veterinaria y educación comunitaria.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                marginTop: "1.75rem",
              }}
            >
              {[
                ["1", "Rescate inmediato", "Equipos 24h para rescatar perros en riesgo."],
                [
                  "2",
                  "Rehabilitación",
                  "Vacunas, esterilización y socialización para cada animal.",
                ],
                [
                  "3",
                  "Adopción responsable",
                  "Familias verificadas con seguimiento post-adopción.",
                ],
                ["4", "Educación", "Talleres en escuelas para prevenir el abandono."],
              ].map(([n, t, d]) => (
                <div key={n} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      minWidth: 34,
                      borderRadius: "50%",
                      background: "var(--terracotta)",
                      color: "var(--warm-white)",
                      fontFamily: "var(--font-display)",
                      fontSize: "0.85rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {n}
                  </div>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        color: "var(--bark)",
                        marginBottom: "0.2rem",
                      }}
                    >
                      {t}
                    </h4>
                    <p
                      style={{ fontSize: "0.85rem", color: "var(--bark-light)", lineHeight: 1.55 }}
                    >
                      {d}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CARRUSEL ALBERGUES ── */}
      <section className="section-pad" style={{ padding: "5rem 5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <span className="section-tag">Red de albergues</span>
            <h2 className="section-title">Nuestros refugios activos</h2>
          </div>
          <button
            className="btn-outline"
            onClick={() => navigate("/albergues")}
            style={{ whiteSpace: "nowrap" }}
          >
            Ver todos →
          </button>
        </div>
        <Carousel
          items={albergues}
          renderCard={(a) => (
            <div
              className="card"
              onClick={() => navigate(`/albergues/${a.id}`)}
              style={{
                cursor: "pointer",
                background: "var(--warm-white)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--gray-light)",
                overflow: "hidden",
              }}
            >
              <div style={{ height: 170, overflow: "hidden" }}>
                <img
                  src={a.imagen}
                  alt={a.nombre}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "1.1rem 1.25rem" }}>
                <div
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--sage)",
                    fontWeight: 500,
                    marginBottom: "0.4rem",
                  }}
                >
                  {a.alcaldia}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    color: "var(--bark)",
                    marginBottom: "0.35rem",
                  }}
                >
                  {a.nombre}
                </h3>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--bark-light)",
                    lineHeight: 1.5,
                    marginBottom: "0.75rem",
                  }}
                >
                  {a.descripcion}
                </p>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--gray)",
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span>
                    🐕 {a.perros_actuales}/{a.capacidad}
                  </span>
                  <span style={{ color: a.status === "open" ? "var(--sage)" : "var(--gold)" }}>
                    {a.status === "open" ? "✅ Abierto" : "⚠️ Casi lleno"}
                  </span>
                </div>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── CARRUSEL NOTICIAS ── */}
      <section className="section-pad" style={{ padding: "5rem 5rem", background: "var(--cream)" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <span className="section-tag">Últimas noticias</span>
            <h2 className="section-title">Lo que está pasando</h2>
          </div>
          <button
            className="btn-outline"
            onClick={() => navigate("/noticias")}
            style={{ whiteSpace: "nowrap" }}
          >
            Ver todas →
          </button>
        </div>
        <Carousel
          items={noticias}
          renderCard={(n) => (
            <div
              className="card"
              style={{
                background: "var(--warm-white)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--gray-light)",
                overflow: "hidden",
              }}
            >
              <div style={{ height: 170, overflow: "hidden" }}>
                <img
                  src={n.imagen}
                  alt={n.titulo}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: "1.1rem 1.25rem" }}>
                <div
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--terracotta)",
                    fontWeight: 500,
                    marginBottom: "0.4rem",
                  }}
                >
                  {n.tipo === "announce"
                    ? "📢 Anuncio"
                    : n.tipo === "success"
                      ? "🏆 Logro"
                      : "📰 Noticia"}{" "}
                  ·{" "}
                  {new Date(n.published_at).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
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
                  {n.resumen}
                </p>
              </div>
            </div>
          )}
        />
      </section>

      {/* ── CTA DONACIÓN ── */}
      <section
        id="donate-section"
        className="cta-grid"
        style={{
          background: "var(--bark)",
          padding: "6rem 5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "start",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.72rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--terra-light)",
              fontWeight: 500,
              display: "block",
              marginBottom: "0.75rem",
            }}
          >
            Haz la diferencia hoy
          </span>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem,3vw,3rem)",
              color: "var(--cream)",
              lineHeight: 1.15,
              marginBottom: "1rem",
            }}
          >
            Tu donación alimenta,
            <br />
            cura y salva vidas
          </h2>
          <p
            style={{
              fontSize: "clamp(0.88rem,1.5vw,1rem)",
              color: "rgba(245,240,232,0.65)",
              lineHeight: 1.7,
              marginBottom: "1.75rem",
            }}
          >
            Con $200 pesos alimentamos a un perro durante un mes. Con $500 cubrimos una vacuna
            completa.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              fontSize: "0.88rem",
              color: "rgba(245,240,232,0.6)",
            }}
          >
            <span>🔒 Pago seguro vía Conekta (tarjeta o OXXO)</span>
            <span>📋 Recibo fiscal disponible</span>
            <span>📊 Transparencia total: reportes mensuales</span>
          </div>
        </div>
        {/* FIX: el formulario no se desborda en móvil */}
        <div
          style={{
            background: "var(--cream)",
            borderRadius: 20,
            padding: "2rem",
            minWidth: 0,
            width: "100%",
          }}
        >
          <DonationForm />
        </div>
      </section>
    </div>
  );
}
