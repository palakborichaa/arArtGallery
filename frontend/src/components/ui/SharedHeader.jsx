// src/components/SharedHeader.jsx
// Drop-in shared header for Buyer, Seller, ArtworkDetail pages

import { Link } from 'react-router-dom';

/**
 * Props:
 *  - page: 'buyer' | 'seller' | 'detail'   → highlights active nav link
 *  - cartCount: number (optional)           → shows cart button if provided
 *  - onCartClick: fn (optional)             → cart button handler
 *  - onSearch: fn (optional)               → search input handler
 *  - searchValue: string (optional)
 *  - logoutHref: string (default '/logout')
 */
export default function SharedHeader({
  page = '',
  cartCount,
  onCartClick,
  onSearch,
  searchValue = '',
  logoutHref = '/logout',
}) {
  const showCart = typeof cartCount === 'number';

  return (
    <header>
      {/* ── Announcement Bar ───────────────────────────── */}
      <div className="av-announce">
        Free AR preview on every artwork — See it in your space before you buy
      </div>

      {/* ── Top Bar ────────────────────────────────────── */}
      <div className="av-topbar">
        <div className="av-topbar-inner">
          <Link to="/" className="av-logo">ArtVerse</Link>

          {/* Search — only shown on buyer/gallery pages */}
          {onSearch && (
            <div className="av-search">
              <span className="av-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search artworks, artists…"
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          )}

          <div className="av-topbar-actions">
            {showCart && (
              <>
                <button type="button" className="av-cart-btn" onClick={onCartClick}>
                  🛒 Cart ({cartCount})
                </button>
                <div className="av-divider" />
              </>
            )}
            <Link to="/select-role" className="av-action-btn">Switch Role</Link>
            <a href={logoutHref} className="av-action-btn">Logout</a>
          </div>
        </div>
      </div>

      {/* ── Nav Bar ─────────────────────────────────────── */}
      <nav className="av-navbar">
        <div className="av-navbar-inner">
          <Link to="/" className={`av-nav-link ${page === 'gallery' ? 'active' : ''}`}>
            Gallery
          </Link>
          <Link to="/buyer" className={`av-nav-link ${page === 'buyer' ? 'active' : ''}`}>
            Marketplace
          </Link>
          <Link to="/seller" className={`av-nav-link ${page === 'seller' ? 'active' : ''}`}>
            Seller Dashboard
          </Link>
          <Link to="/select-role" className="av-nav-link">Switch Role</Link>
        </div>
      </nav>
    </header>
  );
}