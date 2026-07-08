import { createContext, useMemo, useState } from 'react';

export const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  const persist = (next) => {
    setCart(next);
    localStorage.setItem('cart', JSON.stringify(next));
  };

  const value = useMemo(
    () => ({
      cart,
      addToCart: ({ productId, title, price, image, qty = 1 }) => {
        const next = [...cart];
        const idx = next.findIndex((x) => x.productId === productId);
        if (idx >= 0) next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        else next.push({ productId, title, price, image, qty });
        persist(next);
      },
      removeFromCart: (productId) => {
        persist(cart.filter((x) => x.productId !== productId));
      },
      setQty: (productId, qty) => {
        const q = Math.max(1, Number(qty || 1));
        persist(cart.map((x) => (x.productId === productId ? { ...x, qty: q } : x)));
      },
      clearCart: () => persist([]),
      totals: () => {
        const subtotal = cart.reduce((sum, it) => sum + it.price * it.qty, 0);
        const shipping = 0;
        const tax = 0;
        return { subtotal, shipping, tax, grandTotal: subtotal + shipping + tax };
      }
    }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

