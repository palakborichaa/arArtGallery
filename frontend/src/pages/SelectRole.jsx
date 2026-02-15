import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import '../css/SelectRole.css';

export default function SelectRole() {
  const { logout } = useAuth();

  return (
    <div className="select-role-container">
      <div className="topbar">
        <div className="brand">Art Marketplace</div>
        <button type="button" className="link logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="select-role-card">
        <h2>Choose how you want to continue</h2>
        <div className="roles">
          <div className="role">
            <div className="icon buyer">🖼️</div>
            <h3>Buyer</h3>
            <p>
              Explore curated artworks and collect what you love. Immerse yourself in a world of
              creativity and inspiration.
            </p>
            <Link className="btn" to="/buyer">
              Continue as Buyer →
            </Link>
          </div>
          <div className="role">
            <div className="icon seller">📤</div>
            <h3>Seller</h3>
            <p>
              Showcase your pieces, reach art enthusiasts, and manage your listings effortlessly.
            </p>
            <Link className="btn" to="/seller">
              Continue as Seller →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
