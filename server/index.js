import express, { response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { db } from './connection.js';
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

const app = express()


import authRoute from "./routes/auth.js"
import dashboardRoute from "./routes/dashboard.js"


app.use(cookieParser())
app.use("/server/auth", authRoute)
app.use("/server/dashboard", dashboardRoute)

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


// SELECT ALL EMPLOYEES  THAT IS UNARCHIVE
app.get('/archive', (req, res) => {
  const q = "SELECT * FROM users WHERE status = 'archive'"
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

// CREATE DEFAULT EMPLOYEE
app.post("/register", (req, res) => {
          // CHECK IF USER EXISTS
  const checkUser = "SELECT * FROM users WHERE username = ?";
  
  db.query(checkUser, [req.body.username], (err, result) => {
    if (err) return res.json({ Error: "Error in query" });
    
    if (result.length > 0) {
      return res.json({ Status: "Error", Error: "User already exists" });
    } else {
      const q = "INSERT INTO users (username, password) VALUES (?)";

      bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if (err) return res.json({ Error: "Error in hashing password" });
        
        const values = [
          req.body.username,
          hash,
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


  app.post("/admin", (req, res) => {
    // CHECK IF USER EXIST
 
    const checkUser = "SELECT * FROM users WHERE username = ?";
  
  db.query(checkUser, [req.body.username], (err, result) => {
    if (err) return res.json({ Error: "Error in query" });
    
    if (result.length > 0) {
      return res.json({ Status: "Error", Error: "User already exists" });
    } else {
      const q = "INSERT INTO users (username, password, role) VALUES (?)";

      bcrypt.hash(req.body.password.toString(), 10, (err, hash) => {
        if (err) return res.json({ Error: "Error in hashing password" });
        
        const values = [
          req.body.username,
          hash,
          req.body.role
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

// CHECK IF server is running
app.listen(8800, () => {
  console.log("Server running")
})


