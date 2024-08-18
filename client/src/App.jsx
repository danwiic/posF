import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login/Login";
import { Routes, Route } from 'react-router-dom';
import Employee from "./Pages/Employee";
import Users from "./Pages/Users";
import Logout from "./Pages/Logout";
import POS from "./Pages/POS";
import Products from "./Pages/Product";

export default function App() {



  return (
    <div>
      <Routes>
        <Route path="*" element={<div>error 404 Page not found!</div>}/>
        <Route path="/" element={<Login/>}/>
        <Route path="/pos" element={<POS/>}/> 
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/products" element={<Products/>}/>
        <Route path="/employee" element={<Employee/>}/>
        <Route path="/users" element={<Users/>}/>
        <Route path="/logout" element={<Logout/>}/>
      </Routes>
    </div>
  );
}