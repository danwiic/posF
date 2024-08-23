import Layout from "../components/Navbar/Layout";
import { useState, useEffect } from "react";
import "./styles/POS.css";
import Receipt from "../components/Receipt/Receipt";
import axios from "axios";

export default function POS() {
  const [quantities, setQuantities] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [payment, setPayment] = useState(0);
  const [change, setChange] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false); // State to control receipt visibility


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
        console.log('Products fetched:', res.data); // Log the fetched products
        setProducts(res.data);
        setQuantities(res.data.map(drink => ({
          name: drink.prodName,
          sizes: Array.from({ length: drink.sizes.length }, () => 0) // Initialize quantities to 0
        })));
      } catch (err) {
        console.error('Error fetching products:', err); // Log any error
      }
    };

    useEffect(() => {
      fetchCategories();
      fetchProducts(); // Ensure this fetches all products
    }, []);
  

  

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
        name: drink.prodName,
        sizes: Array.from({ length: drink.sizes.length }, () => 0)
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
        name: `${drink.name} (${products[drinkIndex].sizes[sizeIndex].sizeName})`,
        price: quantity * products[drinkIndex].sizes[sizeIndex].price,
        quantity // Add quantity to the item
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
      console.log('Products after category select:', res.data); // Log the fetched products
      setProducts(res.data);
      setQuantities(res.data.map(drink => ({
        name: drink.prodName,
        sizes: Array.from({ length: drink.sizes.length }, () => 0) // Initialize quantities to 0
      })));
    } catch (err) {
      console.error('Error fetching products for category:', err); // Log any error
    }
  };
  

  return (
    <div className="pos--container">
    <Layout>
    <div className="category--btn">
          <button
            className={`cat--selection ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => handleCategorySelect(null)} // Fetch all products when "All" is selected
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
