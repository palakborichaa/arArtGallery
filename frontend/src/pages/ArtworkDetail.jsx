import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import SharedHeader from '@/components/ui/SharedHeader';
import '../css/ArtworkDetail.css';

const API_BASE = '';

function AccordionItem({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion-item ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="accordion-trigger"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{title}</span>
        <span className="accordion-icon">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

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
      .then((data) => { setArtwork(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  const handleViewAR = () => {
    if (artwork) {
      window.open(
        `${API_BASE}/ar-viewer?id=${artwork.id}`,
        '_blank',
        'width=400,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=no'
      );
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  if (loading) return (
    <>
      <SharedHeader page="detail" />
      <div className="detail-body"><div className="detail-state">✨ Loading artwork…</div></div>
    </>
  );

  if (error) return (
    <>
      <SharedHeader page="detail" />
      <div className="detail-body"><div className="detail-state error">❌ {error}</div></div>
    </>
  );

  return (
    <>
      <SharedHeader page="detail" />

      <div className="detail-body">
        <Link to="/buyer" className="back-link">← Back to Marketplace</Link>

        <div className="detail-layout">

          {/* ── Left: Image ── */}
          <div className="detail-image-col">
            <div className="detail-image-wrap">
              <img
                src={`${API_BASE}/artwork/${artwork.id}/image`}
                alt={artwork.name}
                className="detail-image"
              />
              {artwork.is_sold && (
                <div className="detail-sold-overlay">
                  <span className="detail-sold-stamp">SOLD</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Info ── */}
          <div className="detail-info-col">

            {/* Title & Artist */}
            <h1 className="detail-title">{artwork.name}</h1>
            <div className="detail-artist">
              by <span>{artwork.artist || 'Unknown Artist'}</span>
            </div>

            <div className="detail-divider" />

            {/* Metadata Strip */}
            <div className="detail-meta-strip">
              {artwork.dimensions && (
                <div className="detail-meta-cell">
                  <div className="detail-meta-label">Size</div>
                  <div className="detail-meta-value">{artwork.dimensions}</div>
                </div>
              )}
              {artwork.medium && (
                <div className="detail-meta-cell">
                  <div className="detail-meta-label">Medium</div>
                  <div className="detail-meta-value" style={{ textTransform: 'capitalize' }}>{artwork.medium}</div>
                </div>
              )}
              {artwork.artwork_type && (
                <div className="detail-meta-cell">
                  <div className="detail-meta-label">Type</div>
                  <div className="detail-meta-value" style={{ textTransform: 'capitalize' }}>{artwork.artwork_type}</div>
                </div>
              )}
              {artwork.year_created && (
                <div className="detail-meta-cell">
                  <div className="detail-meta-label">Year</div>
                  <div className="detail-meta-value">{artwork.year_created}</div>
                </div>
              )}
              {artwork.style && (
                <div className="detail-meta-cell">
                  <div className="detail-meta-label">Style</div>
                  <div className="detail-meta-value" style={{ textTransform: 'capitalize' }}>{artwork.style}</div>
                </div>
              )}
            </div>

            <div className="detail-divider" />

            {/* Price & Buy */}
            <div className="detail-price-row">
              <div className="detail-price">
                {artwork.price
                  ? `$${Number(artwork.price).toFixed(2)}`
                  : 'Price on request'}
              </div>
              <button
                type="button"
                className="detail-buy-btn"
                disabled={artwork.is_sold || !artwork.price}
                onClick={handleViewAR}
              >
                {artwork.is_sold ? 'Sold' : '🥽 View in AR'}
              </button>
            </div>

            {!artwork.is_sold && artwork.price && (
              <div className="detail-delivery">Delivered within 5–7 business days</div>
            )}

            {/* Accordions */}
            <div className="detail-accordions">
              {artwork.description && (
                <AccordionItem title="About this Artwork">
                  <p>{artwork.description}</p>
                </AccordionItem>
              )}

              <AccordionItem title="View in AR">
                <p>
                  Use our AR viewer to place this artwork in your space before purchasing.
                  Click the button below to open the AR experience.
                </p>
                <button type="button" className="accordion-action-btn" onClick={handleViewAR}>
                  🥽 Launch AR Viewer
                </button>
              </AccordionItem>

              <AccordionItem title="Download 3D Model">
                <p>Download the 3D GLB file for this artwork to use in your own AR/3D projects.</p>
                <a
                  href={`${API_BASE}/artwork/${artwork.id}/glb`}
                  className="accordion-action-btn"
                  download
                >
                  📥 Download .glb
                </a>
              </AccordionItem>

              <AccordionItem title="Artwork Details">
                <div className="accordion-details-grid">
                  {artwork.dimensions && <><span>Size</span><span>{artwork.dimensions}</span></>}
                  {artwork.medium    && <><span>Medium</span><span style={{ textTransform:'capitalize' }}>{artwork.medium}</span></>}
                  {artwork.style     && <><span>Style</span><span style={{ textTransform:'capitalize' }}>{artwork.style}</span></>}
                  {artwork.year_created && <><span>Year</span><span>{artwork.year_created}</span></>}
                  {artwork.created_at   && <><span>Listed</span><span>{formatDate(artwork.created_at)}</span></>}
                </div>
              </AccordionItem>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}