'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { products } from '@/lib/catalog';
import { MAX_PRODUCT_QUANTITY } from '@/lib/pricing';
type CartItem = {
  id: string;
  quantity: number;
};
type ShopState = {
  cart: CartItem[];
  saved: string[];
};
type ShopContextValue = ShopState & {
  ready: boolean;
  count: number;
  toast: string;
  add: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  toggleSaved: (id: string) => void;
  notify: (message: string) => void;
};
const STORAGE_KEY = 'jjglass-shop-v1';
const knownIds = new Set(products.map(product => product.id));
const purchasableIds = new Set(products.filter(product => product.available !== false && !product.hasOptions).map(product => product.id));
const ShopContext = createContext<ShopContextValue | null>(null);
const quantityLimit = (value: number) => Math.min(MAX_PRODUCT_QUANTITY, Math.max(1, Math.floor(value)));
function restoreState(raw: string | null): ShopState {
  const empty = {
    cart: [],
    saved: []
  };
  if (!raw) return empty;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return empty;
    const record = value as Record<string, unknown>;
    const quantities = new Map<string, number>();
    if (Array.isArray(record.cart)) {
      for (const item of record.cart) {
        if (!item || typeof item !== 'object') continue;
        const {
          id,
          quantity
        } = item as Record<string, unknown>;
        if (typeof id !== 'string' || !purchasableIds.has(id) || typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 1) continue;
        quantities.set(id, quantityLimit((quantities.get(id) ?? 0) + quantity));
      }
    }
    const saved = Array.isArray(record.saved) ? [...new Set(record.saved.filter((id): id is string => typeof id === 'string' && knownIds.has(id)))] : [];
    return {
      cart: [...quantities].map(([id, quantity]) => ({
        id,
        quantity
      })),
      saved
    };
  } catch {
    return empty;
  }
}
export function ShopProvider({
  children
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<ShopState>({
    cart: [],
    saved: []
  });
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => {
    try {
      setState(restoreState(window.localStorage.getItem(STORAGE_KEY)));
    } catch {/* Shopping still works when browser storage is unavailable. */}
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {/* Keep the current session usable without persistent storage. */}
  }, [ready, state]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const add = useCallback((id: string, quantity = 1) => {
    if (!purchasableIds.has(id) || !Number.isFinite(quantity) || quantity < 1) return;
    setState(previous => {
      const existing = previous.cart.find(item => item.id === id);
      return {
        ...previous,
        cart: existing ? previous.cart.map(item => item.id === id ? {
          id,
          quantity: quantityLimit(item.quantity + quantity)
        } : item) : [...previous.cart, {
          id,
          quantity: quantityLimit(quantity)
        }]
      };
    });
  }, []);
  const setQuantity = useCallback((id: string, quantity: number) => {
    if (!purchasableIds.has(id) || !Number.isFinite(quantity) || quantity < 1) return;
    setState(previous => ({
      ...previous,
      cart: previous.cart.map(item => item.id === id ? {
        id,
        quantity: quantityLimit(quantity)
      } : item)
    }));
  }, []);
  const remove = useCallback((id: string) => setState(previous => ({
    ...previous,
    cart: previous.cart.filter(item => item.id !== id)
  })), []);
  const clear = useCallback(() => setState(previous => ({
    ...previous,
    cart: []
  })), []);
  const toggleSaved = useCallback((id: string) => {
    if (!knownIds.has(id)) return;
    setState(previous => ({
      ...previous,
      saved: previous.saved.includes(id) ? previous.saved.filter(value => value !== id) : [...previous.saved, id]
    }));
  }, []);
  const notify = useCallback((message: string) => setToast(message), []);
  const value = useMemo(() => ({
    ...state,
    ready,
    toast,
    add,
    setQuantity,
    remove,
    clear,
    toggleSaved,
    notify,
    count: state.cart.reduce((sum, item) => sum + item.quantity, 0)
  }), [state, ready, toast, add, setQuantity, remove, clear, toggleSaved, notify]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider.');
  return context;
}
