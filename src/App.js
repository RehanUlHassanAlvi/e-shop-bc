// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { auth, firestore } from './firebase';
import LoginPage from './LoginPage';
import OrderHistoryPage from './OrderHistoryPage';
import ShoppingItems from './ShoppingItems';
import './App.css'; // Import the CSS file for styling

const initialItems = [
  { id: 1, name: 'Item 1', price: 10 },
  { id: 2, name: 'Item 2', price: 20 },
  { id: 3, name: 'Item 3', price: 30 }
];

const App = () => {
  const [cart, setCart] = useState([]);
  const [reviews, setReviews] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      if (user) {
        loadCartFromFirestore(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadCartFromFirestore = async (userId) => {
    try {
      const cartRef = firestore.collection('carts').doc(userId);
      const cartSnapshot = await cartRef.get();
      if (cartSnapshot.exists) {
        const cartData = cartSnapshot.data();
        setCart(cartData.items || []);
      }
    } catch (error) {
      console.error('Error loading cart:', error.message);
    }
  };

  const saveCartToFirestore = async (userId, cartItems) => {
    try {
      const cartRef = firestore.collection('carts').doc(userId);
      await cartRef.set({ items: cartItems });
      console.log('Cart saved successfully:', cartItems);
    } catch (error) {
      console.error('Error saving cart:', error.message);
    }
  };

  const saveOrderToFirestore = async (userId, order) => {
    try {
      const ordersRef = firestore.collection('orders');
      await ordersRef.add({ userId, ...order });
      console.log('Order saved successfully:', order);
    } catch (error) {
      console.error('Error saving order:', error.message);
    }
  };

  const addToCart = (item) => {
    const updatedCart = [...cart, item];
    setCart(updatedCart);
    saveCartToFirestore(user.uid, updatedCart);
  };

  const removeFromCart = (item) => {
    const updatedCart = cart.filter(cartItem => cartItem.id !== item.id);
    setCart(updatedCart);
    saveCartToFirestore(user.uid, updatedCart);
  };

  const buyItems = () => {
    alert('Items bought!');
    if (user) {
      saveCartToFirestore(user.uid, []);
      const order = {
        items: cart,
        totalPrice: cart.reduce((total, item) => total + item.price, 0),
        orderDate: new Date().toISOString()
      };
      saveOrderToFirestore(user.uid, order);
      setCart([]);
    }
  };

  const leaveReview = (itemId, rating) => {
    setReviews({ ...reviews, [itemId]: rating });
  };

  return (
    <Router>
      <div>
        <div className="navbar">
          <div>
            <Link to="/" className="nav-link">Home</Link>
            {user && (
              <Link to="/order-history" className="nav-link">Order History</Link>
            )}
          </div>
          {user && (
            <button onClick={() => auth.signOut()} className="logout-btn">Logout</button>
          )}
        </div>
        <Routes>
          <Route path="/" element={user ? (
            <div>
              <h1>Welcome, {user.email}</h1>
              <ShoppingItems items={initialItems} addToCart={addToCart} removeFromCart={removeFromCart} />
              <div className="cart-section">
                <h2>Cart</h2>
                <ul>
                  {cart.map(item => (
                    <li key={item.id} className="cart-item">
                      <span className="cart-item-name">{item.name}</span> - ${item.price}
                    </li>
                  ))}
                </ul>
                {cart.length > 0 && <button onClick={buyItems} className="buy-btn">Buy Items</button>}
              </div>
            </div>
          ) : (
            <LoginPage />
          )} />
          <Route path="/order-history" element={user ? (
            <OrderHistoryPage userId={user.uid} />
          ) : (
            <LoginPage />
          )} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
