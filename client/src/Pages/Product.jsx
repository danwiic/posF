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
      id: stockData.length + 1, // Example of adding ID automatically, adjust as needed
      name: "New Drink",
      sizes: [
        { size: "Medio", quantity: 10 },
        { size: "Grande", quantity: 10 }
      ]
    };
    setStockData([...stockData, newProduct]);
  };

  return (
    <div className="stock--main--container">
      <Layout>
        <div className="stock-container">

          <button onClick={handleAddProduct} className='btn--add'>Add New Product</button>
          <table className='prod--table'>

            <thead className='prod--th--head'>
              <tr className='product--info--table'>
                <th className='product--info--table'>Product ID</th>
                <th className='product--info--table'>Product Name</th>
                <th className='product--info--table'>Size</th>
                <th className='product--info--table'>Quantity</th>
                <th className='product--info--table'>Actions</th>
              </tr>
            </thead>

            <tbody className='prod--td--body'>
              {stockData.map((product, productIndex) =>
                product.sizes.map((size, sizeIndex) => (
                  <tr key={`${product.name}-${size.size}`} style={{border: "1px solid black"}}>
                    {sizeIndex === 0 && (
                      <>
                        <td className='product--info--table' rowSpan={product.sizes.length}>{product.id}</td>
                        <td className='product--info--table' rowSpan={product.sizes.length}>{product.name}</td>
                      </>
                    )}
                    <td className='product--info--table'>{size.size}</td>
                    <td className='product--info--table'>{size.quantity}</td>
                    <td className='product--info--table prod--table--operation'>
                      <button className='btn--prod--update'
                        onClick={() =>
                          handleUpdateQuantity(
                            productIndex,
                            sizeIndex,
                            size.quantity + 1
                          )
                        }
                      >
                        ADD
                      </button>
                      <button className='btn--prod--delete'
                        onClick={() =>
                          handleUpdateQuantity(
                            productIndex,
                            sizeIndex,
                            size.quantity - 1
                          )
                        }
                      >
                        ARCHIVE
                      </button>
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
