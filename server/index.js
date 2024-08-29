import express, { response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { db } from './connection.js';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import multer from 'multer';
import moment from 'moment/moment.js';

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

// SELECT ALL ACTIVE STAFF
app.get('/employee', (req, res) => {
  const q = "SELECT * FROM users WHERE status = 'active' AND role = 'staff'"
  db.query(q, (err,data)=> {
    if(err) return res.json(err)
    return res.json(data)
  })
});

// SELECT ALL ACTIVE ADMIN
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

// ARCHIVE EMPLOYEE ACCOUNT
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

//  UNARCHIVE EMPLOYEE ACCOUNT 
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

// DELETE STAFF ACCOUNT
app.delete('/employee/:id', (req, res) => {
  const empId = req.params.id
  const q = "DELETE FROM users WHERE id = ?"

  db.query(q, [empId], (err, data) => {
    if(err) return res.json(err)
      return res.json("Staff deleted successfully")
  })
})

// DELETE ADMIN ACCOUNT
app.delete('/admins/:id', (req, res) => {
  const adminID = req.params.id
  const q = "DELETE FROM users WHERE id = ?"

  db.query(q, [adminID], (err, data) => {
    if(err) return res.json(err)
      return res.json("Staff deleted successfully")
  })
})

// CREATE DEFAULT EMPLOYEE
app.post("/register", (req, res) => {
  const checkUser = "SELECT * FROM users WHERE username = ?";
  
  db.query(checkUser, [req.body.username], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Error in query" });
    }

    if (result.length > 0) {
      return res.status(409).json({ status: "Error", error: "User already exists" });
    } 

    const userQuery = "INSERT INTO users (username, password) VALUES (?)";
    bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
      if (err) {
        console.error("Hashing error:", err);
        return res.status(500).json({ error: "Error in hashing password" });
      }

      const userValues = [req.body.username, hash];

      db.query(userQuery, [userValues], (err, result) => {
        if (err) {
          console.error("Database query error:", err);
          return res.status(500).json({ error: "Error in query" });
        }

        const userId = result.insertId;
        const securityQuestionQuery = "INSERT INTO security_questions (user_id, question, answer) VALUES (?)";

        const securityQuestionValues = [userId, req.body.securityQuestion, req.body.securityAnswer];

        db.query(securityQuestionQuery, [securityQuestionValues], (err, result) => {
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Error in query" });
          }

          return res.status(200).json({ status: 'Success' });
        });
      });
    });
  });
});

// UPDATE THE USERS INFO
app.put('/user/update/:id', async (req, res) => {
  const userId = req.params.id;
  const { username, password, securityQuestion, securityAnswer } = req.body;

  try {
      // Check if the new username already exists
      const [rows] = await new Promise((resolve, reject) => {
          db.query(
              `SELECT * FROM users WHERE username = ? AND id != ?`,
              [username, userId],
              (err, results) => {
                  if (err) reject(err);
                  else resolve([results]);
              }
          );
      });

      if (rows.length > 0) {
          return res.status(400).json({ error: "Username already exists" });
      }

      let updateUserQuery = `
          UPDATE users 
          SET username = ? 
          ${password ? ', password = ?' : ''} 
          WHERE id = ?`;

      let updateUserValues = [username];
      if (password) {
          // Hash the new password
          const hash = await bcrypt.hash(password, 10);
          updateUserValues.push(hash);
      }
      updateUserValues.push(userId);

      await new Promise((resolve, reject) => {
          db.query(updateUserQuery, updateUserValues, (err, results) => {
              if (err) reject(err);
              else resolve(results);
          });
      });

      // Update security question
      const updateSecurityQuestionQuery = `
          UPDATE security_questions 
          SET question = ?, answer = ? 
          WHERE user_id = ?`;

      const updateSecurityQuestionValues = [securityQuestion, securityAnswer, userId];
      await new Promise((resolve, reject) => {
          db.query(updateSecurityQuestionQuery, updateSecurityQuestionValues, (err, results) => {
              if (err) reject(err);
              else resolve(results);
          });
      });

      return res.status(200).json({ status: "Success" });

  } catch (err) {
      console.error("Database query error:", err.message || err);
      return res.status(500).json({ error: "Internal server error" });
  }
});





