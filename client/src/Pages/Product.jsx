import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Navbar/Layout';
import './styles/Products.css';
import Popup from '../components/Popup/Popup';
import { ToastContainer, toast } from 'react-toastify';
ToastContainer

export default function Products() {
  const [stockData, setStockData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    priceMedio: '',
    priceGrande: '',
    quantityMedio: '',
    quantityGrande: '',
    image: null,
    category: ''
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  // Function to fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8800/products');
      const data = response.data;
      const formattedData = data.reduce((acc, item) => {
        const existingProduct = acc.find(p => p.id === item.productID);
        if (existingProduct) {
          existingProduct.sizes.push({
            size: item.sizeName,
            price: item.price,
            quantity: item.quantity
          });
        } else {
          acc.push({
            id: item.productID,
            name: item.prodName,
            sizes: [
              {
                size: item.sizeName,
                price: item.price,
                quantity: item.quantity
              }
            ]
          });
        }
        return acc;
      }, []);
      setStockData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8800/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleUpdateQuantity = (productIndex, sizeIndex, increment) => {
    const updatedStock = [...stockData];
    updatedStock[productIndex].sizes[sizeIndex].quantity += increment;
    setStockData(updatedStock);
  };

  const handleAddProduct = () => {
    setShowPopup(true);
  };

  const handleSubmitProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('prodName', newProduct.name);
      formData.append('priceMedio', newProduct.priceMedio);
      formData.append('priceGrande', newProduct.priceGrande);
      formData.append('quantityMedio', newProduct.quantityMedio);
      formData.append('quantityGrande', newProduct.quantityGrande);
      formData.append('category', newProduct.category);
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      await axios.post('http://localhost:8800/add-product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`${newProduct.name} added successfully`)
      fetchProducts();
      setShowPopup(false); // Close popup on success
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  };

  return (
    <div className="stock--main--container">
      <ToastContainer/>
      <Layout>
      <div className="stock-container">
  <button onClick={handleAddProduct} className='btn--add'>Add New Product</button>
  <div className="table-wrapper">
    <table className='prod--table'>
      <thead className='prod--th--head'>
        <tr className='product--info--table'>
          <th className='product--info--table'>Product ID</th>
          <th className='product--info--table'>Product Name</th>
          <th className='product--info--table'>Size</th>
          <th className='product--info--table'>Price</th>
          <th className='product--info--table'>Quantity</th>
          <th className='product--info--table'>Actions</th>
        </tr>
      </thead>
      <tbody className='prod--td--body'>
        {stockData.map((product, productIndex) => (
          product.sizes.map((size, sizeIndex) => (
            <tr key={`${product.id}-${size.size}`}>
              {sizeIndex === 0 && (
                <>
                  <td className='product--info--table' rowSpan={product.sizes.length}>{product.id}</td>
                  <td className='product--info--table' rowSpan={product.sizes.length}>{product.name}</td>
                </>
              )}
              <td className='product--info--table'>{size.size}</td>
              <td className='product--info--table'>{size.price}</td>
              <td className='product--info--table'>{size.quantity}</td>
              {sizeIndex === 0 && (
                <td className='product--info--table prod--table--operation' rowSpan={product.sizes.length}>
                  <button className='btn--prod--add'
                    onClick={() => handleUpdateQuantity(productIndex, sizeIndex, 1)}>
                    ADD
                  </button>
                  <button className='btn--prod--delete'
                    onClick={() => handleUpdateQuantity(productIndex, sizeIndex, -1)}>
                    ARCHIVE
                  </button>
                </td>
              )}
            </tr>
          )))
        )}
      </tbody>
    </table>
  </div>
</div>

        {showPopup && (
          <Popup trigger={showPopup} setTrigger={setShowPopup}>
            <div className="popup-content">
              <h2>ADD PRODUCTS</h2>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitProduct(); }}>
                <label>
                  Product Name:
                  <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
                </label>
                <label>
                  Price (Medio):
                  <input type="number" step="0.01" value={newProduct.priceMedio} onChange={(e) => setNewProduct({ ...newProduct, priceMedio: e.target.value })} />
                </label>
                <label>
                  Price (Grande):
                  <input type="number" step="0.01" value={newProduct.priceGrande} onChange={(e) => setNewProduct({ ...newProduct, priceGrande: e.target.value })} />
                </label>
                <label>
                  Quantity (Medio):
                  <input type="number" value={newProduct.quantityMedio} onChange={(e) => setNewProduct({ ...newProduct, quantityMedio: e.target.value })} />
                </label>
                <label>
                  Quantity (Grande):
                  <input type="number" value={newProduct.quantityGrande} onChange={(e) => setNewProduct({ ...newProduct, quantityGrande: e.target.value })} />
                </label>
                <label>
                  Category:
                  <select className='prod--cat' value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.categoryID} value={category.categoryID}>{category.name}</option>
                    ))}
                    <option value="new">Add new category</option>
                  </select>
                  {newProduct.category === 'new' && (
                    <input
                      type="text"
                      placeholder="New category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    />
                  )}
                </label>
                <label>
                  Image:
                  <input type="file" onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })} />
                </label>
                <button type="submit">Add Product</button>
                <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
              </form>
            </div>
          </Popup>
        )}
      </Layout>
    </div>
  );
}
