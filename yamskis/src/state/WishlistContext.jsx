import { createContext, useEffect, useMemo, useState } from 'react';

import { apiGetWishlist, apiToggleWishlist, setAuthTokenHeader } from '../api/client';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setAuthTokenHeader();
        const data = await apiGetWishlist();
        setWishlist(data.wishlist || []);
      } catch {
        // ignore when not logged in
      } finally {
        setHydrated(true);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({
      wishlist,
      hydrated,
      isWished: (productId) => wishlist.some((p) => p._id === productId),
      toggle: async (productId) => {
        setAuthTokenHeader();
        const data = await apiToggleWishlist(productId);
        setWishlist(data.wishlist || []);
      }
    }),
    [wishlist, hydrated]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

