import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase project credentials
// Get them from: https://supabase.com/dashboard → your project → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Auth helpers ──────────────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ─── Albergues ─────────────────────────────────────────────────────────────

export async function getAlbergues() {
  const { data, error } = await supabase
    .from('albergues')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getAlbergue(id) {
  const { data, error } = await supabase
    .from('albergues')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function createAlbergue(albergue) {
  const { data, error } = await supabase
    .from('albergues')
    .insert([albergue])
    .select()
    .single()
  return { data, error }
}

export async function updateAlbergue(id, updates) {
  const { data, error } = await supabase
    .from('albergues')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteAlbergue(id) {
  const { error } = await supabase.from('albergues').delete().eq('id', id)
  return { error }
}

// ─── Noticias ──────────────────────────────────────────────────────────────

export async function getNoticias() {
  const { data, error } = await supabase
    .from('noticias')
    .select('*')
    .order('published_at', { ascending: false })
  return { data, error }
}

export async function createNoticia(noticia) {
  const { data, error } = await supabase
    .from('noticias')
    .insert([{ ...noticia, published_at: new Date().toISOString() }])
    .select()
    .single()
  return { data, error }
}

export async function updateNoticia(id, updates) {
  const { data, error } = await supabase
    .from('noticias')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deleteNoticia(id) {
  const { error } = await supabase.from('noticias').delete().eq('id', id)
  return { error }
}

// ─── Gastos / Transparencia ────────────────────────────────────────────────

export async function getGastos() {
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .order('fecha', { ascending: false })
  return { data, error }
}

export async function createGasto(gasto) {
  const { data, error } = await supabase
    .from('gastos')
    .insert([gasto])
    .select()
    .single()
  return { data, error }
}

export async function deleteGasto(id) {
  const { error } = await supabase.from('gastos').delete().eq('id', id)
  return { error }
}

// ─── Donaciones ────────────────────────────────────────────────────────────

export async function createDonacion(donacion) {
  const { data, error } = await supabase
    .from('donaciones')
    .insert([donacion])
    .select()
    .single()
  return { data, error }
}

export async function getDonaciones() {
  const { data, error } = await supabase
    .from('donaciones')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getResumenFinanciero() {
  const { data: donaciones } = await supabase
    .from('donaciones')
    .select('monto, status')
    .eq('status', 'paid')

  const { data: gastos } = await supabase
    .from('gastos')
    .select('monto')

  const totalRecaudado = (donaciones || []).reduce((sum, d) => sum + Number(d.monto), 0)
  const totalGastado = (gastos || []).reduce((sum, g) => sum + Number(g.monto), 0)

  return {
    totalRecaudado,
    totalGastado,
    reserva: totalRecaudado - totalGastado,
  }
}

// ─── Image upload ──────────────────────────────────────────────────────────

export async function uploadImage(file, bucket = 'imagenes') {
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filename, file, { cacheControl: '3600', upsert: false })

  if (error) return { url: null, error }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename)

  return { url: publicUrl, error: null }
}

// ─── AUTH MULTI-ROL ────────────────────────────────────────────────────────

export async function signUp({ email, password, nombre, rol = 'usuario' }) {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { nombre, rol } },
  })
  return { data, error }
}

export async function getPerfil(userId) {
  const { data, error } = await supabase
    .from('perfiles').select('*').eq('id', userId).single()
  return { data, error }
}

export async function updatePerfil(userId, updates) {
  const { data, error } = await supabase
    .from('perfiles').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId).select().single()
  return { data, error }
}

export async function uploadAvatar(userId, file) {
  const ext  = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`
  const { error } = await supabase.storage.from('avatares')
    .upload(path, file, { upsert: true })
  if (error) return { url: null, error }
  const { data: { publicUrl } } = supabase.storage.from('avatares').getPublicUrl(path)
  return { url: publicUrl, error: null }
}

// ─── SOLICITUDES DE ALBERGUE ───────────────────────────────────────────────

export async function crearSolicitud(solicitud) {
  const { data, error } = await supabase
    .from('solicitudes_albergue').insert([solicitud]).select().single()
  return { data, error }
}

export async function getMiSolicitud(userId) {
  const { data, error } = await supabase
    .from('solicitudes_albergue').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()
  return { data, error }
}

export async function getSolicitudes() {
  const { data, error } = await supabase
    .from('solicitudes_albergue').select('*, perfiles(nombre,email)')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function resolverSolicitud(id, status, nota_admin, albergue_id = null) {
  const { data, error } = await supabase
    .from('solicitudes_albergue')
    .update({ status, nota_admin, albergue_id, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  return { data, error }
}

// ─── MÉTODOS DE PAGO ──────────────────────────────────────────────────────

export async function getMetodosPago(userId) {
  const { data, error } = await supabase
    .from('metodos_pago').select('*').eq('user_id', userId)
    .order('es_principal', { ascending: false })
  return { data, error }
}

export async function addMetodoPago(metodo) {
  if (metodo.es_principal) {
    await supabase.from('metodos_pago')
      .update({ es_principal: false }).eq('user_id', metodo.user_id)
  }
  const { data, error } = await supabase
    .from('metodos_pago').insert([metodo]).select().single()
  return { data, error }
}

export async function deleteMetodoPago(id) {
  const { error } = await supabase.from('metodos_pago').delete().eq('id', id)
  return { error }
}

// ─── SUSCRIPCIONES ────────────────────────────────────────────────────────

export async function getMisSuscripciones(userId) {
  const { data, error } = await supabase
    .from('suscripciones').select('*, albergues(nombre)')
    .eq('user_id', userId).order('created_at', { ascending: false })
  return { data, error }
}

export async function cancelarSuscripcion(id) {
  const { data, error } = await supabase
    .from('suscripciones').update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  return { data, error }
}

export async function getMisDonaciones(userId) {
  const { data, error } = await supabase
    .from('donaciones').select('*, albergues(nombre)')
    .eq('user_id', userId).order('created_at', { ascending: false })
  return { data, error }
}

// ─── ALBERGUE PROPIO (panel del albergue autorizado) ──────────────────────

export async function getMiAlbergue(userId) {
  const { data, error } = await supabase
    .from('albergues').select('*').eq('admin_user_id', userId).maybeSingle()
  return { data, error }
}

export async function updateMiAlbergue(userId, updates) {
  const { data, error } = await supabase
    .from('albergues').update(updates).eq('admin_user_id', userId).select().single()
  return { data, error }
}
