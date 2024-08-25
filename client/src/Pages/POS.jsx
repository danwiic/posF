import Layout from "../components/Navbar/Layout";
import { useState, useEffect } from "react";
import "./styles/POS.css";
import Receipt from "../components/Receipt/Receipt";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
ToastContainer

export default function POS() {
  const [quantities, setQuantities] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [payment, setPayment] = useState(0);
  const [change, setChange] = useState(0);
  const [discount, setDiscount] = useState(0); 
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false); 
  

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8800/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch all products by default
  const fetchProducts = async (categoryID) => {
    try {
      const res = await axios.get("http://localhost:8800/product", {
        params: { categoryID: categoryID || 0 }
      });
      console.log('Products fetched:', res.data);
      setProducts(res.data);
      setQuantities(res.data.map(drink => ({
        name: drink.prodName,
        sizes: Array.from({ length: drink.sizes.length }, () => 0)
      })));
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts(); 
  }, []);

  // Recalculate change whenever quantities, payment, discount, or products change
  useEffect(() => {
    const total = getTotal();
    const amountPaid = parseFloat(payment);
    if (!isNaN(amountPaid)) {
      setChange(amountPaid - total);
    } else {
      setChange(0);
    }
  }, [quantities, payment, discount, products]); // Added products to dependency array

  const handleQuantityChange = (drinkIndex, sizeIndex, value) => {
    const newQuantities = [...quantities];
    const newSizeQuantity = parseInt(value, 10);
  
    if (newSizeQuantity >= 0) {
      newQuantities[drinkIndex].sizes[sizeIndex] = isNaN(newSizeQuantity) ? 0 : newSizeQuantity;
      setQuantities(newQuantities);
    } else {
      // If the newSizeQuantity is negative, do nothing (or set it to zero)
      newQuantities[drinkIndex].sizes[sizeIndex] = 0;
      setQuantities(newQuantities);
    }
  };

  const handleClearOrder = () => {
    setQuantities(
      products.map(drink => ({
        name: drink.prodName,
        sizes: Array.from({ length: drink.sizes.length }, () => 0)
      }))
    );
    setPayment(0);
    setChange(0);
    setDiscount(0); 
  };

  const handlePaymentChange = (e) => {
    const value = e.target.value;
    setPayment(value);
  };

  const getTotal = () => {
    const total = quantities.reduce((total, drink, drinkIndex) => {
      return total + drink.sizes.reduce((sum, quantity, sizeIndex) => {
        return sum + quantity * products[drinkIndex].sizes[sizeIndex].price;
      }, 0);
    }, 0);
    
    return total - (total * discount); 
  };

  const handlePay = (e) => {
    e.preventDefault(); 
    if (payment >= getTotal()) {
      setShowReceipt(true);
    } else {
      toast.error("Payment is insufficient!");
    }
  };

  const handleApplyDiscount = () => {
    if (isDiscountApplied) {
      // If discount is already applied, remove it
      setDiscount(0);
      setIsDiscountApplied(false);
    } else {
      // If discount is not applied, apply it
      setDiscount(0.10); // Apply 10% discount
      setIsDiscountApplied(true);
    }
  };
  

  // Generate items for the receipt
  const receiptItems = quantities.flatMap((drink, drinkIndex) =>
    drink.sizes.map((quantity, sizeIndex) =>
      quantity > 0 ? {
        name: `${drink.name} (${products[drinkIndex].sizes[sizeIndex].sizeName})`,
        price: quantity * products[drinkIndex].sizes[sizeIndex].price,
        quantity 
      } : null
    ).filter(item => item !== null)
  );

  const printReceipt = () => {
    setShowReceipt(false); 
  };

  const handleCategorySelect = async (categoryID) => {
    setSelectedCategory(categoryID);
    try {
      const res = await axios.get("http://localhost:8800/product", {
        params: { categoryID: categoryID || 0 }
      });
      console.log('Products after category select:', res.data); 
      setProducts(res.data);
      setQuantities(res.data.map(drink => ({
        name: drink.prodName,
        sizes: Array.from({ length: drink.sizes.length }, () => 0)
      })));
    } catch (err) {
      console.error('Error fetching products for category:', err); 
    }
  };

  return (
    <div className="pos--container">
      <ToastContainer/>
      <Layout>
        <div className="category--btn">
          <button
            className={`cat--selection ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect(null)} 
          >
            All
          </button>

          {categories.map(category => (
            <button
              className={`cat--selection ${selectedCategory === category.categoryID ? 'active' : ''}`}
              key={category.categoryID}
              onClick={() => handleCategorySelect(category.categoryID)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="pos-list">
          {products.length === 0 ? (
            <p>No products available</p>
          ) : (
            products.map((drink, drinkIndex) => (
              <div key={drinkIndex} className="pos-item">
                {drink.image && <img src={drink.image} className="pos--prod--image" alt={drink.prodName}/>}
                <h2>{drink.prodName}</h2>
                <div className="pos-item-content">
                  {drink.sizes.map((size, sizeIndex) => (
                    <div key={sizeIndex} className="size-control-container">
                      <div className="size-info">
                        {size.sizeName} - ₱{size.price}
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
            ))
          )}

          <div className="sticky-summary">
            <h2>Order Summary</h2>
            <button className="pay-discount" onClick={handleApplyDiscount}>Apply 10% Discount</button>
            <ul>
              {receiptItems.map((item, index) => (
                <li key={index}>
                  {item.name} - x{item.quantity} - ₱{item.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <h3>Total: ₱{getTotal().toFixed(2)}</h3>
            {discount > 0 && <h4>Discount: 10%</h4>}
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
            <button onClick={handlePay} className="pay-btn">Pay<img src="gcash.svg" style={{width: "25px"}}/></button>
          </div>
        </div>
      </Layout>

      {showReceipt && (
        <div className="receipt-popup">
          <div className="receipt-popup-content">
            <button onClick={() => setShowReceipt(false)} className="close-btn">&#x2715;</button>
            <button onClick={printReceipt} className="print-btn">Print</button>
            <Receipt
              items={receiptItems}
              total={getTotal()}
              payment={payment}
              change={change}
              discount={discount}
              onClose={() => setShowReceipt(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
