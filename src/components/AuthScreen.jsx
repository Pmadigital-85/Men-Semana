import { useState } from 'react'

const C = {
  orange:'#F4845F', orangeLight:'#FFF0EB',
  green:'#6DBE8C',  greenLight:'#EDF7F1',
  purple:'#9B7FD4', purpleLight:'#F3EFFE',
  card:'#FFFFFF', bg:'#FAFAF8', text:'#2D2D2D', muted:'#888', border:'#EEEBE4',
}

export default function AuthScreen({ onAuth, error, setError }) {
  const [mode, setMode]         = useState('login')   // login | signup | reset
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handle = async () => {
    if (!email.trim()) return
    setLoading(true); setError(null)
    await onAuth(mode, email, password, name)
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', padding:'14px 16px',
    border:`2px solid ${C.border}`, borderRadius:14,
    fontSize:16, outline:'none', boxSizing:'border-box',
    fontFamily:'inherit', background:'#fff', color:C.text,
    marginBottom:12,
  }
  const btnStyle = {
    width:'100%', padding:16,
    background:`linear-gradient(135deg,#F4845F,#C96A45)`,
    color:'#fff', border:'none', borderRadius:16,
    fontSize:16, fontWeight:800, cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1, marginTop:4,
  }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(160deg,#FFF0EB 0%,#F3EFFE 50%,#EDF7F1 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20}}>
      <div style={{width:'100%', maxWidth:400}}>

        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{fontSize:56, marginBottom:8}}>🍽️</div>
          <h1 style={{margin:0, fontSize:28, fontWeight:800, color:C.text}}>MenúSemana</h1>
          <p style={{margin:'6px 0 0', fontSize:15, color:C.muted}}>Tu planificador de comidas latinoamericano</p>
        </div>

        <div style={{background:C.card, borderRadius:24, padding:28, boxShadow:'0 8px 40px rgba(0,0,0,0.08)'}}>

          {/* Mode selector */}
          {mode !== 'reset' && (
            <div style={{display:'flex', background:C.bg, borderRadius:14, padding:4, marginBottom:24}}>
              {[{id:'login',label:'Entrar'},{id:'signup',label:'Crear cuenta'}].map(m=>(
                <button key={m.id} onClick={()=>{setMode(m.id);setError(null)}} style={{flex:1, padding:'10px', border:'none', borderRadius:11, background:mode===m.id?'#fff':'transparent', color:mode===m.id?C.text:C.muted, fontWeight:mode===m.id?800:500, fontSize:14, cursor:'pointer', transition:'all 0.2s', boxShadow:mode===m.id?'0 2px 8px rgba(0,0,0,0.08)':'none'}}>
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {mode === 'reset' ? (
            <>
              {resetSent ? (
                <div style={{textAlign:'center', padding:'20px 0'}}>
                  <div style={{fontSize:48, marginBottom:12}}>📧</div>
                  <h3 style={{margin:'0 0 8px', color:C.text}}>Revisa tu correo</h3>
                  <p style={{color:C.muted, fontSize:14}}>Te enviamos un link para restablecer tu contraseña.</p>
                  <button onClick={()=>{setMode('login');setResetSent(false)}} style={{...btnStyle, marginTop:16}}>Volver al inicio</button>
                </div>
              ) : (
                <>
                  <h3 style={{margin:'0 0 6px', fontSize:18, fontWeight:800}}>¿Olvidaste tu contraseña?</h3>
                  <p style={{margin:'0 0 18px', color:C.muted, fontSize:14}}>Te enviamos un link a tu correo para restablecerla.</p>
                  <input style={inputStyle} type="email" placeholder="Tu correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}/>
                  {error && <div style={{color:'#e05a5a', fontSize:13, marginBottom:12, padding:'10px 14px', background:'#fff0f0', borderRadius:10}}>{error}</div>}
                  <button style={btnStyle} onClick={handle} disabled={loading}>{loading?'Enviando...':'Enviar link de acceso'}</button>
                  <button onClick={()=>{setMode('login');setError(null)}} style={{width:'100%', padding:'12px', background:'none', border:'none', color:C.muted, fontSize:14, cursor:'pointer', marginTop:8}}>← Volver</button>
                </>
              )}
            </>
          ) : (
            <>
              <h3 style={{margin:'0 0 18px', fontSize:18, fontWeight:800, color:C.text}}>
                {mode==='login' ? '¡Bienvenido de vuelta! 👋' : 'Crea tu cuenta gratis 🎉'}
              </h3>

              {mode==='signup' && (
                <input style={inputStyle} type="text" placeholder="Tu nombre (ej: María)" value={name} onChange={e=>setName(e.target.value)}/>
              )}
              <input style={inputStyle} type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)}/>
              <input style={inputStyle} type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()}/>

              {error && (
                <div style={{color:'#e05a5a', fontSize:13, marginBottom:12, padding:'10px 14px', background:'#fff0f0', borderRadius:10, lineHeight:1.5}}>
                  ⚠️ {translateError(error)}
                </div>
              )}

              <button style={btnStyle} onClick={handle} disabled={loading}>
                {loading ? '⏳ Un momento...' : mode==='login' ? 'Entrar a mi cuenta' : 'Crear cuenta gratis'}
              </button>

              {mode==='login' && (
                <button onClick={()=>{setMode('reset');setError(null)}} style={{width:'100%', padding:'10px', background:'none', border:'none', color:C.muted, fontSize:13, cursor:'pointer', marginTop:8}}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              {mode==='signup' && (
                <p style={{textAlign:'center', fontSize:12, color:C.muted, marginTop:14, lineHeight:1.5}}>
                  Al crear tu cuenta aceptas nuestros{' '}
                  <span style={{color:C.orange, fontWeight:700}}>Términos de uso</span>
                </p>
              )}
            </>
          )}
        </div>

        {/* Beta badge */}
        <div style={{textAlign:'center', marginTop:20}}>
          <span style={{background:C.greenLight, color:C.green, borderRadius:20, padding:'6px 16px', fontSize:12, fontWeight:700}}>
            🎉 Beta gratuita — sin tarjeta de crédito
          </span>
        </div>
      </div>
    </div>
  )
}

function translateError(msg) {
  if (msg.includes('Invalid login'))        return 'Correo o contraseña incorrectos.'
  if (msg.includes('already registered'))   return 'Este correo ya tiene una cuenta. Intenta entrar.'
  if (msg.includes('Password should be'))   return 'La contraseña debe tener al menos 6 caracteres.'
  if (msg.includes('Unable to validate'))   return 'Correo no válido. Revísalo.'
  if (msg.includes('Email not confirmed'))  return 'Confirma tu correo primero. Revisa tu bandeja de entrada.'
  if (msg.includes('network'))              return 'Sin conexión. Verifica tu internet.'
  return msg
}
