import {db} from '../connection.js'
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

export const login = (req, res) => {

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

}

export const register = (req, res) => {

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

}

export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    secure: true,
    sameSite: "none"
  }).status(200).json("User has been logout")
}

