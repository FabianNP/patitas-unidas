import SolicitudesTab from "./SolicitudesTab";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  signOut,
  getAlbergues,
  createAlbergue,
  updateAlbergue,
  deleteAlbergue,
  getNoticias,
  createNoticia,
  updateNoticia,
  deleteNoticia,
  getGastos,
  createGasto,
  deleteGasto,
  getDonaciones,
  uploadImage,
} from "../../lib/supabase";
import {
  LogOut,
  Home,
  Building2,
  Newspaper,
  DollarSign,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Check,
  Upload,
  TrendingUp,
  Users,
  Heart,
} from "lucide-react";

const TABS = [
  { id: "solicitudes", label: "Solicitudes", icon: Users },
  { id: "overview", label: "Resumen", icon: TrendingUp },
  { id: "albergues", label: "Albergues", icon: Building2 },
  { id: "noticias", label: "Noticias", icon: Newspaper },
  { id: "gastos", label: "Gastos", icon: DollarSign },
  { id: "donaciones", label: "Donaciones", icon: Heart },
];

// ── Generic Modal ──────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(61,43,31,0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--warm-white)",
          borderRadius: "var(--radius-xl)",
          padding: "2rem",
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          overflowX: "hidden",
          width: "calc(100vw - 2rem)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "var(--bark)" }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--gray)",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Form helpers ───────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label
      style={{
        fontSize: "0.8rem",
        color: "var(--bark-light)",
        display: "block",
        marginBottom: "0.4rem",
        fontWeight: 500,
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    style={{
      width: "100%",
      padding: "0.7rem",
      border: "1.5px solid var(--gray-light)",
      borderRadius: 8,
      fontSize: "0.9rem",
      outline: "none",
      background: "var(--warm-white)",
      color: "var(--bark)",
      ...props.style,
    }}
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    rows={3}
    style={{
      width: "100%",
      padding: "0.7rem",
      border: "1.5px solid var(--gray-light)",
      borderRadius: 8,
      fontSize: "0.9rem",
      outline: "none",
      background: "var(--warm-white)",
      color: "var(--bark)",
      resize: "vertical",
      ...props.style,
    }}
  />
);

const Select = ({ options, ...props }) => (
  <select
    {...props}
    style={{
      width: "100%",
      padding: "0.7rem",
      border: "1.5px solid var(--gray-light)",
      borderRadius: 8,
      fontSize: "0.9rem",
      outline: "none",
      background: "var(--warm-white)",
      color: "var(--bark)",
    }}
  >
    {options.map(([v, l]) => (
      <option key={v} value={v}>
        {l}
      </option>
    ))}
  </select>
);

// ── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ albergues, noticias, gastos, donaciones }) {
  const totalDonado = donaciones
    .filter((d) => d.status === "paid")
    .reduce((s, d) => s + Number(d.monto), 0);
  const totalGastado = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const totalPerros = albergues.reduce((s, a) => s + Number(a.perros_actuales || 0), 0);
  const totalAdoptados = albergues.reduce((s, a) => s + Number(a.adoptados_mes || 0), 0);

  const metrics = [
    {
      label: "Donado este año",
      value: `$${totalDonado.toLocaleString("es-MX")}`,
      icon: "💰",
      color: "var(--terracotta)",
    },
    {
      label: "Total gastado",
      value: `$${totalGastado.toLocaleString("es-MX")}`,
      icon: "📊",
      color: "var(--sage)",
    },
    { label: "Perros en red", value: totalPerros, icon: "🐕", color: "var(--gold)" },
    { label: "Adoptados este mes", value: totalAdoptados, icon: "🏠", color: "var(--bark-light)" },
    { label: "Albergues activos", value: albergues.length, icon: "🏡", color: "var(--terracotta)" },
    { label: "Noticias publicadas", value: noticias.length, icon: "📰", color: "var(--sage)" },
  ];

  return (
    <div>
      <h2 style={h2Style}>Panel de control</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "2rem" }}>{m.icon}</div>
            <div>
              <div
                style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: m.color }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--gray)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {m.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Últimas donaciones */}
      <div
        style={{ background: "var(--cream)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.1rem",
            color: "var(--bark)",
            marginBottom: "1rem",
          }}
        >
          Últimas donaciones
        </h3>
        {donaciones.slice(0, 6).map((d, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.6rem 0",
              borderBottom: i < 5 ? "1px solid var(--gray-light)" : "none",
              fontSize: "0.85rem",
            }}
          >
            <div>
              <span style={{ color: "var(--bark)", fontWeight: 500 }}>{d.nombre || "Anónimo"}</span>
              <span style={{ color: "var(--gray)", marginLeft: "0.5rem" }}>{d.email}</span>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--terracotta)",
                  fontSize: "1rem",
                }}
              >
                ${Number(d.monto).toLocaleString("es-MX")}
              </span>
              <span
                style={{
                  background: d.status === "paid" ? "var(--sage-pale)" : "var(--gold-pale)",
                  color: d.status === "paid" ? "var(--sage)" : "var(--gold)",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "99px",
                  fontSize: "0.7rem",
                }}
              >
                {d.status === "paid" ? "Pagado" : "Pendiente"}
              </span>
            </div>
          </div>
        ))}
        {donaciones.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "var(--gray)", fontStyle: "italic" }}>
            No hay donaciones registradas aún.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Albergues Tab ──────────────────────────────────────────────────────────
