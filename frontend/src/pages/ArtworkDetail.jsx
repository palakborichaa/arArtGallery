import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/ArtworkDetail.css';

const API_BASE = '';

export default function ArtworkDetail() {
  const { id } = useParams();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('Invalid artwork ID');
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/artwork/${id}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Artwork not found');
        return res.json();
      })
      .then((data) => {
        setArtwork(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleViewAR = () => {
    if (artwork) {
      const arUrl = `${API_BASE}/ar-viewer?id=${artwork.id}`;
      window.open(arUrl, '_blank', 'width=400,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=no');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <>
        <header className="detail-header">
          <nav className="detail-nav">
            <div className="logo">🎨 ArtVerse</div>
            <Link className="nav-link" to="/buyer">← Back to Gallery</Link>
          </nav>
        </header>
        <div className="detail-container">
          <div className="loading">✨ Loading artwork details...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="detail-header">
          <nav className="detail-nav">
            <div className="logo">🎨 ArtVerse</div>
            <Link className="nav-link" to="/buyer">← Back to Gallery</Link>
          </nav>
        </header>
        <div className="detail-container">
          <div className="error">❌ Error: {error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="detail-header">
        <nav className="detail-nav">
          <div className="logo">🎨 ArtVerse</div>
          <div>
            <Link className="nav-link" to="/buyer">← Back to Gallery</Link>
            <a className="nav-link" href={`${API_BASE}/logout`}>Logout</a>
          </div>
        </nav>
      </header>

      <div className="detail-container">
        <Link to="/buyer" className="back-link">
          ← Back to Gallery
        </Link>

        <div className="artwork-detail">
          <div className="artwork-grid">
            <div className="artwork-image-container">
              <img
                src={`${API_BASE}/artwork/${artwork.id}/image`}
                alt={artwork.name}
                className="artwork-image"
              />
            </div>
            <div className="artwork-info">
              <h1 className="artwork-title">{artwork.name}</h1>
              <div className="artwork-artist">by {artwork.artist || 'Unknown Artist'}</div>
              <div className="artwork-price">
                {artwork.price ? `$${Number(artwork.price).toFixed(2)}` : 'Price on request'}
              </div>

              <div className="artwork-details">
                {artwork.artwork_type && (
                  <div className="detail-item">
                    <div className="detail-label">Type</div>
                    <div className="detail-value">{artwork.artwork_type}</div>
                  </div>
                )}
                {artwork.year_created && (
                  <div className="detail-item">
                    <div className="detail-label">Year</div>
                    <div className="detail-value">{artwork.year_created}</div>
                  </div>
                )}
                {artwork.dimensions && (
                  <div className="detail-item">
                    <div className="detail-label">Dimensions</div>
                    <div className="detail-value">{artwork.dimensions}</div>
                  </div>
                )}
                {artwork.medium && (
                  <div className="detail-item">
                    <div className="detail-label">Medium</div>
                    <div className="detail-value">{artwork.medium}</div>
                  </div>
                )}
                {artwork.style && (
                  <div className="detail-item">
                    <div className="detail-label">Style</div>
                    <div className="detail-value">{artwork.style}</div>
                  </div>
                )}
                <div className="detail-item">
                  <div className="detail-label">Added</div>
                  <div className="detail-value">{formatDate(artwork.created_at)}</div>
                </div>
              </div>

              {artwork.description && (
                <div className="artwork-description">
                  <div className="description-title">Description</div>
                  <div className="description-text">{artwork.description}</div>
                </div>
              )}

              <div className="artwork-actions">
                <button type="button" className="btn" onClick={handleViewAR}>
                  🥽 Experience in AR
                </button>
                <a href={`${API_BASE}/artwork/${artwork.id}/glb`} className="btn btn-secondary" download>
                  📥 Download 3D Model
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
