import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import reviewContractAbi from './ReviewContract.json'; // Import the ABI of your smart contract
import { firestore } from './firebase';
import './OrderHistoryPage.css'; // Import CSS file for styling

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Adjust according to your admin check
  const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address

  useEffect(() => {
    fetchOrders();
    initializeWeb3();
  }, []);

  const fetchOrders = async () => {
    try {
      const ordersRef = firestore.collection('orders');
      const querySnapshot = await ordersRef.get();
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
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

  const handleItemRatingChange = (orderId, itemId, rating) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => item.id === itemId ? { ...item, rating } : item)
        };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  const handleItemReviewChange = (orderId, itemId, review) => {
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          items: order.items.map(item => item.id === itemId ? { ...item, review } : item)
        };
      }
      return order;
    });
    setOrders(updatedOrders);
  };

  const handleSubmit = async (orderId) => {
    setLoading(true);
    try {
      const order = orders.find(order => order.id === orderId);
      await firestore.collection('orders').doc(orderId).update(order);
      console.log('Order updated successfully');
    } catch (error) {
      console.error('Error updating order:', error.message);
    }
    setLoading(false);
  };

  const handleCompleteEscrow = async (itemId) => {
    setLoading(true);
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.completeEscrow(itemId).send({ from: accounts[0] });
      console.log('Escrow completed successfully');
    } catch (error) {
      console.error('Error completing escrow:', error.message);
    }
    setLoading(false);
  };

  const handleDisputeEscrow = async (itemId) => {
    setLoading(true);
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.disputeEscrow(itemId).send({ from: accounts[0] });
      console.log('Escrow disputed successfully');
    } catch (error) {
      console.error('Error disputing escrow:', error.message);
    }
    setLoading(false);
  };

  const handleResolveDispute = async (itemId, resolveToSeller) => {
    setLoading(true);
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.resolveEscrowDispute(itemId, resolveToSeller).send({ from: accounts[0] });
      console.log('Escrow dispute resolved successfully');
    } catch (error) {
      console.error('Error resolving escrow dispute:', error.message);
    }
    setLoading(false);
  };

  
  return (
    <div className="order-history-container">
      <h2>Order History</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul className="order-list">
          {orders.map(order => (
            <li key={order.id} className="order">
              <div className="order-details">
                <h4>Order ID: {order.id}</h4>
                <p>Total Price: ${order.totalPrice}</p>
                <p>Order Date: {new Date(order.orderDate).toLocaleString()}</p>
              </div>
              {order.items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">${item.price}</span>
                  </div>
                  <div className="item-actions">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={item.rating || ''}
                      onChange={(e) => handleItemRatingChange(order.id, item.id, parseInt(e.target.value))}
                      placeholder="Rating (1-5)"
                    />
                    <textarea
                      value={item.review || ''}
                      onChange={(e) => handleItemReviewChange(order.id, item.id, e.target.value)}
                      placeholder="Write a review"
                    />
                    <button onClick={() => handleCompleteEscrow(item.id)} disabled={loading}>
                      {loading ? 'Completing...' : 'Complete Escrow'}
                    </button>
                    <button onClick={() => handleDisputeEscrow(item.id)} disabled={loading}>
                      {loading ? 'Disputing...' : 'Dispute Escrow'}
                    </button>
                    {isAdmin && (
                      <>
                        <button onClick={() => handleResolveDispute(item.id, true)} disabled={loading}>
                          {loading ? 'Resolving...' : 'Resolve to Seller'}
                        </button>
                        <button onClick={() => handleResolveDispute(item.id, false)} disabled={loading}>
                          {loading ? 'Resolving...' : 'Resolve to Buyer'}
                        </button>
                      </>
                    )}
                  </div>
                  <button onClick={() => handleSubmit(order.id)} className="submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrderHistoryPage;