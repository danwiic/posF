import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Navbar/Layout';
import './styles/Products.css';
import Popup from '../components/Popup/Popup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { IoIosArrowRoundBack } from "react-icons/io";



export default function Products() {
  const [stockData, setStockData] = useState([]);
  const [archivedData, setArchivedData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showArchivedPopup, setShowArchivedPopup] = useState(false);
  const [showAddons, setShowAddons] = useState(false)
  const [addons, setAddons] = useState([])
  const [showAddAddons, setShowAddAddons] = useState(false)
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
  


  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8800/products');
      const data = response.data
      
      const formattedData = data.reduce((acc, item) => {
        let product = acc.find(p => p.id === item.productID);
  
        if (!product) {
          product = {
            id: item.productID,
            name: item.prodName,
            sizes: []
          };
          acc.push(product);
        }
  
        product.sizes.push({
          sizeID: item.sizeID,
          size: item.sizeName,
          price: item.price,
          quantity: item.quantity
        });
  
        return acc;
      }, []);
      setStockData(formattedData)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchArchivedProducts = async () => {
    try {
      const response = await axios.get('http://localhost:8800/archive/products');
      const data = response.data
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
          })
        }
        return acc
      }, [])
      setArchivedData(formattedData)
    } catch (error) {
      console.error('Error fetching archived products:', error)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:8800/categories')
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchArchivedProducts()
  }, [])
  

  const handleArchiveProduct = async (productIndex) => {
    const updatedStock = [...stockData]
    const productId = updatedStock[productIndex].id
  
    // Archive product
    try {
      await axios.put(`http://localhost:8800/product/${productId}/archive`)
      toast.success('Product archived successfully')
      fetchProducts()
    } catch (error) {
      console.error('Error archiving product:', error)
      toast.error('Error archiving product')
    }
  }
  

  const handleAddProduct = () => {
    setShowPopup(true);
  }
  const handleViewAddons = () => {
    setShowAddons(true);
  }
  const handleBackAddAddons = () => {
    setShowAddons(true);
    setShowAddAddons(false)
  }
  const handleViewAddAddons = () => {
    setShowAddAddons(true)
    setShowAddons(false)
  }

  const handleDeleteCategory = async (categoryID) => {
    try {
      await axios.delete(`http://localhost:8800/delete-category/${categoryID}`);
      toast.success('Category has been deleted');
      // Fetch categories again to update the UI
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Failed to delete category');
    }
  };
  

  const addNewCategory = async (e) => {
    e.preventDefault(); // Prevent form default behavior here

    try {
      await axios.post('http://localhost:8800/add-category', { name: newCategory });
      toast.success('Category added successfully');
      fetchCategories(); // Ensure this function is defined elsewhere in your code
      setNewCategory(''); // Clear the input after successful addition
      setShowAddAddons(false); // Optionally close the popup
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Error adding category');
    }
  };
  

  const handleSubmitProduct = async () => {
    try {
      if (newProduct.category === 'new' && newCategory.trim()) {
        await addNewCategory(newCategory.trim());
        await fetchCategories();
        setNewProduct(prevProduct => ({ ...prevProduct, category: newCategory.trim() }));
      } else if (newProduct.category === 'new') {
        toast.error('Please provide a new category name.');
        return;
      }

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
  
      toast.success(`${newProduct.name} added successfully`);
      fetchProducts(); 
      setShowPopup(false);
    } catch (error) {
      console.error('Error submitting product:', error);
      toast.error('Error submitting product');
    }
  }
  

  const handleShowArchived = async () => {
    await fetchArchivedProducts();
    setShowArchivedPopup(true);
  }

  const handleUnarchiveProduct = async (productId) => {
    try {
      await axios.put(`http://localhost:8800/product/${productId}/unarchive`);
      toast.success('Product unarchived successfully');
      fetchProducts();
      fetchArchivedProducts();
    } catch (error) {
      console.error('Error unarchiving product:', error);
      toast.error('Error unarchiving product');
    }
  }

  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowUpdate(true); 
  }
  
  
  const handleUpdateProduct = async () => {
    const updatedSizes = selectedProduct.sizes.map(size => {
      if (!size.sizeID) {
        console.error('Missing sizeID in one of the sizes');
        return null; 
      }
      return {
        sizeID: size.sizeID,
        price: parseFloat(size.price),
        quantity: parseInt(size.quantity, 10)
      };
    }).filter(size => size !== null);
  
    try {
      const response = await axios.put(`http://localhost:8800/product/${selectedProduct.id}`, { sizes: updatedSizes });
  
      if (response.status === 200) {
        toast.success('Product updated successfully');
        fetchProducts(); 
        setShowPopup(false); 
      } else {
        toast.error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product');
    }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await axios.delete(`http://localhost:8800/product/${productId}/delete`);
      toast.success('Product deleted successfully');
      fetchArchivedProducts();
      fetchProducts(); 
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  }


  

  return (
    <div className="stock--main--container">
      <ToastContainer />
      <Layout>
        <div className="stock-container">
          <div className="popup--prod--button">
            <button onClick={handleAddProduct} className='btn--add'>Add New Product</button>
            <button onClick={handleViewAddons} className="btn--archive">VIEW CATEGORIES</button>
            <button onClick={handleShowArchived} className="btn--archive">VIEW ARCHIVED PRODUCTS</button>
          </div>
          <div className="table--wrapper--prod">
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
                      <td className='product--info--table size'>{size.size}</td>
                      <td className='product--info--table'>₱{size.price}</td>
                      <td className='product--info--table'>{size.quantity === 0 ? "Out of stock": size.quantity}</td>
                      {sizeIndex === 0 && (
                        <td className='product--info--table prod--table--operation' rowSpan={product.sizes.length}>
                          <button className='btn--prod--update'
                            onClick={() => handleEditProduct(product)}>
                            UPDATE
                          </button>
                          <button className='btn--prod--archive'
                            onClick={() => handleArchiveProduct(productIndex)}>
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
                  <input type="number" value={newProduct.priceMedio} onChange={(e) => setNewProduct({ ...newProduct, priceMedio: e.target.value })} />
                </label>
                <label>
                  Price (Grande):
                  <input type="number" value={newProduct.priceGrande} onChange={(e) => setNewProduct({ ...newProduct, priceGrande: e.target.value })} />
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
                  </select>
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

        {showAddons && (
          <Popup trigger={showAddons} setTrigger={setShowAddons} className="bg-dash">
          <h1 style={{ marginBottom: "15px", textAlign: "center", fontSize: "20px", fontWeight: "800" }}>
            CATEGORIES
          </h1>

         <div className="addon--action--con">
            <button 
              onClick={handleViewAddAddons}>
              Add Category
            </button>
         </div>

            <table className='ordered--table'>
              <thead>
                <tr>
                  <th>CategoryID</th>
                  <th>Category Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(add => (
                  <tr key={add.categoryID} id={add.id}>
                    <td>{add.categoryID}</td>
                    <td>{add.name}</td>
                    <td>
                     <button onClick={() => handleDeleteCategory(add.categoryID)} className='btn--prod--delete'>DELETE</button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
       </Popup>
      )}


        {showArchivedPopup && (
          <Popup trigger={showArchivedPopup} setTrigger={setShowArchivedPopup}>
            <div className="popup-content">
              <h2>ARCHIVED PRODUCTS</h2>
              <table className='prod--popup--table'>
                <thead>
                  <tr>
                    <th className='product--info--table'
                    style={{padding: "4px"}}
                    >
                      Product ID
                      </th>
                    <th className='product--info--table'>Product Name</th>
                    <th className='product--info--table'>Actions</th>
                  </tr>
                </thead>
                <tbody className='prod--td--body'>
                  {archivedData.map((product) => (
                    product.sizes.map((size, sizeIndex) => (
                      <tr key={`${product.id}-${size.size}`}>
                        {sizeIndex === 0 && (
                          <>
                            <td className='product--info--table' rowSpan={product.sizes.length}>{product.id}</td>
                            <td className='product--info--table' rowSpan={product.sizes.length}>{product.name}</td>
                          </>
                        )}
                        {sizeIndex === 0 && (
                          <td className='product--info--table arch--table--popup' rowSpan={product.sizes.length}>
                            <button className='btn--prod--unarchive'
                              onClick={() => handleUnarchiveProduct(product.id)}>
                              UNARCHIVE
                            </button>
                            <button className='btn--prod--delete'
                              onClick={() => handleDeleteProduct(product.id)}>
                              DELETE
                            </button>
                          </td>
                        )}
                      </tr>
                    )))
                  )}
                </tbody>
              </table>
            </div>
          </Popup>
        )}

        {showAddAddons && (
            <Popup trigger={showAddAddons} setTrigger={setShowAddAddons}>
              <h1 style={{ marginBottom: '15px', textAlign: 'center', fontSize: '20px', fontWeight: '800' }}>
                NEW CATEGORY
              </h1>
              <div className='add--addons'>
                <form onSubmit={addNewCategory} className='add--addon--form'>
                  <input
                    className='new--addon--input'
                    type='text'
                    placeholder='Enter category name...'
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    required
                  />
                  <button className='btn--add--addon' type='submit'>
                    ADD
                  </button>
                </form>
                <button onClick={() => handleBackAddAddons()} className='btn--cancel--add--addon'>
                  CANCEL
                </button>
              </div>
            </Popup>
              )}
        
        {showUpdate && (
          <Popup trigger={showUpdate} setTrigger={setShowUpdate}>
            <div className="popup-content">
              <h2>EDIT PRODUCT</h2>
              {selectedProduct && (
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateProduct(); setShowUpdate(false) }}>
                  <label>
                    Product Name:
                    <input
                      type="text"
                      value={selectedProduct.name}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                    />
                  </label>
                  {selectedProduct.sizes.map((size, index) => (
                    <div key={index}>
                      <h3 className='update--size'>Size: {size.size}</h3>
                      <label>
                        Price:
                        <input
                          type="text"
                          value={size.price}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value);
                            if (!isNaN(newPrice)) {
                              const updatedSizes = [...selectedProduct.sizes];
                              updatedSizes[index].price = newPrice;
                              setSelectedProduct({ ...selectedProduct, sizes: updatedSizes });
                            }
                          }}
                        />
                      </label>
                      <label>
                        Quantity:
                        <input
                          type="number"
                          value={size.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value, 10);
                            if (!isNaN(newQuantity)) {
                              const updatedSizes = [...selectedProduct.sizes];
                              updatedSizes[index].quantity = newQuantity;
                              setSelectedProduct({ ...selectedProduct, sizes: updatedSizes });
                            }
                          }}
                        />
                      </label>
                    </div>
                  ))}

                  <button type="submit" >Update Product</button>
                  <button type="button" onClick={() => setShowPopup(false)}>Cancel</button>
                </form>
              )}
            </div>
          </Popup>
        )}
      </Layout>
    </div>
  );
}