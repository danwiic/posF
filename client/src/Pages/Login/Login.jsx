import { useContext, useState } from 'react'
import './Login.css'

import { Link } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContextProvider'




export default function Login() {


  const myStyle = {
    backgroundImage: "url('backg.jpg')"
  }

  return (
    <div className='container' style={myStyle}>
    <div className='wrapper'>
      <form >
        <h1 className='title'>LOGIN</h1>

        <div className='input-box'>
          <input type="text" id='username'name='username' placeholder='Username' required/>
        </div>

        <div className='input-box'>
           <input type="password" id='password' name='password' placeholder='Password' required/>
        </div>
         
       <Link to={'/dashboard'}><button className='btn-Login' >Login</button></Link>
      </form>
    </div>
    </div>
  )
};
