import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  updatePerfil,
  uploadAvatar,
  getMisDonaciones,
  getMisSuscripciones,
  getMetodosPago,
  addMetodoPago,
  deleteMetodoPago,
  cancelarSuscripcion,
} from "../../lib/supabase";
import {
  User,
  CreditCard,
  Heart,
  Bell,
  Camera,
  Trash2,
  Check,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

const TABS = [
  ["perfil", "Perfil", User],
  ["donaciones", "Donaciones", Heart],
  ["suscripciones", "Suscripciones", Bell],
  ["pagos", "Métodos de pago", CreditCard],
];

/* ── Pestaña Perfil ── */
function TabPerfil({ user, perfil, refreshPerfil }) {
  const [form, setForm] = useState({
    nombre: perfil?.nombre || "",
    apellido: perfil?.apellido || "",
  });
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(perfil?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setOk(false);
    let avatar_url = perfil?.avatar_url;
    if (avatarFile) {
      const { url } = await uploadAvatar(user.id, avatarFile);
      if (url) avatar_url = url;
    }
    await updatePerfil(user.id, { ...form, avatar_url });
    await refreshPerfil();
    setSaving(false);
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  }

  const initials =
    ((form.nombre[0] || "") + (form.apellido[0] || "")).toUpperCase() ||
    (user?.email[0] || "U").toUpperCase();

  return (
    <form onSubmit={handleSave}>
      <h2 style={h2s}>Mi perfil</h2>
      {/* Avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--terra-pale)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.6rem",
              fontFamily: "var(--font-display)",
              color: "var(--terracotta)",
              border: "3px solid var(--warm-white)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "var(--terracotta)",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Camera size={12} color="white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) {
                setAvatarFile(f);
                setAvatarPreview(URL.createObjectURL(f));
              }
            }}
          />
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--bark)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {form.nombre || user?.email}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--bark-light)",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user?.email}
          </p>
          {avatarFile && (
            <p style={{ fontSize: "0.72rem", color: "var(--sage)", marginTop: "0.2rem" }}>
              ✓ Nueva foto lista
            </p>
          )}
        </div>
      </div>
      {/* Campos — colapsa a 1 col en móvil */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        {[
          ["nombre", "Nombre", "Tu nombre"],
          ["apellido", "Apellido", "Tu apellido"],
        ].map(([k, label, ph]) => (
          <div key={k}>
            <label style={ls}>{label}</label>
            <input
              value={form[k]}
              onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
              placeholder={ph}
              style={is}
              onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
            />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={ls}>Correo electrónico</label>
        <input
          value={user?.email}
          disabled
          style={{ ...is, background: "var(--cream)", color: "var(--gray)" }}
        />
        <p style={{ fontSize: "0.7rem", color: "var(--gray)", marginTop: "0.3rem" }}>
          El correo no se puede cambiar desde aquí.
        </p>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary"
          style={{ borderRadius: 10 }}
        >
          <Check size={15} /> {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {ok && (
          <span
            style={{
              fontSize: "0.85rem",
              color: "var(--sage)",
              display: "flex",
              gap: "0.3rem",
              alignItems: "center",
            }}
          >
            <CheckCircle size={14} />
            Guardado
          </span>
        )}
      </div>
    </form>
  );
}

/* ── Pestaña Donaciones ── */
function TabDonaciones({ userId }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    getMisDonaciones(userId).then(({ data }) => setItems(data || []));
  }, [userId]);
  const total = items.filter((d) => d.status === "paid").reduce((s, d) => s + Number(d.monto), 0);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <h2 style={h2s}>Mis donaciones</h2>
        <div
          style={{
            background: "var(--terra-pale)",
            borderRadius: "var(--radius-md)",
            padding: "0.5rem 1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              color: "var(--terracotta)",
            }}
          >
            ${total.toLocaleString("es-MX")}
          </div>
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--bark-light)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Total donado
          </div>
        </div>
      </div>
      {items.length === 0 && (
        <p style={{ color: "var(--gray)", fontStyle: "italic", fontSize: "0.9rem" }}>
          Aún no tienes donaciones. ¡Cada peso cuenta! 🐾
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((d) => (
          <div
            key={d.id}
            style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.88rem",
                  color: "var(--bark)",
                  fontWeight: 500,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {d.albergues?.nombre || "Patitas Unidas"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--bark-light)", marginTop: "0.2rem" }}>
                {d.metodo === "card" ? "💳" : "🏪"}{" "}
                {d.frecuencia === "once"
                  ? "Una vez"
                  : d.frecuencia === "monthly"
                    ? "Mensual"
                    : "Anual"}{" "}
                ·{" "}
                {d.created_at
                  ? new Date(d.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1rem",
                  color: "var(--terracotta)",
                }}
              >
                ${Number(d.monto).toLocaleString("es-MX")}
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "99px",
                  background: d.status === "paid" ? "var(--sage-pale)" : "var(--gold-pale)",
                  color: d.status === "paid" ? "var(--sage)" : "var(--gold)",
                  fontWeight: 600,
                }}
              >
                {d.status === "paid" ? "✓ Pagado" : "⏳ Pendiente"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pestaña Suscripciones ── */
function TabSuscripciones({ userId }) {
  const [items, setItems] = useState([]);
  const [cancelling, setCancelling] = useState(null);
  useEffect(() => {
    getMisSuscripciones(userId).then(({ data }) => setItems(data || []));
  }, [userId]);

  async function cancelar(id) {
    if (!confirm("¿Cancelar esta suscripción?")) return;
    setCancelling(id);
    await cancelarSuscripcion(id);
    setItems((items) => items.map((i) => (i.id === id ? { ...i, status: "cancelled" } : i)));
    setCancelling(null);
  }

  return (
    <div>
      <h2 style={h2s}>Mis suscripciones</h2>
      {items.filter((i) => i.status === "active").length === 0 && (
        <p
          style={{
            color: "var(--gray)",
            fontStyle: "italic",
            fontSize: "0.9rem",
            marginBottom: "1rem",
          }}
        >
          No tienes suscripciones activas. 🐾
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {items.map((s) => (
          <div
            key={s.id}
            style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-lg)",
              padding: "1.1rem 1.25rem",
              border: `1.5px solid ${s.status === "active" ? "var(--sage-pale)" : "var(--gray-light)"}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      color: "var(--bark)",
                    }}
                  >
                    {s.albergues?.nombre || "Patitas Unidas"}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "99px",
                      background: s.status === "active" ? "var(--sage-pale)" : "var(--gray-light)",
                      color: s.status === "active" ? "var(--sage)" : "var(--gray)",
                      fontWeight: 600,
                    }}
                  >
                    {s.status === "active"
                      ? "Activa"
                      : s.status === "paused"
                        ? "Pausada"
                        : "Cancelada"}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--bark-light)" }}>
                  ${Number(s.monto).toLocaleString("es-MX")} ·{" "}
                  {s.frecuencia === "monthly" ? "mensual" : "anual"}
                  {s.proximo_cobro &&
                    ` · próximo: ${new Date(s.proximo_cobro).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}`}
                </div>
              </div>
              {s.status === "active" && (
                <button
                  onClick={() => cancelar(s.id)}
                  disabled={cancelling === s.id}
                  style={{
                    fontSize: "0.78rem",
                    color: "#A32D2D",
                    background: "none",
                    border: "1px solid #F7C1C1",
                    borderRadius: "99px",
                    padding: "0.3rem 0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "var(--font-body)",
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={12} /> {cancelling === s.id ? "…" : "Cancelar"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Pestaña Métodos de pago ── */
function TabPagos({ userId }) {
  const [metodos, setMetodos] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ numero: "", nombre: "", mes: "", anio: "", cvc: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    getMetodosPago(userId).then(({ data }) => setMetodos(data || []));
  }, [userId]);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    const { error } = await addMetodoPago({
      user_id: userId,
      tipo: "card",
      ultimos4: form.numero.slice(-4),
      marca: form.numero.startsWith("4") ? "visa" : "mastercard",
      conekta_source_id: "src_mock_" + Date.now(),
      es_principal: metodos.length === 0,
    });
    setSaving(false);
    if (error) {
      setErr("Error al guardar la tarjeta.");
      return;
    }
    getMetodosPago(userId).then(({ data }) => setMetodos(data || []));
    setShowAdd(false);
    setForm({ numero: "", nombre: "", mes: "", anio: "", cvc: "" });
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <h2 style={h2s}>Métodos de pago</h2>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="btn-primary"
          style={{ borderRadius: 10, fontSize: "0.85rem", padding: "0.55rem 1rem" }}
        >
          <Plus size={14} /> Agregar
        </button>
      </div>
      {metodos.length === 0 && !showAdd && (
        <p style={{ color: "var(--gray)", fontStyle: "italic", fontSize: "0.9rem" }}>
          No tienes métodos de pago guardados.
        </p>
      )}
      <div
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1rem" }}
      >
        {metodos.map((m) => (
          <div
            key={m.id}
            style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-md)",
              padding: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: `1.5px solid ${m.es_principal ? "var(--terracotta)" : "var(--gray-light)"}`,
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.85rem", alignItems: "center" }}>
              <span style={{ fontSize: "1.6rem" }}>💳</span>
              <div>
                <div style={{ fontSize: "0.88rem", color: "var(--bark)", fontWeight: 500 }}>
                  {m.marca?.charAt(0).toUpperCase() + m.marca?.slice(1) || "Tarjeta"} ••••{" "}
                  {m.ultimos4}
                  {m.es_principal && (
                    <span
                      style={{
                        marginLeft: "0.4rem",
                        fontSize: "0.68rem",
                        background: "var(--terra-pale)",
                        color: "var(--terracotta)",
                        padding: "0.1rem 0.45rem",
                        borderRadius: "99px",
                        fontWeight: 600,
                      }}
                    >
                      Principal
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--bark-light)" }}>
                  {new Date(m.created_at).toLocaleDateString("es-MX", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                deleteMetodoPago(m.id).then(() =>
                  setMetodos((ms) => ms.filter((x) => x.id !== m.id)),
                )
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--gray)",
                display: "flex",
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      {showAdd && (
        <div
          style={{
            background: "var(--cream)",
            borderRadius: "var(--radius-lg)",
            padding: "1.25rem",
            border: "1.5px solid var(--gray-light)",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--bark)",
              marginBottom: "1rem",
            }}
          >
            Nueva tarjeta
          </h3>
          {err && (
            <div
              style={{
                color: "#A32D2D",
                background: "#FCEBEB",
                borderRadius: 8,
                padding: "0.6rem 0.85rem",
                fontSize: "0.82rem",
                marginBottom: "0.85rem",
                display: "flex",
                gap: "0.4rem",
                alignItems: "center",
              }}
            >
              <AlertCircle size={14} />
              {err}
            </div>
          )}
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={ls}>Número de tarjeta</label>
              <input
                placeholder="1234 5678 9012 3456"
                value={form.numero}
                onChange={(e) =>
                  setForm((f) => ({ ...f, numero: e.target.value.replace(/\D/g, "").slice(0, 16) }))
                }
                required
                style={is}
                onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
              />
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={ls}>Nombre en la tarjeta</label>
              <input
                placeholder="Como aparece en la tarjeta"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                required
                style={is}
                onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "0.6rem",
                marginBottom: "1rem",
              }}
            >
              {[
                ["mes", "MM", 2],
                ["anio", "AAAA", 4],
                ["cvc", "CVC", 4],
              ].map(([k, ph, max]) => (
                <div key={k}>
                  <label style={ls}>{ph}</label>
                  <input
                    placeholder={ph}
                    value={form[k]}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        [k]: e.target.value.replace(/\D/g, "").slice(0, max),
                      }))
                    }
                    required
                    style={is}
                    onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
                  />
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.7rem", color: "var(--gray)", marginBottom: "0.85rem" }}>
              🔒 Tokenizado de forma segura vía Conekta.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
                style={{ borderRadius: 10 }}
              >
                {saving ? "Guardando…" : "Guardar tarjeta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ── Página principal ── */
export default function PerfilUsuario() {
  const { user, perfil, refreshPerfil } = useAuth();
  const [tab, setTab] = useState("perfil");

  if (!user) return null;

  const initials =
    ((perfil?.nombre?.[0] || "") + (perfil?.apellido?.[0] || "")).toUpperCase() ||
    user.email[0].toUpperCase();

  return (
    <div
      style={{ paddingTop: "var(--nav-height)", minHeight: "100vh", background: "var(--cream)" }}
    >
      {/* Layout: sidebar izquierda + contenido — apila en móvil */}
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "1.5rem",
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="perfil-layout"
      >
        {/* Sidebar — en móvil se convierte en tabs horizontales */}
        <aside
          style={{
            background: "var(--warm-white)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--gray-light)",
            padding: "1.25rem",
            position: "sticky",
            top: "calc(var(--nav-height) + 1rem)",
          }}
          className="perfil-sidebar"
        >
          {/* Avatar info */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "1.25rem",
              paddingBottom: "1.25rem",
              borderBottom: "1px solid var(--gray-light)",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--terra-pale)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.3rem",
                fontFamily: "var(--font-display)",
                color: "var(--terracotta)",
                margin: "0 auto 0.5rem",
                overflow: "hidden",
              }}
            >
              {perfil?.avatar_url ? (
                <img
                  src={perfil.avatar_url}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                color: "var(--bark)",
                marginBottom: "0.1rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {perfil?.nombre || user.email.split("@")[0]}
            </p>
            <p
              style={{
                fontSize: "0.68rem",
                color: "var(--bark-light)",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.email}
            </p>
          </div>
          {/* Nav links */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
            className="perfil-nav-desktop"
          >
            {TABS.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.65rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  border: "none",
                  background: tab === id ? "var(--terra-pale)" : "transparent",
                  color: tab === id ? "var(--terracotta)" : "var(--bark-light)",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-body)",
                }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Contenido */}
        <div
          style={{
            background: "var(--warm-white)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--gray-light)",
            padding: "1.5rem",
            minWidth: 0,
          }}
        >
          {/* Tabs horizontales en móvil */}
          <div
            className="perfil-tabs-mobile"
            style={{
              display: "none",
              overflowX: "auto",
              gap: "0.25rem",
              marginBottom: "1.5rem",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--gray-light)",
            }}
          >
            {TABS.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  whiteSpace: "nowrap",
                  padding: "0.5rem 0.9rem",
                  borderRadius: "99px",
                  border: "none",
                  cursor: "pointer",
                  background: tab === id ? "var(--terracotta)" : "var(--cream)",
                  color: tab === id ? "var(--warm-white)" : "var(--bark-light)",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-body)",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          {tab === "perfil" && (
            <TabPerfil user={user} perfil={perfil} refreshPerfil={refreshPerfil} />
          )}
          {tab === "donaciones" && <TabDonaciones userId={user.id} />}
          {tab === "suscripciones" && <TabSuscripciones userId={user.id} />}
          {tab === "pagos" && <TabPagos userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

const h2s = {
  fontFamily: "var(--font-display)",
  fontSize: "1.3rem",
  color: "var(--bark)",
  marginBottom: "1.25rem",
};
const ls = {
  fontSize: "0.8rem",
  color: "var(--bark-light)",
  display: "block",
  marginBottom: "0.35rem",
  fontWeight: 500,
};
const is = {
  width: "100%",
  padding: "0.7rem",
  border: "1.5px solid var(--gray-light)",
  borderRadius: 8,
  fontSize: "0.9rem",
  outline: "none",
  background: "var(--warm-white)",
  color: "var(--bark)",
  fontFamily: "var(--font-body)",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};
