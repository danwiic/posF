import Layout from "../components/Navbar/Layout";
import products from '../../JSON FILES/products.json';
import { useState } from "react";
import "./styles/POS.css";

export default function POS() {
  const [quantities, setQuantities] = useState(
    products.map(drink => ({
      name: drink.name,
      sizes: drink.sizes.map(() => 0) // Initialize quantities to 0
    }))
  );

  const handleQuantityChange = (drinkIndex, sizeIndex, change) => {
    const newQuantities = [...quantities];
    const newSizeQuantity = newQuantities[drinkIndex].sizes[sizeIndex] + change;

    if (newSizeQuantity >= 0) {
      newQuantities[drinkIndex].sizes[sizeIndex] = newSizeQuantity;
      setQuantities(newQuantities);
    }
  };

  const getTotal = () => {
    return quantities.reduce((total, drink, drinkIndex) => {
      return total + drink.sizes.reduce((sum, quantity, sizeIndex) => {
        return sum + quantity * products[drinkIndex].sizes[sizeIndex].price;
      }, 0);
    }, 0);
  };

  return (
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
            {quantities.map((drink, drinkIndex) =>
              drink.sizes.map((quantity, sizeIndex) => 
                quantity > 0 && (
                  <li key={`${drink.name}-${sizeIndex}`}>
                    {<img src={`/products/${products[drinkIndex].image}`} alt={`${drink.name}`} style={{width: '30px', marginRight: '10px'}} />}
                    {drink.name} ({products[drinkIndex].sizes[sizeIndex].size}) - {quantity} x ₱{products[drinkIndex].sizes[sizeIndex].price} = ₱{(quantity * products[drinkIndex].sizes[sizeIndex].price).toFixed(2)}
                  </li>
                )
              )
            )}
          </ul>
          <h3>Total: ₱{getTotal().toFixed(2)}</h3>
        </div>
      </div>
    </Layout>
  );
}
