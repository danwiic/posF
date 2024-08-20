import { ImSad } from "react-icons/im";
import "./styles/Forbidden.css"
import { Link } from "react-router-dom";


export default function Forbidden() {
  return(
    
    <div className="forbidden--container" style={{color: 'grey'}}>
      <div className="forbidden--content">
        <ImSad style={{fontSize: '100px'}}/>
        <div style={{fontSize: "50px"}}><strong>404</strong></div>
        <div style={{marginTop:"20px", fontSize: "20px"}}>Page not found!</div>
        <div style={{marginTop: "40px", marginBottom: "10px"}}>The page you are looking for doesn&apos;t exist.</div>
        <Link to="/">LOGIN HERE</Link>
      </div>  
    </div>
  )
};
