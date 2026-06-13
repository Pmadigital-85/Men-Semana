import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

// Debounce helper — saves to DB only after user stops typing for 1.5s
function useDebouncedSave(fn, delay = 1500) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export function useUserData(userId) {
  const [menu, setMenuState]               = useState({})
  const [savedWeeks, setSavedWeeksState]   = useState([])
  const [products, setProductsState]       = useState(null)   // null = not loaded yet
  const [supermarkets, setSupermarketsState] = useState(null)
  const [prices, setPricesState]           = useState({})
  const [syncing, setSyncing]              = useState(false)
  const [lastSaved, setLastSaved]          = useState(null)

  // ── Load all data on mount ──
  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setSyncing(true)
      const { data } = await supabase
        .from('user_data')
        .select('key, value')
        .eq('user_id', userId)

      if (data) {
        const map = Object.fromEntries(data.map(r => [r.key, r.value]))
        if (map.menu)         setMenuState(map.menu)
        if (map.savedWeeks)   setSavedWeeksState(map.savedWeeks)
        if (map.products)     setProductsState(map.products)
        if (map.supermarkets) setSupermarketsState(map.supermarkets)
        if (map.prices)       setPricesState(map.prices)
      }
      setSyncing(false)
    }
    load()
  }, [userId])

  // ── Generic upsert to DB ──
  const saveKey = useCallback(async (key, value) => {
    if (!userId) return
    setSyncing(true)
    await supabase.from('user_data').upsert(
      { user_id: userId, key, value, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,key' }
    )
    setLastSaved(new Date())
    setSyncing(false)
  }, [userId])

  const debouncedSave = useDebouncedSave(saveKey)

  // ── Setters that update state AND sync ──
  const setMenu = (v) => {
    const val = typeof v === 'function' ? v(menu) : v
    setMenuState(val)
    debouncedSave('menu', val)
  }

  const setSavedWeeks = (v) => {
    const val = typeof v === 'function' ? v(savedWeeks) : v
    setSavedWeeksState(val)
    saveKey('savedWeeks', val)            // save immediately (user action)
  }

  const setProducts = (v) => {
    const val = typeof v === 'function' ? v(products) : v
    setProductsState(val)
    debouncedSave('products', val)
  }

  const setSupermarkets = (v) => {
    const val = typeof v === 'function' ? v(supermarkets) : v
    setSupermarketsState(val)
    saveKey('supermarkets', val)
  }

  const setPrices = (v) => {
    const val = typeof v === 'function' ? v(prices) : v
    setPricesState(val)
    debouncedSave('prices', val)
  }

  return {
    menu, setMenu,
    savedWeeks, setSavedWeeks,
    products, setProducts,
    supermarkets, setSupermarkets,
    prices, setPrices,
    syncing, lastSaved,
    dataLoaded: products !== null,   // true once first load completes
  }
}
