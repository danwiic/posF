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
    
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [updateOpen, setUpdateOpen] = useState(false)

  const handleUpdateClick = (employee) => {
    setSelectedEmployee(employee);
    setUpdateOpen(true); // Assuming you have a state to control the visibility of the update popup
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setSelectedEmployee(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords are provided and match
    if (selectedEmployee.newPassword && selectedEmployee.newPassword !== selectedEmployee.confirmPassword) {
        toast.error("Passwords do not match");
        return;
    }

    const dataToSend = {
        username: selectedEmployee.username,
        securityQuestion: selectedEmployee.securityQuestion,
        securityAnswer: selectedEmployee.securityAnswer,
    };

    // Include password fields only if they are provided
    if (selectedEmployee.newPassword) {
        dataToSend.password = selectedEmployee.newPassword;
    }

    try {
        await axios.put(`http://localhost:8800/user/update/${selectedEmployee.id}`, dataToSend);
        fetchStaff(); // Refresh the employee list
        setUpdateOpen(false); // Close the update popup
        toast.success("Employee updated successfully");
    } catch (err) {
        console.error(err);
        toast.error("Failed to update employee");
    }
}
  

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
    fetchArch();
  }, []); 

  const fetchArch = async () => {
    try {
      const res = await axios.get("http://localhost:8800/archive/staff");
      setArcEmp(res.data); 
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setEmp(prev => ({...prev, [e.target.name]: e.target.value}));
  };

  const notifySuccess = () => toast.success("Account added successfully");

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8800/register", emp);
      if (response.data.status === 'Success') {
        notifySuccess();
        setEmp({
          username: '',
          password: '',
          securityQuestion: '',
          securityAnswer: ''
        });
        setOpen(false); // Close popup after successful addition
        fetchStaff(); // Fetch the updated employee list
      } else {
        throw new Error(response.data.error);
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        // Handle specific case for user already exists
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
                   <select
                      id="securityQuestion"
                      name="securityQuestion"
                      className="emp--input"
                      required
                      onChange={handleChange}
                      value={emp.securityQuestion}
                  >
                      <option value="">Select a security question...</option>
                      <option value="What is your mother's maiden name?">What is your mother&apos;s maiden name?</option>
                      <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                      <option value="What was the name of your elementary school?">What was the name of your elementary school?</option>
                      <option value="What is you favorite game?">What is you favorite game?</option>
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
                    value={emp.securityAnswer}
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
                    <button className="btn-update" onClick={() => handleUpdateClick(emp)}>UPDATE</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Popup trigger={updateOpen} setTrigger={setUpdateOpen}>
          <h3>Update Employee</h3>
          <div className="update-popup-container">
          <form onSubmit={handleUpdateSubmit}>
            <input
              name="username"
              type="text"
              value={selectedEmployee?.username || ''}
              onChange={handleUpdateChange}
              placeholder="Update username"
              required
            />
            <input
              name="newPassword"
              type="password"  // Input field for new password
              value={selectedEmployee?.newPassword || ''}
              onChange={handleUpdateChange}
              placeholder="New password (leave empty if unchanged)"
            />
            <input
              name="confirmPassword"
              type="password"  // Input field for confirming new password
              value={selectedEmployee?.confirmPassword || ''}
              onChange={handleUpdateChange}
              placeholder="Confirm new password"
            />
            <select
              name="securityQuestion"
              value={selectedEmployee?.securityQuestion || ''}
              onChange={handleUpdateChange}
              required
            >
              <option value="">Select a security question...</option>
              <option value="What is your mother's maiden name?">What is your mother&apos;s maiden name?</option>
              <option value="What was the name of your first pet?">What was the name of your first pet?</option>
              <option value="What was the name of your elementary school?">What was the name of your elementary school?</option>
              <option value="What is your favorite game?">What is your favorite game?</option>
              <option value="What is your favorite food?">What is your favorite food?</option>
            </select>
            <input
              name="securityAnswer"
              type="text"
              value={selectedEmployee?.securityAnswer || ''}
              onChange={handleUpdateChange}
              placeholder="Update answer"
              required
            />
            <button type="submit">UPDATE</button>
          </form>
          </div>
        </Popup>

      </Layout>
    </div>
  );
}
