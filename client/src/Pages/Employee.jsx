import { useEffect, useState } from "react"
import Layout from "../components/Navbar/Layout"
import axios from 'axios'
import "./styles/Employee.css"
import Popup from '../components/Popup/Popup';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from "react-toastify";


export default function Employee() {
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
    <div>
      <ToastContainer/>

      <Layout className="emp-layout">
        <div className="emp--container">

           {/* EMP POPUP */}
           <div className="emp--popup">
            <Popup trigger={open} setTrigger={setOpen}>
              <h3>Add New Employee</h3>
              <form className="emp--form">
                <input id="username" name="username" type="text" className="emp--input" required placeholder="Input username..." onChange={handleChange}/>
                <input id="password" name="password" type="password" className="emp--input" required placeholder="Input password..." onChange={handleChange}/>
                <button className="btn--emp--add" onClick={handleClick}>ADD EMPLOYEE</button>
              </form>
            </Popup>
          </div>
          {/* EMD POPUP */}

          <h1 className="emp--header">EMPLOYEES</h1>
         
          <button className="btn--add" onClick={() => setOpen(true)}>ADD EMPLOYEE?</button>

          <table className="emp--table">
            <thead>
              <tr>
                <th>userID</th>
                <th>username</th>
                <th>password</th>
                <th>role</th>
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
                  <td style={{color: emp.status === "active" ? "green" : "red"}}>{emp.status}</td>
                  <td className="col--operations">
                    <button className="btn-archive" onClick={notifySuccess}>ARCHIVE</button>
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
