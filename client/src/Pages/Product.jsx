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
    const newProduct = {
      name: "New Drink",
      sizes: [
        { size: "Small", quantity: 10 },
        { size: "Medium", quantity: 10 },
        { size: "Large", quantity: 10 }
      ]
    };
    setStockData([...stockData, newProduct]);
  };
  return(
    <div className="stock--main--container">
    <Layout>
      <div className="stock-container">

    <button onClick={handleAddProduct} className='btn--add'>Add New Product</button>
      <table className='prod--table'>

        <thead className='prod--th--head'>
          <tr style={{border: "1px solid gray"}}>
            <th style={{border: "1px solid gray"}}>Product Name</th>
            <th style={{border: "1px solid gray"}}>Size</th>
            <th style={{border: "1px solid gray"}}>Quantity</th>
            <th style={{border: "1px solid gray"}}>Actions</th>
          </tr>
        </thead>

        <tbody className='prod--td--body' >
          {stockData.map((product, productIndex) =>
            product.sizes.map((size, sizeIndex) => (
              <tr key={`${product.name}-${size.size}`} style={{border: "1px solid black"}}>
                {sizeIndex === 0 && (
                  <td style={{border: "1px solid gray"}} rowSpan={product.sizes.length}>{product.name}</td>
                )}
                <td style={{border: "1px solid gray"}}>{size.size}</td>
                <td style={{border: "1px solid gray"}}>{size.quantity}</td>
                <td style={{border: "1px solid gray"}} className='prod--table--operation'>
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
                  <button className='btn--prod--delete'
                  onClick={() =>
                    handleUpdateQuantity(
                      productIndex,
                      sizeIndex,
                      size.quantity - 1
                    )
                  }
                  
                  >ARCHIVE</button>
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
      </div>
    </Layout>
    </div>
  )
};
