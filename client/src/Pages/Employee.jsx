import { useEffect, useState } from "react"
import Layout from "../components/Navbar/Layout"
import axios from 'axios'
import "./styles/Employee.css"
import Popup from '../components/Popup/Popup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";
import staffs from "../../JSON FILES/emp.json"

export default function Employee() {

  const [staff] = useState(staffs)

  

  // USE STATE FOR POPUP
  const [open, setOpen] = useState(false)

  const [employee, setEmployee] = useState([])
  console.log(employee)

  const [emp, setEmp] = useState({
    username: "",
    password: ""
  })

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await axios.get("http://localhost:8800/employee");
        console.log("Response:", res);
        setEmployee(res.data); 
      } catch (err) {
        console.log("Error:", err);
      }
    };
    fetchStaff();
  }, [emp]);

  // ADDING NEW EMP
  
  const handleChange = (e) => {
    e.preventDefault()
    setEmp(prev => ({...prev, [e.target.name]: e.target.value}))
  }

  
  const handleClick = async e => {
    e.preventDefault()
    try{
      await axios.post("http://localhost:8800/server/auth/register", emp)
      notifySuccess()
      setEmp({
        username: '',
        password: ''
      });
    }catch(err){
      console.log(err);
    }
  }


  const notifySuccess = () => toast.success("Account added successfully")
  // DELETING STAFF

  const handleDelete = async (id) => {
    try{
      await axios.delete("http://localhost:8800/employee"+id)
      window.location.reload()
    }catch(err){
      console.log(err);
    }
  }


  return(
    <div className="emp-layout">
      <ToastContainer/>

      <Layout>
        <div className="emp--container">

           {/* EMP POPUP */}
           <div className="emp--popup">
            <Popup trigger={open} setTrigger={setOpen}>
              <div className="emp--popup--container">
              <h3 className="h3--add--header">Add New Employee</h3>
              <form className="emp--form">
                <input id="username" name="username" type="text" className="emp--input" required placeholder="Input username..." onChange={handleChange}/>
                <input id="password" name="password" type="password" className="emp--input" required placeholder="Input password..." onChange={handleChange}/>
                <button className="btn--emp--add" onClick={handleClick}>ADD</button>
              </form>
              </div>
            </Popup>
          </div>
          {/* EMD POPUP */}

          {/* ADD NEW EMP / STAFF */}
          <button className="btn--add" onClick={() => setOpen(true)}>ADD EMPLOYEE?</button>

          <table className="emp--table" style={{textAlign: "center"}}>
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
              {staff.map(emp => (
                <tr key={emp.userID}>
                  <td>{emp.userID}</td>
                  <td>{emp.username}</td>
                  <td>{emp.password}</td>
                  <td>{emp.role}</td>
                  <td style={{color: emp.status === "active" ? "green" : "red"}}>{emp.status}</td>
                  <td className="col--operations">
                    <button className="btn-archive" onClick={notifySuccess} 
                    >{emp.status === "archive" ? "UNARCHIVE" : "ARCHIVE"}
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
  )
};
