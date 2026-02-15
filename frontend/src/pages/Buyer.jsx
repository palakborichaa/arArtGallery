import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/Buyer.css';

const API_BASE = '';

export default function Buyer() {
  const [artworks, setArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [addedItem, setAddedItem] = useState(null);

  useEffect(() => {
    const url = `${API_BASE}/artworks`.replace(/\/+/, '/') || '/artworks';
    fetch(url, { credentials: 'include' })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          throw new Error(text || `Failed to load artworks (${res.status})`);
        }
        try {
          return text ? JSON.parse(text) : [];
        } catch {
          throw new Error('Invalid response from server');
        }
      })
      .then((data) => {
        setArtworks(Array.isArray(data) ? data : []);
        setFilteredArtworks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load artworks');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...artworks];
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.artist?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter) filtered = filtered.filter((a) => a.artwork_type === typeFilter);
    if (priceFilter === 'low') filtered = filtered.filter((a) => a.price != null && a.price < 500);
    if (priceFilter === 'medium')
      filtered = filtered.filter((a) => a.price != null && a.price >= 500 && a.price < 2000);
    if (priceFilter === 'high') filtered = filtered.filter((a) => a.price != null && a.price >= 2000);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'artist':
          return (a.artist || '').localeCompare(b.artist || '');
        default:
          return 0;
      }
    });
    setFilteredArtworks(filtered);
    setCurrentPage(1);
  }, [artworks, searchTerm, typeFilter, priceFilter, sortBy]);

  const uniqueTypes = [...new Set(artworks.map((a) => a.artwork_type).filter(Boolean))];

  const handleViewAR = (artworkId) => {
    const arUrl = `${API_BASE}/ar-viewer?id=${artworkId}`;
    window.open(arUrl, '_blank', 'width=400,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=no');
  };

  const addToCart = (artwork) => {
    const existing = cart.find((item) => item.id === artwork.id);
    if (existing) {
      setCart(cart.map((item) => (item.id === artwork.id ? { ...item, quantity: item.quantity + 1 } : item)));
    } else {
      setCart([...cart, { ...artwork, quantity: 1 }]);
    }
    setAddedItem(artwork);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setAddedItem(null);
    }, 3000);
  };

  const removeFromCart = (artworkId) => setCart(cart.filter((item) => item.id !== artworkId));

  const updateQuantity = (artworkId, newQuantity) => {
    if (newQuantity <= 0) removeFromCart(artworkId);
    else setCart(cart.map((item) => (item.id === artworkId ? { ...item, quantity: newQuantity } : item)));
  };

  const getTotalPrice = () => cart.reduce((t, item) => t + (item.price || 0) * item.quantity, 0);
  const getTotalItems = () => cart.reduce((t, item) => t + item.quantity, 0);

  const totalPages = Math.ceil(filteredArtworks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArtworks = filteredArtworks.slice(startIndex, startIndex + itemsPerPage);

  const imgUrl = (id) => `${API_BASE}/artwork/${id}/image`;

  return (
    <>
      <header className="buyer-header">
        <nav className="buyer-nav">
          <div className="logo">ArtVerse</div>
          <div className="nav-links">
            <button type="button" className="cart-btn" onClick={() => setShowCart(true)}>
              🛒 Cart ({getTotalItems()})
            </button>
            <Link className="nav-link" to="/select-role">Switch Role</Link>
            <a className="nav-link" href={`${API_BASE}/logout`}>Logout</a>
          </div>
        </nav>
      </header>

      <div className="buyer-container">
        <div className="hero">
          <h1>Brushstrokes Made For You</h1>
          <p>See it in your space first, commit to it later.</p>
        </div>

        {!loading && !error && (
          <div className="filters">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Search</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Search by name or artist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <label className="filter-label">Type</label>
                <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  {uniqueTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">Price Range</label>
                <select className="filter-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                  <option value="">All Prices</option>
                  <option value="low">Under $500</option>
                  <option value="medium">$500 - $2000</option>
                  <option value="high">$2000+</option>
                </select>
              </div>
              <div className="filter-actions">
                <div className="filter-group">
                  <label className="filter-label">Sort by</label>
                  <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Name A-Z</option>
                    <option value="artist">Artist A-Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
                <div className="view-toggle">
                  <button
                    type="button"
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    ⊞
                  </button>
                  <button
                    type="button"
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading">✨ Loading amazing artworks...</div>
        )}
        {error && (
          <div className="error">❌ Error: {error}</div>
        )}
        {!loading && !error && filteredArtworks.length === 0 && (
          <div className="empty">
            {artworks.length === 0 ? (
              <div>
                <p>🎨 No artworks yet in our gallery</p>
                <p>Be the first to <Link className="nav-link" to="/seller">upload an artwork</Link>!</p>
              </div>
            ) : (
              <p>🔍 No artworks match your search criteria</p>
            )}
          </div>
        )}
        {!loading && !error && filteredArtworks.length > 0 && (
          <>
            <div className={viewMode === 'grid' ? 'buyer-grid' : 'buyer-list'}>
              {currentArtworks.map((artwork) => (
                <div key={artwork.id} className="buyer-card">
                  <img src={imgUrl(artwork.id)} alt={artwork.name} className="card-image" />
                  <div className="card-content">
                    {viewMode === 'list' && (
                      <div className="card-info">
                        <h3 className="card-title">{artwork.name}</h3>
                        <div className="card-meta">
                          <span className="card-artist">{artwork.artist || 'Unknown Artist'}</span>
                          {artwork.artwork_type && <span className="card-type">{artwork.artwork_type}</span>}
                        </div>
                        <div className="card-price">
                          {artwork.price ? `$${artwork.price.toFixed(2)}` : 'Price on request'}
                        </div>
                      </div>
                    )}
                    {viewMode === 'grid' && (
                      <>
                        <h3 className="card-title">{artwork.name}</h3>
                        <div className="card-meta">
                          <span className="card-artist">{artwork.artist || 'Unknown Artist'}</span>
                          {artwork.artwork_type && <span className="card-type">{artwork.artwork_type}</span>}
                        </div>
                        <div className="card-price">
                          {artwork.price ? `$${artwork.price.toFixed(2)}` : 'Price on request'}
                        </div>
                      </>
                    )}
                    <div className="card-actions">
                      <Link className="btn" to={`/artwork/${artwork.id}`}>Details</Link>
                      <button type="button" className="btn" onClick={() => handleViewAR(artwork.id)}>
                        🥽 View in AR
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => addToCart(artwork)}
                        disabled={!artwork.price}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <div className="page-info">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}

            <div className="stats">
              Showing {filteredArtworks.length} of {artworks.length} artworks
            </div>
          </>
        )}
      </div>

      {showCart && (
        <div className="cart-modal">
          <div className="cart-overlay" onClick={() => setShowCart(false)} aria-hidden="true" />
          <div className="cart-content">
            <div className="cart-header">
              <h2>🛒 Shopping Cart</h2>
              <button type="button" className="close-btn" onClick={() => setShowCart(false)}>✕</button>
            </div>
            <div className="cart-body">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <p>Your cart is empty</p>
                  <button type="button" className="btn" onClick={() => setShowCart(false)}>Continue Shopping</button>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.map((item) => (
                      <div key={item.id} className="cart-item">
                        <img src={imgUrl(item.id)} alt={item.name} className="cart-item-image" />
                        <div className="cart-item-details">
                          <h4>{item.name}</h4>
                          <p className="cart-item-artist">{item.artist || 'Unknown Artist'}</p>
                          <p className="cart-item-price">${(item.price || 0).toFixed(2)}</p>
                        </div>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                            <span className="quantity">{item.quantity}</span>
                            <button type="button" className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                          </div>
                          <button type="button" className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cart-summary">
                    <div className="total"><strong>Total: ${getTotalPrice().toFixed(2)}</strong></div>
                    <div className="cart-actions">
                      <button type="button" className="btn btn-secondary" onClick={() => setCart([])}>Clear Cart</button>
                      <button type="button" className="btn btn-primary" onClick={() => alert('Checkout functionality coming soon!')}>Proceed to Checkout</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmation && addedItem && (
        <div className="confirmation-popup">
          <div className="tick-container"><div className="tick-mark" /></div>
          <div className="confirmation-text">
            <span className="confirmation-item">&quot;{addedItem.name}&quot;</span> has been added to your cart!
          </div>
        </div>
      )}
    </>
  );
}
