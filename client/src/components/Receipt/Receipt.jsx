import "./Receipt.css";

const Receipt = ({ cashierName, invoiceNumber, items, total, payment, change }) => {
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = `${month}/${date}/${year}`;

  return (
    <div className="receipt--container">
      <h2 className="title">
        <img src="bb.svg" alt="Big Brew Logo" />
      </h2>
      <h1 className="title">Big Brew</h1>
      <div className="invoice-details">
        <div className="address">Santa Cruz Dalahican, <br /> Cavite City</div>
        <p style={{ textAlign: "center", marginBottom: "10px" }}>Cashier: {cashierName}</p>
        <p style={{ textAlign: "center", marginBottom: "10px" }}>{currentDate}</p>
        <p>Transaction ID: {invoiceNumber}</p>
      </div>
      <table className="invoice-items">
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td className="bup">{item.name} (x{item.quantity})</td>
              <td className="alignright">₱{item.price.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="total">
            <td className="alignright grra">
              <div className="bup" style={{ fontSize: "22px", fontWeight: "bold" }}>Total:</div>
              <div className="bup">Payment:</div>
              <div className="bup">Change:</div>
            </td>
            <td className="alignright grra">
              <div className="bup">₱{total.toFixed(2)}</div>
              <div className="bup">₱{payment.toFixed(2)}</div>
              <div className="bup">₱{change.toFixed(2)}</div>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="footer">
        <div style={{ marginBottom: "12px" }}>Thank you and Come again!</div>
        <div>*** OFFICIAL RECEIPT ***</div>
      </div>
    </div>
  );
};

export default Receipt;
