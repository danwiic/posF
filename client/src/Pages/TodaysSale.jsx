import { useEffect, useState } from "react";
import Layout from "../components/Navbar/Layout";
import axios from "axios";
import Popup from "../components/Popup/Popup";
import './styles/Today.css';

export default function TodaysSale() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [open, setOpen] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch transactions for today
      const transactionsResponse = await axios.get('http://localhost:8800/today');
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVoidTransaction = async (transactionId) => {
    const confirmed = window.confirm('Are you sure you want to void this transaction?');
    if (!confirmed) return;

    try {
      await axios.post(`http://localhost:8800/transaction/${transactionId}/void`);
      // Refresh transactions list
      fetchData(); // Refresh the transactions list
    } catch (error) {
      console.error('Error voiding transaction:', error);
    }
  };

  const handleViewDetails = async (transaction) => {
    try {
      // Fetch the order details for the selected transaction
      const detailsResponse = await axios.get(`http://localhost:8800/order-details/${transaction.TransactionID}`);
      const transactionWithDetails = {
        ...transaction,
        items: detailsResponse.data
      };
      setSelectedTransaction(transactionWithDetails);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };

  return (
    <div className="today--container">
      <Layout>
        <div className="order--today">
          <h3 className='order--head'>Order&apos;s Today</h3>
          <div className="table-wrapper--today">
            <div className="order--container--today">
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
      </Layout>
      {open && (
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
                    <th>Size</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransaction.items.map(item => (
                    <tr key={item.ProductID}>
                      <td>{item.ProductID}</td>
                      <td>{item.prodName}</td>
                      <td>{item.sizeName}</td> {/* Display the size */}
                      <td>{item.Quantity}</td>
                      <td>₱{item.ItemPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Popup>
        </div>
      )}
    </div>
  );
}
