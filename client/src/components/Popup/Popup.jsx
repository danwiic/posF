import './Popup.css'


export default function Popup(props) {
  return (props.trigger) ? (
    <div className="popop">
      <div className="popup-inner">
        <button className="btn-close" onClick={() => props.setTrigger(false)}>X</button>
        {props.children}
      </div>
    </div>
  ) : ""
};
