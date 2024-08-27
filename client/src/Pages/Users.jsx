import { useEffect, useState } from "react";
import Layout from "../components/Navbar/Layout";
import axios from 'axios';
import "./styles/Employee.css";
import Popup from '../components/Popup/Popup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";

export default function Users() {
  const [open, setOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false); // State for archive popup

  const [archAdmin, setArchAdmin] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [admin, setAdmin] = useState({
      username: '',
      password: '',
      securityQuestion: '',
      securityAnswer: ''
  });

  // Move fetchStaff function outside useEffect
  const fetchStaff = async () => {
    try {
      const res = await axios.get("http://localhost:8800/admins");
      setAdmins(res.data); 
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []); 

  const fetchArch = async () => {
    try {
      const res = await axios.get("http://localhost:8800/archive/admin");
      setArchAdmin(res.data); 
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchArch();
  }, []); 

  const handleChange = (e) => {
    e.preventDefault();
    setAdmin(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const notifySuccess = () => toast.success("Account added successfully");

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8800/register/admin", { ...admin, role: "admin" })
      notifySuccess();
      setAdmin({
        username: '',
        password: '',
        securityQuestion: '',
        securityAnswer: ''
      });
      setOpen(false); // Close popup after successful addition
      fetchStaff(); // Fetch the updated employee list
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error('Account already exists');
      } else {
        console.error(err);
        toast.error('Failed to add employee: ' + err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8800/employee/${id}`);
      setAdmins(admins.filter(emp => emp.id !== id));
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
      toast.success(`Admin status changed to ${newStatus}`);
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
      toast.success(`Admin status changed to ${newStatus}`);
    } catch (err) {
      console.log(err);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="emp-layout">
      <ToastContainer />
      <Layout>
        <div className="emp--container">

          {/* EMP POPUP */}
          <Popup trigger={open} setTrigger={setOpen}>
          <h3 className="h3--add--header">Add New Admin</h3>
            <div className="emp--popup--container">
              <form className="emp--form">
                <input
                  id="username"
                  name="username"
                  value={admin.username}
                  type="text"
                  className="emp--input"
                  required
                  placeholder="Input username..."
                  onChange={handleChange}
                />
                <input
                  id="password"
                  name="password"
                  value={admin.password}
                  type="password"
                  className="emp--input"
                  required
                  placeholder="Input password..."
                  onChange={handleChange}
                />
                  <select
                    id="securityQuestion"
                    name="securityQuestion"
                    className="emp--input"
                    required
                    onChange={handleChange}
                    value={admin.securityQuestion}
                  >
                      <option value="">Select a security question...</option>
                      <option value="What is your mother's maiden name?">What is your mother&apos;s maiden name?</option>
                      <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                      <option value="What was the name of your elementary school?">What was the name of your elementary school?</option>
                      <option value="What is your favorite game?">What is your favorite game?</option>
                      <option value="What is your favorite food?">What is your favorite food?</option>
                  </select>

                  <input
                    id="securityAnswer"
                    name="securityAnswer"
                    type="text"
                    className="emp--input"
                    required
                    placeholder="Input answer..."
                    onChange={handleChange}
                    value={admin.securityAnswer}
                  />
                <button className="btn--emp--add" onClick={handleClick}>ADD</button>
              </form>
            </div>
          </Popup>
          {/* END EMP POPUP */}

          {/* ARCHIVED STAFF POPUP */}
          <Popup trigger={archiveOpen} setTrigger={setArchiveOpen}>
            <div className="emp--popup--arch--container">
              <h3 className="h3--arch--header">Archived Admins</h3>
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
                  {archAdmin.map(arch => (
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
            <button className="btn--add" onClick={() => setOpen(true)}>ADD ADMIN</button>
            <button className="btn--archive" onClick={() => setArchiveOpen(true)}>VIEW ARCHIVED LIST</button>
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
              {admins.map(emp => (
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
