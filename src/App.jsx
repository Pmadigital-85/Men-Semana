import { useState, useRef } from "react";
import { PLANS, canUseFeature } from "./lib/supabase";
import { LockedFeature } from "./components/Paywall";
import { DEFAULT_PRODUCTS, PROD_CATEGORIES } from "./lib/constants";

/* ─────────────────────── CONSTANTS ─────────────────────── */
const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const DAY_SHORT = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MEALS = ["Desayuno","Almuerzo","Cena"];
const MEAL_EMOJI = { Desayuno:"🌅", Almuerzo:"☀️", Cena:"🌙" };

const UNSPLASH = {
  Desayuno:"https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=70",
  Almuerzo:"https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=70",
  Cena:"https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=70",
  Ensalada:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70",
  Pollo:"https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&q=70",
  Pasta:"https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&q=70",
  Arroz:"https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=70",
  Sopa:"https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=70",
  Huevos:"https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&q=70",
  Fruta:"https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&q=70",
  Pescado:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=70",
  default:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",
};
const getPhoto = (name) => {
  if (!name) return UNSPLASH.default;
  const n = name.toLowerCase();
  if (n.includes("ensalada")) return UNSPLASH.Ensalada;
  if (n.includes("pollo")||n.includes("pechuga")) return UNSPLASH.Pollo;
  if (n.includes("pasta")||n.includes("fideo")) return UNSPLASH.Pasta;
  if (n.includes("arroz")) return UNSPLASH.Arroz;
  if (n.includes("sopa")||n.includes("crema")||n.includes("caldo")) return UNSPLASH.Sopa;
  if (n.includes("huevo")) return UNSPLASH.Huevos;
  if (n.includes("fruta")||n.includes("batido")||n.includes("avena")) return UNSPLASH.Fruta;
  if (n.includes("pescado")||n.includes("filete")) return UNSPLASH.Pescado;
  return UNSPLASH.default;
};

const QUICK_RECIPES = [
  { name:"Avena con plátano y miel", meal:"Desayuno", time:"10 min", ingredients:["avena 1 taza","leche 1 taza","plátano 1","miel 1 cda"] },
  { name:"Huevos revueltos con pan tostado", meal:"Desayuno", time:"10 min", ingredients:["huevos 3","mantequilla 1 cda","sal al gusto","pan 2 rebanadas"] },
  { name:"Yogur con frutas y granola", meal:"Desayuno", time:"5 min", ingredients:["yogur 1 taza","granola ½ taza","fresas o mango 100g"] },
  { name:"Pan tostado con huevo frito", meal:"Desayuno", time:"10 min", ingredients:["pan 2 rebanadas","huevos 2","aceite 1 cda","sal al gusto"] },
  { name:"Batido de frutas con leche", meal:"Desayuno", time:"5 min", ingredients:["leche 1 vaso","plátano 1","fresas 100g","azúcar 1 cda"] },
  { name:"Tortilla o arepa con queso", meal:"Desayuno", time:"15 min", ingredients:["harina de maíz 1 taza","queso blanco 100g","sal al gusto","agua c/n"] },
  { name:"Sopa de verduras con pollo", meal:"Almuerzo", time:"35 min", ingredients:["zanahoria 2","papa 2","pollo 200g","caldo 1L","sal al gusto"] },
  { name:"Pollo a la plancha con arroz", meal:"Almuerzo", time:"30 min", ingredients:["pechuga de pollo 2","limón 2","ajo 3 dientes","arroz 1 taza","aceite 2 cdas"] },
  { name:"Arroz con frijoles o lentejas", meal:"Almuerzo", time:"30 min", ingredients:["arroz 1 taza","frijoles o lentejas 1 taza","cebolla ½","ajo 2 dientes","tomate 1"] },
  { name:"Pasta con salsa de tomate", meal:"Almuerzo", time:"25 min", ingredients:["pasta 200g","tomate 3","ajo 2 dientes","cebolla ½","aceite de oliva 2 cdas"] },
  { name:"Ensalada con pollo a la plancha", meal:"Almuerzo", time:"20 min", ingredients:["lechuga 1","pollo 200g","tomate 1","pepino 1","aceite y limón al gusto"] },
  { name:"Carne molida guisada con papa", meal:"Almuerzo", time:"35 min", ingredients:["carne molida 250g","papa 3","tomate 2","cebolla 1","ajo 2 dientes"] },
  { name:"Pescado al horno con verduras", meal:"Almuerzo", time:"35 min", ingredients:["filete de pescado 2","zanahoria 2","papa 2","limón 1","aceite 2 cdas"] },
  { name:"Guiso de pollo con papa", meal:"Almuerzo", time:"40 min", ingredients:["muslos de pollo 4","papa 3","zanahoria 2","cebolla 1","ajo 3 dientes"] },
  { name:"Sopa de pasta con verduras", meal:"Cena", time:"20 min", ingredients:["pasta corta 100g","zanahoria 1","caldo de pollo 500ml","sal al gusto"] },
  { name:"Sandwich de jamón y queso", meal:"Cena", time:"10 min", ingredients:["pan de molde 4 rebanadas","jamón 4 láminas","queso 2 láminas","lechuga","tomate 1"] },
  { name:"Huevos con tomate y cebolla", meal:"Cena", time:"15 min", ingredients:["huevos 3","tomate 1","cebolla ¼","aceite 1 cda","sal al gusto"] },
  { name:"Crema de espinacas o brócoli", meal:"Cena", time:"25 min", ingredients:["espinacas o brócoli 200g","crema o leche 100ml","caldo 500ml","ajo 2 dientes","cebolla ½"] },
  { name:"Pan o tortilla con queso fundido", meal:"Cena", time:"10 min", ingredients:["pan o tortillas 4","queso blanco 150g","tomate 1","sal al gusto"] },
  { name:"Arroz salteado con huevo", meal:"Cena", time:"15 min", ingredients:["arroz cocido 2 tazas","huevos 2","cebolla ¼","aceite 1 cda","sal al gusto"] },
];

const catForProduct = (name) => {
  const low = name.toLowerCase();
  for (const [cat, kws] of Object.entries(PROD_CATEGORIES)) {
    if (kws.some(k => low.includes(k))) return cat;
  }
  return "🛒 Otros";
};


const BADGES = [
  { id:"first_meal",   icon:"🍳", label:"Primera Receta",    desc:"Agrega tu primera receta",              pts:10  },
  { id:"full_day",     icon:"⭐", label:"Día Completo",       desc:"Planea las 3 comidas de un día",         pts:30  },
  { id:"full_week",    icon:"🏆", label:"Semana Lista",       desc:"Planea toda la semana",                  pts:100 },
  { id:"shopper",      icon:"🛒", label:"Lista Lista",        desc:"Genera tu lista del super",              pts:20  },
  { id:"ai_chef",      icon:"🤖", label:"Chef Digital",       desc:"Usa al Chef Juanfra IA",                 pts:25  },
  { id:"fridge_scan",  icon:"📸", label:"Fridge Hunter",      desc:"Escanea tu nevera",                      pts:35  },
  { id:"price_hunter", icon:"💰", label:"Cazador de Precios", desc:"Agrega precios en 2 supermercados",      pts:40  },
  { id:"saver",        icon:"💚", label:"Ahorrador",          desc:"Encuentra el supermercado más barato",   pts:50  },
];

