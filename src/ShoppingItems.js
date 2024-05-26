import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { firestore } from './firebase';
import reviewContractAbi from './ReviewContract.json'; 
import './ShoppingItems.css'; // Import CSS file for styling

const ShoppingItems = ({ items, addToCart, removeFromCart }) => {
  const [averageRatings, setAverageRatings] = useState({});
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address

  useEffect(() => {
    fetchAllOrders();
    initializeWeb3();
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

  const initializeWeb3 = async () => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
        const contractInstance = new web3Instance.eth.Contract(reviewContractAbi, contractAddress);
        setWeb3(web3Instance);
        setContract(contractInstance);
      } catch (error) {
        console.error('Error initializing Web3:', error.message);
      }
    } else {
      console.error('Ethereum provider not found');
    }
  };

  const handleCreateEscrow = async (itemId, sellerAddress, price) => {
    setLoading(true);
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.createEscrow(itemId, sellerAddress).send({
        from: accounts[0],
        value: web3.utils.toWei(price.toString(), 'ether')
      });
      console.log('Escrow created successfully');
    } catch (error) {
      console.error('Error creating escrow:', error.message);
    }
    setLoading(false);
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
              <button className="create-escrow-button" onClick={() => handleCreateEscrow(item.id, item.sellerAddress, item.price)} disabled={loading}>
                {loading ? 'Creating Escrow...' : 'Create Escrow'}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShoppingItems;
