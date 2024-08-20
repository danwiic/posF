import Layout from "../components/Navbar/Layout";
import products from '../../JSON FILES/products.json';
import { useState, useRef } from "react";
import "./styles/POS.css";
import Receipt from "../components/Receipt/Receipt";

export default function POS() {
  const [quantities, setQuantities] = useState(
    products.map(drink => ({
      name: drink.name,
      sizes: drink.sizes.map(() => 0) // Initialize quantities to 0
    }))
  );

  const [payment, setPayment] = useState(0);
  const [change, setChange] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false); // State to control receipt visibility

  const receiptRef = useRef(null); // Ref to control receipt rendering

  const handleQuantityChange = (drinkIndex, sizeIndex, change) => {
    const newQuantities = [...quantities];
    const newSizeQuantity = newQuantities[drinkIndex].sizes[sizeIndex] + change;

    if (newSizeQuantity >= 0) {
      newQuantities[drinkIndex].sizes[sizeIndex] = newSizeQuantity;
      setQuantities(newQuantities);
    }
  };

  const handleClearOrder = () => {
    setQuantities(
      products.map(drink => ({
        name: drink.name,
        sizes: drink.sizes.map(() => 0)
      }))
    );
    setPayment(0);
    setChange(0);
  };

  const handlePaymentChange = (e) => {
    const amountPaid = parseFloat(e.target.value) || 0;
    setPayment(amountPaid);
    setChange(amountPaid - getTotal());
  };

  const getTotal = () => {
    return quantities.reduce((total, drink, drinkIndex) => {
      return total + drink.sizes.reduce((sum, quantity, sizeIndex) => {
        return sum + quantity * products[drinkIndex].sizes[sizeIndex].price;
      }, 0);
    }, 0);
  };

  const handlePay = (e) => {
    e.preventDefault(); // Prevent form submission and page reload
    if (payment >= getTotal()) {
      setShowReceipt(true);
    } else {
      alert("Payment is insufficient!");
    }
  };

  // Generate items for the receipt
  const receiptItems = quantities.flatMap((drink, drinkIndex) =>
    drink.sizes.map((quantity, sizeIndex) =>
      quantity > 0 ? {
        name: `${drink.name} (${products[drinkIndex].sizes[sizeIndex].size})`,
        price: quantity * products[drinkIndex].sizes[sizeIndex].price,
        quantity // Add quantity to the item
      } : null
    ).filter(item => item !== null)
  );

  const printReceipt = () => {
    if (receiptRef.current) {
      const receiptWindow = window.open('', '', 'width=800,height=600');
      receiptWindow.document.write('<html><head><title>Receipt</title>');
      receiptWindow.document.write('<style>');
      receiptWindow.document.write(`
        .receipt--container {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f0f4fa;
          width: 300px;
          margin: 20px auto;
          background: #fff;
          border: 1px solid #e9e9e9;
          border-radius: 3px;
          padding: 30px;
        }
        .title {
          text-align: center;
          color: #000;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .title img {
          width: 80px;
          border-radius: 50%;
          margin-right: 10px;
          border: 6px solid #b04d1c;
        }
        .invoice-details p {
          margin: 0;
          font-size: 14px;
        }
        .invoice-items {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .invoice-items td {
          padding: 8px 0;
        }
        .invoice-items .alignright {
          text-align: right;
        }
        .alignright .bup {
          text-align: right;
          padding: 8px 0 ;
        }
        .invoice-items .total {
          border-top: 2px solid #333;
          font-weight: 700;
        }
        tbody:first-child{
          border-top: 1px solid black;
          padding-top: 42px;
        }
        .grra {
          border-bottom: 2px solid black;
        }
        .address {
          padding: 16px;
          margin-top: 20px;
          text-align: center;
        }
        .footer{
          display: block;
          margin: auto;
          padding: 16px;
          text-align: center;
          width: 100%;
          margin-top: 20px;
        }
      `);
      receiptWindow.document.write('</style></head><body>');
      receiptWindow.document.write(receiptRef.current.innerHTML);
      receiptWindow.document.write('</body></html>');
      receiptWindow.document.close();
      receiptWindow.document.focus();
      receiptWindow.print();
      setShowReceipt(false); // Hide receipt after printing
    }
  };

  return (
    <div className="pos--container">
      <Layout>
        <div className="pos-list">
          {products.map((drink, drinkIndex) => (
            <div key={drinkIndex} className="pos-item">
              <img src={`/products/${drink.image}`} className="pos--prod--image" alt={drink.name} />
              <h2>{drink.name}</h2>
              <div className="pos-item-content">
                {drink.sizes.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="size-control-container">
                    <div className="size-info">
                      {size.size} - ₱{size.price}
                    </div>
                    <div className="quantity-control">
                      <button onClick={() => handleQuantityChange(drinkIndex, sizeIndex, -1)}>-</button>
                      <span>{quantities[drinkIndex].sizes[sizeIndex]}</span>
                      <button onClick={() => handleQuantityChange(drinkIndex, sizeIndex, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="sticky-summary">
            <h2>Order Summary</h2>
            <ul>
              {receiptItems.map((item, index) => (
                <li key={index}>
                  {item.name} - x{item.quantity} - ₱{item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <h3>Total: ₱{getTotal().toFixed(2)}</h3>
            <button onClick={handleClearOrder} className="clear-order-btn">Clear Order</button>
            <div className="payment-container">
              <label>Payment:</label>
              <input
                type="text"
                value={payment}
                onChange={handlePaymentChange}
                placeholder="Enter payment amount"
              />
              <h3>Change: ₱{change.toFixed(2)}</h3>
            </div>
            <button onClick={handlePay} className="pay-btn">Pay</button>
          </div>
        </div>
      </Layout>

      {showReceipt && (
        <div className="receipt-popup">
          <div className="receipt-popup-content">
            <button onClick={() => setShowReceipt(false)} className="close-btn">X</button>
            <button onClick={printReceipt} className="print-btn">Print Receipt</button>
            <Receipt
              invoiceNumber={`INV-${Date.now()}`} 
              items={receiptItems}
              total={getTotal()}
              payment={payment}
              change={change}
            />
          </div>
        </div>
      )}
    </div>
  );
}
