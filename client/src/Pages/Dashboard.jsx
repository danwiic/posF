import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Navbar/Layout';
import Popup from '../components/Popup/Popup';
import "./styles/Dashboard.css";

export default function Dashboard() {
  const [open, setOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState([]);
  const [salesStats, setSalesStats] = useState({
    today: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    total: 0
  });
  const [selectedDate, setSelectedDate] = useState(''); // State to manage selected date

  const fetchData = async (date = '') => {
    try {
      // Fetch transactions based on the selected date
      const transactionsResponse = await axios.get('http://localhost:8800/order-history', {
        params: { date }
      });
      setTransactions(transactionsResponse.data);

      // Fetch sales statistics
      const statsResponse = await axios.get('http://localhost:8800/sales');
      console.log('Sales Stats:', statsResponse.data); // Log data to inspect
      setSalesStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch with no date
  }, []);

  const handleVoidTransaction = async (transactionId) => {
    const confirmed = window.confirm('Are you sure you want to void this transaction?');
    if (!confirmed) return;

    try {
      await axios.post(`http://localhost:8800/transaction/${transactionId}/void`);
      fetchData(selectedDate); // Refresh transactions list
    } catch (error) {
      console.error('Error voiding transaction:', error);
    }
  };

  const handleViewDetails = async (transactionId) => {
    try {
      const response = await axios.get(`http://localhost:8800/order-details/${transactionId}`);
      setSelectedTransaction(response.data);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleDateChange = (event) => {
    const date = event.target.value;
    setSelectedDate(date);
    fetchData(date); // Fetch data for the selected date
  };

  return (
    <div className='dash--body'>
      <Layout>
        <div className="dash--container">
          <div className="dash--popup">
            <Popup trigger={open} setTrigger={setOpen} className="bg-dash">
              <h1 style={{ marginBottom: "15px", textAlign: "center", fontSize: "20px", fontWeight: "800" }}>
                ITEMS ORDERED
              </h1>
              {selectedTransaction.length > 0 && (
                <table className='order--table'>
                  <thead>
                    <tr>
                      <th>ProductID</th>
                      <th>Item Name</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTransaction.map(item => (
                      <tr key={item.ProductID + item.sizeName}>
                        <td>{item.ProductID}</td>
                        <td>{item.prodName}</td>
                        <td>{item.sizeName}</td>
                        <td>{item.Quantity}</td>
                        <td>₱{item.ItemPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Popup>
          </div>

          <div className="cards--container">
            <div className="cards">
              <div className="card--total today--total">
                <div className='sales--header'>TODAY&apos;S SALES</div>
                <span className='dash--sales'>₱{salesStats.today.toFixed(2)}</span>
              </div>
              <div className="card--total weekly--total">
                <div className='sales--header'>WEEKLY SALES</div>
                <span className='dash--sales'>₱{salesStats.thisWeek.toFixed(2)}</span>
              </div>
              <div className="card--total weekly--total">
                <div className='sales--header'>LAST WEEK SALES</div>
                <span className='dash--sales'>₱{salesStats.lastWeek.toFixed(2)}</span>
              </div>
              <div className="card--total monthly--total">
                <div className='sales--header'>MONTHLY SALES</div>
                <span className='dash--sales'>₱{salesStats.thisMonth.toFixed(2)}</span>
              </div>
              <div className="card--total overall--total">
                <div className='sales--header'>TOTAL SALES</div>
                <span className='dash--sales'>₱{salesStats.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

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
                        <th>Order Date
                        <input
                              type="date"
                              id="date-picker"
                              value={selectedDate}
                              onChange={handleDateChange}
                              className="date-picker"
                            />
                          </th>
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
                            <button className='view--orders' onClick={() => handleViewDetails(transaction.TransactionID)}>VIEW</button>
                          </td>
                          <td>{transaction.TotalQuantity}</td>
                          <td>{transaction.OrderDateTime}</td>
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
        </div>
      </Layout>
    </div>
  );
}
