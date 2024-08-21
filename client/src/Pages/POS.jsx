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

  const handleQuantityChange = (drinkIndex, sizeIndex, value) => {
    const newQuantities = [...quantities];
    const newSizeQuantity = parseInt(value, 10);

    if (newSizeQuantity >= 0) {
      newQuantities[drinkIndex].sizes[sizeIndex] = isNaN(newSizeQuantity) ? 0 : newSizeQuantity;
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
      setShowReceipt(false); 
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
                      <button style={{height: "22px"}} onClick={() => handleQuantityChange(drinkIndex, sizeIndex, quantities[drinkIndex].sizes[sizeIndex] - 1)}>-</button>
                      <input
                        type="text"
                        value={quantities[drinkIndex].sizes[sizeIndex]}
                        onChange={(e) => handleQuantityChange(drinkIndex, sizeIndex, e.target.value)}
                        className="quantity-input"
                        style={{width: "35px", textAlign: "center", height: "22px"}}
                      />
                      <button style={{height: "22px"}} onClick={() => handleQuantityChange(drinkIndex, sizeIndex, quantities[drinkIndex].sizes[sizeIndex] + 1)}>+</button>
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
