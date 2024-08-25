import "./Receipt.css";

const Receipt = ({ invoiceNumber, items, total, payment, change, discount }) => {
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
        <div className="address">Santa Cruz Dalahican, <br /> Cavite City</div>
        <p style={{ textAlign: "center", marginBottom: "10px" }}>{currentDate}</p>
        <p style={{fontSize: "12px", margin: "30px 0", fontWeight: "600"}} >Transaction ID:{invoiceNumber}</p>
      </div>
      <table className="invoice-items">
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="bup-items">{item.name} (x{item.quantity})</td>
              <td className="alignright bup-price">₱{item.price.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="total">
            <td className="alignright cells">
              <div className="bup infos">Subtotal:</div>
              <div className="bup infos change">Discount:</div>
              <div className="bup infos"  style={{ fontSize: "20px", fontWeight: "bold" }}>Final Total:</div>
              <div className="bup infos payment">Payment:</div>
              <div className="bup infos change">Change:</div>
          
            </td>
            <td className="alignright cells">
              <div className="bup total">₱{total.toFixed(2)}</div>
              <div className="bup">₱{discount ? discountAmount.toFixed(2) : (0).toFixed(2)}</div>
              <div className="bup total">₱{finalTotal.toFixed(2)}</div>
              <div className="bup">₱{parseFloat(payment).toFixed(2)}</div>
              <div className="bup">₱{parseFloat(change).toFixed(2)}</div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="footer">
        <div style={{ marginBottom: "12px", fontSize: "14px" }}>Thank you and Come again!</div>
        <div>*** OFFICIAL RECEIPT ***</div>
      </div>
    </div>
  );
};

export default Receipt;