// ======================CREATE NEW ADMIN ACCOUNT=================================>
app.post("/register/admin", (req, res) => {
    const checkUser = "SELECT * FROM users WHERE username = ?";
    
    db.query(checkUser, [req.body.username], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Error in query" });
      }
  
      if (result.length > 0) {
        return res.status(409).json({ status: "Error", error: "User already exists" });
      }
  
      const userQuery = "INSERT INTO users (username, password, role) VALUES (?)";
  
      bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if (err) {
          console.error("Hashing error:", err);
          return res.status(500).json({ error: "Error in hashing password" });
        }
  
        const userValues = [
          req.body.username,
          hash,
          'admin'
        ];
  
        db.query(userQuery, [userValues], (err, result) => {
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Error in query" });
          }
  
          const userId = result.insertId;
  
          const securityQuestionQuery = "INSERT INTO security_questions (user_id, question, answer) VALUES (?)";
  
          const securityQuestionValues = [
            userId,
            req.body.securityQuestion,
            req.body.securityAnswer
          ];
  
          db.query(securityQuestionQuery, [securityQuestionValues], (err, result) => {
            if (err) {
              console.error("Database query error:", err);
              return res.status(500).json({ error: "Error in query" });
            }
  
            return res.status(200).json({ status: 'Success' });
          });
        });
      });
    });
});
// <=======================================================

// LOGIN ENDPOINT AND CHECKING ROLES TOO
const JWT_SECRET = 'super_secret_promise'; 
app.post('/login', (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, result) => {
    if (err) return res.json({ Status: "Error", Error: "Error in query" });
    
    if (result.length > 0) {
      bcrypt.compare(req.body.password.toString(), result[0].password, (err, match) => {
        if (err) return res.json({ Error: "Password comparison error" });
        if (match) {
          const token = jwt.sign(
            { id: result[0].id, role: result[0].role },
            JWT_SECRET 
          );
          return res.json({
            Status: "Success",
            user: {
              id: result[0].id,
              username: result[0].username,
              role: result[0].role,
            },
            token 
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

// LOGOUT -----------------> PRETTY OBVIUS IG 
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    secure: true,
    sameSite: "none"
  }).status(200).json("User has been logout")
})

// FETCH PRODUCTS FOR PRODUCT PAGE
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
    res.json(results);
  });
});

//========================================== ADDING NEW PRODUCTS =====================================================

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });

