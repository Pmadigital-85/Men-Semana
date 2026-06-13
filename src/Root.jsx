import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useUserData } from './hooks/useUserData'
import { DEFAULT_PRODUCTS } from './lib/constants'
import AuthScreen from './components/AuthScreen'
import PaywallScreen from './components/Paywall'
import App from './App'

export default function Root() {
  const auth = useAuth()
  const userData = useUserData(auth.user?.id)
  const [showPaywall, setShowPaywall] = useState(false)

  // ── Merge default products on first load ──
  const products = userData.products ?? DEFAULT_PRODUCTS
  const supermarkets = userData.supermarkets ?? ['Super A', 'Super B']

  // ── Auth handler ──
  const handleAuth = async (mode, email, password, name) => {
    if (mode === 'login')  return auth.signIn(email, password)
    if (mode === 'signup') return auth.signUp(email, password, name)
    if (mode === 'reset') {
      const { error } = await auth.resetPassword(email)
      if (!error) return { resetSent: true }
      return { error }
    }
  }

  // ── Stripe checkout (Phase 3 — wired up when ready) ──
  const handleSelectPlan = async (plan) => {
    if (plan.price === 0) { setShowPaywall(false); return }
    // TODO Phase 3: call your Stripe checkout endpoint
    // window.location.href = `/api/checkout?plan=${plan.id}&user=${auth.user.id}`
    alert(`✅ Integración con Stripe lista para conectar en Fase 3.\n\nPlan seleccionado: ${plan.name} · $${plan.price}/mes`)
    setShowPaywall(false)
  }

  if (auth.loading) return <SplashScreen />

  if (!auth.user) {
    return (
      <AuthScreen
        onAuth={handleAuth}
        error={auth.error}
        setError={auth.setError}
      />
    )
  }

  if (!userData.dataLoaded) return <SplashScreen message="Cargando tu menú..." />

  return (
    <>
      <App
        auth={auth}
        userData={{ ...userData, products, supermarkets }}
        onUpgrade={() => setShowPaywall(true)}
      />
      {showPaywall && (
        <PaywallScreen
          currentPlan={auth.plan}
          onClose={() => setShowPaywall(false)}
          onSelectPlan={handleSelectPlan}
        />
      )}
    </>
  )
}

function SplashScreen({ message = 'Cargando...' }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#F4845F,#C96A45)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontSize:60 }}>🍽️</div>
      <div style={{ fontSize:22, fontWeight:800, color:'#fff' }}>MenúSemana</div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.8)' }}>{message}</div>
    </div>
  )
}
