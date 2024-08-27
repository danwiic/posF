import { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../../Context/UserContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser(); // Use setUser from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8800/login', { username, password });
      if (response.data.Status === 'Success') {
        const user = response.data.user;
        const token = response.data.token;
  
        setUser(user); // Store user details in context
  
        // Save user data and token to localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', token); // Store token
  
        navigate('/dashboard');
      } else {
        setError(response.data.Error || 'Login failed');
      }
    } catch (error) {
      setError(error);
    }
  };

  const myStyle = {
    backgroundImage: "url('backg.jpg')"
  };

  return (
    <div className='container' style={myStyle}>
      <div className='wrapper'>
        <form onSubmit={handleLogin}>
          <h1 className='title'>LOGIN</h1>
          <div className='input-box'>
            <input
              type="text"
              id='username'
              name='username'
              placeholder='Username'
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className='input-box'>
            <input
              type="password"
              id='password'
              name='password'
              placeholder='Password'
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className='btn-Login'>Login</button>
          <Link to="/reset"><p className='forgot--password'>Forgot password?</p></Link>
          {error && <p style={{ color: 'red', textAlign: "center", marginTop: "10px" }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
