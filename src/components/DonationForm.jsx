import { useState } from "react";
import {
  tokenizeCard,
  processDonation,
  createOxxoPayment,
  getDonationImpact,
} from "../lib/conekta";
import { createDonacion } from "../lib/supabase";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";

const AMOUNTS = [100, 200, 500, 1000, 2000];

export default function DonationForm({ albergue = null }) {
  const [amount, setAmount] = useState(200);
  const [customAmt, setCustomAmt] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [method, setMethod] = useState("card");
  const [showCard, setShowCard] = useState(false); // card fields toggled
  const [card, setCard] = useState({ number: "", name: "", expMonth: "", expYear: "", cvc: "" });
  const [donor, setDonor] = useState({ name: "", email: "" });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const finalAmount = customAmt ? Number(customAmt) : amount;
  const impact = getDonationImpact(finalAmount);

  // When card method selected, auto-expand card fields
  const handleMethodChange = (val) => {
    setMethod(val);
    if (val === "card") setShowCard(true);
    else setShowCard(false);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (finalAmount < 10) return setMessage("El monto mínimo es $10 pesos.");
    if (!donor.name || !donor.email) return setMessage("Por favor completa tu nombre y email.");
    if (
      method === "card" &&
      (!card.number || !card.name || !card.expMonth || !card.expYear || !card.cvc)
    )
      return setMessage("Completa todos los datos de la tarjeta.");

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
          `Tu referencia OXXO es: ${result.reference}. Tienes hasta el ${result.expiry_date} para pagar.`,
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
        // Guardar customer_id y source_id para cobros recurrentes
        ...(result.customer_id && { conekta_customer_id: result.customer_id }),
        ...(result.source_id && { conekta_source_id: result.source_id }),
        ...(result.next_charge_date && { proximo_cobro: result.next_charge_date }),
      });
      setStatus("success");
      setMessage(
        `¡Gracias, ${donor.name}! Tu donación de $${finalAmount.toLocaleString("es-MX")} MXN fue procesada. Recibirás un recibo en ${donor.email}.`,
      );
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Ocurrió un error. Intenta de nuevo.");
    }
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--sage-pale)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
          }}
        >
          <CheckCircle size={36} color="var(--sage)" />
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            color: "var(--bark)",
            marginBottom: "0.6rem",
          }}
        >
          ¡Donación exitosa!
        </h3>
        <p
          style={{
            fontSize: "0.88rem",
            color: "var(--bark-light)",
            lineHeight: 1.65,
            marginBottom: "1.5rem",
          }}
        >
          {message}
        </p>
        <button
          className="btn-outline"
          style={{ width: "100%", justifyContent: "center", borderRadius: 10 }}
          onClick={() => {
            setStatus("idle");
            setMessage("");
            setCard({ number: "", name: "", expMonth: "", expYear: "", cvc: "" });
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
      <label style={ls}>¿Con qué frecuencia?</label>
      <div
        style={{
          display: "flex",
          borderRadius: 10,
          overflow: "hidden",
          border: "1.5px solid var(--gray-light)",
          marginBottom: "1.1rem",
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
              fontFamily: "var(--font-body)",
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
      <label style={ls}>Elige un monto</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "0.5rem",
          marginBottom: "0.85rem",
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
              padding: "0.65rem 0.25rem",
              border: `1.5px solid ${amount === a && !customAmt ? "var(--terracotta)" : "var(--gray-light)"}`,
              background: amount === a && !customAmt ? "var(--terracotta)" : "transparent",
              color: amount === a && !customAmt ? "var(--warm-white)" : "var(--bark)",
              borderRadius: 10,
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font-body)",
            }}
          >
            ${a.toLocaleString("es-MX")}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setCustomAmt(" ");
            setAmount(0);
          }}
          style={{
            padding: "0.65rem 0.25rem",
            border: `1.5px solid ${customAmt.trim() ? "var(--terracotta)" : "var(--gray-light)"}`,
            background: customAmt.trim() ? "var(--terracotta)" : "transparent",
            color: customAmt.trim() ? "var(--warm-white)" : "var(--bark)",
            borderRadius: 10,
            fontSize: "0.95rem",
            cursor: "pointer",
            transition: "all 0.2s",
            fontFamily: "var(--font-body)",
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
          marginBottom: "0.4rem",
        }}
      >
        <span
          style={{
            background: "var(--gray-light)",
            padding: "0.7rem 0.9rem",
            fontWeight: 500,
            color: "var(--bark-light)",
            fontSize: "0.9rem",
          }}
        >
          $
        </span>
        <input
          type="number"
          placeholder="Otro monto"
          value={customAmt.trim()}
          onChange={(e) => setCustomAmt(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            padding: "0.7rem",
            outline: "none",
            background: "var(--warm-white)",
            color: "var(--bark)",
            fontSize: "0.95rem",
            minWidth: 0,
          }}
        />
        <span
          style={{
            background: "var(--gray-light)",
            padding: "0.7rem 0.75rem",
            color: "var(--bark-light)",
            fontSize: "0.82rem",
          }}
        >
          MXN
        </span>
      </div>
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--sage)",
          fontStyle: "italic",
          marginBottom: "1.1rem",
          minHeight: "1em",
        }}
      >
        {impact}
      </p>

      {/* Datos del donador */}
      <label style={ls}>Tus datos</label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <input
          placeholder="Tu nombre"
          value={donor.name}
          onChange={(e) => setDonor((d) => ({ ...d, name: e.target.value }))}
          style={is}
          required
        />
        <input
          type="email"
          placeholder="Tu email"
          value={donor.email}
          onChange={(e) => setDonor((d) => ({ ...d, email: e.target.value }))}
          style={is}
          required
        />
      </div>

      {/* Método de pago */}
      <label style={ls}>Método de pago</label>
      <div style={{ display: "flex", gap: "0.6rem", marginBottom: "1rem" }}>
        {[
          ["card", "💳 Tarjeta"],
          ["oxxo", "🏪 OXXO"],
        ].map(([val, label]) => (
          <button
            type="button"
            key={val}
            onClick={() => handleMethodChange(val)}
            style={{
              flex: 1,
              padding: "0.6rem",
              border: `1.5px solid ${method === val ? "var(--terracotta)" : "var(--gray-light)"}`,
              background: method === val ? "var(--terra-pale)" : "transparent",
              color: method === val ? "var(--terracotta)" : "var(--bark-light)",
              borderRadius: 10,
              fontSize: "0.88rem",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              fontWeight: method === val ? 500 : 400,
              transition: "all 0.2s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TARJETA — colapsable */}
      {method === "card" && (
        <div
          style={{
            marginBottom: "1rem",
            border: "1.5px solid var(--gray-light)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {/* Header toggle */}
          <button
            type="button"
            onClick={() => setShowCard((s) => !s)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              background: showCard ? "var(--terra-pale)" : "var(--cream)",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              color: showCard ? "var(--terracotta)" : "var(--bark-light)",
              fontSize: "0.88rem",
              fontWeight: 500,
              transition: "background 0.2s",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CreditCard size={16} />
              {card.number
                ? `•••• •••• •••• ${card.number.slice(-4)}`
                : "Ingresar datos de tarjeta"}
            </span>
            {showCard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Card fields — visible when expanded */}
          {showCard && (
            <div
              style={{
                padding: "1rem",
                background: "var(--warm-white)",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <input
                placeholder="Número de tarjeta"
                value={card.number}
                onChange={(e) =>
                  setCard((c) => ({ ...c, number: e.target.value.replace(/\D/g, "").slice(0, 16) }))
                }
                style={is}
                required
                onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
              />
              <input
                placeholder="Nombre en la tarjeta"
                value={card.name}
                onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                style={is}
                required
                onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <input
                  placeholder="MM"
                  value={card.expMonth}
                  onChange={(e) =>
                    setCard((c) => ({
                      ...c,
                      expMonth: e.target.value.replace(/\D/g, "").slice(0, 2),
                    }))
                  }
                  style={is}
                  maxLength={2}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
                />
                <input
                  placeholder="AAAA"
                  value={card.expYear}
                  onChange={(e) =>
                    setCard((c) => ({
                      ...c,
                      expYear: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                  style={is}
                  maxLength={4}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
                />
                <input
                  placeholder="CVC"
                  value={card.cvc}
                  onChange={(e) =>
                    setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))
                  }
                  style={is}
                  maxLength={4}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "var(--terracotta)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--gray-light)")}
                />
              </div>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "var(--gray)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  margin: 0,
                }}
              >
                <Lock size={11} /> Tu tarjeta se tokeniza de forma segura. Nunca almacenamos datos
                de tarjeta.
              </p>
            </div>
          )}
        </div>
      )}

      {/* OXXO info */}
      {method === "oxxo" && (
        <div
          style={{
            background: "var(--gold-pale)",
            borderRadius: 10,
            padding: "0.85rem 1rem",
            marginBottom: "1rem",
            fontSize: "0.82rem",
            color: "var(--bark-light)",
            lineHeight: 1.55,
          }}
        >
          <strong style={{ color: "var(--bark)" }}>¿Cómo funciona OXXO?</strong>
          <br />
          Generamos una referencia que puedes pagar en cualquier OXXO. El pago se refleja en 24–48
          horas.
        </div>
      )}

      {/* Error */}
      {message && status === "error" && (
        <div
          style={{
            background: "#FCEBEB",
            color: "#A32D2D",
            borderRadius: 10,
            padding: "0.7rem 0.9rem",
            marginBottom: "0.85rem",
            fontSize: "0.83rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0 }} /> {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          width: "100%",
          padding: "0.9rem",
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
          fontFamily: "var(--font-body)",
        }}
        onMouseEnter={(e) => {
          if (status !== "loading") e.currentTarget.style.background = "var(--bark)";
        }}
        onMouseLeave={(e) => {
          if (status !== "loading") e.currentTarget.style.background = "var(--terracotta)";
        }}
      >
        {status === "loading" ? (
          <>
            <Loader size={17} style={{ animation: "spin 1s linear infinite" }} /> Procesando…
          </>
        ) : (
          `Donar $${finalAmount.toLocaleString("es-MX")} MXN`
        )}
      </button>

      <p
        style={{
          fontSize: "0.72rem",
          color: "var(--gray)",
          textAlign: "center",
          marginTop: "0.6rem",
        }}
      >
        🔒 Pago seguro · Donataria Autorizada SAT · Recibo fiscal disponible
      </p>
    </form>
  );
}

const ls = {
  fontSize: "0.8rem",
  color: "var(--bark-light)",
  display: "block",
  marginBottom: "0.4rem",
  fontWeight: 500,
};
const is = {
  padding: "0.7rem",
  border: "1.5px solid var(--gray-light)",
  borderRadius: 8,
  fontSize: "0.88rem",
  outline: "none",
  background: "var(--warm-white)",
  color: "var(--bark)",
  width: "100%",
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};
