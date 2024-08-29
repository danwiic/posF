import Layout from "../components/Navbar/Layout";
import { useState, useEffect } from "react";
import "./styles/POS.css";
import Receipt from "../components/Receipt/Receipt";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Popup from '../components/Popup/Popup.jsx'


export default function POS() {
  const [quantities, setQuantities] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [payment, setPayment] = useState("");
  const [change, setChange] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [transactionID, setTransactionID] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [addons, setAddons] = useState([])
  const [selectedAddons, setSelectedAddons] = useState({});

  const fetchAddons = async () => {
    try {
      const res = await axios.get("http://localhost:8800/addons");
      setAddons(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  
  useEffect(() => {
    fetchAddons();
  }, []);

  
  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8800/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (categoryID) => {
    try {
      const res = await axios.get("http://localhost:8800/product", {
        params: { categoryID: categoryID || 0 }
      });
      const newProducts = res.data;
  
      // Update products list
      setProducts(newProducts);
  
      // Preserve existing quantities
      const updatedQuantities = quantities.map(existingQuantity => {
        const matchingProduct = newProducts.find(
          newProduct => newProduct.productID === existingQuantity.productID
        );
        if (matchingProduct) {
          return {
            ...existingQuantity,
            name: matchingProduct.prodName,
            sizes: Array.from({ length: matchingProduct.sizes.length }, (_, i) => existingQuantity.sizes[i] || 0)
          };
        }
        return null; // Remove quantities for products that are no longer available
      }).filter(item => item !== null);
  

      const newProductQuantities = newProducts.filter(newProduct =>
        !updatedQuantities.find(existingQuantity => existingQuantity.productID === newProduct.productID)
      ).map(newProduct => ({
        productID: newProduct.productID,
        name: newProduct.prodName,
        quantity: 0,
        sizes: Array.from({ length: newProduct.sizes.length }, () => 0)
      }));
  
      setQuantities([...updatedQuantities, ...newProductQuantities]);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };
  

  useEffect(() => {
    fetchCategories();
    fetchProducts(); 
  }, []);

  useEffect(() => {
    const total = getTotal();
    const amountPaid = parseFloat(payment);
    if (!isNaN(amountPaid)) {
      setChange(amountPaid - total);
    } else {
      setChange(0);
    }
  }, [payment, discount, products]); 

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
    setPayment("");
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
        const itemPrice = quantity * products[drinkIndex].sizes[sizeIndex].price;
        const addonPrice = Object.entries(selectedAddons[products[drinkIndex].productID] || {})
          .reduce((addonSum, [addonID, addonQuantity]) => {
            const addon = addons.find(addon => addon.addonID === parseInt(addonID));
            return addonSum + (addon ? addon.addonPrice * addonQuantity : 0);
          }, 0);
        return sum + itemPrice + addonPrice;
      }, 0);
    }, 0);
    return total - (total * discount);
  };
  
  
  const receiptItems = quantities.flatMap((drink, drinkIndex) =>
    drink.sizes.map((quantity, sizeIndex) =>
      quantity > 0 ? {
        name: `${drink.name} (${products[drinkIndex].sizes[sizeIndex].sizeName})`,
        price: quantity * products[drinkIndex].sizes[sizeIndex].price +
               (Object.entries(selectedAddons[products[drinkIndex].productID] || {})
                .reduce((addonSum, [addonID, addonQuantity]) => {
                  const addon = addons.find(addon => addon.addonID === parseInt(addonID));
                  return addonSum + (addon ? addon.addonPrice * addonQuantity : 0);
                }, 0)),
        quantity,
        productID: products[drinkIndex].productID,
        sizeID: products[drinkIndex].sizes[sizeIndex].sizeID,
        addons: Object.entries(selectedAddons[products[drinkIndex].productID] || {})
                .map(([addonID, addonQuantity]) => {
                  const addon = addons.find(addon => addon.addonID === parseInt(addonID));
                  return addon ? `${addon.addonName} - x${addonQuantity} - ₱${addon.addonPrice * addonQuantity}` : null;
                }).filter(addon => addon !== null)
      } : null
    ).filter(item => item !== null)
  );
  
  

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
  
  const printReceipt = () => {
    setShowReceipt(false); 
  };

  const handleCategorySelect = async (categoryID) => {
    setSelectedCategory(categoryID);
    try {
      const res = await axios.get("http://localhost:8800/product", {
        params: { categoryID: categoryID || 0 }
      });
      const newProducts = res.data;
      setProducts(newProducts);
  
      // Update product quantities without resetting existing quantities
      const updatedQuantities = quantities.map(existingQuantity => {
        const matchingProduct = newProducts.find(
          newProduct => newProduct.productID === existingQuantity.productID
        );
        if (matchingProduct) {
          return {
            ...existingQuantity,
            name: matchingProduct.prodName,
            sizes: Array.from({ length: matchingProduct.sizes.length }, (_, i) => existingQuantity.sizes[i] || 0)
          };
        }
        return null; // Remove quantities for products that are no longer available
      }).filter(item => item !== null);
  
      // Add new products with zero quantities
      const newProductQuantities = newProducts.filter(newProduct =>
        !updatedQuantities.find(existingQuantity => existingQuantity.productID === newProduct.productID)
      ).map(newProduct => ({
        productID: newProduct.productID,
        name: newProduct.prodName,
        quantity: 0,
        sizes: Array.from({ length: newProduct.sizes.length }, () => 0)
      }));
  
      setQuantities([...updatedQuantities, ...newProductQuantities]);
    } catch (err) {
      console.error("Error fetching products for category:", err);
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

        setReceiptData({
          transactionID: transactionID + 1,
          paymentMethod: paymentData.paymentMethod.toUpperCase(), 
          items: receiptItems,
          total: total,
          payment: paymentAmount,
          change: paymentAmount - total,
          discount: discount
        });
        toast.success("Order success");
        setQuantities(products.map(drink => ({
          name: drink.prodName,
          sizes: Array.from({ length: drink.sizes.length }, () => 0)
        })));
        setTransactionID(response.data.transactionID);
        setPaymentMethod(paymentData.paymentMethod);
        setShowReceipt(true);
        setPayment("");
        setChange(0);
        setDiscount(0); 
      } catch (error) {
        console.error("Error processing payment:", error);
        toast.error("Payment processing failed.");
      }
    } else {
      toast.error("Payment amount is less than the total.");
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

        setReceiptData({
          transactionID: transactionID + 1,
          paymentMethod: paymentData.paymentMethod.toUpperCase(), 
          items: receiptItems,
          total: total,
          payment: paymentAmount,
          change: paymentAmount - total,
          discount: discount
        });

        toast.success("Order success");

        setQuantities(products.map(drink => ({
          name: drink.prodName,
          sizes: Array.from({ length: drink.sizes.length }, () => 0)
        })));
        setTransactionID(response.data.transactionID);
        setPaymentMethod(paymentData.paymentMethod);
        setShowReceipt(true);
        setPayment("");
        setChange(0);
        setDiscount(0); 
      } catch (error) {
        console.error("Error processing payment:", error);
        toast.error("Payment processing failed.");
      }
    } else {
      toast.error("Payment amount is less than the total.");
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
                    {drink.image && (
                      <img
                        src={drink.image}
                        className="pos--prod--image"
                        alt={drink.prodName}
                      />
                    )}
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
                                onClick={() => handleQuantityChange(
                                  drinkIndex,
                                  sizeIndex,
                                  quantities[drinkIndex].sizes[sizeIndex] - 1
                                )}
                                disabled={quantities[drinkIndex].sizes[sizeIndex] <= 0}
                              >
                                -
                              </button>
                              <input
                                type="text"
                                value={quantities[drinkIndex].sizes[sizeIndex]}
                                onChange={(e) => handleQuantityChange(
                                  drinkIndex,
                                  sizeIndex,
                                  e.target.value
                                )}
                                className="quantity-input"
                                style={{ width: "35px", textAlign: "center", height: "22px" }}
                                disabled={size.quantity <= 0}
                              />
                              <button
                                style={{ height: "22px" }}
                                onClick={() => handleQuantityChange(
                                  drinkIndex,
                                  sizeIndex,
                                  quantities[drinkIndex].sizes[sizeIndex] + 1
                                )}
                                disabled={size.quantity <= 0}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                        
                      ))}
                    </div>
                    {/* <button className="btn--choose--addon" onClick={() => setShowAddon(true)}>Add-ons</button> */}
                  
                  </div>
                ))
              )}

          <div className="sticky-summary">
            <h2>Order Summary</h2>
            <button className="pay-discount" onClick={handleApplyDiscount}>10% Discount (PWD, Senior)</button>
            <ul>
            {receiptItems.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name} - x{item.quantity} - ₱{item.price.toFixed(2)}</span>
                  {item.addons && item.addons.length > 0 && (
                    <div className="addons-list">
                      <span>Add-ons:</span>
                      {item.addons.map((addon, addonIndex) => (
                        <div key={addonIndex} className="addon-item">
                          <span>{addon}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </ul>
            <h3>Total: ₱{getTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            {discount > 0 && <h4>Discount: 10%</h4>}
            <button onClick={handleClearOrder} className="clear-order-btn">Clear Order</button>
            <div className="payment-container">
              <label>Payment:</label>
              <input
                type="text"
                value={payment}
                onChange={handlePaymentChange}
                placeholder="0"
                maxLength="5"
              />
              <h3>Change: ₱{change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <button onClick={handlePay}  className="pay-btn">Pay</button>
            <button onClick={handleGcashPay} className="pay-btn">Pay<img src="gcash.svg" style={{width: "25px"}}/></button>
          </div>
        </div>

        
      </Layout>

        {/* {showAddon && (
          <Popup trigger={showAddon} setTrigger={setShowAddon}>
            <h3>Select Addons</h3>
            {addons.map(add => (
              <div className="addon-list" key={add.addonID}>
                <p>{add.addonName} -  ₱{add.addonPrice}</p>

                <div className="quantity-control">
                  <button className="quantity-btn" onClick={() => handleDecrement(add.addonID)}>-</button>
                  <input 
                    type="number" 
                    value={selectedQuantities[add.addonID] || 0}
                    onChange={(e) => handleAddonChange(add.productID, add.addonID, parseInt(e.target.value, 10))}
                    className="quantity-input"
                  />
                  <button className="quantity-btn" onClick={() => handleIncrement(add.addonID)}>+</button>
                </div>
              </div>
            ))}
            <button onClick={() => setShowAddon(false)}>Close</button>
          </Popup>
        )} */}


        {showReceipt && receiptData && (
        <div className="receipt-popup">
          <div className="receipt-popup-content">
            <button onClick={() => setShowReceipt(false)} className="close-btn">&#x2715;</button>
            <Receipt
              transactionID={receiptData.transactionID}
              paymentMethod={receiptData.paymentMethod}
              items={receiptData.items}
              total={receiptData.total}
              payment={receiptData.payment}
              change={receiptData.change}
              discount={receiptData.discount}
              onClose={() => setShowReceipt(false)}
              />
            </div>
          </div>
        )}
    </div>
  );
}
