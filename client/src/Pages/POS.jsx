import Layout from "../components/Navbar/Layout";
import { useState, useEffect } from "react";
import "./styles/POS.css";
import Receipt from "../components/Receipt/Receipt";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";


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
  

  // FETCH ALL CATEGORIES
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8800/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // FETCH ALL PRODUCTS THAT ARE ACTIVE
  const fetchProducts = async (categoryID) => {
    try {
      const res = await axios.get("http://localhost:8800/product", {
        params: { categoryID: categoryID || 0 }
      });
      setProducts(res.data);
      setQuantities(res.data.map(drink => ({
        productID: drink.productID,
        name: drink.prodName,
        quantity: drink.quantity,
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

  // UPDATE THE CHANGE AND TOTAL VALUE AFTER SELECTING PRODUCTS
  useEffect(() => {
    const total = getTotal();
    const amountPaid = parseFloat(payment);
    if (!isNaN(amountPaid)) {
      setChange(amountPaid - total);
    } else {
      setChange(0);
    }
  }, [quantities, payment, discount, products]); 

  const handleQuantityChange = (drinkIndex, sizeIndex, value) => {
    const newQuantities = [...quantities];
    const newSizeQuantity = parseInt(value, 10);
  
    if (newSizeQuantity >= 0) {
      newQuantities[drinkIndex].sizes[sizeIndex] = isNaN(newSizeQuantity) ? 0 : newSizeQuantity;
      setQuantities(newQuantities);
    } else {
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

  const handleApplyDiscount = () => {
    if (isDiscountApplied) {
      // REMOVE DISCOUNT 
      setDiscount(0);
      setIsDiscountApplied(false);
    } else {
      // APPLY DISCOUNT
      setDiscount(0.10); 
      setIsDiscountApplied(true);
    }
  };
  

  const receiptItems = quantities.flatMap((drink, drinkIndex) =>
    drink.sizes.map((quantity, sizeIndex) =>
      quantity > 0 ? {
        name: `${drink.name} (${products[drinkIndex].sizes[sizeIndex].sizeName})`,
        price: quantity * products[drinkIndex].sizes[sizeIndex].price,
        quantity,
        productID: products[drinkIndex].productID,
        sizeID: products[drinkIndex].sizes[sizeIndex].sizeID // Ensure sizeID is included
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
 
  const handlePay = async (e) => {
    e.preventDefault();
    const total = getTotal();
    const paymentAmount = parseFloat(payment);
  
    if (isNaN(paymentAmount) || paymentAmount < 0) {
      toast.error("Invalid payment amount!");
      return;
    }
  
    if (paymentAmount >= total) {
      try {
        const paymentData = {
          paymentMethod: 'cash',
          items: receiptItems,
          total: total,
          paymentAmount: paymentAmount,
          changeAmount: paymentAmount - total,
          discount: discount
        };
  
        const response = await axios.post("http://localhost:8800/payment", paymentData, {
          headers: { 'Content-Type': 'application/json' }
        });
  
        // Reset order and payment state after successful payment
        setQuantities(
          products.map(drink => ({
            name: drink.prodName,
            sizes: Array.from({ length: drink.sizes.length }, () => 0)
          }))
        );
        toast.success("Transaction successful");
        setPayment(0);
        setChange(0);
        setDiscount(0);
        fetchProducts();
      } catch (err) {
        toast.error("Error processing payment!");
        console.error("Payment error:", err.response ? err.response.data : err.message);
      }
    } else {
      toast.error("Insufficient payment amount!");
    }
  };
  
  const handleGcashPay = async (e) => {
    e.preventDefault();
    const total = getTotal();
    const paymentAmount = parseFloat(payment);
  
    if (isNaN(paymentAmount) || paymentAmount < 0) {
      toast.error("Invalid payment amount!");
      return;
    }
  
    if (paymentAmount >= total) {
      try {
        const paymentData = {
          paymentMethod: 'gcash',
          items: receiptItems,
          total: total,
          paymentAmount: paymentAmount,
          changeAmount: paymentAmount - total,
          discount: discount
        };
  
        const response = await axios.post("http://localhost:8800/payment", paymentData, {
          headers: { 'Content-Type': 'application/json' }
        });
  
        // Reset order and payment state after successful payment
        setQuantities(
          products.map(drink => ({
            name: drink.prodName,
            sizes: Array.from({ length: drink.sizes.length }, () => 0)
          }))
        );
        toast.success("Transaction successful");
        setPayment(0);
        setChange(0);
        setDiscount(0);
        fetchProducts();
      } catch (err) {
        toast.error("Error processing payment!");
        console.error("Payment error:", err.response ? err.response.data : err.message);
      }
    } else {
      toast.error("Insufficient payment amount!");
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
              {drink.image && <img src={drink.image} className="pos--prod--image" alt={drink.prodName} />}
              <h2>{drink.prodName}</h2>
              <div className="pos-item-content">
                {drink.sizes.map((size, sizeIndex) => (
                  <div key={sizeIndex} className="size-control-container">
                    <div className="size-info">
                      {size.sizeName} - ₱{size.price}
                    </div>
                    {size.quantity <= 0 ? (
                      <p className="out-of-stock">Out of Stock</p>
                    ) : (
                      <div className="quantity-control">
                        <button
                          style={{ height: "22px" }}
                          onClick={() => handleQuantityChange(drinkIndex, sizeIndex, quantities[drinkIndex].sizes[sizeIndex] - 1)}
                          disabled={quantities[drinkIndex].sizes[sizeIndex] <= 0}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          value={quantities[drinkIndex].sizes[sizeIndex]}
                          onChange={(e) => handleQuantityChange(drinkIndex, sizeIndex, e.target.value)}
                          className="quantity-input"
                          style={{ width: "35px", textAlign: "center", height: "22px" }}
                          disabled={size.quantity <= 0}
                        />
                        <button
                          style={{ height: "22px" }}
                          onClick={() => handleQuantityChange(drinkIndex, sizeIndex, quantities[drinkIndex].sizes[sizeIndex] + 1)}
                          disabled={size.quantity <= 0}
                        >
                          +
                        </button>
                      </div>
                    )}
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
            <button onClick={handlePay}  className="pay-btn">Pay</button>
            <button onClick={handleGcashPay} className="pay-btn">Pay<img src="gcash.svg" style={{width: "25px"}}/></button>
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
