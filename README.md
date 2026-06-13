# 🍽️ MenúSemana v2.0 — Beta + Escala

Planificador de comidas para América Latina con cuentas de usuario, comparador de precios y sistema de membresías.

---

## 🗺️ Roadmap completo

| Fase | Estado | Qué incluye |
|------|--------|-------------|
| ✅ **Fase 1 — Beta** | Listo | App completa, Vercel, PWA |
| ✅ **Fase 2 — Cuentas** | Listo | Supabase auth, datos en nube |
| ⏳ **Fase 3 — Cobrar** | Próximo | Stripe, webhooks, membresías |
| ⏳ **Fase 4 — Escalar** | Futuro | App nativa, notificaciones push |

---

## 🚀 Publicar en Vercel (paso a paso)

### Paso 1 — Crear proyecto en Supabase

1. Ve a **supabase.com** → crear cuenta gratis
2. Clic en **"New project"** → ponle nombre `menusamana`
3. Elige la región más cercana a tus usuarios (ej: South America)
4. Espera 1-2 minutos que termine de configurarse
5. Ve a **SQL Editor** → pega todo el contenido de `supabase-schema.sql` → Run
6. Ve a **Project Settings → API** y copia:
   - `Project URL` → es tu `VITE_SUPABASE_URL`
   - `anon public key` → es tu `VITE_SUPABASE_ANON_KEY`

### Paso 2 — Subir a GitHub

```bash
git init
git add .
git commit -m "MenúSemana v2.0 — auth + cloud"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/menusamana.git
git push -u origin main
```

### Paso 3 — Conectar con Vercel

1. Ve a **vercel.com** → importar repositorio
2. Framework: Vite (detecta automático)
3. En **Environment Variables** agrega:

```
VITE_SUPABASE_URL          = https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY     = eyJxxxx...
VITE_ANTHROPIC_API_KEY     = sk-ant-xxxx...
```

4. Deploy → en 2 min tienes tu URL pública

### Paso 4 — Activar email en Supabase

En Supabase → Authentication → Settings:
- Site URL: `https://tu-app.vercel.app`
- Redirect URLs: `https://tu-app.vercel.app/**`

---

## 💳 Fase 3 — Stripe (cobrar membresías)

Cuando tengas usuarios beta y quieras cobrar:

### Precios sugeridos para América Latina
| Plan | Precio | Target |
|------|--------|--------|
| Gratis | $0 | Adquisición, beta |
| Pro | $4.99/mes | 1 persona o pareja |
| Familia | $8.99/mes | Familia de hasta 5 |

### Pasos
1. Crear cuenta en **stripe.com**
2. Crear productos y precios en Stripe Dashboard
3. Crear endpoint `/api/checkout` en Vercel (Edge Function)
4. Crear webhook `/api/stripe-webhook` que llama a `upgrade_user_plan()`
5. En `Root.jsx`, reemplazar el `alert()` con `window.location.href = checkout URL`

### El webhook actualiza el plan en Supabase:
```sql
SELECT upgrade_user_plan(
  'user-uuid-here',
  'pro',
  'cus_stripe_id',
  'sub_stripe_id',
  '2025-08-01'::timestamptz
);
```

---

## 📁 Estructura del proyecto

```
menusamana/
├── src/
│   ├── Root.jsx              ← Auth gate + data wiring
│   ├── App.jsx               ← App principal (recibe auth+data como props)
│   ├── components/
│   │   ├── AuthScreen.jsx    ← Login / registro / reset password
│   │   └── Paywall.jsx       ← Modal de planes + LockedFeature
│   ├── hooks/
│   │   ├── useAuth.js        ← Sesión de usuario, plan
│   │   └── useUserData.js    ← Datos en nube con auto-sync
│   └── lib/
│       ├── supabase.js       ← Cliente + definición de PLANES
│       └── constants.js      ← Productos, categorías
├── supabase-schema.sql       ← BD: ejecutar 1 vez en Supabase
├── vite.config.js
└── vercel.json
```

---

## 🔒 Seguridad

- Row Level Security (RLS) activo en Supabase — cada usuario ve solo sus datos
- Claves nunca en el código, siempre en variables de entorno
- Stripe webhooks verificados con firma secreta (Fase 3)
- La `anon key` de Supabase es segura para el frontend (RLS la protege)

---

## 💻 Desarrollo local

```bash
npm install
```

Crea `.env.local` con:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
VITE_ANTHROPIC_API_KEY=sk-ant-xxx...
```

Luego:
```bash
npm run dev
```