const C = {
  orange:"#F4845F", orangeLight:"#FFF0EB",
  green:"#6DBE8C",  greenLight:"#EDF7F1",
  purple:"#9B7FD4", purpleLight:"#F3EFFE",
  yellow:"#F5C842", yellowLight:"#FFFBEA",
  lila:"#C9A7EB",   lilaLight:"#F8F2FF",
  teal:"#4DBDBA",   tealLight:"#E8F8F8",
  bg:"#FAFAF8", card:"#FFFFFF", text:"#2D2D2D", muted:"#888", border:"#EEEBE4",
};

const generateShoppingList = (menu) => {
  const all = {};
  Object.values(menu).forEach(day => Object.values(day).forEach(recipe => {
    recipe?.ingredients?.forEach(ing => {
      const key = ing.split(" ")[0].toLowerCase();
      if (!all[key]) all[key] = { text:ing, checked:false };
    });
  }));
  return Object.values(all);
};

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function App({ auth, userData, onUpgrade }) {
  /* ── core state ── */
  const [view, setView]                   = useState("planner");
  const [activeDay, setActiveDay]         = useState(0);
  // Cloud-synced via useUserData (passed from Root)
  const { menu, setMenu, savedWeeks, setSavedWeeks,
          products: _products, setProducts,
          supermarkets: _supermarkets, setSupermarkets,
          prices, setPrices, syncing } = userData;

  const products     = _products     ?? DEFAULT_PRODUCTS;
  const supermarkets = _supermarkets ?? ["Super A", "Super B"];

  const [shopping, setShopping]           = useState([]);
  const [showPicker, setShowPicker]       = useState(null);
  const [search, setSearch]               = useState("");
  const [generatingFull, setGeneratingFull] = useState(false);
  /* ── AI ── */
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiInput, setAiInput]             = useState("");
  const [fridgeInput, setFridgeInput]     = useState("");
  const [fridgeMode, setFridgeMode]       = useState("text");
  const [fridgeLoading, setFridgeLoading] = useState(false);
  const [fridgeSuggestions, setFridgeSuggestions] = useState([]);
  const [fridgeImage, setFridgeImage]     = useState(null);
  /* ── gamification ── */
  const [earnedBadges, setEarnedBadges]   = useState(new Set());
  const [points, setPoints]               = useState(0);
  const [newBadge, setNewBadge]           = useState(null);
  const [toast, setToast]                 = useState("");
  /* ── PRICE TRACKER ── */
  const [priceView, setPriceView]         = useState("compare");  // compare | edit | add
  const [editSuper, setEditSuper]         = useState(supermarkets[0]||"");
  const [newSuperName, setNewSuperName]   = useState("");
  const [newProd, setNewProd]             = useState({ name:"", category:"🛒 Otros", unit:"unid" });
  const [filterCat, setFilterCat]         = useState("Todos");
  const [priceSearch, setPriceSearch]     = useState("");
  const [editingPrice, setEditingPrice]   = useState(null); // { prodId, super }
  const [tempPrice, setTempPrice]         = useState("");

  const fileRef = useRef();
  const priceInputRef = useRef();


  /* ── helpers ── */
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const awardBadge = (id) => {
    const badge = BADGES.find(b => b.id === id);
    if (!badge || earnedBadges.has(id)) return;
    setEarnedBadges(prev => new Set([...prev, id]));
    setPoints(p => p + badge.pts);
    setNewBadge(badge);
    setTimeout(() => setNewBadge(null), 3500);
  };

  const checkBadges = (newMenu) => {
    const total = Object.values(newMenu).reduce((a,d) => a + Object.keys(d||{}).length, 0);
    if (total >= 1) awardBadge("first_meal");
    const full = Object.values(newMenu).filter(d => Object.keys(d||{}).length === 3).length;
    if (full >= 1) awardBadge("full_day");
    if (full === 7) awardBadge("full_week");
  };

  const setRecipe = (day, meal, recipe) => {
    const nm = { ...menu, [day]:{ ...(menu[day]||{}), [meal]:recipe } };
    setMenu(nm); setShowPicker(null);
    setPoints(p => p+5); checkBadges(nm);
    showToast(`✅ ${recipe.name} (+5 pts)`);
  };
  const removeRecipe = (day, meal) => {
    const u={...menu}; if(u[day]) delete u[day][meal]; setMenu(u); showToast("🗑️ Eliminado");
  };
  const clearDay = (day) => {
    const u={...menu}; delete u[day]; setMenu(u); showToast(`🗑️ ${day} limpiado`);
  };
  const buildShoppingList = () => {
    setShopping(generateShoppingList(menu));
    setView("shopping"); awardBadge("shopper");
    showToast("🛒 Lista generada");
  };
  const saveWeek = () => {
    if (!canUseFeature(auth.plan, "savedWeeks", savedWeeks.length)) {
      onUpgrade(); return;
    }
    const name=`Semana ${savedWeeks.length+1} — ${new Date().toLocaleDateString("es-LA",{day:"numeric",month:"short"})}`;
    setSavedWeeks(prev=>[...prev,{name,menu:JSON.parse(JSON.stringify(menu))}]);
    showToast(`💾 "${name}" guardada`);
  };
  const toggleItem = (idx) => setShopping(prev=>prev.map((it,i)=>i===idx?{...it,checked:!it.checked}:it));

  const callAI = async (messages) => {
    const res = await fetch("/api/ai",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, messages }),
    });
    const data = await res.json();
    const text = data.content?.map(c=>c.text||"").join("");
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  };

  const generateAI = async () => {
    if (!aiInput.trim()) return;
    if (!canUseFeature(auth.plan, "aiCalls")) { onUpgrade(); return; }
    setAiLoading(true); setAiSuggestions([]);
    try {
      const r = await callAI([{role:"user",content:`Persona de América Latina. Situación: "${aiInput}". Sugiere 6 recetas fáciles con ingredientes disponibles en cualquier país latinoamericano. Nombres descriptivos universales. SOLO JSON: [{"name":"...","meal":"Desayuno|Almuerzo|Cena","time":"15 min","ingredients":["ingrediente cantidad"]}]`}]);
      setAiSuggestions(r); awardBadge("ai_chef");
    } catch { showToast("❌ Error IA"); }
    setAiLoading(false);
  };

  const scanFridge = async () => {
    if (!fridgeInput.trim() && !fridgeImage) return;
    setFridgeLoading(true); setFridgeSuggestions([]);
    try {
      let content = fridgeImage
        ? [{type:"image",source:{type:"base64",media_type:"image/jpeg",data:fridgeImage}},{type:"text",text:`Identifica ingredientes en esta nevera. Sugiere 5 recetas fáciles latinoamericanas. SOLO JSON: [{"name":"...","meal":"Desayuno|Almuerzo|Cena","time":"15 min","ingredients":["..."],"uses":["..."]}]`}]
        : `Tengo: "${fridgeInput}". Sugiere 5 recetas fáciles latinoamericanas con lo que tengo. SOLO JSON: [{"name":"...","meal":"Desayuno|Almuerzo|Cena","time":"15 min","ingredients":["..."],"uses":["..."]}]`;
      const r = await callAI([{role:"user",content}]);
      setFridgeSuggestions(r); awardBadge("fridge_scan");
    } catch { showToast("❌ Error IA"); }
    setFridgeLoading(false);
  };

  const generateFullWeek = async () => {
    setGeneratingFull(true);
    try {
      const r = await callAI([{role:"user",content:`Menú semanal completo para familia latinoamericana. 7 días × 3 comidas (Desayuno, Almuerzo, Cena). Recetas simples, ingredientes fáciles en América Latina. Nombres descriptivos universales. SOLO JSON: {"Lunes":{"Desayuno":{"name":"...","ingredients":["..."]},"Almuerzo":{"name":"...","ingredients":["..."]},"Cena":{"name":"...","ingredients":["..."]}},...} — 7 días exactos.`}]);
      setMenu(r); checkBadges(r); showToast("✨ Semana generada");
    } catch { showToast("❌ Error IA"); }
    setGeneratingFull(false);
  };

  /* ─── PRICE TRACKER helpers ─── */
  const priceKey = (prodId, sup) => `${prodId}_${sup}`;

  const getPrice = (prodId, sup) => {
    const v = prices[priceKey(prodId, sup)];
    return v !== undefined ? v : null;
  };

  const savePrice = (prodId, sup, val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num < 0) return;
    const updated = { ...prices, [priceKey(prodId, sup)]: num };
    setPrices(updated);
    /* badge: si hay precios en 2+ supers */
    const supsWithData = supermarkets.filter(s =>
      products.some(p => updated[priceKey(p.id, s)] != null)
    );
    if (supsWithData.length >= 2) awardBadge("price_hunter");
    setEditingPrice(null);
  };

  const cheapestSuper = (prodId) => {
    let best = null, bestP = Infinity;
    supermarkets.forEach(s => {
      const p = getPrice(prodId, s);
      if (p !== null && p < bestP) { bestP = p; best = s; }
    });
    return { sup: best, price: bestP === Infinity ? null : bestP };
  };

  const totalPerSuper = () => {
    return supermarkets.map(s => {
      let total = 0, count = 0;
      products.forEach(p => {
        const pr = getPrice(p.id, s);
        if (pr !== null) { total += pr; count++; }
      });
      return { sup:s, total:parseFloat(total.toFixed(2)), count };
    });
  };

  const bestSuperOverall = () => {
    const totals = totalPerSuper().filter(t => t.count > 0);
    if (!totals.length) return null;
    return totals.reduce((a,b) => a.total < b.total ? a : b);
  };

  const addSupermarket = () => {
    const name = newSuperName.trim();
    if (!name || supermarkets.includes(name)) return;
    if (!canUseFeature(auth.plan, "supermarkets", supermarkets.length)) {
      onUpgrade(); return;
    }
    setSupermarkets(prev => [...prev, name]);
    setNewSuperName(""); setEditSuper(name);
    showToast(`✅ "${name}" agregado`);
  };

  const removeSupermarket = (sup) => {
    setSupermarkets(prev => prev.filter(s => s !== sup));
    const updated = { ...prices };
    Object.keys(updated).forEach(k => { if (k.endsWith(`_${sup}`)) delete updated[k]; });
    setPrices(updated);
    showToast(`🗑️ "${sup}" eliminado`);
  };

  const addProduct = () => {
    const name = newProd.name.trim();
    if (!name) return;
    const id = `custom_${Date.now()}`;
    const cat = catForProduct(name) !== "🛒 Otros" ? catForProduct(name) : newProd.category;
    setProducts(prev => [...prev, { id, name, category:cat, unit:newProd.unit }]);
    setNewProd({ name:"", category:"🛒 Otros", unit:"unid" });
    showToast(`✅ "${name}" agregado`);
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    const updated = { ...prices };
    Object.keys(updated).forEach(k => { if (k.startsWith(`${id}_`)) delete updated[k]; });
    setPrices(updated);
  };

  const filteredProducts = products.filter(p => {
    const matchCat = filterCat === "Todos" || p.category === filterCat;
    const matchSearch = p.name.toLowerCase().includes(priceSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const allCategories = ["Todos", ...Object.keys(PROD_CATEGORIES)];

  /* ── layout ── */
  const totalMeals = Object.values(menu).reduce((a,d)=>a+Object.keys(d||{}).length,0);
  const checkedCount = shopping.filter(i=>i.checked).length;
  const level = Math.floor(points/100)+1;
  const levelPct = points % 100;

  const groupedShopping = {};
  shopping.forEach((item,idx) => {
    const cat = (() => {
      const low = item.text.toLowerCase();
      for (const [c,kws] of Object.entries(PROD_CATEGORIES)) { if(kws.some(k=>low.includes(k))) return c; }
      return "🛒 Otros";
    })();
    if (!groupedShopping[cat]) groupedShopping[cat]=[];
    groupedShopping[cat].push({...item,idx});
  });

  const filteredRecipes = QUICK_RECIPES.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) &&
    (!showPicker?.meal || r.meal === showPicker.meal)
  );

  const tabStyle = (id) => ({
    padding:"10px 14px", border:"none",
    background: view===id ? C.orange : "transparent",
    color: view===id ? "#fff" : "rgba(255,255,255,0.82)",
    borderRadius:"12px 12px 0 0",
    fontSize:12, fontWeight: view===id ? 800 : 500,
    cursor:"pointer", transition:"all 0.2s", whiteSpace:"nowrap",
  });

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div style={{fontFamily:"'Segoe UI',system-ui,sans-serif",minHeight:"100vh",background:C.bg,color:C.text}}>

      {/* ─── HEADER ─── */}
      <div style={{background:"linear-gradient(135deg,#F4845F,#C96A45)",padding:"16px 16px 0",position:"sticky",top:0,zIndex:100,boxShadow:"0 4px 20px rgba(244,132,95,0.35)"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <h1 style={{margin:0,fontSize:20,fontWeight:800,color:"#fff",letterSpacing:-0.5}}>🍽️ MenúSemana</h1>
                <button onClick={auth.signOut} title="Cerrar sesión" style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:8,padding:"4px 8px",color:"rgba(255,255,255,0.8)",fontSize:11,cursor:"pointer"}}>Salir</button>
              </div>
              <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,0.85)"}}>Hola, {auth.displayName} · {totalMeals} comidas planeadas</p>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <div style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"5px 12px",textAlign:"center",cursor:"pointer"}} onClick={onUpgrade}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.8)",fontWeight:700}}>
                  {PLANS[auth.plan]?.name || "Gratis"} {syncing?"🔄":"✓"}
                </div>
                <div style={{fontSize:13,fontWeight:800,color:"#fff"}}>⭐ {points}</div>
              </div>
              <button onClick={generateFullWeek} disabled={generatingFull} style={{background:"rgba(255,255,255,0.9)",color:C.orange,border:"none",borderRadius:20,padding:"8px 12px",fontSize:11,fontWeight:800,cursor:generatingFull?"not-allowed":"pointer"}}>
                {generatingFull?"⏳...":"✨ IA Semana"}
              </button>
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{background:"rgba(255,255,255,0.25)",borderRadius:20,height:4,overflow:"hidden"}}>
              <div style={{width:`${levelPct}%`,height:"100%",background:"#fff",borderRadius:20,transition:"width 0.5s"}}/>
            </div>
          </div>
          <div style={{display:"flex",gap:2,overflowX:"auto",paddingBottom:0}}>
            {[
              {id:"planner",   label:"📅 Planner"},
              {id:"fridge",    label:"🧊 Nevera"},
              {id:"shopping",  label:`🛒 Lista${shopping.length?` (${checkedCount}/${shopping.length})`:""}` },
              {id:"prices",    label:"💰 Precios"},
              {id:"ai",        label:"👨‍🍳 Chef Juanfra"},
              {id:"rewards",   label:`🏆 Logros${earnedBadges.size?` (${earnedBadges.size})`:""}` },
            ].map(t=><button key={t.id} onClick={()=>setView(t.id)} style={tabStyle(t.id)}>{t.label}</button>)}
          </div>
        </div>
      </div>

      <div style={{maxWidth:680,margin:"0 auto",padding:"20px 14px 100px"}}>

        {/* ════════ PLANNER ════════ */}
        {view==="planner" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:20}}>
              {DAYS.map((day,i)=>{
                const cnt=Object.keys(menu[day]||{}).length;
                const bgs=[C.orangeLight,C.greenLight,C.purpleLight,C.yellowLight,C.lilaLight,C.tealLight,C.orangeLight];
                return (
                  <button key={day} onClick={()=>setActiveDay(i)} style={{padding:"8px 4px",border:activeDay===i?`2px solid ${C.orange}`:`2px solid ${C.border}`,borderRadius:14,background:activeDay===i?C.orange:bgs[i],color:activeDay===i?"#fff":C.text,cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                    <div style={{fontSize:10,fontWeight:700}}>{DAY_SHORT[i]}</div>
                    <div style={{fontSize:15,marginTop:2}}>{cnt===3?"✅":cnt>0?"🟡":"○"}</div>
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:800,color:C.orange}}>{DAYS[activeDay]}</h2>
              <div style={{display:"flex",gap:8}}>
                {menu[DAYS[activeDay]]&&<button onClick={()=>clearDay(DAYS[activeDay])} style={{background:C.purpleLight,color:C.purple,border:`1.5px solid ${C.lila}`,borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>🗑️ Limpiar</button>}
                <button onClick={saveWeek} style={{background:C.greenLight,color:C.green,border:`1.5px solid ${C.green}`,borderRadius:10,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>💾 Guardar</button>
              </div>
            </div>
            {MEALS.map(meal=>{
              const recipe=menu[DAYS[activeDay]]?.[meal];
              return (
                <div key={meal} style={{background:C.card,borderRadius:20,marginBottom:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",border:`1.5px solid ${recipe?C.border:"#EEE"}`}}>
                  {recipe&&(
                    <div style={{height:100,backgroundImage:`url(${getPhoto(recipe.name)})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.05),rgba(0,0,0,0.55))"}}/>
                      <div style={{position:"absolute",bottom:10,left:14,color:"#fff"}}>
                        <div style={{fontSize:10,fontWeight:700,opacity:0.9,textTransform:"uppercase",letterSpacing:1}}>{MEAL_EMOJI[meal]} {meal}</div>
                        <div style={{fontSize:16,fontWeight:800}}>{recipe.name}</div>
                      </div>
                      <div style={{position:"absolute",top:10,right:10,display:"flex",gap:6}}>
                        <button onClick={()=>removeRecipe(DAYS[activeDay],meal)} style={{background:"rgba(255,255,255,0.85)",border:"none",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:13}}>🗑️</button>
                        <button onClick={()=>setShowPicker({day:DAYS[activeDay],meal})} style={{background:"rgba(255,255,255,0.85)",border:"none",borderRadius:8,padding:"5px 9px",cursor:"pointer",fontSize:11,fontWeight:700}}>Cambiar</button>
                      </div>
                    </div>
                  )}
                  <div style={{padding:14}}>
                    {!recipe&&(
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <span style={{fontSize:22}}>{MEAL_EMOJI[meal]}</span>
                          <div>
                            <div style={{fontSize:10,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{meal}</div>
                            <div style={{fontSize:14,color:"#bbb"}}>Sin planear</div>
                          </div>
                        </div>
                        <button onClick={()=>setShowPicker({day:DAYS[activeDay],meal})} style={{background:C.orange,color:"#fff",border:"none",borderRadius:12,padding:"9px 18px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Agregar</button>
                      </div>
                    )}
                    {recipe?.ingredients&&(
                      <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:recipe?0:8}}>
                        {recipe.ingredients.slice(0,4).map((ing,i)=><span key={i} style={{background:C.orangeLight,color:C.orange,borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:600}}>{ing}</span>)}
                        {recipe.ingredients.length>4&&<span style={{background:C.orangeLight,color:C.orange,borderRadius:20,padding:"3px 9px",fontSize:11,fontWeight:600}}>+{recipe.ingredients.length-4} más</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {totalMeals>0&&<button onClick={buildShoppingList} style={{width:"100%",padding:16,background:`linear-gradient(135deg,${C.green},#4A9E6E)`,color:"#fff",border:"none",borderRadius:18,fontSize:15,fontWeight:800,cursor:"pointer",marginTop:8,boxShadow:`0 4px 18px rgba(109,190,140,0.35)`}}>🛒 Generar Lista del Super ({totalMeals} comidas)</button>}
            {savedWeeks.length>0&&(
              <div style={{marginTop:22}}>
                <h3 style={{fontSize:14,fontWeight:700,color:C.purple,margin:"0 0 10px"}}>💾 Semanas Guardadas</h3>
                {savedWeeks.map((sw,i)=>(
                  <div key={i} onClick={()=>{setMenu(sw.menu);showToast(`📂 "${sw.name}" cargada`);}} style={{background:C.purpleLight,border:`1.5px solid ${C.lila}`,borderRadius:14,padding:"11px 16px",marginBottom:8,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontWeight:700,color:C.purple,fontSize:14}}>{sw.name}</span>
                    <span style={{fontSize:12,color:C.purple}}>Cargar →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ FRIDGE ════════ */}
        {view==="fridge"&&(
          <div>
            <div style={{background:`linear-gradient(135deg,${C.purpleLight},${C.lilaLight})`,borderRadius:24,padding:22,marginBottom:20,border:`2px solid ${C.lila}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                <div style={{fontSize:32}}>🧊</div>
                <div><h3 style={{margin:0,fontSize:19,fontWeight:800,color:C.purple}}>Chef Juanfra analiza tu nevera</h3>
                <p style={{margin:0,fontSize:13,color:"#7a6a8a"}}>Dinos qué tienes y cocinamos con eso</p></div>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[{id:"text",label:"📝 Escribir"},{id:"photo",label:"📸 Foto"}].map(m=>(
                  <button key={m.id} onClick={()=>setFridgeMode(m.id)} style={{flex:1,padding:"9px",border:`2px solid ${fridgeMode===m.id?C.purple:C.lila}`,borderRadius:12,background:fridgeMode===m.id?C.purple:"#fff",color:fridgeMode===m.id?"#fff":C.purple,fontWeight:700,fontSize:13,cursor:"pointer"}}>{m.label}</button>
                ))}
              </div>
              {fridgeMode==="text"
                ? <textarea value={fridgeInput} onChange={e=>setFridgeInput(e.target.value)} placeholder="Ej: pollo, arroz, zanahoria, huevos, tomate..." style={{width:"100%",minHeight:80,padding:"11px 14px",borderRadius:12,border:`2px solid ${C.lila}`,fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
                : <div>
                    <input type="file" ref={fileRef} accept="image/*" capture="environment" onChange={e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{setFridgeImage(r.result.split(",")[1]);showToast("📸 Foto lista");};r.readAsDataURL(f);}} style={{display:"none"}}/>
                    <button onClick={()=>fileRef.current.click()} style={{width:"100%",padding:14,background:"#fff",border:`2px dashed ${C.purple}`,borderRadius:14,color:C.purple,fontSize:14,fontWeight:700,cursor:"pointer"}}>{fridgeImage?"✅ Foto cargada — cambiar":"📸 Foto de la nevera"}</button>
                  </div>
              }
              <button onClick={scanFridge} disabled={fridgeLoading||(!fridgeInput.trim()&&!fridgeImage)} style={{width:"100%",marginTop:12,padding:14,background:fridgeLoading?C.lila:`linear-gradient(135deg,${C.purple},#7B5AB8)`,color:"#fff",border:"none",borderRadius:13,fontSize:14,fontWeight:800,cursor:fridgeLoading?"not-allowed":"pointer"}}>
                {fridgeLoading?"🔍 Analizando...":"🍳 ¿Qué puedo cocinar?"}
              </button>
            </div>
            {fridgeSuggestions.length>0&&fridgeSuggestions.map((rec,i)=>(
              <div key={i} style={{background:C.card,borderRadius:18,overflow:"hidden",marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:`1.5px solid ${C.border}`}}>
                <div style={{height:80,backgroundImage:`url(${getPhoto(rec.name)})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(0,0,0,0.6))"}}/>
                  <div style={{position:"absolute",bottom:8,left:12}}><span style={{background:C.purple,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#fff"}}>{MEAL_EMOJI[rec.meal]} {rec.meal}</span></div>
                </div>
                <div style={{padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div><div style={{fontSize:15,fontWeight:800}}>{rec.name}</div>{rec.time&&<div style={{fontSize:11,color:C.muted}}>⏱️ {rec.time}</div>}</div>
                    <button onClick={()=>setRecipe(DAYS[activeDay],rec.meal,rec)} style={{background:C.purple,color:"#fff",border:"none",borderRadius:10,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Agregar</button>
                  </div>
                  {rec.uses&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:5}}><span style={{fontSize:11,color:C.muted}}>Usa: </span>{rec.uses.map((u,j)=><span key={j} style={{background:C.greenLight,color:C.green,borderRadius:20,padding:"2px 8px",fontSize:11,fontWeight:600}}>{u}</span>)}</div>}
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{rec.ingredients?.slice(0,4).map((ing,j)=><span key={j} style={{background:C.purpleLight,color:C.purple,borderRadius:20,padding:"2px 8px",fontSize:11}}>{ing}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════ SHOPPING ════════ */}
        {view==="shopping"&&(
          <div>
            {!shopping.length
              ? <div style={{textAlign:"center",padding:"60px 20px"}}><div style={{fontSize:60,marginBottom:12}}>🛒</div><h3 style={{color:C.muted,fontWeight:500}}>Lista vacía</h3><button onClick={()=>setView("planner")} style={{background:C.orange,color:"#fff",border:"none",borderRadius:14,padding:"12px 24px",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:10}}>Ir al Planner</button></div>
              : <>
                  <div style={{background:C.card,borderRadius:18,padding:16,marginBottom:16,boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:800}}>Progreso</span><span style={{color:C.green,fontWeight:800}}>{checkedCount}/{shopping.length} ✓</span></div>
                    <div style={{background:C.border,borderRadius:20,height:10,overflow:"hidden"}}><div style={{width:`${shopping.length?(checkedCount/shopping.length)*100:0}%`,height:"100%",background:`linear-gradient(90deg,${C.green},#4A9E6E)`,borderRadius:20,transition:"width 0.4s"}}/></div>
                    {checkedCount===shopping.length&&shopping.length>0&&<div style={{textAlign:"center",marginTop:8,fontSize:16,fontWeight:800,color:C.green}}>🎉 ¡Compra completa!</div>}
                  </div>
                  {Object.entries(groupedShopping).map(([cat,items])=>(
                    <div key={cat} style={{marginBottom:16}}>
                      <h3 style={{fontSize:13,color:C.muted,margin:"0 0 8px",fontWeight:700}}>{cat}</h3>
                      <div style={{background:C.card,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,0.04)"}}>
                        {items.map((item,i)=>(
                          <div key={item.idx} onClick={()=>toggleItem(item.idx)} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<items.length-1?`1px solid ${C.border}`:"none",cursor:"pointer",opacity:item.checked?0.45:1,transition:"opacity 0.2s"}}>
                            <div style={{width:22,height:22,borderRadius:6,border:item.checked?"none":`2px solid ${C.border}`,background:item.checked?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontSize:13,fontWeight:700}}>{item.checked&&"✓"}</div>
                            <span style={{fontSize:15,textDecoration:item.checked?"line-through":"none"}}>{item.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={()=>setShopping(shopping.map(i=>({...i,checked:false})))} style={{width:"100%",padding:13,background:C.border,border:"none",borderRadius:14,color:C.muted,fontSize:14,fontWeight:700,cursor:"pointer"}}>🔄 Reiniciar</button>
                </>
            }
          </div>
        )}

        {/* ════════ PRICES ════════ */}
        {view==="prices"&&(
          <div>
            {/* Sub-tabs */}
            <div style={{display:"flex",gap:8,marginBottom:20}}>
              {[{id:"compare",label:"📊 Comparar"},{id:"edit",label:"✏️ Mis Precios"},{id:"add",label:"⚙️ Configurar"}].map(t=>(
                <button key={t.id} onClick={()=>setPriceView(t.id)} style={{flex:1,padding:"10px",border:`2px solid ${priceView===t.id?C.teal:C.border}`,borderRadius:14,background:priceView===t.id?C.teal:"#fff",color:priceView===t.id?"#fff":C.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── COMPARE ── */}
            {priceView==="compare"&&(
              <div>
                {/* Best super banner */}
                {bestSuperOverall()&&(
                  <div style={{background:`linear-gradient(135deg,${C.tealLight},${C.greenLight})`,border:`2px solid ${C.teal}`,borderRadius:20,padding:18,marginBottom:18,display:"flex",alignItems:"center",gap:14}}>
                    <div style={{fontSize:40}}>🏆</div>
                    <div>
                      <div style={{fontSize:12,color:C.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>Más económico esta semana</div>
                      <div style={{fontSize:20,fontWeight:800,color:"#2D2D2D"}}>{bestSuperOverall().sup}</div>
                      <div style={{fontSize:13,color:C.muted}}>Total registrado: <strong>${bestSuperOverall().total.toFixed(2)}</strong></div>
                    </div>
                  </div>
                )}

                {/* Per-super totals */}
                <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(supermarkets.length,3)},1fr)`,gap:10,marginBottom:20}}>
                  {totalPerSuper().map(({sup,total,count})=>{
                    const isBest = bestSuperOverall()?.sup === sup;
                    return (
                      <div key={sup} style={{background:isBest?C.greenLight:C.card,border:`2px solid ${isBest?C.green:C.border}`,borderRadius:18,padding:"16px 12px",textAlign:"center"}}>
                        <div style={{fontSize:12,color:C.muted,fontWeight:700,marginBottom:4}}>{sup}</div>
                        <div style={{fontSize:22,fontWeight:800,color:isBest?C.green:C.text}}>${total.toFixed(2)}</div>
                        <div style={{fontSize:11,color:C.muted}}>{count} productos</div>
                        {isBest&&<div style={{fontSize:11,fontWeight:700,color:C.green,marginTop:4}}>✅ Mejor precio</div>}
                      </div>
                    );
                  })}
                </div>

                {/* Product comparison table */}
                <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 12px"}}>Comparación por producto</h3>

                {/* Category filter */}
                <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
                  {["Todos","🥩 Carnes y Proteínas","🥛 Lácteos","🥦 Frutas y Verduras","🌾 Granos y Abarrotes","🫒 Aceites y Condimentos","🧴 Limpieza y Hogar"].map(cat=>(
                    <button key={cat} onClick={()=>setFilterCat(cat)} style={{padding:"6px 12px",borderRadius:20,border:`1.5px solid ${filterCat===cat?C.teal:C.border}`,background:filterCat===cat?C.teal:"#fff",color:filterCat===cat?"#fff":C.text,fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{cat==="Todos"?"Todos":cat.split(" ").slice(0,2).join(" ")}</button>
                  ))}
                </div>

                <input type="text" placeholder="🔍 Buscar producto..." value={priceSearch} onChange={e=>setPriceSearch(e.target.value)}
                  style={{width:"100%",padding:"11px 16px",borderRadius:14,border:`2px solid ${C.border}`,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12,fontFamily:"inherit"}}/>

                {filteredProducts.map(prod=>{
                  const entries = supermarkets.map(s=>({ s, p:getPrice(prod.id,s) }));
                  const withPrice = entries.filter(e=>e.p!==null);
                  if (!withPrice.length) return null;
                  const minP = Math.min(...withPrice.map(e=>e.p));
                  return (
                    <div key={prod.id} style={{background:C.card,borderRadius:16,padding:14,marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",border:`1.5px solid ${C.border}`}}>
                      <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>{prod.name} <span style={{fontSize:11,color:C.muted,fontWeight:400}}>({prod.unit})</span></div>
                      <div style={{display:"grid",gridTemplateColumns:`repeat(${supermarkets.length},1fr)`,gap:8}}>
                        {supermarkets.map(s=>{
                          const p = getPrice(prod.id,s);
                          const isCheap = p!==null && p===minP && withPrice.length>1;
                          return (
                            <div key={s} style={{textAlign:"center",background:isCheap?C.greenLight:C.bg,borderRadius:12,padding:"10px 6px",border:`1.5px solid ${isCheap?C.green:C.border}`}}>
                              <div style={{fontSize:10,color:C.muted,fontWeight:700,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s}</div>
                              {p!==null
                                ? <><div style={{fontSize:16,fontWeight:800,color:isCheap?C.green:C.text}}>${p.toFixed(2)}</div>{isCheap&&<div style={{fontSize:10,color:C.green,fontWeight:700}}>💚 Mejor</div>}</>
                                : <div style={{fontSize:12,color:"#ccc"}}>—</div>
                              }
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {filteredProducts.every(prod=>supermarkets.every(s=>getPrice(prod.id,s)===null))&&(
                  <div style={{textAlign:"center",padding:"40px 20px",color:C.muted}}>
                    <div style={{fontSize:48,marginBottom:10}}>💰</div>
                    <p style={{fontSize:15}}>Aún no tienes precios registrados.</p>
                    <button onClick={()=>setPriceView("edit")} style={{background:C.teal,color:"#fff",border:"none",borderRadius:14,padding:"12px 22px",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>✏️ Ingresar precios</button>
                  </div>
                )}
              </div>
            )}

            {/* ── EDIT PRICES ── */}
            {priceView==="edit"&&(
              <div>
                {/* Super selector */}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:13,color:C.muted,fontWeight:700,marginBottom:8}}>Supermercado que estás actualizando:</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {supermarkets.map(s=>(
                      <button key={s} onClick={()=>setEditSuper(s)} style={{padding:"9px 16px",border:`2px solid ${editSuper===s?C.teal:C.border}`,borderRadius:20,background:editSuper===s?C.teal:"#fff",color:editSuper===s?"#fff":C.text,fontWeight:700,fontSize:13,cursor:"pointer"}}>
                        {editSuper===s?"✓ ":""}{s}
                      </button>
                    ))}
                  </div>
                </div>

                <input type="text" placeholder="🔍 Buscar producto..." value={priceSearch} onChange={e=>setPriceSearch(e.target.value)}
                  style={{width:"100%",padding:"11px 16px",borderRadius:14,border:`2px solid ${C.border}`,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:8,fontFamily:"inherit"}}/>

                {/* Category pills */}
                <div style={{display:"flex",gap:6,overflowX:"auto",marginBottom:14,paddingBottom:4}}>
                  {allCategories.map(cat=>(
                    <button key={cat} onClick={()=>setFilterCat(cat)} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${filterCat===cat?C.teal:C.border}`,background:filterCat===cat?C.teal:"#fff",color:filterCat===cat?"#fff":C.text,fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{cat==="Todos"?"Todos":cat.split(" ").slice(0,2).join(" ")}</button>
                  ))}
                </div>

                <div style={{background:C.tealLight,borderRadius:14,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#2a7a78"}}>
                  💡 Toca el precio de cualquier producto para editarlo en <strong>{editSuper}</strong>
                </div>

                {Object.entries(
                  filteredProducts.reduce((acc,p)=>{
                    if (!acc[p.category]) acc[p.category]=[];
                    acc[p.category].push(p); return acc;
                  },{})
                ).map(([cat,prods])=>(
                  <div key={cat} style={{marginBottom:18}}>
                    <h4 style={{fontSize:13,color:C.muted,margin:"0 0 8px",fontWeight:700}}>{cat}</h4>
                    <div style={{background:C.card,borderRadius:16,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                      {prods.map((prod,i)=>{
                        const isEditing = editingPrice?.prodId===prod.id && editingPrice?.super===editSuper;
                        const p = getPrice(prod.id, editSuper);
                        return (
                          <div key={prod.id} style={{display:"flex",alignItems:"center",padding:"13px 16px",borderBottom:i<prods.length-1?`1px solid ${C.border}`:"none",gap:12}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:14,fontWeight:600}}>{prod.name}</div>
                              <div style={{fontSize:11,color:C.muted}}>{prod.unit}</div>
                            </div>
                            {isEditing
                              ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                                  <span style={{fontSize:14,fontWeight:700,color:C.muted}}>$</span>
                                  <input ref={priceInputRef} type="number" step="0.01" min="0" value={tempPrice} onChange={e=>setTempPrice(e.target.value)}
                                    style={{width:80,padding:"7px 10px",border:`2px solid ${C.teal}`,borderRadius:10,fontSize:15,outline:"none",fontFamily:"inherit",fontWeight:700}}
                                    onKeyDown={e=>{ if(e.key==="Enter") savePrice(prod.id,editSuper,tempPrice); if(e.key==="Escape") setEditingPrice(null); }}
                                  />
                                  <button onClick={()=>savePrice(prod.id,editSuper,tempPrice)} style={{background:C.teal,color:"#fff",border:"none",borderRadius:10,padding:"7px 12px",fontWeight:700,cursor:"pointer",fontSize:13}}>✓</button>
                                  <button onClick={()=>setEditingPrice(null)} style={{background:C.border,color:C.muted,border:"none",borderRadius:10,padding:"7px 10px",cursor:"pointer",fontSize:13}}>✕</button>
                                </div>
                              : <button onClick={()=>{setEditingPrice({prodId:prod.id,super:editSuper});setTempPrice(p!==null?p.toString():"");setTimeout(()=>priceInputRef.current?.focus(),50);}}
                                  style={{background:p!==null?C.tealLight:C.bg,border:`1.5px solid ${p!==null?C.teal:C.border}`,borderRadius:12,padding:"8px 14px",cursor:"pointer",minWidth:80,textAlign:"center"}}>
                                  {p!==null?<span style={{fontSize:15,fontWeight:800,color:C.teal}}>${p.toFixed(2)}</span>:<span style={{fontSize:12,color:"#bbb"}}>+ Precio</span>}
                                </button>
                            }
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CONFIG ── */}
            {priceView==="add"&&(
              <div>
                {/* Supermarkets */}
                <div style={{background:C.card,borderRadius:20,padding:18,marginBottom:18,boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
                  <h3 style={{margin:"0 0 14px",fontSize:16,fontWeight:800}}>🏪 Mis Supermercados</h3>
                  {supermarkets.map(s=>(
                    <div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontSize:15,fontWeight:600}}>{s}</span>
                      <button onClick={()=>{const n=prompt("Nuevo nombre:",s);if(n&&n.trim()&&n!==s){setSupermarkets(prev=>prev.map(x=>x===s?n.trim():x));showToast("✅ Nombre actualizado");}}} style={{background:C.greenLight,color:C.green,border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:700,marginRight:6}}>✏️ Editar</button>
                    <button onClick={()=>removeSupermarket(s)} style={{background:C.orangeLight,color:C.orange,border:"none",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,fontWeight:700}}>Eliminar</button>
                    </div>
                  ))}
                  <div style={{display:"flex",gap:8,marginTop:14}}>
                    <input type="text" placeholder="Nombre del supermercado..." value={newSuperName} onChange={e=>setNewSuperName(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addSupermarket()}
                      style={{flex:1,padding:"10px 14px",border:`2px solid ${C.border}`,borderRadius:12,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
                    <button onClick={addSupermarket} style={{background:C.teal,color:"#fff",border:"none",borderRadius:12,padding:"10px 18px",fontSize:14,fontWeight:700,cursor:"pointer"}}>+ Agregar</button>
                  </div>
                </div>

                {/* Add product */}
                <div style={{background:C.card,borderRadius:20,padding:18,boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
                  <h3 style={{margin:"0 0 14px",fontSize:16,fontWeight:800}}>📦 Agregar Producto</h3>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    <input type="text" placeholder="Nombre del producto (ej: Aceite de oliva 500ml)" value={newProd.name} onChange={e=>setNewProd(p=>({...p,name:e.target.value}))}
                      style={{padding:"11px 14px",border:`2px solid ${C.border}`,borderRadius:12,fontSize:14,outline:"none",fontFamily:"inherit"}}/>
                    <div style={{display:"flex",gap:10}}>
                      <select value={newProd.category} onChange={e=>setNewProd(p=>({...p,category:e.target.value}))}
                        style={{flex:2,padding:"10px 12px",border:`2px solid ${C.border}`,borderRadius:12,fontSize:13,outline:"none",fontFamily:"inherit",background:"#fff"}}>
                        {Object.keys(PROD_CATEGORIES).map(c=><option key={c}>{c}</option>)}
                      </select>
                      <select value={newProd.unit} onChange={e=>setNewProd(p=>({...p,unit:e.target.value}))}
                        style={{flex:1,padding:"10px 12px",border:`2px solid ${C.border}`,borderRadius:12,fontSize:13,outline:"none",fontFamily:"inherit",background:"#fff"}}>
                        {["kg","g","L","ml","unid","paq","lata","doc","bot","caja"].map(u=><option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <button onClick={addProduct} style={{padding:"13px",background:`linear-gradient(135deg,${C.teal},#3A9E9B)`,color:"#fff",border:"none",borderRadius:14,fontSize:15,fontWeight:800,cursor:"pointer"}}>
                      + Agregar a mi lista de productos
                    </button>
                  </div>

                  {/* Custom products list */}
                  {products.filter(p=>p.id.startsWith("custom_")).length>0&&(
                    <div style={{marginTop:16}}>
                      <div style={{fontSize:13,color:C.muted,fontWeight:700,marginBottom:8}}>Mis productos personalizados:</div>
                      {products.filter(p=>p.id.startsWith("custom_")).map(p=>(
                        <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
                          <div><div style={{fontSize:14,fontWeight:600}}>{p.name}</div><div style={{fontSize:11,color:C.muted}}>{p.category} · {p.unit}</div></div>
                          <button onClick={()=>removeProduct(p.id)} style={{background:C.orangeLight,color:C.orange,border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:12,fontWeight:700}}>✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ CHEF JUANFRA ════════ */}
        {view==="ai"&&(
          <div>
            <div style={{background:`linear-gradient(135deg,${C.yellowLight},${C.orangeLight})`,borderRadius:24,padding:22,marginBottom:20,border:`2px solid ${C.yellow}`}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:46,height:46,borderRadius:14,background:C.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>👨‍🍳</div>
                <div><h3 style={{margin:0,fontSize:18,fontWeight:800,color:C.orange}}>Chef Juanfra IA</h3><p style={{margin:0,fontSize:12,color:"#c47a40"}}>Tu chef personal latinoamericano</p></div>
              </div>
              <textarea value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="¿Cuántas personas? ¿Restricciones? ¿Poco tiempo? ¿Quieres comer sano y económico?..."
                style={{width:"100%",minHeight:80,padding:"11px 14px",borderRadius:12,border:`2px solid ${C.yellow}`,fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"rgba(255,255,255,0.8)"}}/>
              <button onClick={generateAI} disabled={aiLoading||!aiInput.trim()} style={{width:"100%",marginTop:12,padding:14,background:aiLoading?C.yellow:`linear-gradient(135deg,${C.orange},#C96A45)`,color:"#fff",border:"none",borderRadius:13,fontSize:14,fontWeight:800,cursor:aiLoading?"not-allowed":"pointer"}}>
                {aiLoading?"👨‍🍳 Chef Juanfra cocinando ideas...":"🍳 ¡Sugiéreme recetas!"}
              </button>
            </div>
            {aiSuggestions.map((rec,i)=>(
              <div key={i} style={{background:C.card,borderRadius:18,overflow:"hidden",marginBottom:12,boxShadow:"0 2px 10px rgba(0,0,0,0.06)",border:`1.5px solid ${C.border}`}}>
                <div style={{height:90,backgroundImage:`url(${getPhoto(rec.name)})`,backgroundSize:"cover",backgroundPosition:"center",position:"relative"}}>
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent,rgba(0,0,0,0.6))"}}/>
                  <div style={{position:"absolute",bottom:8,left:12,display:"flex",gap:6}}>
                    <span style={{background:C.orange,borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#fff"}}>{MEAL_EMOJI[rec.meal]} {rec.meal}</span>
                    {rec.time&&<span style={{background:"rgba(255,255,255,0.9)",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{rec.time}</span>}
                  </div>
                </div>
                <div style={{padding:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{fontSize:15,fontWeight:800}}>{rec.name}</div>
                    <button onClick={()=>setRecipe(DAYS[activeDay],rec.meal,rec)} style={{background:C.orange,color:"#fff",border:"none",borderRadius:10,padding:"7px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}}>+ Agregar</button>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{rec.ingredients?.slice(0,5).map((ing,j)=><span key={j} style={{background:C.orangeLight,color:C.orange,borderRadius:20,padding:"3px 8px",fontSize:11}}>{ing}</span>)}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:20}}>
              <h3 style={{fontSize:15,fontWeight:800,margin:"0 0 12px"}}>🍴 Recetario Latinoamericano</h3>
              <input type="text" placeholder="🔍 Buscar..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:"100%",padding:"11px 16px",borderRadius:14,border:`2px solid ${C.border}`,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:12,fontFamily:"inherit"}}/>
              {["Desayuno","Almuerzo","Cena"].map(mt=>{
                const f=QUICK_RECIPES.filter(r=>r.meal===mt&&r.name.toLowerCase().includes(search.toLowerCase()));
                if (!f.length) return null;
                return (
                  <div key={mt} style={{marginBottom:14}}>
                    <h4 style={{fontSize:12,color:C.muted,margin:"0 0 8px",fontWeight:700,textTransform:"uppercase",letterSpacing:1}}>{MEAL_EMOJI[mt]} {mt}</h4>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                      {f.map(rec=><button key={rec.name} onClick={()=>{setRecipe(DAYS[activeDay],rec.meal,rec);setView("planner");}} style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"7px 13px",color:C.text,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>{rec.name}</button>)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════ REWARDS ════════ */}
        {view==="rewards"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:18}}>
              {[{label:"Puntos",value:points,c:C.orange,bg:C.orangeLight},{label:"Nivel",value:level,c:C.purple,bg:C.purpleLight},{label:"Logros",value:`${earnedBadges.size}/${BADGES.length}`,c:C.green,bg:C.greenLight}].map((s,i)=>(
                <div key={i} style={{background:s.bg,borderRadius:16,padding:"14px 10px",textAlign:"center"}}>
                  <div style={{fontSize:22,fontWeight:800,color:s.c}}>{s.value}</div>
                  <div style={{fontSize:11,color:s.c,fontWeight:700,opacity:0.8}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.card,borderRadius:18,padding:16,marginBottom:18,boxShadow:"0 2px 10px rgba(0,0,0,0.05)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontWeight:800}}>Nivel {level} → {level+1}</span><span style={{color:C.orange,fontWeight:700}}>{levelPct}/100</span></div>
              <div style={{background:C.border,borderRadius:20,height:12,overflow:"hidden"}}><div style={{width:`${levelPct}%`,height:"100%",background:`linear-gradient(90deg,${C.orange},${C.yellow})`,borderRadius:20,transition:"width 0.5s"}}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
              {BADGES.map(badge=>{
                const earned=earnedBadges.has(badge.id);
                return (
                  <div key={badge.id} style={{background:earned?C.yellowLight:C.card,borderRadius:18,padding:16,border:`2px solid ${earned?C.yellow:C.border}`,opacity:earned?1:0.5}}>
                    <div style={{fontSize:28,marginBottom:6}}>{badge.icon}</div>
                    <div style={{fontSize:13,fontWeight:800,marginBottom:2}}>{badge.label}</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{badge.desc}</div>
                    <div style={{fontSize:12,fontWeight:700,color:earned?C.orange:C.muted}}>{earned?`✅ +${badge.pts} pts`:`🎯 +${badge.pts} pts`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── RECIPE PICKER MODAL ─── */}
      {showPicker&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowPicker(null)}>
          <div style={{background:C.bg,width:"100%",maxHeight:"75vh",borderRadius:"26px 26px 0 0",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:"18px 18px 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h3 style={{margin:0,fontSize:17,fontWeight:800}}>{MEAL_EMOJI[showPicker.meal]} {showPicker.meal} — {showPicker.day}</h3>
                <button onClick={()=>setShowPicker(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.muted}}>×</button>
              </div>
              <input type="text" placeholder="🔍 Buscar receta..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:"100%",padding:"10px 14px",borderRadius:12,border:`2px solid ${C.border}`,fontSize:14,outline:"none",boxSizing:"border-box",marginBottom:10,fontFamily:"inherit"}}/>
            </div>
            <div style={{overflowY:"auto",padding:"0 18px 30px"}}>
              {filteredRecipes.map(rec=>(
                <div key={rec.name} onClick={()=>setRecipe(showPicker.day,showPicker.meal,rec)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
                  <div style={{width:50,height:50,borderRadius:12,backgroundImage:`url(${getPhoto(rec.name)})`,backgroundSize:"cover",backgroundPosition:"center",flexShrink:0}}/>
                  <div><div style={{fontWeight:700,fontSize:14}}>{rec.name}</div><div style={{fontSize:11,color:C.muted}}>⏱️ {rec.time} · {rec.ingredients.slice(0,2).join(", ")}</div></div>
                </div>
              ))}
              {!filteredRecipes.length&&(
                <div style={{textAlign:"center",padding:20}}>
                  <p style={{color:C.muted}}>No encontramos esa receta</p>
                  {search.trim()&&<button onClick={()=>{setRecipe(showPicker.day,showPicker.meal,{name:search.trim(),ingredients:[],meal:showPicker.meal});showToast("✅ Receta personalizada agregada");}} style={{background:C.orange,color:"#fff",border:"none",borderRadius:14,padding:"10px 20px",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:8}}>
                    ➕ Agregar "{search.trim()}" como receta
                  </button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TOAST ─── */}
      {toast&&<div style={{position:"fixed",bottom:88,left:"50%",transform:"translateX(-50%)",background:C.text,color:"#fff",borderRadius:20,padding:"11px 22px",fontSize:13,fontWeight:700,boxShadow:"0 8px 30px rgba(0,0,0,0.25)",zIndex:300,whiteSpace:"nowrap"}}>{toast}</div>}

      {/* ─── BADGE CELEBRATION ─── */}
      {newBadge&&(
        <div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:C.card,borderRadius:28,padding:"28px 34px",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.3)",zIndex:400,border:`3px solid ${C.yellow}`,minWidth:250}}>
          <div style={{fontSize:52,marginBottom:6}}>{newBadge.icon}</div>
          <div style={{fontSize:12,fontWeight:700,color:C.orange,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>¡Nuevo Logro!</div>
          <div style={{fontSize:20,fontWeight:800,marginBottom:4}}>{newBadge.label}</div>
          <div style={{fontSize:13,color:C.muted,marginBottom:12}}>{newBadge.desc}</div>
          <div style={{background:C.yellowLight,borderRadius:20,padding:"7px 20px",display:"inline-block",color:C.orange,fontWeight:800,fontSize:15}}>+{newBadge.pts} pts ⭐</div>
        </div>
      )}
    </div>
  );
}
