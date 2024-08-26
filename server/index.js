import express, { response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { db } from './connection.js';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import multer from 'multer';

const app = express()

app.use(cookieParser())

// middlewares
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// REMAIN LOGIN AFTER RELOADING PAGE
app.get('/token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from Bearer scheme

  if (!token) {
    return res.status(401).json({ valid: false });
  }

  jwt.verify(token, JWT_SECRET, (err) => {
    if (err) {
      return res.status(401).json({ valid: false });
    }
    res.json({ valid: true });
  });
});


// SELECT ALL STAFF
app.get('/employee', (req, res) => {
  const q = "SELECT * FROM users WHERE status = 'active' AND role = 'staff'"
  db.query(q, (err,data)=> {
    if(err) return res.json(err)
    return res.json(data)
  })
});

// SELECT ALL ADMIN
app.get('/admins', (req, res) => {
  const q = "SELECT * FROM users WHERE status = 'active' AND role = 'admin'"
  db.query(q, (err,data)=> {
    if(err) return res.json(err)
    return res.json(data)
  })
});


// SELECT ALL EMPLOYEES  THAT IS ARCHIVE
app.get('/archive/staff', (req, res) => {
  const q = "SELECT * FROM users WHERE status = 'archive' AND role = 'staff'"
  db.query(q, (err,data)=> {
    if(err) return res.json(err)
    return res.json(data)
  })
});

// SELECT ALL ADMIN  THAT IS ARCHIVE
app.get('/archive/admin', (req, res) => {
  const q = "SELECT * FROM users WHERE status = 'archive' AND role = 'admin'"
  db.query(q, (err,data)=> {
    if(err) return res.json(err)
    return res.json(data)
  })
});

// ARCHIVE ACCOUNT
app.put('/employee/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.status(200).send("Status updated");
  } catch (err) {
    res.status(500).send(err);
  }
});

//  UNARCHIVE
app.put('/employee/:id/unarch', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.status(200).send("Status updated");
  } catch (err) {
    res.status(500).send(err);
  }
});

// DELETE STAFF
app.delete('/employee/:id', (req, res) => {
  const empId = req.params.id
  const q = "DELETE FROM users WHERE id = ?"

  db.query(q, [empId], (err, data) => {
    if(err) return res.json(err)
      return res.json("Staff deleted successfully")
  })
})

// DELETE ADMIN
app.delete('/admins/:id', (req, res) => {
  const adminID = req.params.id
  const q = "DELETE FROM users WHERE id = ?"

  db.query(q, [adminID], (err, data) => {
    if(err) return res.json(err)
      return res.json("Staff deleted successfully")
  })
})

// DELETE STAFF
app.delete('/employee/:id', (req, res) => {
  const empId = req.params.id
  const q = "DELETE FROM users WHERE id = ?"

  db.query(q, [empId], (err, data) => {
    if(err) return res.json(err)
      return res.json("Staff deleted successfully")
  })
})

// CREATE DEFAULT EMPLOYEE
app.post("/register", (req, res) => {
          // CHECK IF USER EXISTS
  const checkUser = "SELECT * FROM users WHERE username = ?";
  
  db.query(checkUser, [req.body.username], (err, result) => {
    if (err) return res.json({ Error: "Error in query" });
    
    if (result.length > 0) {
      return res.json({ Status: "Error", Error: "User already exists" });
    } else {
      const q = "INSERT INTO users (username, password, forgot_pass_key) VALUES (?)";

      bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if (err) return res.json({ Error: "Error in hashing password" });
        
        const values = [
          req.body.username,
          hash,
          req.body.forgotKey
        ];

        db.query(q, [values], (err, result) => {
          if (err) return res.json({ Error: "Error in query" });
          return res.json({ Status: 'Success' });
        });
      });
    }
  });
});

// ======================CREATE ADMIN ACCOUNT=================================>


  app.post("/register/admin", (req, res) => {
    // CHECK IF USER EXIST
 
    const checkUser = "SELECT * FROM users WHERE username = ?";
  
  db.query(checkUser, [req.body.username], (err, result) => {
    if (err) return res.json({ Error: "Error in query" });
    
    if (result.length > 0) {
      return res.json({ Status: "Error", Error: "User already exists" });
    } else {
      const q = "INSERT INTO users (username, password, role, forgot_pass_key) VALUES (?)";

      bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if (err) return res.json({ Error: "Error in hashing password" });
        
        const values = [
          req.body.username,
          hash,
          req.body.role,
          req.body.forgotKey
        ];

        db.query(q, [values], (err, result) => {
          if (err) return res.json({ Error: "Error in query" });
          return res.json({ Status: 'Success' });
        })
      })
    }
  })
 })

