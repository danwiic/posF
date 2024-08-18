import Navbar from './Navbar';
import './Layout.css';

export default function Layout({ children }) {
  return (
    <div className="layout-container">
        <Navbar/>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
