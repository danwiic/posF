import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Navbar/Layout';
import Popup from '../components/Popup/Popup';
import "./styles/Dashboard.css";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('http://localhost:8800/order-history');
        setTransactions(response.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle voiding a transaction
  const handleVoidTransaction = async (transactionId) => {
    const confirmed = window.confirm('Are you sure you want to void this transaction?');
    if (!confirmed) return;
  
    try {
      await axios.delete(`http://localhost:8800/transaction/${transactionId}/void`);
      // Refresh transactions list
      const response = await axios.get('http://localhost:8800/order-history');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error voiding transaction:', error);
    }
  };

  // Handle viewing details
  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  return (
    <div className='dash--body'>
      <Layout>
        {/* POP UP COMPONENT ===================================> */}
        <div className="dash--popup">
          <Popup trigger={open} setTrigger={setOpen} className="bg-dash">
            <h1 style={{ marginBottom: "15px", textAlign: "center", fontSize: "20px", fontWeight: "800" }}>
              ITEMS ORDERED
            </h1>
            {selectedTransaction && (
              <table className='order--table'>
                <thead>
                  <tr>
                    <th>ProductID</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Populate with selectedTransaction details */}
                </tbody>
              </table>
            )}
          </Popup>
        </div>
        {/* POP UP COMPONENT <===================================>*/}

        <div className="cards--container">
          <div className="cards">
            <div className="card--total today--total">
              <div className='sales--header'>TODAY&apos;S SALES</div>
              <span className='dash--sales'>₱2,450</span>
            </div>
            <div className="card--total weekly--total">
              <div className='sales--header'>WEEKLY SALES</div>
              <span className='dash--sales'>₱8,360</span>
            </div>
            <div className="card--total monthly--total">
              <div className='sales--header'>MONTHLY SALES</div>
              <span className='dash--sales'>₱23,980</span>
            </div>
            <div className="card--total overall--total">
              <div className='sales--header'>TOTAL SALES</div>
              <span className='dash--sales'>₱45,300</span>
            </div>
          </div>
        </div>

        {/* ORDER HISTORY */}
        <div className="order--history">
          <h3 className='order--head'>Order History</h3>
          <div className="table-wrapper">
            <div className="order--container">
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className='order--table'>
                  <thead>
                    <tr>
                      <th>TransactionID</th>
                      <th>Items Ordered</th>
                      <th>Order Quantity</th>
                      <th>Order Date</th>
                      <th>Payment Method</th>
                      <th>Total Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(transaction => (
                      <tr key={transaction.TransactionID}>
                        <td>{transaction.TransactionID}</td>
                        <td>
                          <button className='view--orders' onClick={() => handleViewDetails(transaction)}>VIEW</button>
                        </td>
                        <td>{transaction.TotalQuantity}</td>
                        <td>{transaction.OrderDate}</td>
                        <td>{transaction.PaymentMethod.toUpperCase()}</td>
                        <td>₱{transaction.TotalAmount.toFixed(2)}</td>
                        <td>
                          <button
                            className='dash--void--transac'
                            onClick={() => handleVoidTransaction(transaction.TransactionID)}
                          >
                            VOID TRANSACTION
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
}
