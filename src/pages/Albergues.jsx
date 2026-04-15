import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAlbergues } from "../lib/supabase";
import { MapPin, Users, Heart } from "lucide-react";

const MOCK = [
  {
    id: 1,
    nombre: "Casa Bigotes",
    alcaldia: "Iztapalapa",
    descripcion: "Albergue familiar especializado en perros adultos y razas grandes.",
    perros_actuales: 68,
    capacidad: 80,
    adoptados_mes: 24,
    status: "open",
    imagen: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80",
    lat: 19.3571,
    lng: -99.0626,
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
    imagen: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&q=80",
    lat: 19.3467,
    lng: -99.1617,
  },
  {
    id: 3,
    nombre: "Patitas Libre",
    alcaldia: "Tlalpan",
    descripcion: "El mayor refugio de la red, 5,000 m² de área verde.",
    perros_actuales: 110,
    capacidad: 120,
    adoptados_mes: 31,
    status: "full",
    imagen: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&q=80",
    lat: 19.2938,
    lng: -99.1635,
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
    imagen: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?w=600&q=80",
    lat: 19.4888,
    lng: -99.1846,
  },
  {
    id: 5,
    nombre: "Amigos del Sur",
    alcaldia: "Xochimilco",
    descripcion: "Refugio con huerto orgánico y terapia asistida.",
    perros_actuales: 55,
    capacidad: 70,
    adoptados_mes: 19,
    status: "open",
    imagen: "https://images.unsplash.com/photo-1534361960057-19f4434a4428?w=600&q=80",
    lat: 19.2649,
    lng: -99.103,
  },
  {
    id: 6,
    nombre: "Patas al Norte",
    alcaldia: "Gustavo A. Madero",
    descripcion: "Mayor índice de adopción de la red.",
    perros_actuales: 48,
    capacidad: 65,
    adoptados_mes: 37,
    status: "open",
    imagen: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80",
    lat: 19.493,
    lng: -99.1108,
  },
];

