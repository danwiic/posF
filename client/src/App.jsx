import Dashboard from "./Pages/Dashboard.jsx";
import Login from "./Pages/Login/Login";
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Employee from "./Pages/Employee";
import Users from "./Pages/Users";
import POS from "./Pages/POS";
import Products from "./Pages/Product";
import ProtectedRoute from "./components/ProtectedRoute";
import { UserProvider } from "./Context/UserContext";
import Forbidden from "./Pages/Forbidden.jsx";
import Receipt from "./components/Receipt/Receipt.jsx"
import TodaysSale from "./Pages/TodaysSale.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
TodaysSale


export default function App() {



  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/rec" element={<Receipt/>} />
          <Route path="*" element={<Forbidden/>} />
          <Route path="/" element={<Login />} />
          <Route path="/reset" element={<ForgotPassword />} />
          <Route path="/today" element={<ProtectedRoute element={<TodaysSale />} allowedRoles={['staff']} />} />
          <Route path="/pos" element={<ProtectedRoute element={<POS />} allowedRoles={['admin', 'staff']} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} allowedRoles={['admin']} />} />
          <Route path="/products" element={<ProtectedRoute element={<Products />} allowedRoles={['admin']} />} />
          <Route path="/employee" element={<ProtectedRoute element={<Employee />} allowedRoles={['admin']} />} />
          <Route path="/users" element={<ProtectedRoute element={<Users />} allowedRoles={['admin']} />} />
        </Routes>
      </Router>
  </UserProvider>
  );
}