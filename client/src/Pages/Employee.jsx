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
  const [employee, setEmployee] = useState([]);
  const [emp, setEmp] = useState({
    username: "",
    password: ""
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get("http://localhost:8800/employee");
        setEmployee(res.data); 
      } catch (err) {
        console.log("Error:", err);
      }
    };
    fetchStaff();
  }, [emp]);

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
        password: ''
      });
      setOpen(false); // Close popup after successful addition
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
    } catch (err) {
      console.log(err);
      toast.error('Failed to delete employee');
    }
  };

  return (
    <div className="emp-layout">
      <ToastContainer />
      <Layout>
        <div className="emp--container">

          {/* EMP POPUP */}
          <Popup trigger={open} setTrigger={setOpen}>
            <div className="emp--popup--container">
              <h3 className="h3--add--header">Add New Employee</h3>
              <form className="emp--form">
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="emp--input"
                  required
                  placeholder="Input username..."
                  onChange={handleChange}
                />
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="emp--input"
                  required
                  placeholder="Input password..."
                  onChange={handleChange}
                />
                <button className="btn--emp--add" onClick={handleClick}>ADD</button>
              </form>
            </div>
          </Popup>
          {/* END EMP POPUP */}

          {/* ADD NEW EMP / STAFF */}
          <button className="btn--add" onClick={() => setOpen(true)}>ADD EMPLOYEE</button>

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
                    <button className="btn-archive" onClick={() => notifySuccess()}>
                      {emp.status === "archive" ? "UNARCHIVE" : "ARCHIVE"}
                    </button>
                    <button className="btn-update">UPDATE</button>
                    <button className="btn-delete" onClick={() => handleDelete(emp.id)}>DELETE</button>
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
