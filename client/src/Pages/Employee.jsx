import { useEffect, useState } from "react";
import Layout from "../components/Navbar/Layout";
import axios from 'axios';
import "./styles/Employee.css";
import Popup from '../components/Popup/Popup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

export default function Employee() {
  const [open, setOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false); // State for archive popup

  const [archEmp, setArcEmp] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [emp, setEmp] = useState({
    username: "",
    password: "",
    forgotKey: ""
  });

  // Move fetchStaff function outside useEffect
  const fetchStaff = async () => {
    try {
      const res = await axios.get("http://localhost:8800/employee");
      setEmployee(res.data); 
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []); // Empty dependency array ensures this only runs once after initial render

  const fetchArch = async () => {
    try {
      const res = await axios.get("http://localhost:8800/archive/staff");
      setArcEmp(res.data); 
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchArch();
  }, []); // Empty dependency array ensures this only runs once after initial render

  const handleChange = (e) => {
    e.preventDefault();
    setEmp(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const notifySuccess = () => toast.success("Account added successfully");

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/register", emp);
      notifySuccess();
      setEmp({
        username: '',
        password: '',
        forgotKey: ''
      });
      setOpen(false); // Close popup after successful addition
      fetchStaff(); // Fetch the updated employee list
    } catch (err) {
      console.log(err);
      toast.error('Failed to add employee');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/employee/${id}`);
      setEmployee(employee.filter(emp => emp.id !== id));
      toast.success("Account deleted successfully");
      fetchStaff(); 
      fetchArch(); 
    } catch (err) {
      console.log(err);
      toast.error('Failed to delete employee');
    }
  };

  const handleArchive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'archive' : 'active';
      await axios.put(`http://localhost:8800/employee/${id}/status`, { status: newStatus });
      fetchStaff(); // Refresh employee list
      fetchArch(); 
      toast.success(`Employee status changed to ${newStatus}`);
    } catch (err) {
      console.log(err);
      toast.error('Failed to update status');
    }
  };

  const handleUnArchive = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'archive' ? 'active' : 'archive';
      await axios.put(`http://localhost:8800/employee/${id}/unarch`, { status: newStatus });
      fetchStaff(); // Refresh employee list
      fetchArch(); 
      toast.success(`Employee status changed to ${newStatus}`);
    } catch (err) {
      console.log(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="emp-layout">
      <ToastContainer />
      <Layout>
        <div className="emp--container--con">
        <div className="emp--container">

          {/* EMP POPUP */}
          <Popup trigger={open} setTrigger={setOpen}>
          <h3 className="h3--add--header">Add New Employee</h3>
            <div className="emp--popup--container">
              <form className="emp--form">
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="emp--input"
                  required
                  placeholder="Input username..."
                  onChange={handleChange}
                  value={emp.username}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="emp--input"
                  required
                  placeholder="Input password..."
                  onChange={handleChange}
                  value={emp.password}
                />
                 <input
                  id="forgotKey"
                  name="forgotKey"
                  type="text"
                  className="emp--input"
                  required
                  placeholder="Input key..."
                  onChange={handleChange}
                  value={emp.forgotKey}
                />
                <button className="btn--emp--add" onClick={handleClick}>ADD</button>
              </form>
            </div>
          </Popup>
          </div>
          {/* END EMP POPUP */}

          {/* ARCHIVED STAFF POPUP */}
          <Popup trigger={archiveOpen} setTrigger={setArchiveOpen}>
            <div className="emp--popup--arch--container">
              <h3 className="h3--arch--header">Archived Employees</h3>
              <table className="arch--table">
                <thead>
                  <tr>
                    <th>userID</th>
                    <th>Username</th>
                    <th>Status</th>
                    <th className="col--operations">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {archEmp.map(arch => (
                    <tr key={arch.id}>
                      <td>{arch.id}</td>
                      <td>{arch.username}</td>
                      <td>{arch.status}</td>
                      <td>
                        <button className="btn-archive" onClick={() => handleUnArchive(arch.id, arch.status)}>
                          {arch.status === "archive" ? "UNARCHIVE" : "ARCHIVE"}
                        </button>
                        <button className="btn-delete" onClick={() => handleDelete(arch.id)}>DELETE</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Popup>
          {/* END ARCHIVED STAFF POPUP */}

          {/* ADD NEW EMP / STAFF */}

          <div className="popup--view--button">
            <button className="btn--add" onClick={() => setOpen(true)}>ADD EMPLOYEE</button>
            <button className="btn--archive" onClick={() => setArchiveOpen(true)}>VIEW ARCHIVED STAFF</button>
          </div>
      
          <table className="emp--table" style={{ textAlign: "center" }}>
            <thead>
              <tr>
                <th>userID</th>
                <th>Username</th>
                <th>Password</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employee.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.username}</td>
                  <td>{emp.password}</td>
                  <td>{emp.role}</td>
                  <td style={{ color: emp.status === "active" ? "green" : "red" }}>{emp.status}</td>
                  <td className="col--operations">
                    {emp.status === 'active' && (
                      <button className="btn-archive" onClick={() => handleArchive(emp.id, emp.status)}>
                         {emp.status === "archive" ? "UNARCHIVE" : "ARCHIVE"}
                    </button>
                    )}
                    <button className="btn-update">UPDATE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Layout>
    </div>
  );
}