function AlberguesTab({ items, reload }) {
  const [modal, setModal] = useState(null); // null | 'create' | item
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);

  const open = (item = null) => {
    setForm(
      item
        ? { ...item, necesidades: (item.necesidades || []).join("\n") }
        : { status: "open", perros_actuales: 0, capacidad: 50, adoptados_mes: 0 },
    );
    setImgFile(null);
    setModal(item || "create");
  };

  const save = async () => {
    setSaving(true);
    let imagen = form.imagen || "";
    if (imgFile) {
      const { url } = await uploadImage(imgFile);
      if (url) imagen = url;
    }
    const payload = {
      ...form,
      imagen,
      necesidades:
        typeof form.necesidades === "string"
          ? form.necesidades.split("\n").filter(Boolean)
          : form.necesidades || [],
      perros_actuales: Number(form.perros_actuales || 0),
      capacidad: Number(form.capacidad || 0),
      adoptados_mes: Number(form.adoptados_mes || 0),
    };
    if (modal === "create") await createAlbergue(payload);
    else await updateAlbergue(modal.id, payload);
    setSaving(false);
    setModal(null);
    reload();
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar este albergue?")) return;
    await deleteAlbergue(id);
    reload();
  };

  return (
    <div>
      <div style={tabHeaderStyle}>
        <h2 style={h2Style}>Albergues</h2>
        <button className="btn-primary" onClick={() => open()}>
          <PlusCircle size={16} /> Nuevo albergue
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: "1rem",
        }}
      >
        {items.map((a) => (
          <div
            key={a.id}
            style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--gray-light)",
            }}
          >
            {a.imagen && (
              <div style={{ height: 140, overflow: "hidden" }}>
                <img
                  src={a.imagen}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div style={{ padding: "1.25rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "0.5rem",
                }}
              >
                <h4
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.05rem",
                    color: "var(--bark)",
                  }}
                >
                  {a.nombre}
                </h4>
                <span
                  style={{
                    fontSize: "0.7rem",
                    background: a.status === "open" ? "var(--sage-pale)" : "var(--gold-pale)",
                    color: a.status === "open" ? "var(--sage)" : "var(--gold)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "99px",
                    fontWeight: 500,
                  }}
                >
                  {a.status === "open" ? "Abierto" : "Casi lleno"}
                </span>
              </div>
              <p
                style={{ fontSize: "0.78rem", color: "var(--bark-light)", marginBottom: "0.5rem" }}
              >
                {a.alcaldia}
              </p>
              <p style={{ fontSize: "0.78rem", color: "var(--gray)" }}>
                {a.perros_actuales}/{a.capacidad} perros
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={() => open(a)} style={iconBtnStyle}>
                  <Pencil size={14} /> Editar
                </button>
                <button
                  onClick={() => remove(a.id)}
                  style={{ ...iconBtnStyle, color: "#A32D2D", borderColor: "#F7C1C1" }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal
          title={modal === "create" ? "Nuevo albergue" : `Editar: ${modal.nombre}`}
          onClose={() => setModal(null)}
        >
          <Field label="Nombre">
            <Input
              value={form.nombre || ""}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "0.75rem",
            }}
          >
            <Field label="Alcaldía">
              <Input
                value={form.alcaldia || ""}
                onChange={(e) => setForm((f) => ({ ...f, alcaldia: e.target.value }))}
              />
            </Field>
            <Field label="Estado">
              <Select
                value={form.status || "open"}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                options={[
                  ["open", "Abierto"],
                  ["full", "Casi lleno"],
                  ["closed", "Cerrado"],
                ]}
              />
            </Field>
          </div>
          <Field label="Descripción">
            <Textarea
              value={form.descripcion || ""}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: "0.75rem",
            }}
          >
            <Field label="Perros actuales">
              <Input
                type="number"
                value={form.perros_actuales || ""}
                onChange={(e) => setForm((f) => ({ ...f, perros_actuales: e.target.value }))}
              />
            </Field>
            <Field label="Capacidad">
              <Input
                type="number"
                value={form.capacidad || ""}
                onChange={(e) => setForm((f) => ({ ...f, capacidad: e.target.value }))}
              />
            </Field>
            <Field label="Adoptados/mes">
              <Input
                type="number"
                value={form.adoptados_mes || ""}
                onChange={(e) => setForm((f) => ({ ...f, adoptados_mes: e.target.value }))}
              />
            </Field>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "0.75rem",
            }}
          >
            <Field label="Latitud">
              <Input
                type="number"
                step="0.0001"
                placeholder="19.3900"
                value={form.lat || ""}
                onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
              />
            </Field>
            <Field label="Longitud">
              <Input
                type="number"
                step="0.0001"
                placeholder="-99.1300"
                value={form.lng || ""}
                onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
              />
            </Field>
            <Field label="Dirección">
              <Input
                value={form.direccion || ""}
                onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
              />
            </Field>
            <Field label="Teléfono">
              <Input
                value={form.telefono || ""}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              />
            </Field>
            <Field label="Email">
              <Input
                value={form.email || ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Horario">
              <Input
                value={form.horario || ""}
                onChange={(e) => setForm((f) => ({ ...f, horario: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Director">
            <Input
              value={form.director || ""}
              onChange={(e) => setForm((f) => ({ ...f, director: e.target.value }))}
            />
          </Field>
          <Field label="Necesidades (una por línea)">
            <Textarea
              rows={4}
              value={form.necesidades || ""}
              onChange={(e) => setForm((f) => ({ ...f, necesidades: e.target.value }))}
            />
          </Field>
          <Field label="Imagen">
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Input
                value={form.imagen || ""}
                onChange={(e) => setForm((f) => ({ ...f, imagen: e.target.value }))}
                placeholder="URL de imagen o sube un archivo"
                style={{ flex: 1 }}
              />
              <label
                style={{
                  ...iconBtnStyle,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Upload size={14} /> Subir
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setImgFile(e.target.files[0])}
                />
              </label>
            </div>
            {imgFile && (
              <p style={{ fontSize: "0.75rem", color: "var(--sage)", marginTop: "0.3rem" }}>
                ✓ {imgFile.name} — se subirá al guardar
              </p>
            )}
          </Field>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button className="btn-ghost" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              <Check size={16} /> {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Noticias Tab ───────────────────────────────────────────────────────────
function NoticiasTab({ items, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);

  const open = (item = null) => {
    setForm(item || { tipo: "news" });
    setImgFile(null);
    setModal(item || "create");
  };

  const save = async () => {
    setSaving(true);
    let imagen = form.imagen || "";
    if (imgFile) {
      const { url } = await uploadImage(imgFile);
      if (url) imagen = url;
    }
    const payload = { ...form, imagen };
    if (modal === "create") await createNoticia(payload);
    else await updateNoticia(modal.id, payload);
    setSaving(false);
    setModal(null);
    reload();
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar esta noticia?")) return;
    await deleteNoticia(id);
    reload();
  };

  const tipoLabel = { news: "📰 Noticia", announce: "📢 Anuncio", success: "🏆 Logro" };

  return (
    <div>
      <div style={tabHeaderStyle}>
        <h2 style={h2Style}>Noticias y anuncios</h2>
        <button className="btn-primary" onClick={() => open()}>
          <PlusCircle size={16} /> Nueva noticia
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {items.map((n) => (
          <div
            key={n.id}
            style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              border: "1px solid var(--gray-light)",
            }}
          >
            {n.imagen && (
              <img
                src={n.imagen}
                alt=""
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "var(--radius-sm)",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--terracotta)",
                  fontWeight: 500,
                  marginBottom: "0.25rem",
                }}
              >
                {tipoLabel[n.tipo] || n.tipo} ·{" "}
                {n.published_at ? new Date(n.published_at).toLocaleDateString("es-MX") : ""}
              </div>
              <h4
                style={{
                  fontSize: "0.95rem",
                  color: "var(--bark)",
                  marginBottom: "0.25rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {n.titulo}
              </h4>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--bark-light)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {n.resumen}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              <button onClick={() => open(n)} style={iconBtnStyle}>
                <Pencil size={14} />
              </button>
              <button
                onClick={() => remove(n.id)}
                style={{ ...iconBtnStyle, color: "#A32D2D", borderColor: "#F7C1C1" }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "var(--gray)", fontStyle: "italic" }}>
            No hay noticias aún.
          </p>
        )}
      </div>

      {modal && (
        <Modal
          title={modal === "create" ? "Nueva noticia" : "Editar noticia"}
          onClose={() => setModal(null)}
        >
          <Field label="Título">
            <Input
              value={form.titulo || ""}
              onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            />
          </Field>
          <Field label="Tipo">
            <Select
              value={form.tipo || "news"}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
              options={[
                ["news", "📰 Noticia"],
                ["announce", "📢 Anuncio"],
                ["success", "🏆 Logro"],
              ]}
            />
          </Field>
          <Field label="Resumen (se muestra en listados)">
            <Textarea
              value={form.resumen || ""}
              onChange={(e) => setForm((f) => ({ ...f, resumen: e.target.value }))}
            />
          </Field>
          <Field label="Contenido completo">
            <Textarea
              rows={6}
              value={form.contenido || ""}
              onChange={(e) => setForm((f) => ({ ...f, contenido: e.target.value }))}
            />
          </Field>
          <Field label="Imagen">
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Input
                value={form.imagen || ""}
                onChange={(e) => setForm((f) => ({ ...f, imagen: e.target.value }))}
                placeholder="URL de imagen o sube un archivo"
                style={{ flex: 1 }}
              />
              <label
                style={{
                  ...iconBtnStyle,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Upload size={14} /> Subir
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setImgFile(e.target.files[0])}
                />
              </label>
            </div>
            {imgFile && (
              <p style={{ fontSize: "0.75rem", color: "var(--sage)", marginTop: "0.3rem" }}>
                ✓ {imgFile.name}
              </p>
            )}
          </Field>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button className="btn-ghost" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              <Check size={16} /> {saving ? "Guardando..." : "Publicar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Gastos Tab ─────────────────────────────────────────────────────────────
function GastosTab({ items, reload }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await createGasto({ ...form, monto: Number(form.monto) });
    setSaving(false);
    setModal(false);
    reload();
  };

  const remove = async (id) => {
    if (!confirm("¿Eliminar este gasto?")) return;
    await deleteGasto(id);
    reload();
  };

  const total = items.reduce((s, g) => s + Number(g.monto), 0);

  return (
    <div>
      <div style={tabHeaderStyle}>
        <div>
          <h2 style={h2Style}>Registro de gastos</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--bark-light)", marginTop: "0.25rem" }}>
            Total registrado:{" "}
            <strong style={{ color: "var(--terracotta)" }}>${total.toLocaleString("es-MX")}</strong>
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setForm({ categoria: "alimento", fecha: new Date().toISOString().slice(0, 10) });
            setModal(true);
          }}
        >
          <PlusCircle size={16} /> Agregar gasto
        </button>
      </div>

      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--gray-light)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-light)" }}>
              {["Fecha", "Descripción", "Categoría", "Albergue", "Proveedor", "Monto", ""].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: "0.72rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--gray)",
                      fontWeight: 500,
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      background: "var(--cream)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((g) => (
              <tr
                key={g.id}
                style={{ borderBottom: "1px solid rgba(212,206,198,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={tdStyle}>{g.fecha}</td>
                <td style={{ ...tdStyle, maxWidth: 240 }}>{g.descripcion}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "99px",
                      background: "var(--terra-pale)",
                      color: "var(--terracotta)",
                      fontWeight: 500,
                    }}
                  >
                    {g.categoria}
                  </span>
                </td>
                <td style={tdStyle}>{g.albergue}</td>
                <td style={tdStyle}>{g.proveedor}</td>
                <td style={{ ...tdStyle, fontWeight: 500, color: "var(--bark)" }}>
                  ${Number(g.monto).toLocaleString("es-MX")}
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => remove(g.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#A32D2D",
                      display: "flex",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p
            style={{
              padding: "2rem",
              fontSize: "0.85rem",
              color: "var(--gray)",
              fontStyle: "italic",
            }}
          >
            No hay gastos registrados.
          </p>
        )}
      </div>

      {modal && (
        <Modal title="Registrar gasto" onClose={() => setModal(false)}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "0.75rem",
            }}
          >
            <Field label="Fecha">
              <Input
                type="date"
                value={form.fecha || ""}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
              />
            </Field>
            <Field label="Categoría">
              <Select
                value={form.categoria || "alimento"}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                options={[
                  ["alimento", "Alimento"],
                  ["medico", "Médico"],
                  ["infraestructura", "Infraestructura"],
                  ["rescate", "Rescate"],
                  ["admin", "Administración"],
                  ["otro", "Otro"],
                ]}
              />
            </Field>
          </div>
          <Field label="Descripción">
            <Input
              value={form.descripcion || ""}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
              gap: "0.75rem",
            }}
          >
            <Field label="Albergue">
              <Input
                value={form.albergue || ""}
                onChange={(e) => setForm((f) => ({ ...f, albergue: e.target.value }))}
                placeholder="Casa Bigotes"
              />
            </Field>
            <Field label="Proveedor">
              <Input
                value={form.proveedor || ""}
                onChange={(e) => setForm((f) => ({ ...f, proveedor: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Monto (MXN)">
            <div
              style={{
                display: "flex",
                border: "1.5px solid var(--gray-light)",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  background: "var(--gray-light)",
                  padding: "0.7rem 0.9rem",
                  color: "var(--bark-light)",
                }}
              >
                $
              </span>
              <Input
                type="number"
                value={form.monto || ""}
                onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                style={{ border: "none", borderRadius: 0 }}
              />
            </div>
          </Field>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "flex-end",
              marginTop: "1rem",
            }}
          >
            <button className="btn-ghost" onClick={() => setModal(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              <Check size={16} /> {saving ? "Guardando..." : "Registrar gasto"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Donaciones Tab ─────────────────────────────────────────────────────────
function DonacionesTab({ items }) {
  const total = items.filter((d) => d.status === "paid").reduce((s, d) => s + Number(d.monto), 0);
  const methods = { card: "💳 Tarjeta", oxxo: "🏪 OXXO" };
  const freqs = { once: "Una vez", monthly: "Mensual", yearly: "Anual" };

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[
          ["Total recaudado", `$${total.toLocaleString("es-MX")}`, "var(--terracotta)"],
          ["Donaciones pagadas", items.filter((d) => d.status === "paid").length, "var(--sage)"],
          ["Pendientes de pago", items.filter((d) => d.status !== "paid").length, "var(--gold)"],
        ].map(([label, val, color]) => (
          <div
            key={label}
            style={{
              background: "var(--cream)",
              borderRadius: "var(--radius-lg)",
              padding: "1.5rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color }}>{val}</div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--gray)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: "0.25rem",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--gray-light)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-light)" }}>
              {["Fecha", "Donador", "Email", "Monto", "Método", "Frecuencia", "Estado"].map((h) => (
                <th
                  key={h}
                  style={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--gray)",
                    fontWeight: 500,
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    background: "var(--cream)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((d, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid rgba(212,206,198,0.4)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={tdStyle}>
                  {d.created_at ? new Date(d.created_at).toLocaleDateString("es-MX") : "—"}
                </td>
                <td style={{ ...tdStyle, fontWeight: 500, color: "var(--bark)" }}>
                  {d.nombre || "Anónimo"}
                </td>
                <td style={tdStyle}>{d.email}</td>
                <td style={{ ...tdStyle, fontWeight: 500, color: "var(--terracotta)" }}>
                  ${Number(d.monto).toLocaleString("es-MX")}
                </td>
                <td style={tdStyle}>{methods[d.metodo] || d.metodo}</td>
                <td style={tdStyle}>{freqs[d.frecuencia] || d.frecuencia}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "99px",
                      background: d.status === "paid" ? "var(--sage-pale)" : "var(--gold-pale)",
                      color: d.status === "paid" ? "var(--sage)" : "var(--gold)",
                      fontWeight: 500,
                    }}
                  >
                    {d.status === "paid" ? "✓ Pagado" : "⏳ Pendiente"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <p
            style={{
              padding: "2rem",
              fontSize: "0.85rem",
              color: "var(--gray)",
              fontStyle: "italic",
            }}
          >
            No hay donaciones registradas.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [albergues, setAlbergues] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [donaciones, setDonaciones] = useState([]);

  const loadAll = () => {
    getAlbergues().then(({ data }) => setAlbergues(data || []));
    getNoticias().then(({ data }) => setNoticias(data || []));
    getGastos().then(({ data }) => setGastos(data || []));
    getDonaciones().then(({ data }) => setDonaciones(data || []));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const handleTabChange = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream)" }}>
      {/* Mobile overlay */}
      <div
        className={`admin-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`admin-sidebar${sidebarOpen ? " open" : ""}`}
        style={{
          width: 220,
          background: "var(--bark)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 200,
        }}
      >
        <div
          style={{
            padding: "1.5rem 1.25rem 1rem",
            borderBottom: "1px solid rgba(245,240,232,0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                color: "var(--cream)",
                marginBottom: "0.1rem",
              }}
            >
              🐾 Patitas
            </div>
            <div
              style={{
                fontSize: "0.68rem",
                color: "rgba(245,240,232,0.4)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Admin Panel
            </div>
          </div>
          {/* Close btn mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(245,240,232,0.5)",
              cursor: "pointer",
              display: "flex",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        <nav style={{ flex: 1, padding: "0.75rem" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.9rem",
                borderRadius: "var(--radius-sm)",
                border: "none",
                background: tab === id ? "rgba(196,98,45,0.25)" : "transparent",
                color: tab === id ? "var(--terra-light)" : "rgba(245,240,232,0.6)",
                fontSize: "0.875rem",
                cursor: "pointer",
                marginBottom: "0.25rem",
                textAlign: "left",
                transition: "all 0.2s",
                fontFamily: "var(--font-body)",
              }}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(245,240,232,0.1)" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.65rem 0.9rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "rgba(245,240,232,0.5)",
              fontSize: "0.85rem",
              cursor: "pointer",
              marginBottom: "0.25rem",
              textAlign: "left",
              fontFamily: "var(--font-body)",
            }}
          >
            <Home size={17} /> Ver sitio
          </button>
          <button
            onClick={handleSignOut}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.65rem 0.9rem",
              borderRadius: "var(--radius-sm)",
              border: "none",
              background: "transparent",
              color: "rgba(245,240,232,0.5)",
              fontSize: "0.85rem",
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "var(--font-body)",
            }}
          >
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="admin-main"
        style={{
          marginLeft: 220,
          flex: 1,
          padding: "2.5rem 3rem",
          minHeight: "100vh",
          maxWidth: "100%",
          overflowX: "hidden",
        }}
      >
        {/* Mobile top bar */}
        <div
          style={{
            display: "none",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid var(--gray-light)",
          }}
          className="admin-topbar-mobile"
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: "var(--bark)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.5rem 0.75rem",
              cursor: "pointer",
              color: "var(--cream)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontFamily: "var(--font-body)",
            }}
          >
            ☰ Menú
          </button>
          <span
            style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--bark)" }}
          >
            {TABS.find((t) => t.id === tab)?.label}
          </span>
        </div>

        {tab === "overview" && (
          <OverviewTab
            albergues={albergues}
            noticias={noticias}
            gastos={gastos}
            donaciones={donaciones}
          />
        )}
        {tab === "albergues" && <AlberguesTab items={albergues} reload={loadAll} />}
        {tab === "noticias" && <NoticiasTab items={noticias} reload={loadAll} />}
        {tab === "gastos" && <GastosTab items={gastos} reload={loadAll} />}
        {tab === "donaciones" && <DonacionesTab items={donaciones} />}
        {tab === "solicitudes" && <SolicitudesTab />}
      </main>
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────
const h2Style = { fontFamily: "var(--font-display)", fontSize: "1.5rem", color: "var(--bark)" };
const tabHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1.5rem",
  flexWrap: "wrap",
  gap: "1rem",
};
const iconBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.3rem",
  padding: "0.4rem 0.8rem",
  border: "1px solid var(--gray-light)",
  borderRadius: "var(--radius-sm)",
  background: "transparent",
  fontSize: "0.8rem",
  cursor: "pointer",
  color: "var(--bark-light)",
  transition: "all 0.2s",
};
const tdStyle = {
  padding: "0.85rem 1rem",
  fontSize: "0.85rem",
  color: "var(--bark-light)",
  verticalAlign: "middle",
};

// NOTA: Exportar también la sección de solicitudes para el admin.
// Agrégala como nuevo tab en el Dashboard existente.
// Ver SolicitudesAdminTab más abajo — está como componente separado
// que se puede importar e integrar en el Dashboard principal.
