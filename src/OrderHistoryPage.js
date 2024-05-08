// OrderHistoryPage.js
import React, { useState, useEffect } from 'react';
import { firestore } from './firebase';
import './OrderHistoryPage.css'; // Import the CSS file for styling

const OrderHistoryPage = ({ userId }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersRef = firestore.collection('orders');
        const querySnapshot = await ordersRef.where('userId', '==', userId).get();
        const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(userOrders);
      } catch (error) {
        console.error('Error loading orders:', error.message);
      }
    };

    loadOrders();
  }, [userId]);

  const handleItemRatingChange = (orderId, itemId, rating) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, rating };
            }
            return item;
          });
          return { ...order, items: updatedItems };
        }
        return order;
      })
    );
  };

  const handleItemReviewChange = (orderId, itemId, review) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          const updatedItems = order.items.map(item => {
            if (item.id === itemId) {
              return { ...item, review };
            }
            return item;
          });
          return { ...order, items: updatedItems };
        }
        return order;
      })
    );
  };

  const handleSubmit = async (orderId) => {
    try {
      const order = orders.find(order => order.id === orderId);
      if (order) {
        const updatedItems = order.items.map(item => ({
          ...item,
          rating: item.rating || 0, // Set default rating if not already present
          review: item.review || '' // Set default review if not already present
        }));
        await firestore.collection('orders').doc(orderId).update({ items: updatedItems });
        console.log('Ratings and reviews submitted successfully.');
      }
    } catch (error) {
      console.error('Error submitting ratings and reviews:', error.message);
    }
  };

  return (
    <div className="order-history-container">
      <h2>Order History</h2>
      {orders.map(order => (
        <div key={order.id} className="order">
          <div className="order-details">
            <p>Order ID: {order.id}</p>
            <p>Total Price: ${order.totalPrice}</p>
            <p>Order Date: {new Date(order.orderDate).toLocaleString()}</p>
          </div>
          <ul>
            {order.items.map(item => (
              <li key={item.id} className="order-item">
                {item.name} - ${item.price}
                <div className="item-rating">
                  <select value={item.rating || '0'} onChange={(e) => handleItemRatingChange(order.id, item.id, parseInt(e.target.value))}>
                    <option value="0">Select Rating</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
                <div className="item-review">
                  <textarea value={item.review || ''} onChange={(e) => handleItemReviewChange(order.id, item.id, e.target.value)} placeholder="Write a review..."></textarea>
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => handleSubmit(order.id)} className="submit-btn">Submit</button>
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryPage;
