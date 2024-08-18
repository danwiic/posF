import { useState } from 'react';
import Layout from '../components/Navbar/Layout';
import Popup from '../components/Popup/Popup';
import "./styles/Dashboard.css"
Popup

export default function Dashboard() {

  const [open, setOpen] = useState(false)

  

  return(
    <div className='dash--body'>
      <Layout>

      {/* POP UP COMPONENT ===================================> */}
    <div className="dash--popup">
      <Popup trigger={open} setTrigger={setOpen} className="bg-dash">
      <h1 style={{marginBottom: "15px", textAlign: "center"}}>ITEMS ORDERED</h1>
      <table className='order--table'>
      <thead>
        <tr>
          <th>OrderID</th>
          <th>Item Name</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>00001</td>
          <td>Pasta</td>
          <td>1</td>
          <td>₱150</td>
        </tr>
        <tr>
          <td>00001</td>
          <td>Juice</td>
          <td>1</td>
          <td>₱30</td>
        </tr>
        <tr>
          <td>00001</td>
          <td>Boba</td>
          <td>1</td>
          <td>₱80</td>
        </tr>
      </tbody>
    </table>
      </Popup>
    </div>
    {/* POP UP COMPONENT <===================================>*/}




        <div className="cards--container ">
          <div className="cards">

            <div className="card--total today--total">
              <div className='sales--header'>TODAY SALES</div>
              <span className='dash--sales'>₱2,450</span>
            </div>

            <div className="card--total weekly--total">
              <div className='sales--header'>WEEKLY SALES</div>
              <span className='dash--sales'>₱8,360</span>
            </div>
            
            <div className="card--total monthly--total">
              <div className='sales--header'>MONTHLY SALES</div>
              <span className='dash--sales '>₱23,980</span>
            </div>

            <div className="card--total overall--total">
              <div className='sales--header'>TOTAL SALES</div>
              <span className='dash--sales'>₱45,300</span>
            </div>

          </div>
        </div>

      

      {/* ORDER HISTORY */}
        <div className="order--history">
  <h3 className='order--head'>Order History</h3>

  <div className="order--container">
    <table className='order--table'>
      <thead>
        <tr>
          <th>OrderID</th>
          <th>Items Ordered</th>
          <th>Order Date</th>
          <th>Total Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>00001</td>
          <td>
            <button className='view--orders' onClick={() => setOpen(true)}>SEE LIST</button>
          </td>
          <td>08-15-2024</td>
          <td>₱260</td>
        </tr>
        <tr>
          <td>00002</td>
          <td><button className='view--orders' onClick={() => setOpen(true)}>SEE LIST</button></td>
          <td>08-15-2024</td>
          <td>₱260</td>
        </tr>
        <tr>
          <td>00003</td>
          <td><button className='view--orders' onClick={() => setOpen(true)}>SEE LIST</button></td>
          <td>08-15-2024</td>
          <td>₱260</td>
        </tr>
        <tr>
          <td>00004</td>
          <td><button className='view--orders' onClick={() => setOpen(true)}>SEE LIST</button></td>
          <td>08-15-2024</td>
          <td>₱260</td>
        </tr>
        <tr>
          <td>00005</td>
          <td><button className='view--orders' onClick={() => setOpen(true)}>SEE LIST</button></td>
          <td>08-15-2024</td>
          <td>₱260</td>
        </tr>
        <tr>
          <td>00006</td>
          <td><button className='view--orders' onClick={() => setOpen(true)}>SEE LIST</button></td>
          <td>08-15-2024</td>
          <td>₱260</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>


      </Layout>
    </div>
  )
};
