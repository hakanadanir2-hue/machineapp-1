"use client";
import { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  discounted_price: number | null;
  image_url: string | null;
  quantity: number;
  variant?: string;
}

interface CartState { items: CartItem[]; }

type Action =
  | { type: "ADD"; item: Omit<CartItem, "quantity"> }
  | { type: "REMOVE"; id: string; variant?: string }
  | { type: "UPDATE_QTY"; id: string; variant: string | undefined; qty: number }
  | { type: "CLEAR" };

function key(id: string, variant?: string) { return `${id}__${variant ?? ""}` }

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "ADD": {
      const k = key(action.item.id, action.item.variant);
      const existing = state.items.find((i) => key(i.id, i.variant) === k);
      if (existing) {
        return { items: state.items.map((i) => key(i.id, i.variant) === k ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => key(i.id, i.variant) !== key(action.id, action.variant)) };
    case "UPDATE_QTY":
      if (action.qty <= 0) return { items: state.items.filter((i) => key(i.id, i.variant) !== key(action.id, action.variant)) };
      return { items: state.items.map((i) => key(i.id, i.variant) === key(action.id, action.variant) ? { ...i, quantity: action.qty } : i) };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

interface CartCtx {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string, variant?: string) => void;
  updateQty: (id: string, variant: string | undefined, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  const add        = useCallback((item: Omit<CartItem, "quantity">) => dispatch({ type: "ADD", item }), []);
  const remove     = useCallback((id: string, variant?: string) => dispatch({ type: "REMOVE", id, variant }), []);
  const updateQty  = useCallback((id: string, variant: string | undefined, qty: number) => dispatch({ type: "UPDATE_QTY", id, variant, qty }), []);
  const clear      = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + (i.discounted_price ?? i.price) * i.quantity, 0);

  return <Ctx.Provider value={{ items: state.items, totalItems, totalPrice, add, remove, updateQty, clear }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
