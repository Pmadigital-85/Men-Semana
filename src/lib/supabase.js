import { createClient } from '@supabase/supabase-js'

// These come from Vercel Environment Variables — never hardcode keys
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️  Supabase env vars not set. Running in demo mode.')
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder'
)

// ─── Plan definitions ────────────────────────────────────────
// Single source of truth for plan logic across the entire app.
// When you add a new plan, change it here only.
export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratis',
    price: 0,
    label: 'Beta gratuita',
    color: '#6DBE8C',
    features: [
      'Planeador semanal completo',
      'Lista del supermercado',
      '1 semana guardada',
      '2 supermercados en comparador',
      'Recetario latinoamericano',
    ],
    limits: {
      savedWeeks: 1,
      supermarkets: 2,
      aiCallsPerDay: 3,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    label: 'Mensual',
    color: '#F4845F',
    popular: true,
    features: [
      'Todo lo del plan Gratis',
      'Semanas guardadas ilimitadas',
      'Hasta 10 supermercados',
      'Chef Juanfra IA sin límites',
      'Análisis de nevera con foto',
      'Historial de precios (3 meses)',
      'Sincronización en todos tus dispositivos',
    ],
    limits: {
      savedWeeks: Infinity,
      supermarkets: 10,
      aiCallsPerDay: Infinity,
    },
  },
  family: {
    id: 'family',
    name: 'Familia',
    price: 8.99,
    label: 'Mensual · hasta 5 miembros',
    color: '#9B7FD4',
    features: [
      'Todo lo del plan Pro',
      'Hasta 5 cuentas familiares',
      'Menús compartidos en tiempo real',
      'Lista del super compartida',
      'Presupuesto familiar de compras',
      'Historial de precios (12 meses)',
    ],
    limits: {
      savedWeeks: Infinity,
      supermarkets: Infinity,
      aiCallsPerDay: Infinity,
      familyMembers: 5,
    },
  },
}

export const canUseFeature = (plan, feature, currentCount = 0) => {
  const limits = PLANS[plan]?.limits || PLANS.free.limits
  switch (feature) {
    case 'savedWeeks':    return currentCount < limits.savedWeeks
    case 'supermarkets':  return currentCount < limits.supermarkets
    case 'aiCalls':       return limits.aiCallsPerDay === Infinity || currentCount < limits.aiCallsPerDay
    default:              return true
  }
}