// INSERT NEW PRODUCT TO DATABASE WITH IMAGE
app.post('/add-product', upload.single('image'), (req, res) => {
  const { prodName, priceMedio, priceGrande, quantityMedio, quantityGrande, category, newCategory } = req.body;
  const image = req.file ? req.file.buffer : null; 
  const mimeType = req.file ? req.file.mimetype : null; 

  if (!prodName || !priceMedio || !priceGrande || !quantityMedio || !quantityGrande) {
    return res.status(400).send('Missing required fields');
  }

  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).send('Server error');
    }

    let categoryId;
    let categoryQuery;
    let categoryValues;

    if (category === 'new' && newCategory) {
      // Insert new category
      categoryQuery = 'INSERT INTO drink_categories (name) VALUES (?)';
      categoryValues = [newCategory];
    } else {
      // Use existing category
      categoryId = category; 
      categoryQuery = 'SELECT categoryID FROM drink_categories WHERE categoryID = ?';
      categoryValues = [categoryId];
    }

    db.query(categoryQuery, categoryValues, (error, results) => {
      if (error) {
        return db.rollback(() => {
          console.error('Error inserting/selecting category:', error);
          res.status(500).send('Server error');
        });
      }

      if (category === 'new' && newCategory) {
        // New category inserted, get its ID
        categoryId = results.insertId;
      } else {
        // Existing category, ensure it exists
        if (results.length === 0) {
          return db.rollback(() => {
            console.error('Category not found');
            res.status(400).send('Category not found');
          });
        }
        categoryId = results[0].categoryID;
      }

      // Insert product
      const insertProductQuery = 'INSERT INTO Products (prodName, categoryID) VALUES (?, ?)';
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

// ADD NEW CATEGORY IF NEEDED
app.post('/add-category', async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const query = 'INSERT INTO drink_categories (name) VALUES (?)';
    const result = await db.query(query, [name]);

    if (result.affectedRows > 0) {
      res.status(201).json({ message: 'Category added successfully' });
    } else {
      res.status(500).json({ error: 'Failed to add category' });
    }
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET ALL CATEGORIES IN CATEGORY TABLE FOR PRODUCTS DISPLAY IN POS PAGE
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

// FETCH ALL PRODUCTS
app.get('/product', (req, res) => {
  const categoryID = parseInt(req.query.categoryID, 10) || 0; // Convert categoryID to integer

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
    WHERE p.categoryID = ? AND p.status = 'active'
  `;

  if (categoryID === 0) {
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
      WHERE p.status = 'active'
    `;
  }

  db.query(q, [categoryID], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: err.message });
    }

    const products = results.reduce((acc, row) => {
      let product = acc.find(p => p.productID === row.productID);
      if (!product) {
        product = {
          productID: row.productID,
          prodName: row.prodName,
          sizes: [],
          image: row.imageData ? toBase64(row.imageData, row.mimeType) : null
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


// SELECT ALL PRODUCTS THAT IS ARCHIVE IN PRODUCT.JSX
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

// SET PRODUCTS STATUS TO ARCHIVE
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

// SUBMIT THE TRANSACTION AND UPDATE THE STOCKS IN DATABASE
app.post('/payment', (req, res) => {
  const { paymentMethod, items, total, paymentAmount, discount } = req.body;

  // Convert paymentAmount and total to numbers
  const paymentAmountNum = Number(paymentAmount);
  const totalNum = Number(total);

  if (!paymentMethod || !items || !total || isNaN(paymentAmountNum) || isNaN(totalNum)) {
    return res.status(400).json({ message: 'Missing or invalid parameters' });
  }

  // Calculate changeAmount
  const changeAmount = paymentAmountNum - totalNum;

  // Check if paymentAmount is valid
  if (paymentAmountNum < totalNum) {
    return res.status(400).json({ message: 'Payment amount must be equal to or greater than the total amount' });
  }

  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ message: 'Transaction failed', error: err });
    }

    // Insert order record
    db.query(
      `INSERT INTO Orders (OrderDate, PaymentMethod, TotalAmount) 
       VALUES (NOW(), ?, ?)`,
      [paymentMethod, totalNum],
      (err, results) => {
        if (err) {
          return db.rollback(() => res.status(500).json({ message: 'Failed to insert order', error: err }));
        }

        const orderID = results.insertId;

        // Process each item
        let itemQueries = items.map(item => {
          return new Promise((resolve, reject) => {
            // Insert into order items
            db.query(
              `INSERT INTO OrderItems (TransactionID, ProductID, Quantity, ItemPrice, SizeID) 
               VALUES (?, ?, ?, ?, ?)`,
              [orderID, item.productID, item.quantity, item.price, item.sizeID],
              (err, results) => {
                if (err) return reject(err);

                const orderItemID = results.insertId;

                // Insert addons for this order item
                if (item.addOns && item.addOns.length > 0) {
                  let addonQueries = item.addOns.map(addOn => {
                    return new Promise((resolve, reject) => {
                      db.query(
                        `INSERT INTO OrderItemAddons (OrderItemID, AddonID, AddonPrice) 
                         VALUES (?, ?, ?)`,
                        [orderItemID, addOn.addonID, addOn.addonPrice],
                        err => {
                          if (err) return reject(err);
                          resolve();
                        }
                      );
                    });
                  });

                  Promise.all(addonQueries)
                    .then(() => {
                      // Update product stock
                      db.query(
                        `UPDATE ProductSizes 
                         SET quantity = quantity - ? 
                         WHERE productID = ? 
                           AND sizeID = ?`,
                        [item.quantity, item.productID, item.sizeID],
                        err => {
                          if (err) return reject(err);
                          resolve();
                        }
                      );
                    })
                    .catch(err => reject(err));
                } else {
                  // If no addons, just update product stock
                  db.query(
                    `UPDATE ProductSizes 
                     SET quantity = quantity - ? 
                     WHERE productID = ? 
                       AND sizeID = ?`,
                    [item.quantity, item.productID, item.sizeID],
                    err => {
                      if (err) return reject(err);
                      resolve();
                    }
                  );
                }
              }
            );
          });
        });

        Promise.all(itemQueries)
          .then(() => {
            db.commit(err => {
              if (err) {
                return db.rollback(() => res.status(500).json({ message: 'Failed to commit transaction', error: err }));
              }
              res.status(200).json({ 
                message: 'Payment processed and stock updated successfully',
                transactionID: orderID, // Return the transaction ID
                changeAmount // Include calculated changeAmount in response
              });
            });
          })
          .catch(err => {
            db.rollback(() => res.status(500).json({ message: 'Failed to process items', error: err }));
          });
      }
    );
  });
});




// GET ALL THE ORDER HISTORY
app.get('/order-history', (req, res) => {
  const date = req.query.date;
  let query = `
    SELECT o.TransactionID, 
           DATE_FORMAT(o.OrderDate, '%Y-%m-%d %r') AS OrderDateTime, 
           o.PaymentMethod, 
           o.TotalAmount, 
           SUM(oi.Quantity) AS TotalQuantity
    FROM Orders o
    JOIN OrderItems oi ON o.TransactionID = oi.TransactionID
    ${date ? `WHERE DATE(o.OrderDate) = '${date}'` : ''}
    GROUP BY o.TransactionID, o.OrderDate, o.PaymentMethod, o.TotalAmount
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

// VOIDING TRANSACTION AND RETURNING THE QUANTITY
app.post('/transaction/:transactionId/void', (req, res) => {
  const { transactionId } = req.params;

  // Begin transaction
  db.beginTransaction(err => {
    if (err) {
      console.error('Transaction start error:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Fetch order details
    db.query('SELECT * FROM Orders WHERE TransactionID = ?', [transactionId], (err, orderDetails) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error fetching order details:', err);
          res.status(500).json({ message: 'Internal server error' });
        });
      }

      if (orderDetails.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ message: 'Transaction not found' });
        });
      }

      // Fetch order items
      db.query('SELECT * FROM OrderItems WHERE TransactionID = ?', [transactionId], (err, orderItems) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error fetching order items:', err);
            res.status(500).json({ message: 'Internal server error' });
          });
        }

        // Ensure each update is performed correctly
        let updateCount = 0;
        const totalItems = orderItems.length;
        
        orderItems.forEach(item => {
          db.query(
            'UPDATE ProductSizes SET quantity = quantity + ? WHERE productID = ? AND sizeID = ?',
            [item.Quantity, item.ProductID, item.SizeID],  // Ensure the correct size is targeted
            (err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Error updating product quantities:', err);
                  res.status(500).json({ message: 'Internal server error' });
                });
              }

              updateCount++;
              if (updateCount === totalItems) {
                // Delete from OrderItems
                db.query('DELETE FROM OrderItems WHERE TransactionID = ?', [transactionId], (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Error deleting from OrderItems:', err);
                      res.status(500).json({ message: 'Internal server error' });
                    });
                  }

                  // Delete from Orders
                  db.query('DELETE FROM Orders WHERE TransactionID = ?', [transactionId], (err) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Error deleting from Orders:', err);
                        res.status(500).json({ message: 'Internal server error' });
                      });
                    }

                    // Commit transaction
                    db.commit(err => {
                      if (err) {
                        return db.rollback(() => {
                          console.error('Transaction commit error:', err);
                          res.status(500).json({ message: 'Internal server error' });
                        });
                      }
                      res.status(200).json({ message: 'Transaction voided successfully' });
                    });
                  });
                });
              }
            }
          );
        });
      });
    });
  });
});



// =================================== UPDATE PRODUCT QUANTITY / PRICE
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

app.get('/sales', (req, res) => {
  const query = `
    SELECT 'today' AS period, COALESCE(SUM(TotalAmount), 0) AS total 
    FROM Orders 
    WHERE DATE(OrderDate) = CURDATE()
    UNION ALL
    SELECT 'thisWeek' AS period, COALESCE(SUM(TotalAmount), 0) AS total 
    FROM Orders 
    WHERE YEARWEEK(OrderDate, 1) = YEARWEEK(CURDATE(), 1)
    UNION ALL
    SELECT 'lastWeek' AS period, COALESCE(SUM(TotalAmount), 0) AS total 
    FROM Orders 
    WHERE YEARWEEK(OrderDate, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)
    UNION ALL
    SELECT 'thisMonth' AS period, COALESCE(SUM(TotalAmount), 0) AS total 
    FROM Orders 
    WHERE YEAR(OrderDate) = YEAR(CURDATE()) 
    AND MONTH(OrderDate) = MONTH(CURDATE())
    UNION ALL
    SELECT 'total' AS period, COALESCE(SUM(TotalAmount), 0) AS total 
    FROM Orders
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching sales data:', err);
      return res.status(500).json({ message: 'Error fetching sales data', error: err });
    }

    const sales = results.reduce((acc, row) => {
      acc[row.period] = row.total || 0;
      return acc;
    }, {});

    res.json(sales);
  });
});

