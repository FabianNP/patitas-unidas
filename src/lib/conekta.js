// ─────────────────────────────────────────────────────────────────────────────
// Conekta Payment Integration
// Docs: https://developers.conekta.com/docs
//
// Setup:
//  1. Create account at https://conekta.com
//  2. Get your PUBLIC key from Dashboard → API Keys
//  3. Add to .env: VITE_CONEKTA_PUBLIC_KEY=key_xxxxxxxx
//  4. Your BACKEND needs the SECRET key to create orders server-side
//     (Never expose the secret key in frontend code)
//
// For a full implementation you need a small backend (Supabase Edge Function
// works great) to create Conekta orders securely.
// ─────────────────────────────────────────────────────────────────────────────

const CONEKTA_PUBLIC_KEY = import.meta.env.VITE_CONEKTA_PUBLIC_KEY || 'key_xxxxxxxxxx'
const CONEKTA_PRIVATE_KEY = import.meta.env.VITE_CONEKTA_PRIVATE_KEY || 'key_xxxxxxxxxx'

// Load Conekta.js script dynamically
export function loadConektaScript() {
  return new Promise((resolve, reject) => {
    if (window.Conekta) { resolve(window.Conekta); return }
    const script = document.createElement('script')
    script.src = 'https://cdn.conekta.io/js/latest/conekta.js'
    script.onload = () => {
      window.Conekta.setPublicKey(CONEKTA_PUBLIC_KEY)
      resolve(window.Conekta)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// Tokenize a card with Conekta.js
export async function tokenizeCard({ number, name, expMonth, expYear, cvc }) {
  const Conekta = await loadConektaScript()

  return new Promise((resolve, reject) => {
    Conekta.Token.create(
      {
        card: {
          number: number.replace(/\s/g, ''),
          name,
          exp_month: expMonth,
          exp_year: expYear,
          cvc,
        },
      },
      (token) => resolve(token.id),
      (error) => reject(new Error(error.message_to_purchaser || 'Error al procesar la tarjeta'))
    )
  })
}

// ─── Call your backend (Supabase Edge Function) to create the charge ───────
//
// Example Supabase Edge Function (supabase/functions/create-order/index.ts):
//
//   import Conekta from 'npm:conekta@latest'
//   // Conekta.api_key = Deno.env.get('CONEKTA_PRIVATE_KEY')
//   Conekta.api_key = CONEKTA_PRIVATE_KEY

//   Deno.serve(async (req) => {
//     const { token, amount, email, name, description, frequency } = await req.json()

//     // One-time charge
//     if (frequency === 'once') {
//       const order = await Conekta.Order.create({
//         currency: 'MXN',
//         customer_info: { name, email, phone: '5500000000' },
//         line_items: [{ name: description, unit_price: amount * 100, quantity: 1 }],
//         charges: [{ payment_method: { type: 'card', token_id: token } }],
//       })
//       return new Response(JSON.stringify({ id: order.id, status: order.payment_status }))
//     }

//     // Monthly subscription
//     const customer = await Conekta.Customer.create({
//       name, email,
//       payment_sources: [{ type: 'card', token_id: token }],
//       subscription: {
//         plan_id: 'plan_donacion_mensual', // create plan in Conekta dashboard
//       },
//     })
//     return new Response(JSON.stringify({ id: customer.id, status: 'active' }))
//   })

export async function processDonation({ token, amount, email, name, frequency, albergue }) {
  const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-order`

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      token,
      amount: Number(amount),
      email,
      name,
      frequency,
      description: `Donación Patitas Unidas${albergue ? ` — ${albergue}` : ''}`,
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || 'Error al procesar el pago')
  }

  return response.json()
}

// ─── OXXO Payment (no card needed) ────────────────────────────────────────
// Conekta generates an OXXO reference the user pays in-store.
// Your backend creates a cash order and returns the reference number.

export async function createOxxoPayment({ amount, email, name }) {
  const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-oxxo`

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ amount: Number(amount), email, name }),
  })

  if (!response.ok) throw new Error('Error al generar referencia OXXO')
  return response.json() // returns { reference, expiry_date, barcode_url }
}

// ─── Donation impact copy ──────────────────────────────────────────────────

export function getDonationImpact(amount) {
  const amt = Number(amount)
  if (amt >= 2000) return '🏥 Cubres el tratamiento completo de un perro enfermo'
  if (amt >= 1000) return '💉 Financias una esterilización de emergencia'
  if (amt >= 500)  return '🔬 Cubres la vacuna completa de un perro rescatado'
  if (amt >= 200)  return '🍖 Alimentas a un perro por un mes completo'
  if (amt >= 100)  return '🐾 Compras una semana de croquetas para un cachorro'
  return '❤️ Cada peso suma — ¡gracias!'
}
