import { PLANS } from '../lib/supabase'

const C = {
  orange:'#F4845F', orangeLight:'#FFF0EB',
  green:'#6DBE8C',  greenLight:'#EDF7F1',
  purple:'#9B7FD4', purpleLight:'#F3EFFE',
  yellow:'#F5C842', yellowLight:'#FFFBEA',
  card:'#FFFFFF', text:'#2D2D2D', muted:'#888', border:'#EEEBE4',
}

// Shown inline when a feature is locked
export function LockedFeature({ feature, onUpgrade }) {
  const messages = {
    savedWeeks:   { icon:'💾', title:'Guarda más semanas', desc:'El plan Pro te permite guardar semanas ilimitadas.' },
    supermarkets: { icon:'🏪', title:'Más supermercados',  desc:'Compara hasta 10 supermercados con el plan Pro.' },
    aiCalls:      { icon:'👨‍🍳', title:'Chef Juanfra ilimitado', desc:'Usa la IA sin límites diarios con el plan Pro.' },
  }
  const m = messages[feature] || { icon:'⭐', title:'Función Pro', desc:'Actualiza para desbloquear esta función.' }

  return (
    <div style={{background:C.orangeLight, border:`2px dashed ${C.orange}`, borderRadius:18, padding:20, textAlign:'center', margin:'12px 0'}}>
      <div style={{fontSize:36, marginBottom:8}}>{m.icon}</div>
      <div style={{fontSize:16, fontWeight:800, color:C.text, marginBottom:4}}>{m.title}</div>
      <div style={{fontSize:13, color:C.muted, marginBottom:14, lineHeight:1.5}}>{m.desc}</div>
      <button onClick={onUpgrade} style={{background:`linear-gradient(135deg,${C.orange},#C96A45)`, color:'#fff', border:'none', borderRadius:14, padding:'11px 24px', fontSize:14, fontWeight:800, cursor:'pointer'}}>
        ⭐ Ver planes
      </button>
    </div>
  )
}

// Full-screen upgrade modal
export default function PaywallScreen({ currentPlan, onClose, onSelectPlan }) {
  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:500, display:'flex', alignItems:'flex-end', justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#FAFAF8', width:'100%', maxWidth:680, maxHeight:'92vh', borderRadius:'28px 28px 0 0', overflow:'auto', padding:'24px 20px 40px'}} onClick={e=>e.stopPropagation()}>

        {/* Handle bar */}
        <div style={{width:40, height:4, background:'#DDD', borderRadius:4, margin:'0 auto 20px'}}/>

        <div style={{textAlign:'center', marginBottom:24}}>
          <div style={{fontSize:44, marginBottom:8}}>⭐</div>
          <h2 style={{margin:0, fontSize:22, fontWeight:800}}>Elige tu plan</h2>
          <p style={{margin:'6px 0 0', color:C.muted, fontSize:14}}>Cancela cuando quieras · Sin compromisos</p>
        </div>

        {/* Plan cards */}
        {Object.values(PLANS).map(plan => {
          const isCurrent = currentPlan === plan.id
          const colors = { free:C.green, pro:C.orange, family:C.purple }
          const bgs    = { free:C.greenLight, pro:C.orangeLight, family:C.purpleLight }
          const pc = colors[plan.id]
          const pb = bgs[plan.id]

          return (
            <div key={plan.id} style={{background:C.card, border:`2px solid ${isCurrent||plan.popular ? pc : C.border}`, borderRadius:22, padding:20, marginBottom:14, position:'relative'}}>
              {plan.popular && !isCurrent && (
                <div style={{position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:C.orange, color:'#fff', borderRadius:20, padding:'4px 16px', fontSize:12, fontWeight:800, whiteSpace:'nowrap'}}>
                  ⭐ Más popular
                </div>
              )}
              {isCurrent && (
                <div style={{position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:pc, color:'#fff', borderRadius:20, padding:'4px 16px', fontSize:12, fontWeight:800, whiteSpace:'nowrap'}}>
                  ✓ Tu plan actual
                </div>
              )}

              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14}}>
                <div>
                  <div style={{fontSize:18, fontWeight:800}}>{plan.name}</div>
                  <div style={{fontSize:12, color:C.muted, marginTop:2}}>{plan.label}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  {plan.price === 0
                    ? <div style={{fontSize:22, fontWeight:800, color:pc}}>Gratis</div>
                    : <><div style={{fontSize:26, fontWeight:800, color:pc}}>${plan.price}</div><div style={{fontSize:11, color:C.muted}}>/mes</div></>
                  }
                </div>
              </div>

              <div style={{marginBottom:16}}>
                {plan.features.map((f,i) => (
                  <div key={i} style={{display:'flex', gap:8, alignItems:'flex-start', padding:'5px 0', borderBottom:i<plan.features.length-1?`1px solid ${C.border}`:'none'}}>
                    <span style={{color:pc, fontWeight:700, fontSize:14, flexShrink:0}}>✓</span>
                    <span style={{fontSize:13, color:C.text, lineHeight:1.4}}>{f}</span>
                  </div>
                ))}
              </div>

              {!isCurrent && (
                <button onClick={() => onSelectPlan(plan)} style={{width:'100%', padding:13, background:plan.price===0?pb:`linear-gradient(135deg,${pc},${pc}CC)`, color:plan.price===0?pc:'#fff', border:`2px solid ${pc}`, borderRadius:14, fontSize:14, fontWeight:800, cursor:'pointer'}}>
                  {plan.price === 0 ? 'Continuar gratis' : `Suscribirme a ${plan.name} · $${plan.price}/mes`}
                </button>
              )}
            </div>
          )
        })}

        <p style={{textAlign:'center', fontSize:12, color:C.muted, marginTop:8, lineHeight:1.6}}>
          🔒 Pago seguro · Cancela en cualquier momento · Sin cobros ocultos
        </p>
        <button onClick={onClose} style={{width:'100%', padding:12, background:'none', border:'none', color:C.muted, fontSize:14, cursor:'pointer', marginTop:4}}>
          Ahora no
        </button>
      </div>
    </div>
  )
}