// <=======================================================



// LOGIN USER
const JWT_SECRET = 'super_secret_promise'; // Use a strong secret key for JWT

app.post('/login', (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, result) => {
    if (err) return res.json({ Status: "Error", Error: "Error in query" });
    
    if (result.length > 0) {
      bcrypt.compare(req.body.password.toString(), result[0].password, (err, match) => {
        if (err) return res.json({ Error: "Password comparison error" });
        if (match) {
          // Generate a JWT token
          const token = jwt.sign(
            { id: result[0].id, role: result[0].role },
            JWT_SECRET // Token expires in 1 hour
          );

          // Return the user's role and token
          return res.json({
            Status: "Success",
            user: {
              id: result[0].id,
              username: result[0].username,
              role: result[0].role,
            },
            token // Send the token to the client
          });
        } else {
          return res.json({ Status: "Error", Error: "Wrong username or password" });
        }
      });
    } else {
      return res.json({ Status: "Error", Error: "Wrong username or password" });
    }
  });
});

// LOGOUT

app.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    secure: true,
    sameSite: "none"
  }).status(200).json("User has been logout")
})

// FETCH PRODUCTS

app.get('/products', (req, res) => {
  const query = `
    SELECT p.productID, p.prodName, s.sizeName, ps.sizeID, ps.price, ps.quantity
    FROM ProductSizes ps
    JOIN Products p ON ps.productID = p.productID
    JOIN Sizes s ON ps.sizeID = s.sizeID
    WHERE status = 'active'
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Database query error:', error);
      return res.status(500).send('Server error');
    }

    // Log raw results
    console.log('Raw database query results:', results);

    res.json(results);
  });
});



//========================================== ADDING NEW PRODUCTS =====================================================

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });


app.post('/add-product', upload.single('image'), (req, res) => {
  const { prodName, priceMedio, priceGrande, quantityMedio, quantityGrande, category, newCategory } = req.body;
  const image = req.file ? req.file.buffer : null; // Image buffer
  const mimeType = req.file ? req.file.mimetype : null; // MIME type

  if (!prodName || !priceMedio || !priceGrande || !quantityMedio || !quantityGrande) {
    return res.status(400).send('Missing required fields');
  }

  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).send('Server error');
    }

    let categoryId;
    let insertCategoryQuery;
    let categoryValues;

    if (category === 'new' && newCategory) {
      insertCategoryQuery = 'INSERT INTO drink_categories (name) VALUES (?)';
      categoryValues = [newCategory];
    } else {
      categoryId = category; // Use the selected category ID
      insertCategoryQuery = 'SELECT categoryID FROM drink_categories WHERE categoryID = ?';
      categoryValues = [categoryId];
    }

    db.query(insertCategoryQuery, categoryValues, (error, results) => {
      if (error) {
        return db.rollback(() => {
          console.error('Error inserting/selecting category:', error);
          res.status(500).send('Server error');
        });
      }

      if (category === 'new' && newCategory) {
        // Handle new category insertion
        categoryId = results.insertId;
      } else {
        // Ensure category exists
        if (results.length === 0) {
          return db.rollback(() => {
            console.error('Category not found');
            res.status(400).send('Category not found');
          });
        }
        categoryId = results[0].categoryID;
      }

      const insertProductQuery = `
        INSERT INTO Products (prodName, categoryID)
        VALUES (?, ?)
      `;
      const productValues = [prodName, categoryId];

      db.query(insertProductQuery, productValues, (error, results) => {
        if (error) {
          return db.rollback(() => {
            console.error('Error inserting product:', error);
            res.status(500).send('Server error');
          });
        }

        const productID = results.insertId;

        // Insert product sizes
        const insertProductSizeQuery = `
          INSERT INTO ProductSizes (productID, sizeID, price, quantity)
          VALUES ?
        `;
        const sizes = [
          [productID, 1, priceMedio, quantityMedio],  // Assuming sizeID 1 is for Medio
          [productID, 2, priceGrande, quantityGrande] // Assuming sizeID 2 is for Grande
        ];

        db.query(insertProductSizeQuery, [sizes], (error) => {
          if (error) {
            return db.rollback(() => {
              console.error('Error inserting product sizes:', error);
              res.status(500).send('Server error');
            });
          }

          if (image) {
            const insertImageQuery = 'INSERT INTO Images (productID, imageData, mimeType) VALUES (?, ?, ?)';
            db.query(insertImageQuery, [productID, image, mimeType], (error) => {
              if (error) {
                return db.rollback(() => {
                  console.error('Error inserting image:', error);
                  res.status(500).send('Server error');
                });
              }

              db.commit(err => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Transaction commit error:', err);
                    res.status(500).send('Server error');
                  });
                }

                res.status(200).send('Product added successfully');
              });
            });
          } else {
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  console.error('Transaction commit error:', err);
                  res.status(500).send('Server error');
                });
              }

              res.status(200).send('Product added successfully');
            });
          }
        });
      });
    });
  });
});

// GET ALL CATEGORIES IN CATEGORY TABLE
app.get('/categories', (req, res) => {
  const q = 'SELECT categoryID, name FROM drink_categories';

  db.query(q, (error, results) => {
    if (error) {
      console.error('Error fetching categories:', error);
      return res.status(500).send('Server error');
    }
    res.json(results);
  });
});

const toBase64 = (buffer, mimeType) => `data:${mimeType};base64,${buffer.toString('base64')}`;

// Get products with images
app.get('/product', (req, res) => {
  const categoryID = req.query.categoryID || 0;

  // Construct the query conditionally
  let q = `
    SELECT 
      p.productID,
      p.prodName,
      ps.sizeID,
      ps.price,
      ps.quantity,
      s.sizeName,
      i.imageData,
      i.mimeType
    FROM Products p
    JOIN ProductSizes ps ON p.productID = ps.productID
    JOIN Sizes s ON ps.sizeID = s.sizeID
    LEFT JOIN Images i ON p.productID = i.productID
    WHERE p.categoryID = ? AND status = 'active'`;

  if (categoryID === '0') {
    // Adjust the query if categoryID is 0
    q = `
      SELECT 
        p.productID,
        p.prodName,
        ps.sizeID,
        ps.price,
        ps.quantity,
        s.sizeName,
        i.imageData,
        i.mimeType
      FROM Products p
      JOIN ProductSizes ps ON p.productID = ps.productID
      JOIN Sizes s ON ps.sizeID = s.sizeID
      LEFT JOIN Images i ON p.productID = i.productID
      WHERE status = 'active'
    `;
  }

  db.query(q, [categoryID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err); // Log any error
      return res.status(500).json({ error: err.message });
    }


    const products = results.reduce((acc, row) => {
      let product = acc.find(p => p.productID === row.productID);
      if (!product) {
        product = {
          productID: row.productID,
          prodName: row.prodName,
          sizes: [],
          image: row.imageData ? toBase64(row.imageData, row.mimeType) : null // Use the correct MIME type
        };
        acc.push(product);
      }
    
      product.sizes.push({
        sizeID: row.sizeID,
        sizeName: row.sizeName,
        price: row.price,
        quantity: row.quantity
      });
    
      return acc;
    }, []);
    

    res.json(products);
  });
});

app.get('/archive/products', (req, res) => {
  const q = `
    SELECT p.productID, p.prodName, s.sizeName, ps.price, ps.quantity
    FROM Products p
    JOIN ProductSizes ps ON p.productID = ps.productID
    JOIN Sizes s ON ps.sizeID = s.sizeID
    WHERE p.status = 'archive'
  `;
  
  db.query(q, (err, data) => {
    if (err) {
      console.error('Error fetching archived products:', err);
      return res.status(500).json({ error: 'Failed to fetch archived products' });
    }
    return res.json(data);
  });
});

// ARCHIVE PRODUCT
app.put('/product/:id/archive', async (req, res) => {
  const { id } = req.params;
  const status = 'archive'; 

  try {
    await db.query('UPDATE Products SET status = ? WHERE productID = ?', [status, id]);
    res.status(200).send("Product archived successfully");
  } catch (err) {
    res.status(500).send("Error archiving product: " + err);
  }
});

// UNARCHIVE PRODUCT
app.put('/product/:id/unarchive', async (req, res) => {
  const { id } = req.params;
  const status = 'active'; // Set status to 'active' for unarchiving

  try {
    await db.query('UPDATE Products SET status = ? WHERE productID = ?', [status, id]);
    res.status(200).send("Product unarchived successfully");
  } catch (err) {
    res.status(500).send("Error unarchiving product: " + err);
  }
});

// UPDATE PRODUCT
app.put('/products/:productId/sizes', async (req, res) => {
  const productId = parseInt(req.params.productId, 10);
  const sizes = req.body.sizes;

  // Input validation
  if (!Array.isArray(sizes) || sizes.some(size => !size.sizeId || size.price < 0 || size.quantity < 0)) {
    return res.status(400).json({ error: 'Invalid input data' });
  }

  const query = (sql, params) => {
    return new Promise((resolve, reject) => {
      db.query(sql, params, (error, results) => {
        if (error) {
          console.error('Database query error:', error);
          return reject(error);
        }
        resolve(results);
      });
    });
  };

  try {
    // Start a transaction
    await query('START TRANSACTION');

    // Check if the product exists
    const productExists = await query('SELECT 1 FROM Products WHERE productID = ?', [productId]);
    if (productExists.length === 0) {
      throw new Error(`Product with ID ${productId} does not exist.`);
    }

    // Check if all sizes exist
    const sizeIds = sizes.map(size => size.sizeId);
    const existingSizes = await query('SELECT sizeID FROM Sizes WHERE sizeID IN (?)', [sizeIds]);
    const existingSizeIds = new Set(existingSizes.map(size => size.sizeID));

    for (const size of sizes) {
      const { sizeId, price, quantity } = size;

      if (!existingSizeIds.has(sizeId)) {
        throw new Error(`Size with ID ${sizeId} does not exist.`);
      }

      // Check if the size already exists for the product
      const existingProductSizes = await query('SELECT * FROM ProductSizes WHERE productID = ? AND sizeID = ?', [productId, sizeId]);

      if (existingProductSizes.length > 0) {
        // Update the existing size
        await query('UPDATE ProductSizes SET price = ?, quantity = ? WHERE productID = ? AND sizeID = ?', [price, quantity, productId, sizeId]);
      } else {
        // Insert a new size
        await query('INSERT INTO ProductSizes (productID, sizeID, price, quantity) VALUES (?, ?, ?, ?)', [productId, sizeId, price, quantity]);
      }
    }

    // Commit the transaction
    await query('COMMIT');

    res.status(200).json({
      message: 'Product sizes updated successfully',
      updatedProduct: {
        id: productId,
        sizes: sizes
      }
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await query('ROLLBACK');
    console.error('Error updating product sizes:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }

  console.log('Received sizes:', sizes);
});



// DELETE PRODUCTS
app.delete('/product/:id/delete', (req, res) => {
  const productId = req.params.id;
  const query = 'DELETE FROM Products WHERE productID = ?';

  db.query(query, [productId], (err, result) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ message: 'Error deleting product' });
    }

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  });
});







// CHECK IF server is running
app.listen(8800, () => {
  console.log("Server running")
})



app.put('/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sizes } = req.body;

    console.log(`Updating product ${id} with sizes:`, sizes);

    if (!sizes || sizes.length === 0) {
      return res.status(400).json({ error: 'No sizes provided for update' });
    }

    for (const size of sizes) {
      const { sizeID, price, quantity } = size;

      if (!sizeID) {
        console.error('Missing sizeID in request payload');
        continue;
      }

      console.log(`Updating sizeID ${sizeID} with price ${price} and quantity ${quantity}`);

      const result = await db.query(
        'UPDATE ProductSizes SET price = ?, quantity = ? WHERE productID = ? AND sizeID = ?',
        [price, quantity, id, sizeID]
      );
      console.log(`Update result for sizeID ${sizeID}:`, result);

      if (result.affectedRows === 0) {
        console.error(`No rows updated for productID ${id} and sizeID ${sizeID}`);
      }
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Error updating product' });
  }
});

