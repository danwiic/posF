import React from 'react'; // Import React
import PropTypes from 'prop-types';
import "./Receipt.css";

const Receipt = ({ transactionID, paymentMethod, items, total, payment, change, discount }) => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = `${month}/${date}/${year}`;

  const discountAmount = total * (discount || 0);
  const finalTotal = total - discountAmount;

  return (
    <div className="receipt--container">
      <h2 className="title">
        <img src="bb.svg" alt="Big Brew Logo" />
      </h2>
      <h1 className="title--receipt">Big Brew</h1>
      <div className="invoice-details">
        <div className="address">
          Santa Cruz Dalahican, <br /> Cavite City
        </div>
        <p style={{ textAlign: "center", marginBottom: "10px" }}>{currentDate}</p>
        <p style={{ fontSize: "12px", margin: "10px 0", fontWeight: "600" }}>
          Transaction ID: {transactionID}
        </p>
        <p style={{ fontSize: "12px", margin: "10px 0", fontWeight: "600" }}>
          Payment Method: {paymentMethod}
        </p>
      </div>
      <table className="invoice-items">
        <tbody>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td className="bup-items">
                  {item.name} (x{item.quantity})
                </td>
                <td className="alignright bup-price">
                  ₱{item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              {item.addOns && item.addOns.length > 0 && item.addOns.map((addOn, addOnIndex) => (
                <tr key={`addon-${index}-${addOnIndex}`}>
                  <td className="bup-items">
                    &nbsp;&nbsp;• {addOn.name}
                  </td>
                  <td className="alignright bup-price">
                    ₱{addOn.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
          <tr className="total">
            <td className="alignright cells">
              <div className="bup infos">Subtotal:</div>
              {discount > 0 && <div className="bup infos change">Discount:</div>}
              <div className="bup infos" style={{ fontSize: "20px", fontWeight: "bold" }}>
                Final Total:
              </div>
              <div className="bup infos payment">Payment:</div>
              <div className="bup infos change">Change:</div>
            </td>
            <td className="alignright cells">
              <div className="bup total">₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              {discount > 0 && <div className="bup">₱{discountAmount.toFixed(2)}</div>}
              <div className="bup total">₱{finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="bup">₱{parseFloat(payment).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className="bup">₱{parseFloat(change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="footer">
        <div style={{ marginBottom: "12px", fontSize: "14px" }}>Thank you and Come again!</div>
      </div>
    </div>
  );
};


export default Receipt;
