import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const validateToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:8800/token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };
  
  

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    
    if (storedToken) {
      validateToken(storedToken).then(isValid => {
        if (isValid) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
