import Layout from '../components/Navbar/Layout';
import { ToastContainer } from 'react-toastify';
import admins from "../../JSON FILES/admin.json"
import { useState } from 'react';
import Popup from '../components/Popup/Popup';
import "./styles/Users.css"

export default function Users() {

  const [user] = useState(admins)
  const [open, setOpen] = useState(false)

  return(
    <div className="admin-layout">
      <ToastContainer/>

      <Layout>
        <div className="admin--container">

           {/* ADMIN POPUP */}
           <div className="admin--popup">
            <Popup trigger={open} setTrigger={setOpen}>
              <h3>Add New Admin</h3>
              <form className="admin--form">
                <input name="username" type="text" className="admin--input" required placeholder="Input username..." />
                <input name="password" type="password" className="admin--input" required placeholder="Input password..."/>
                <input name="role" type="text" className="admin--input" required value={"admin"}/>
                <button className='btn--admin--add'>ADD ADMIN</button>
              </form>
            </Popup>
          </div>
          {/* END POPUP */}

          
         
          <button className="btn--add" onClick={() => setOpen(true)}>ADD ADMIN?</button>

          <table className="admin--table" style={{textAlign: "center"}}>
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
              {user.map(admin => (
                <tr key={admin.userID}>
                  <td>{admin.userID}</td>
                  <td>{admin.username}</td>
                  <td>{admin.password}</td>
                  <td>{admin.role}</td>
                  <td style={{color: admin.status === "active" ? "green" : "red"}}>{admin.status}</td>
                  <td className="col--operations">
                    <button className="btn-archive">{admin.status === "archive" ? "UNARCHIVE" : "ARCHIVE"}</button>
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
