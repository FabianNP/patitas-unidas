import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { createAlbergue, resolverSolicitud } from "../../lib/supabase";
import { CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";

export default function SolicitudesTab() {
  const [items, setItems] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [nota, setNota] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");

    // Query directa sin join — evita problemas de RLS en perfiles
    const { data, error: err } = await supabase
      .from("solicitudes_albergue")
      .select("*")
      .order("created_at", { ascending: false });

    console.log("solicitudes data:", data);
    console.log("solicitudes error:", err);

    if (err) {
      setError(`Error: ${err.message} (code: ${err.code})`);
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  async function aprobar(s) {
    setActing(s.id);
    const { data: nuevoAlbergue, error: errAlb } = await createAlbergue({
      nombre: s.nombre,
      alcaldia: s.alcaldia,
      direccion: s.direccion,
      descripcion: s.descripcion,
      capacidad: s.capacidad || 0,
      telefono: s.telefono,
      email: s.email_contacto,
      horario: s.horario,
      status: "open",
      admin_user_id: s.user_id,
    });

    if (errAlb) {
      console.error("Error creando albergue:", errAlb);
    }

    await resolverSolicitud(
      s.id,
      "aprobado",
      nota[s.id] || "¡Bienvenido a la red Patitas Unidas!",
      nuevoAlbergue?.id || null,
    );

    // Cambiar rol del usuario a 'albergue'
    await supabase
      .from("perfiles")
      .update({ rol: "albergue", updated_at: new Date().toISOString() })
      .eq("id", s.user_id);

    setActing(null);
    load();
  }

  async function rechazar(id) {
    if (!nota[id]) {
      alert("Escribe una nota explicando el motivo del rechazo.");
      return;
    }
    setActing(id);
    await resolverSolicitud(id, "rechazado", nota[id]);
    setActing(null);
    load();
  }

  const STATUS_STYLE = {
    pendiente: {
      bg: "var(--gold-pale)",
      color: "var(--gold)",
      icon: <Clock size={14} />,
      label: "Pendiente",
    },
    aprobado: {
      bg: "var(--sage-pale)",
      color: "var(--sage)",
      icon: <CheckCircle size={14} />,
      label: "Aprobado",
    },
    rechazado: { bg: "#FCEBEB", color: "#A32D2D", icon: <XCircle size={14} />, label: "Rechazado" },
  };

  const pendientes = items.filter((i) => i.status === "pendiente").length;

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h2
            style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--bark)" }}
          >
            Solicitudes de albergues
          </h2>
          {pendientes > 0 && (
            <p style={{ fontSize: "0.85rem", color: "var(--terracotta)", marginTop: "0.25rem" }}>
              ⚠️ {pendientes} solicitud{pendientes > 1 ? "es" : ""} pendiente
              {pendientes > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={load}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 1rem",
            border: "1px solid var(--gray-light)",
            borderRadius: "99px",
            background: "transparent",
            fontSize: "0.82rem",
            color: "var(--bark-light)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#FCEBEB",
            color: "#A32D2D",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            marginBottom: "1rem",
            fontSize: "0.85rem",
          }}
        >
          {error}
          <br />
          <small>Revisa la consola del navegador (F12) para más detalles.</small>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <p style={{ color: "var(--gray)", fontStyle: "italic", fontSize: "0.9rem" }}>
          Cargando solicitudes…
        </p>
      )}

      {/* Empty */}
      {!loading && !error && items.length === 0 && (
        <div
          style={{
            background: "var(--cream)",
            borderRadius: "var(--radius-lg)",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
          <p style={{ color: "var(--bark-light)", fontSize: "0.9rem" }}>No hay solicitudes aún.</p>
        </div>
      )}

      {/* Lista */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((s) => {
          const st = STATUS_STYLE[s.status] || STATUS_STYLE.pendiente;
          const isOpen = expanded === s.id;

          return (
            <div
              key={s.id}
              style={{
                background: "var(--warm-white)",
                borderRadius: "var(--radius-lg)",
                border: `1.5px solid ${s.status === "pendiente" ? "var(--gold)" : "var(--gray-light)"}`,
                overflow: "hidden",
              }}
            >
              {/* Row header */}
              <div
                style={{
                  padding: "1.25rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  cursor: "pointer",
                  flexWrap: "wrap",
                }}
                onClick={() => setExpanded(isOpen ? null : s.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      flexWrap: "wrap",
                      marginBottom: "0.2rem",
                    }}
                  >
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "1.05rem",
                        color: "var(--bark)",
                      }}
                    >
                      {s.nombre}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "0.2rem 0.6rem",
                        borderRadius: "99px",
                        background: st.bg,
                        color: st.color,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      {st.icon} {st.label}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "var(--bark-light)" }}>
                    {s.alcaldia} · {s.responsable} ·{" "}
                    {new Date(s.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronUp size={18} color="var(--gray)" />
                ) : (
                  <ChevronDown size={18} color="var(--gray)" />
                )}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: "1px solid var(--gray-light)", padding: "1.5rem" }}>
                  {/* Info grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                      gap: "0.85rem",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {[
                      ["Responsable", s.responsable],
                      ["Teléfono", s.telefono],
                      ["Email", s.email_contacto],
                      ["Dirección", s.direccion],
                      ["Capacidad", s.capacidad ? `${s.capacidad} perros` : "—"],
                      ["Horario", s.horario],
                      ["Experiencia", s.experiencia],
                    ].map(
                      ([l, v]) =>
                        v && (
                          <div key={l}>
                            <div
                              style={{
                                fontSize: "0.68rem",
                                color: "var(--gray)",
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: "0.2rem",
                              }}
                            >
                              {l}
                            </div>
                            <div style={{ fontSize: "0.88rem", color: "var(--bark)" }}>{v}</div>
                          </div>
                        ),
                    )}
                  </div>

                  {/* Descripción */}
                  {s.descripcion && (
                    <div
                      style={{
                        background: "var(--cream)",
                        borderRadius: "var(--radius-md)",
                        padding: "0.85rem 1rem",
                        marginBottom: "1.25rem",
                        fontSize: "0.85rem",
                        color: "var(--bark-light)",
                        lineHeight: 1.6,
                      }}
                    >
                      <strong style={{ color: "var(--bark)" }}>Descripción:</strong>
                      <br />
                      {s.descripcion}
                    </div>
                  )}

                  {/* Nota admin si ya fue resuelto */}
                  {s.nota_admin && (
                    <div
                      style={{
                        background: s.status === "aprobado" ? "var(--sage-pale)" : "#FCEBEB",
                        borderRadius: "var(--radius-md)",
                        padding: "0.85rem 1rem",
                        marginBottom: "1.25rem",
                        fontSize: "0.85rem",
                        color: s.status === "aprobado" ? "var(--sage)" : "#A32D2D",
                      }}
                    >
                      <strong>Nota:</strong> {s.nota_admin}
                    </div>
                  )}

                  {/* Acciones si está pendiente */}
                  {s.status === "pendiente" && (
                    <div>
                      <label
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--bark-light)",
                          display: "block",
                          marginBottom: "0.4rem",
                          fontWeight: 500,
                        }}
                      >
                        Nota para el solicitante (recomendado)
                      </label>
                      <textarea
                        value={nota[s.id] || ""}
                        onChange={(e) => setNota((n) => ({ ...n, [s.id]: e.target.value }))}
                        placeholder="Ej: Aprobado, agendaremos visita la próxima semana. / No cumple con el espacio mínimo requerido."
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1.5px solid var(--gray-light)",
                          borderRadius: 8,
                          fontSize: "0.85rem",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "var(--font-body)",
                          color: "var(--bark)",
                          marginBottom: "1rem",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
                      />
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          onClick={() => aprobar(s)}
                          disabled={acting === s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.65rem 1.25rem",
                            background: "var(--sage)",
                            color: "white",
                            border: "none",
                            borderRadius: 10,
                            fontSize: "0.88rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "var(--font-body)",
                            opacity: acting === s.id ? 0.7 : 1,
                          }}
                        >
                          <CheckCircle size={15} />{" "}
                          {acting === s.id ? "Procesando…" : "Aprobar albergue"}
                        </button>
                        <button
                          onClick={() => rechazar(s.id)}
                          disabled={acting === s.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.65rem 1.25rem",
                            background: "#A32D2D",
                            color: "white",
                            border: "none",
                            borderRadius: 10,
                            fontSize: "0.88rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "var(--font-body)",
                            opacity: acting === s.id ? 0.7 : 1,
                          }}
                        >
                          <XCircle size={15} /> Rechazar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
