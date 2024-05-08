import React, { useEffect, useState } from 'react';
import { firestore } from './firebase';
import './ShoppingItems.css'; // Import CSS file for styling

const ShoppingItems = ({ items, addToCart, removeFromCart }) => {
  const [averageRatings, setAverageRatings] = useState({});

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const ordersRef = firestore.collection('orders');
      const querySnapshot = await ordersRef.get();
      const itemRatings = {};
      const itemCounts = {};

      querySnapshot.forEach(doc => {
        const order = doc.data();
        order.items.forEach(item => {
          if (item.rating) {
            if (itemRatings[item.id]) {
              itemRatings[item.id] += item.rating;
              itemCounts[item.id]++;
            } else {
              itemRatings[item.id] = item.rating;
              itemCounts[item.id] = 1;
            }
          }
        });
      });

      const averageRatings = {};
      Object.keys(itemRatings).forEach(itemId => {
        averageRatings[itemId] = itemRatings[itemId] / itemCounts[itemId];
      });

      setAverageRatings(averageRatings);
    } catch (error) {
      console.error('Error fetching orders:', error.message);
    }
  };

  return (
    <div className="shopping-items-container">
      <h2 className="shopping-items-heading">Shop Our Collection</h2>
      <ul className="shopping-items-list">
        {items.map(item => (
          <li key={item.id} className="shopping-item">
            <div className="shopping-item-details">
              <h3 className="item-name">{item.name}</h3>
              <p className="item-price">${item.price}</p>
              {averageRatings[item.id] && (
                <p className="item-rating">Avg. Rating: {averageRatings[item.id]}</p>
              )}
            </div>
            <div className="shopping-item-actions">
              <button className="add-to-cart-button" onClick={() => addToCart(item)}>Add to Cart</button>
              <button className="remove-from-cart-button" onClick={() => removeFromCart(item)}>Remove from Cart</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingItems;
