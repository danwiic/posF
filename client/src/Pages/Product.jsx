import Layout from '../components/Navbar/Layout';
import products from "../../JSON FILES/products.json"
import { useState } from 'react';
import "./styles/Products.css"

export default function Products() {

  const [stockData, setStockData] = useState(products);

  const handleUpdateQuantity = (productIndex, sizeIndex, newQuantity) => {
    const updatedStock = [...stockData];
    updatedStock[productIndex].sizes[sizeIndex].quantity = newQuantity;
    setStockData(updatedStock);
  };

  const handleAddProduct = () => {
    // Logic to add a new product (you can customize this as needed)
    const newProduct = {
      name: "New Drink",
      sizes: [
        { size: "Small", quantity: 0 },
        { size: "Medium", quantity: 0 },
        { size: "Large", quantity: 0 }
      ]
    };
    setStockData([...stockData, newProduct]);
  };
  return(
    <Layout>
      <div className="stock-container">
    <h1>Stock Inventory</h1>

    <button onClick={handleAddProduct} className='btn-add--prod'>Add New Product</button>
      <table className='prod--table'>

        <thead className='prod--th--head'>
          <tr style={{border: "1px solid black"}}>
            <th style={{border: "1px solid black"}}>Product Name</th>
            <th style={{border: "1px solid black"}}>Size</th>
            <th style={{border: "1px solid black"}}>Quantity</th>
            <th style={{border: "1px solid black"}}>Actions</th>
          </tr>
        </thead>

        <tbody className='prod--td--body' >
          {stockData.map((product, productIndex) =>
            product.sizes.map((size, sizeIndex) => (
              <tr key={`${product.name}-${size.size}`} style={{border: "1px solid black"}}>
                {sizeIndex === 0 && (
                  <td style={{border: "1px solid black"}} rowSpan={product.sizes.length}>{product.name}</td>
                )}
                <td style={{border: "1px solid black"}}>{size.size}</td>
                <td style={{border: "1px solid black"}}>{size.quantity}</td>
                <td style={{border: "1px solid black"}} className='prod--table--operation'>
                  <button className='btn--prod--update'
                    onClick={() =>
                      handleUpdateQuantity(
                        productIndex,
                        sizeIndex,
                        size.quantity + 1
                      )
                    }
                  >
                    UPDATE
                  </button>
                  <button className='btn--prod--delete'>DELETE</button>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
      </div>
    </Layout>
  )
};
