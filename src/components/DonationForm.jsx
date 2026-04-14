import { useState } from "react";
import {
  tokenizeCard,
  processDonation,
  createOxxoPayment,
  getDonationImpact,
} from "../lib/conekta";
import { createDonacion } from "../lib/supabase";
import { CreditCard, Building2, CheckCircle, AlertCircle, Loader } from "lucide-react";

const AMOUNTS = [100, 200, 500, 1000, 2000];

export default function DonationForm({ albergue = null }) {
  const [amount, setAmount] = useState(200);
  const [customAmt, setCustomAmt] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", name: "", expMonth: "", expYear: "", cvc: "" });
  const [donor, setDonor] = useState({ name: "", email: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");

  const finalAmount = customAmt ? Number(customAmt) : amount;
  const impact = getDonationImpact(finalAmount);

  async function handleSubmit(e) {
    e.preventDefault();
    if (finalAmount < 10) return setMessage("El monto mínimo es $10 pesos.");
    if (!donor.name || !donor.email) return setMessage("Por favor completa tu nombre y email.");

    setStatus("loading");
    setMessage("");

    try {
      if (method === "oxxo") {
        const result = await createOxxoPayment({
          amount: finalAmount,
          email: donor.email,
          name: donor.name,
        });
        await createDonacion({
          monto: finalAmount,
          email: donor.email,
          nombre: donor.name,
          metodo: "oxxo",
          status: "pending",
          frecuencia: frequency,
          albergue_id: albergue?.id ?? null,
          conekta_id: result.reference,
        });
        setStatus("success");
        setMessage(
          `Tu referencia OXXO es: ${result.reference}. Tienes hasta el ${result.expiry_date} para pagar en cualquier OXXO.`,
        );
        return;
      }

      const token = await tokenizeCard(card);
      const result = await processDonation({
        token,
        amount: finalAmount,
        email: donor.email,
        name: donor.name,
        frequency,
        albergue: albergue?.nombre,
      });
      await createDonacion({
        monto: finalAmount,
        email: donor.email,
        nombre: donor.name,
        metodo: "card",
        status: "paid",
        frecuencia: frequency,
        albergue_id: albergue?.id ?? null,
        conekta_id: result.id,
      });
      setStatus("success");
      setMessage(
        `¡Gracias, ${donor.name}! Tu donación de $${finalAmount.toLocaleString("es-MX")} MXN fue procesada con éxito. Recibirás un recibo en ${donor.email}.`,
      );
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Ocurrió un error. Intenta de nuevo.");
    }
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <CheckCircle size={56} color="var(--sage)" style={{ margin: "0 auto 1rem" }} />
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.4rem",
            color: "var(--bark)",
            marginBottom: "0.75rem",
          }}
        >
          ¡Donación exitosa!
        </h3>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--bark-light)",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          {message}
        </p>
        <button
          className="btn-outline"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
        >
          Hacer otra donación
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Frecuencia */}
      <label style={labelStyle}>¿Con qué frecuencia?</label>
      <div
        style={{
          display: "flex",
          borderRadius: 10,
          overflow: "hidden",
          border: "1.5px solid var(--gray-light)",
          marginBottom: "1.25rem",
        }}
      >
        {[
          ["once", "Una vez"],
          ["monthly", "Mensual"],
          ["yearly", "Anual"],
        ].map(([val, label]) => (
          <button
            type="button"
            key={val}
            onClick={() => setFrequency(val)}
            style={{
              flex: 1,
              padding: "0.6rem",
              border: "none",
              background: frequency === val ? "var(--terracotta)" : "transparent",
              color: frequency === val ? "var(--warm-white)" : "var(--bark-light)",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Montos */}
      <label style={labelStyle}>Elige un monto</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "0.6rem",
          marginBottom: "1rem",
        }}
      >
        {AMOUNTS.map((a) => (
          <button
            type="button"
            key={a}
            onClick={() => {
              setAmount(a);
              setCustomAmt("");
            }}
            style={{
              padding: "0.7rem",
              border: `1.5px solid ${amount === a && !customAmt ? "var(--terracotta)" : "var(--gray-light)"}`,
              background: amount === a && !customAmt ? "var(--terracotta)" : "transparent",
              color: amount === a && !customAmt ? "var(--warm-white)" : "var(--bark)",
              borderRadius: 10,
              fontSize: "1rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            ${a.toLocaleString("es-MX")}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCustomAmt(" ")}
          style={{
            padding: "0.7rem",
            border: `1.5px solid ${customAmt ? "var(--terracotta)" : "var(--gray-light)"}`,
            background: customAmt ? "var(--terracotta)" : "transparent",
            color: customAmt ? "var(--warm-white)" : "var(--bark)",
            borderRadius: 10,
            fontSize: "1rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          Otro
        </button>
      </div>

      <div
        style={{
          display: "flex",
          border: "1.5px solid var(--gray-light)",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            background: "var(--gray-light)",
            padding: "0.75rem 1rem",
            fontWeight: 500,
            color: "var(--bark-light)",
          }}
        >
          $
        </span>
        <input
          type="number"
          placeholder="Monto personalizado"
          value={customAmt.trim()}
          onChange={(e) => setCustomAmt(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            padding: "0.75rem",
            outline: "none",
            background: "var(--warm-white)",
            color: "var(--bark)",
            fontSize: "1rem",
          }}
        />
        <span
          style={{
            background: "var(--gray-light)",
            padding: "0.75rem 1rem",
            color: "var(--bark-light)",
            fontSize: "0.85rem",
          }}
        >
          MXN
        </span>
      </div>
      <p
        style={{
          fontSize: "0.78rem",
          color: "var(--sage)",
          fontStyle: "italic",
          marginBottom: "1.25rem",
          minHeight: "1.1em",
        }}
      >
        {impact}
      </p>

      {/* Método de pago */}
      <label style={labelStyle}>Método de pago</label>
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          ["card", "💳 Tarjeta"],
          ["oxxo", "🏪 OXXO"],
        ].map(([val, label]) => (
          <button
            type="button"
            key={val}
            onClick={() => setMethod(val)}
            style={{
              flex: 1,
              padding: "0.65rem",
              border: `1.5px solid ${method === val ? "var(--terracotta)" : "var(--gray-light)"}`,
              background: method === val ? "var(--terra-pale)" : "transparent",
              color: method === val ? "var(--terracotta)" : "var(--bark-light)",
              borderRadius: 10,
              fontSize: "0.9rem",
              cursor: "pointer",
              fontWeight: method === val ? 500 : 400,
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Datos del donador */}
      <label style={labelStyle}>Tus datos</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
          gap: "0.6rem",
          marginBottom: "1rem",
        }}
      >
        <input
          placeholder="Tu nombre"
          value={donor.name}
          onChange={(e) => setDonor((d) => ({ ...d, name: e.target.value }))}
          style={inputStyle}
          required
        />
        <input
          type="email"
          placeholder="Tu email"
          value={donor.email}
          onChange={(e) => setDonor((d) => ({ ...d, email: e.target.value }))}
          style={inputStyle}
          required
        />
      </div>

      {/* Card fields */}
      {method === "card" && (
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Datos de la tarjeta</label>
          <input
            placeholder="Número de tarjeta"
            value={card.number}
            onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
            style={{ ...inputStyle, marginBottom: "0.5rem", width: "100%" }}
            required
          />
          <input
            placeholder="Nombre en la tarjeta"
            value={card.name}
            onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
            style={{ ...inputStyle, marginBottom: "0.5rem", width: "100%" }}
            required
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem" }}>
            <input
              placeholder="MM"
              value={card.expMonth}
              onChange={(e) => setCard((c) => ({ ...c, expMonth: e.target.value }))}
              style={inputStyle}
              maxLength={2}
              required
            />
            <input
              placeholder="AAAA"
              value={card.expYear}
              onChange={(e) => setCard((c) => ({ ...c, expYear: e.target.value }))}
              style={inputStyle}
              maxLength={4}
              required
            />
            <input
              placeholder="CVC"
              value={card.cvc}
              onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value }))}
              style={inputStyle}
              maxLength={4}
              required
            />
          </div>
        </div>
      )}

      {method === "oxxo" && (
        <div
          style={{
            background: "var(--gold-pale)",
            borderRadius: 10,
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            fontSize: "0.83rem",
            color: "var(--bark-light)",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "var(--bark)" }}>¿Cómo funciona el pago OXXO?</strong>
          <br />
          Generamos una referencia de pago que puedes pagar en cualquier tienda OXXO del país. El
          pago se refleja en 24–48 horas.
        </div>
      )}

      {message && status === "error" && (
        <div
          style={{
            background: "#FCEBEB",
            color: "#A32D2D",
            borderRadius: 10,
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            fontSize: "0.85rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <AlertCircle size={16} /> {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          width: "100%",
          textAlign: "center",
          padding: "1rem",
          borderRadius: 10,
          border: "none",
          background: status === "loading" ? "var(--bark-light)" : "var(--terracotta)",
          color: "var(--warm-white)",
          fontSize: "1rem",
          fontWeight: 500,
          cursor: status === "loading" ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          transition: "background 0.2s",
        }}
      >
        {status === "loading" ? (
          <>
            <Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> Procesando...
          </>
        ) : (
          `Donar $${finalAmount.toLocaleString("es-MX")} MXN`
        )}
      </button>

      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--gray)",
          textAlign: "center",
          marginTop: "0.75rem",
        }}
      >
        🔒 Pago seguro · Donataria Autorizada SAT · Recibo fiscal disponible
      </p>
    </form>
  );
}

const labelStyle = {
  fontSize: "0.8rem",
  color: "var(--bark-light)",
  display: "block",
  marginBottom: "0.4rem",
  fontWeight: 500,
};
const inputStyle = {
  padding: "0.75rem",
  border: "1.5px solid var(--gray-light)",
  borderRadius: 8,
  fontSize: "0.9rem",
  outline: "none",
  background: "var(--warm-white)",
  color: "var(--bark)",
  width: "100%",
};
