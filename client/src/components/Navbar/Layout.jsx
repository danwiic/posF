import Navbar from './Navbar';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout-container">
        <Navbar className="malupiton"/>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
