import { useEffect, useState } from "react"
import Layout from "../components/Navbar/Layout"
import axios from 'axios'
import "./styles/Employee.css"


export default function Employee() {

  const [employee, setEmployee] = useState([])

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("http://localhost:8800/employee");
        console.log("Response:", res);
        setEmployee(res.data); // Assuming the response data is the employee list
      } catch (err) {
        console.log("Error:", err);
      }
    };
    fetchEmployees();
  }, [employee]);



  return(
    <div>
      <Layout>
        <div className="emp--container">
          <h1 className="emp--header">EMPLOYEES</h1>
      
          <button className="btn--add">ADD EMPLOYEE?</button>

          <table className="emp--table">
            <thead>
              <tr>
                <th>userID</th>
                <th>username</th>
                <th>password</th>
                <th>role</th>
                <th>Status</th>
                <th>Operation</th>
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
                    <button className="btn-archive">ARCHIVE</button>
                    <button className="btn-update">UPDATE</button>
                    <button className="btn-delete">DELETE</button>
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