function LeafletMap({ albergues, onNavigate }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markersRef = useRef({});
  const alberguesRef = useRef(albergues);
  const navigateRef = useRef(onNavigate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    alberguesRef.current = albergues;
  }, [albergues]);
  useEffect(() => {
    navigateRef.current = onNavigate;
  }, [onNavigate]);

  // Load Leaflet once
  useEffect(() => {
    if (document.getElementById("leaflet-css")) {
      setReady(!!window.L);
      return;
    }
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  // Init map
  useEffect(() => {
    if (!ready || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { center: [19.39, -99.13], zoom: 11, zoomControl: true });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution:
        '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);
    leafletMap.current = map;
  }, [ready]);

  // Place markers with popup containing "Ver albergue" button
  useEffect(() => {
    if (!ready || !leafletMap.current) return;
    const list = alberguesRef.current;
    if (!Array.isArray(list) || list.length === 0) return;
    const L = window.L;
    const map = leafletMap.current;

    Object.values(markersRef.current).forEach((m) => {
      try {
        m.remove();
      } catch (_) {}
    });
    markersRef.current = {};

    list.forEach((a) => {
      if (a.lat == null || a.lng == null) return;
      const color = a.status === "open" ? "#C4622D" : "#C8952A";
      const svgPin = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52"><path d="M20 2C11.2 2 4 9.2 4 18c0 11.7 16 32 16 32s16-20.3 16-32C36 9.2 28.8 2 20 2z" fill="${color}" stroke="white" stroke-width="2"/><text x="20" y="20" text-anchor="middle" font-size="14" fill="white" dominant-baseline="middle">🐾</text></svg>`;
      const icon = L.divIcon({
        html: svgPin,
        className: "",
        iconSize: [40, 52],
        iconAnchor: [20, 52],
        popupAnchor: [0, -56],
      });
      const pct = a.capacidad ? Math.round((a.perros_actuales / a.capacidad) * 100) : 0;
      const barColor = pct > 85 ? "#C8952A" : color;

      // Popup HTML — botón "Ver albergue" usa data-id para navegar
      const popupContent = `
        <div style="font-family:system-ui,sans-serif;width:200px">
          <img src="${a.imagen}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;display:block"/>
          <strong style="font-size:14px;color:#3D2B1F;display:block;margin-bottom:2px">${a.nombre}</strong>
          <span style="font-size:11px;color:${color};font-weight:600;text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:6px">${a.alcaldia}</span>
          <div style="background:#E8DDD0;border-radius:99px;height:5px;overflow:hidden;margin-bottom:5px">
            <div style="width:${pct}%;height:100%;background:${barColor};border-radius:99px"></div>
          </div>
          <span style="font-size:11px;color:#6B4C3B;display:block;margin-bottom:10px">🐕 ${a.perros_actuales}/${a.capacidad} · 🏠 ${a.adoptados_mes}/mes</span>
          <button
            data-id="${a.id}"
            onclick="window.__patitasNavigate(${a.id})"
            style="width:100%;padding:8px;background:#C4622D;color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:system-ui,sans-serif">
            Ver albergue →
          </button>
        </div>`;

      const popup = L.popup({
        maxWidth: 220,
        className: "patitas-popup",
        closeButton: true,
      }).setContent(popupContent);
      const marker = L.marker([Number(a.lat), Number(a.lng)], { icon })
        .addTo(map)
        .bindPopup(popup);
      markersRef.current[a.id] = marker;
    });

    // Global function for popup button clicks (Leaflet popups are raw HTML)
    window.__patitasNavigate = (id) => {
      navigateRef.current(id);
    };

    return () => {
      delete window.__patitasNavigate;
    };
  }, [ready, albergues]);

  return (
    <div
      style={{
        position: "relative",
        height: "clamp(300px,45vw,480px)",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "var(--cream)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "0.75rem",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>🗺️</div>
          <p style={{ color: "var(--bark-light)", fontSize: "0.9rem" }}>Cargando mapa…</p>
        </div>
      )}
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <style>{`
        .patitas-popup .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(61,43,31,0.2) !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .patitas-popup .leaflet-popup-content {
          margin: 12px 12px 12px 12px !important;
        }
        .patitas-popup .leaflet-popup-tip { background: white !important; }
        .leaflet-control-attribution { font-size: 9px !important; }
      `}</style>
    </div>
  );
}

export default function Albergues() {
  const navigate = useNavigate();
  const [albergues, setAlbergues] = useState(MOCK);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getAlbergues().then(({ data }) => {
      if (Array.isArray(data) && data.length > 0) setAlbergues(data);
    });
  }, []);

  const handleNavigate = useCallback(
    (id) => {
      navigate(`/albergues/${id}`);
    },
    [navigate],
  );

  const filtered = filter === "all" ? albergues : albergues.filter((a) => a.status === filter);

  return (
    <div style={{ overflowX: "hidden", width: "100%" }}>
      <div className="page-hero">
        <span className="section-tag">Nuestra red</span>
        <h1 className="section-title">Albergues Patitas Unidas</h1>
        <p className="section-lead">
          {albergues.length} refugios en la CDMX. Toca un pin para ver detalles.
        </p>
      </div>

      {/* Mapa — sin tarjeta flotante, el popup tiene el botón */}
      <div style={{ background: "var(--bark)" }}>
        <LeafletMap albergues={albergues} onNavigate={handleNavigate} />
      </div>

      {/* Stats */}
      <div
        style={{
          background: "var(--bark)",
          padding: "1rem 1.5rem 1.75rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {[
          ["🐕", albergues.reduce((s, a) => s + Number(a.perros_actuales || 0), 0), "En refugio"],
          ["🏠", albergues.reduce((s, a) => s + Number(a.adoptados_mes || 0), 0), "Adoptados/mes"],
          ["🏡", albergues.length, "Albergues"],
          ["❤️", albergues.reduce((s, a) => s + Number(a.capacidad || 0), 0), "Capacidad"],
        ].map(([icon, val, label]) => (
          <div key={label} style={{ textAlign: "center", minWidth: 70 }}>
            <div style={{ fontSize: "1.2rem" }}>{icon}</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.2rem,3vw,1.7rem)",
                color: "var(--terra-light)",
                lineHeight: 1.1,
              }}
            >
              {val}
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(245,240,232,0.5)",
                marginTop: 2,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div
        style={{
          padding: "1.5rem 1.5rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--gray)" }}>Filtrar:</span>
        {[
          ["all", "Todos"],
          ["open", "Abiertos"],
          ["full", "Casi llenos"],
        ].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: "0.35rem 0.9rem",
              borderRadius: "99px",
              border: "1px solid var(--gray-light)",
              background: filter === val ? "var(--bark)" : "transparent",
              color: filter === val ? "var(--warm-white)" : "var(--bark-light)",
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-body)",
            }}
          >
            {label}
          </button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--gray)" }}>
          {filtered.length} albergue{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <div
        style={{
          padding: "0 1.5rem 4rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))",
          gap: "1.25rem",
        }}
      >
        {filtered.map((a) => {
          const pct = a.capacidad ? Math.round((a.perros_actuales / a.capacidad) * 100) : 0;
          return (
            <div
              key={a.id}
              onClick={() => navigate(`/albergues/${a.id}`)}
              style={{
                background: "var(--warm-white)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--gray-light)",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all var(--transition)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ height: 180, overflow: "hidden", position: "relative" }}>
                <img
                  src={a.imagen}
                  alt={a.nombre}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: "rgba(61,43,31,0.75)",
                    backdropFilter: "blur(4px)",
                    borderRadius: "99px",
                    padding: "0.2rem 0.55rem",
                    fontSize: "0.65rem",
                    color: "var(--terra-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <MapPin size={10} /> {a.alcaldia}
                </div>
              </div>
              <div style={{ padding: "1.1rem 1.25rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.4rem",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.05rem",
                      color: "var(--bark)",
                      lineHeight: 1.2,
                    }}
                  >
                    {a.nombre}
                  </h3>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      background: a.status === "open" ? "var(--sage-pale)" : "var(--gold-pale)",
                      color: a.status === "open" ? "var(--sage)" : "var(--gold)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "99px",
                      fontWeight: 600,
                      marginLeft: "0.4rem",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {a.status === "open" ? "Abierto" : "Casi lleno"}
                  </span>
                </div>
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
                <div style={{ marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.68rem",
                      color: "var(--gray)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span>Ocupación</span>
                    <span
                      style={{
                        color: pct > 85 ? "var(--gold)" : "var(--bark-light)",
                        fontWeight: 500,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      background: "var(--gray-light)",
                      borderRadius: "99px",
                      height: 5,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: pct > 85 ? "var(--gold)" : "var(--terracotta)",
                        borderRadius: "99px",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--gray-light)",
                  }}
                >
                  {[
                    [Users, `${a.perros_actuales}/${a.capacidad}`, "perros"],
                    [Heart, a.adoptados_mes, "adoptados"],
                  ].map(([Icon, val, label]) => (
                    <div
                      key={label}
                      style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
                    >
                      <Icon size={12} color="var(--terracotta)" />
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.95rem",
                          color: "var(--bark)",
                        }}
                      >
                        {val}
                      </span>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          color: "var(--gray)",
                          textTransform: "uppercase",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
