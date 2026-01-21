import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('milan_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const addToCart = (product) => {
    const newCart = [...cart, { ...product, cartId: Date.now() + Math.random() }];
    setCart(newCart);
    localStorage.setItem('milan_cart', JSON.stringify(newCart));
  };

  const removeFromCart = (cartId) => {
    const newCart = cart.filter(item => item.cartId !== cartId);
    setCart(newCart);
    localStorage.setItem('milan_cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('milan_cart');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartCount: cart.length }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);