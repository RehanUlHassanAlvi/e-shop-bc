
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { auth, firestore } from './firebase';
import Web3 from 'web3';
import reviewContractAbi from './ReviewContract.json'; // Import the ABI of your smart contract
import LoginPage from './LoginPage';
import OrderHistoryPage from './OrderHistoryPage';
import ShoppingItems from './ShoppingItems';
import './App.css'; // Import the CSS file for styling

const initialItems = [
  { id: 1, name: 'Apple iPhone 13', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 2, name: 'Samsung Galaxy S21', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 3, name: 'Sony WH-1000XM4 Headphones', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 4, name: 'Dell XPS 13 Laptop', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 5, name: 'Apple MacBook Pro', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 6, name: 'Sony PlayStation 5', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 7, name: 'Microsoft Xbox Series X', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 8, name: 'Nintendo Switch', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 9, name: 'Bose QuietComfort 35 II', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 10, name: 'Apple Watch Series 6', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 11, name: 'Fitbit Charge 4', price: 5, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 12, name: 'GoPro HERO9 Black', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 13, name: 'Canon EOS Rebel T7', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 14, name: 'Nikon D3500', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 15, name: 'HP Envy 6055 Printer', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 16, name: 'JBL Flip 5 Bluetooth Speaker', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 17, name: 'Samsung Galaxy Tab S7', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 18, name: 'Apple iPad Air', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 19, name: 'Amazon Echo Dot (4th Gen)', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' },
  { id: 20, name: 'Google Nest Hub', price: 0.1, sellerAddress: '0xDCBB818C5fB5ff66B9ef2d90f553E73A28A41B7f' }
];


const App = () => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [reviewContract, setReviewContract] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);
          const contract = new web3.eth.Contract(reviewContractAbi, "0xF665312D3Ca1c819919cE1ac2f3ccE6e2FE320aD");
          setReviewContract(contract);
        } catch (error) {
          console.error("Error connecting to Web3", error);
        }
      } else {
        console.error("Metamask not found");
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
      if (user) {
        loadCartFromFirestore(user.uid);
      }
    });

    initWeb3();
    return () => unsubscribe();
  }, []);

  const loadCartFromFirestore = async (userId) => {
    try {
      const cartRef = firestore.collection('carts').doc(userId);
      const doc = await cartRef.get();
      if (doc.exists) {
        setCart(doc.data().items || []);
      }
    } catch (error) {
      console.error("Error loading cart from Firestore:", error.message);
    }
  };

  const saveCartToFirestore = async (userId, cart) => {
    try {
      const cartRef = firestore.collection('carts').doc(userId);
      await cartRef.set({ items: cart });
    } catch (error) {
      console.error("Error saving cart to Firestore:", error.message);
    }
  };

  const saveOrderToFirestore = async (userId, order) => {
    try {
      const ordersRef = firestore.collection('orders').doc();
      await ordersRef.set({ ...order, userId });
    } catch (error) {
      console.error("Error saving order to Firestore:", error.message);
    }
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart, item];
      if (user) {
        saveCartToFirestore(user.uid, updatedCart);
      }
      return updatedCart;
    });
  };

  const removeFromCart = (item) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(cartItem => cartItem.id !== item.id);
      if (user) {
        saveCartToFirestore(user.uid, updatedCart);
      }
      return updatedCart;
    });
  };

  const buyItems = () => {
    if (!user) return;
    alert('Items bought!');
    saveCartToFirestore(user.uid, []);
    const order = {
      items: cart,
      totalPrice: cart.reduce((total, item) => total + item.price, 0),
      orderDate: new Date().toISOString()
    };
    saveOrderToFirestore(user.uid, order);
    setCart([]);
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
            <div className="welcome-container">
              <h1>Welcome, {user.email}</h1>
              <ShoppingItems items={initialItems} addToCart={addToCart} removeFromCart={removeFromCart} />
              <div className="cart-section">
                <h2>Cart</h2>
                <ul className="cart-list">
                  {cart.map(item => (
                    <li key={item.id} className="cart-item">
                      <span className="cart-item-name">{item.name}</span>
                      <button className="remove-btn" onClick={() => removeFromCart(item)}>Remove</button>
                    </li>
                  ))}
                </ul>
                {cart.length > 0 && <button className="buy-btn" onClick={buyItems}>Buy Items</button>}
              </div>
            </div>
          ) : (
            <LoginPage />
          )} />
          {user && (
            <Route path="/order-history" element={<OrderHistoryPage userId={user.uid} isAdmin={false} />} />
          )}
        </Routes>
      </div>
    </Router>
  )}  

export default App;