// FETCH HISTORY OF TODAYS SALE
app.get('/today', (req, res) => {
  const query = `
    SELECT o.TransactionID, 
           DATE_FORMAT(o.OrderDate, '%Y-%m-%d %r') AS OrderDateTime, 
           o.PaymentMethod, 
           o.TotalAmount, 
           SUM(oi.Quantity) AS TotalQuantity
    FROM Orders o
    JOIN OrderItems oi ON o.TransactionID = oi.TransactionID
    WHERE DATE(o.OrderDate) = CURDATE()
    GROUP BY o.TransactionID, o.OrderDate, o.PaymentMethod, o.TotalAmount
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (results.length === 0) {
      console.log('No data found for today.');
    }

    res.json(results);
  });
});

// FETCH ADDONS THAT IS ACTIVE / AVAILABLE
app.get('/addons', (req, res) => {
  const sql = 'SELECT * FROM Addons WHERE addonStatus = "active"';
  db.query(sql, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to retrieve addons' });
      }
      res.json(results);
  });
});

// FETCH ADDONS THAT IS ARCHIVED
app.get('/addons/arch', (req, res) => {
  const sql = 'SELECT * FROM Addons WHERE addonStatus = "archive"';
  db.query(sql, (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to retrieve addons' });
      }
      res.json(results);
  });
});

// ADDING NEW ADDON
app.post('/addons/add', (req, res) => {
  const { addonName, addonPrice } = req.body;

  const checkSql = 'SELECT * FROM Addons WHERE addonName = ?';
  db.query(checkSql, [addonName], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Failed to check for existing addon' });
      }

      if (results.length > 0) {

          return res.status(400).json({ error: 'Addon with this name already exists' });
      }

      const insertSql = 'INSERT INTO Addons (addonName, addonPrice) VALUES (?, ?)';
      db.query(insertSql, [addonName, addonPrice], (err, results) => {
          if (err) {
              return res.status(500).json({ error: 'Failed to insert addon' });
          }
          res.status(201).json({ addonID: results.insertId });
      });
  });
});

// ARCHIVING ADDONS
app.put('/addons/:addonID/archive', (req, res) => {
  const { addonID } = req.params;

  const sql = 'UPDATE Addons SET addonStatus = "archive" WHERE addonID = ?';
  db.query(sql, [addonID], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to archive addon' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Addon not found' });
      }
      
      res.status(200).json({ message: 'Addon archived successfully' });
  });
});

// UNARCHIVE
app.put('/addons/:addonID/unarchive', (req, res) => {
  const { addonID } = req.params;

  const sql = 'UPDATE Addons SET addonStatus = "active" WHERE addonID = ?';
  db.query(sql, [addonID], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to archive addon' });
      }
      
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Addon not found' });
      }
      
      res.status(200).json({ message: 'Addon archived successfully' });
  });
});


// DELETING ADDONS
app.get('/order-details/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;

  const query = `
    SELECT 
      oi.ProductID, 
      p.prodName, 
      s.sizeName, 
      oi.Quantity, 
      oi.ItemPrice,
      GROUP_CONCAT(a.addonName SEPARATOR ', ') AS Addons,
      GROUP_CONCAT(CONCAT('₱', oia.AddonPrice) SEPARATOR ', ') AS AddonPrices
    FROM 
      OrderItems oi
    JOIN 
      Products p ON oi.ProductID = p.productID
    JOIN 
      Sizes s ON oi.SizeID = s.sizeID
    LEFT JOIN 
      OrderItemAddons oia ON oi.OrderItemID = oia.OrderItemID
    LEFT JOIN 
      Addons a ON oia.AddonID = a.addonID
    WHERE 
      oi.TransactionID = ?
    GROUP BY 
      oi.ProductID, oi.SizeID, oi.Quantity, oi.ItemPrice
  `;

  db.query(query, [transactionId], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});


// Endpoint to get order details by transactionId
app.get('/order-details/:transactionId', (req, res) => {
  const transactionId = req.params.transactionId;

  const query = `
    SELECT 
      oi.ProductID, 
      p.prodName, 
      s.sizeName, 
      oi.Quantity, 
      oi.ItemPrice,
      GROUP_CONCAT(
        CONCAT(a.addonName, ' (₱', oia.AddonPrice, ')') 
        SEPARATOR ', '
      ) AS Addons
    FROM 
      OrderItems oi
    JOIN 
      Products p ON oi.ProductID = p.productID
    JOIN 
      Sizes s ON oi.SizeID = s.sizeID
    LEFT JOIN 
      OrderItemAddons oia ON oi.OrderItemID = oia.OrderItemID
    LEFT JOIN 
      Addons a ON oia.AddonID = a.addonID
    WHERE 
      oi.TransactionID = ?
    GROUP BY 
      oi.ProductID, oi.SizeID, oi.Quantity, oi.ItemPrice
  `;

  db.query(query, [transactionId], (err, results) => {
    if (err) {
      console.error('Error fetching order details:', err);
      res.status(500).send('Server error');
      return;
    }
    res.json(results);
  });
});


// Endpoint to get security question based on username
app.post("/forgot-password", (req, res) => {
  const checkUser = "SELECT * FROM users WHERE username = ?";

  db.query(checkUser, [req.body.username], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Error in query" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = result[0].id;
    const getSecurityQuestion = "SELECT question FROM security_questions WHERE user_id = ?";

    db.query(getSecurityQuestion, [userId], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Error in query" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Security question not found" });
      }

      return res.status(200).json({ question: result[0].question });
    });
  });
});


// Server-side endpoint to verify security answer
app.post("/verify-answer", (req, res) => {
  const { username, answer } = req.body;

  const getUserIdQuery = "SELECT id FROM users WHERE username = ?";
  db.query(getUserIdQuery, [username], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Error in query" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = result[0].id;

    const getSecurityAnswerQuery = "SELECT answer FROM security_questions WHERE user_id = ?";
    db.query(getSecurityAnswerQuery, [userId], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Error in query" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Security question not found" });
      }

      const storedAnswer = result[0].answer;

      if (answer === storedAnswer) {
        return res.status(200).json({ status: "Success" });
      } else {
        return res.status(401).json({ error: "Incorrect security answer" });
      }
    });
  });
});


app.post("/reset-password", (req, res) => {
  const { username, securityAnswer, newPassword } = req.body;

  const checkUser = "SELECT * FROM users WHERE username = ?";
  
  db.query(checkUser, [username], (err, result) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Error in query" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userId = result[0].id;
    const getSecurityAnswer = "SELECT answer FROM security_questions WHERE user_id = ?";

    db.query(getSecurityAnswer, [userId], (err, result) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ error: "Error in query" });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "Security answer not found" });
      }

      const storedAnswer = result[0].answer;

      if (securityAnswer !== storedAnswer) {
        return res.status(400).json({ error: "Security answer is incorrect" });
      }

      // Hash the new password and update it in the database
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) {
          console.error("Error hashing new password:", err);
          return res.status(500).json({ error: "Error in hashing new password" });
        }

        const updatePassword = "UPDATE users SET password = ? WHERE username = ?";
        
        db.query(updatePassword, [hashedPassword, username], (err, result) => {
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Error in updating password" });
          }

          return res.status(200).json({ status: 'Password reset successfully' });
        });
      });
    });
  });
});





// CHECK IF server is running
app.listen(8800, () => {
  console.log("Server running")
})