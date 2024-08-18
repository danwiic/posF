import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { db } from './connection.js';

const app = express()


import authRoute from "./routes/auth.js"
import dashboardRoute from "./routes/dashboard.js"


// middlewares
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use("/server/auth", authRoute)
app.use("/server/dashboard", dashboardRoute)

// SELECT ALL EMPLOYEES  OR STAFF
app.get('/employee', (req, res) => {
  const q = "SELECT * FROM users WHERE status = 'active'"
  db.query(q, (err,data)=> {
    if(err) return res.json(err)
    return res.json(data)
  })
});

// DELETE STAFF
app.delete('/employee:id', (req, res) => {
  const empId = req.params.id
  const q = "DELETE FROM users WHERE id = ?"

  db.query(q, [empId], (err, data) => {
    if(err) return res.json(err)
      return res.json("Staff deleted successfully")
  })
})

// CREATE DEFAULT EMPLOYEE
app.get("/register", (req, res) => {
   // CHECK IF USER EXIST

   const q = "SELECT * FROM users WHERE username = ?"

   db.query(q, [req.body.username], (err,data) => {
     if(err) return res.status(500).json(err)
       if(data.length) return res.status(409).json("Account already exist!")
 
 
   // CREATE NEW USER
     // HASH THE PASSWORD
    const salt = bcrypt.genSaltSync(10)
    const hashedPass = bcrypt.hashSync(req.body.password, salt)

    const q = "INSERT INTO users (username, password) value (?)"

    const values = [
      req.body.username,
      hashedPass
    ]

    db.query(q, [values], (err,data)=> {
      if(err) return res.status(500).json(err) 
        return res.status(200).json("User created successfully.")
    })
  })
})

// LOGIN USER
app.get('/', (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?" 

  db.query(q, [req.body.username], (err, data) => {
   if(err) return res.status(500).json(err)
   if(data.length === 0 ) return res.status(404).json("User not found!")

   const checkPass = bcrypt.compareSync(
      req.body.password,
      data[0].password
     );

   if(!checkPass) 
     return res.status(400).json("Wrong password or username!")

   const token = jwt.sign({ id: data[0].id }, "secretkey")

   const {password, ...others} = data[0]

   res
   .cookie("accessToken", token, {
     httpOnly: true,
   })
   .status(200)
   .json(others)
  })
})

// CHECK IF server is running
app.listen(8800, () => {
  console.log("Server running")
})