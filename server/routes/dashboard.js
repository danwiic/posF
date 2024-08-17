import express from 'express';
import {  } from '../controllers/dashboard.js'

const router = express.Router()

router.get("/test", (req, res)=> {
  res.send("Somehow it works")
})

export default router