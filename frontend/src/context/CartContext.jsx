import { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const initialState = {
  items: [],
  loading: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'CLEAR_CART':
      return { ...state, items: [], loading: false };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Fetch cart when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await api.get('/cart');
      if (data.success) {
        dispatch({ type: 'SET_CART', payload: data.data.items || [] });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      if (data.success) {
        dispatch({ type: 'SET_CART', payload: data.data.items || [] });
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      if (data.success) {
        dispatch({ type: 'SET_CART', payload: data.data.items || [] });
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      if (data.success) {
        dispatch({ type: 'SET_CART', payload: data.data.items || [] });
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      throw error;
    }
  };

  const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        ...state,
        totalItems,
        totalPrice,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
