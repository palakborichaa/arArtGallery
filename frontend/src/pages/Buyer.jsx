import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SharedHeader from '@/components/ui/sharedHeader';
import '../css/sharedHeader.css';
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

  const loadArtworks = () => {
    setLoading(true);
    setError('');
    const url = `${API_BASE}/artworks`.replace(/\/+/, '/') || '/artworks';
    fetch(url, { credentials: 'include' })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || `Failed to load artworks (${res.status})`);
        try { return text ? JSON.parse(text) : []; }
        catch { throw new Error('Invalid response from server'); }
      })
      .then((data) => {
        const clean = Array.isArray(data) ? data.filter((a) => !a.is_sold) : [];
        setArtworks(clean);
        setFilteredArtworks(clean);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load artworks');
        setLoading(false);
      });
  };

  useEffect(() => { loadArtworks(); }, []);

  useEffect(() => {
    let filtered = [...artworks];
    if (searchTerm) {
      filtered = filtered.filter((a) =>
        a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.artist?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter) filtered = filtered.filter((a) => a.artwork_type === typeFilter);
    if (priceFilter === 'low')    filtered = filtered.filter((a) => a.price != null && a.price < 500);
    if (priceFilter === 'medium') filtered = filtered.filter((a) => a.price != null && a.price >= 500 && a.price < 2000);
    if (priceFilter === 'high')   filtered = filtered.filter((a) => a.price != null && a.price >= 2000);
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':       return (a.name || '').localeCompare(b.name || '');
        case 'price-low':  return (a.price || 0) - (b.price || 0);
        case 'price-high': return (b.price || 0) - (a.price || 0);
        case 'artist':     return (a.artist || '').localeCompare(b.artist || '');
        default:           return 0;
      }
    });
    setFilteredArtworks(filtered);
    setCurrentPage(1);
  }, [artworks, searchTerm, typeFilter, priceFilter, sortBy]);

  const uniqueTypes = [...new Set(artworks.map((a) => a.artwork_type).filter(Boolean))];

  const handleViewAR = (artworkId) => {
    window.open(
      `${API_BASE}/ar-viewer?id=${artworkId}`,
      '_blank',
      'width=400,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=no'
    );
  };

  const addToCart = (artwork) => {
    const existing = cart.find((item) => item.id === artwork.id);
    if (existing) {
      setCart(cart.map((item) => item.id === artwork.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...artwork, quantity: 1 }]);
    }
    setAddedItem(artwork);
    setShowConfirmation(true);
    setTimeout(() => { setShowConfirmation(false); setAddedItem(null); }, 3000);
  };

  const removeFromCart = (artworkId) => setCart(cart.filter((item) => item.id !== artworkId));

  const updateQuantity = (artworkId, newQuantity) => {
    if (newQuantity <= 0) removeFromCart(artworkId);
    else setCart(cart.map((item) => item.id === artworkId ? { ...item, quantity: newQuantity } : item));
  };

  const getTotalPrice = () => cart.reduce((t, item) => t + (item.price || 0) * item.quantity, 0);
  const getTotalItems = () => cart.reduce((t, item) => t + item.quantity, 0);

  const totalPages = Math.ceil(filteredArtworks.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArtworks = filteredArtworks.slice(startIndex, startIndex + itemsPerPage);
  const imgUrl = (id) => `${API_BASE}/artwork/${id}/image`;

  const handleCheckout = async () => {
    try {
      if (cart.length === 0) { alert('Cart is empty!'); return; }
      const artwork = cart[0];
      if (!artwork.price) { alert('This artwork has no price, cannot checkout.'); return; }

      const res = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ artwork_id: artwork.id }),
      });
      const orderData = await res.json().catch(() => ({}));
      if (!res.ok || !orderData.success) { alert(orderData.error || 'Failed to create order'); return; }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ArtVerse',
        description: `Payment for ${artwork.name}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                artwork_id: artwork.id,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyData.success) {
              alert(verifyData.error || 'Payment verification failed');
              return;
            }
            alert('✅ Payment successful! Artwork marked as SOLD.');
            setCart((prev) => prev.filter((i) => i.id !== artwork.id));
            setShowCart(false);
            loadArtworks();
          } catch (err) {
            console.error(err);
            alert('Payment succeeded but verification failed.');
          }
        },
        theme: { color: '#d3b56a' },
      };

      if (!window.Razorpay) { alert('Razorpay SDK not loaded. Please refresh the page.'); return; }
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="buyer-page">

      <SharedHeader
        page="buyer"
        cartCount={getTotalItems()}
        onCartClick={() => setShowCart(true)}
        onSearch={setSearchTerm}
        searchValue={searchTerm}
      />

      <div className="buyer-body">

        <div className="buyer-title-row">
          <h1>Marketplace</h1>
          <span className="buyer-count">
            {!loading && !error && `${filteredArtworks.length} artworks`}
          </span>
        </div>

        {!loading && !error && (
          <div className="filters">
            <div className="filter-row">
              <div className="filter-group">
                <label className="filter-label">Type</label>
                <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All Types</option>
                  {uniqueTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Price Range</label>
                <select className="filter-select" value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                  <option value="">All Prices</option>
                  <option value="low">Under $500</option>
                  <option value="medium">$500 – $2,000</option>
                  <option value="high">$2,000+</option>
                </select>
              </div>

              <div className="filter-actions">
                <div className="filter-group">
                  <label className="filter-label">Sort by</label>
                  <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="name">Name A–Z</option>
                    <option value="artist">Artist A–Z</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>

                <div className="view-toggle">
                  <button type="button" className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">⊞</button>
                  <button type="button" className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">☰</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && <div className="loading">✨ Loading artworks…</div>}
        {error   && <div className="error">❌ {error}</div>}

        {!loading && !error && filteredArtworks.length === 0 && (
          <div className="empty">
            {artworks.length === 0
              ? <p>🎨 No artworks yet — <Link to="/seller">be the first to upload</Link>!</p>
              : <p>🔍 No artworks match your filters</p>
            }
          </div>
        )}

        {!loading && !error && filteredArtworks.length > 0 && (
          <>
            <div className={viewMode === 'grid' ? 'buyer-grid' : 'buyer-list'}>
              {currentArtworks.map((artwork) => (
                <div key={artwork.id} className="buyer-card">
                  <img src={imgUrl(artwork.id)} alt={artwork.name} className="card-image" />
                  <div className="card-content">
                    <h3 className="card-title">{artwork.name}</h3>
                    <div className="card-meta">
                      <span className="card-artist">{artwork.artist || 'Unknown Artist'}</span>
                      {artwork.artwork_type && <span className="card-type">{artwork.artwork_type}</span>}
                    </div>
                    <div className="card-price">
                      {artwork.price ? `$${artwork.price.toFixed(2)}` : 'Price on request'}
                    </div>
                    <div className="card-actions">
                      <Link className="btn" to={`/artwork/${artwork.id}`}>Details</Link>
                      <button type="button" className="btn" onClick={() => handleViewAR(artwork.id)}>🥽 AR</button>
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
                <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>← Previous</button>
                <div className="page-info">Page {currentPage} of {totalPages}</div>
                <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
              </div>
            )}

            <div className="stats">Showing {filteredArtworks.length} of {artworks.length} artworks</div>
          </>
        )}
      </div>

      {/* ── Cart Modal ── */}
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
                      <button type="button" className="btn btn-primary" onClick={handleCheckout}>Proceed to Checkout</button>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.6 }}>
                      ⚠️ Checkout works for 1 artwork at a time.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmation Toast ── */}
      {showConfirmation && addedItem && (
        <div className="confirmation-popup">
          <div className="tick-container"><div className="tick-mark" /></div>
          <div className="confirmation-text">
            <span className="confirmation-item">&quot;{addedItem.name}&quot;</span> added to cart!
          </div>
        </div>
      )}
    </div>
  );
}