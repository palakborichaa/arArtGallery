import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import '../css/ARViewer.css';

const API_BASE = '';

function isARSupported() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);
  if (isIOS) {
    const versionMatch = navigator.userAgent.match(/OS ([0-9]+)_/);
    if (versionMatch) return parseInt(versionMatch[1], 10) >= 12;
  }
  if (isAndroid && /Chrome/.test(navigator.userAgent)) {
    const match = navigator.userAgent.match(/Chrome\/([0-9]+)/);
    if (match) return parseInt(match[1], 10) >= 79;
  }
  return isAndroid || isIOS;
}

export default function ARViewer() {
  const [searchParams] = useSearchParams();
  const artworkId = searchParams.get('id');
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ msg: '', type: '' });
  const [arReady, setArReady] = useState(false);
  const viewerRef = useRef(null);
  const arButtonRef = useRef(null);

  const showStatus = (message, type = 'info') => {
    setStatus({ msg: message, type });
    if (type !== 'error') {
      setTimeout(() => setStatus({ msg: '', type: '' }), 5000);
    }
  };

  useEffect(() => {
    if (!artworkId) {
      setError('No artwork ID provided');
      setLoading(false);
      return;
    }

    let cancelled = false;

    fetch(`${API_BASE}/api/artwork/${artworkId}`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Artwork not found');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setArtwork(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [artworkId]);

  useEffect(() => {
    if (!artwork || !viewerRef.current) return;

    const viewer = viewerRef.current;
    const glbUrl = `${API_BASE}/artwork/${artwork.id}/glb`;
    viewer.src = glbUrl;

    const onLoad = () => {
      setArReady(true);
      showStatus('3D model loaded successfully!', 'success');
    };
    const onError = () => {
      showStatus('Failed to load 3D model', 'error');
    };

    viewer.addEventListener('load', onLoad);
    viewer.addEventListener('error', onError);
    return () => {
      viewer.removeEventListener('load', onLoad);
      viewer.removeEventListener('error', onError);
    };
  }, [artwork]);

  const handleARClick = async () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    try {
      showStatus('Launching AR...', 'info');
      if (navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((t) => t.stop());
        } catch {
          showStatus('Camera access required for AR', 'error');
          return;
        }
      }
      viewer.activateAR();
    } catch (err) {
      showStatus('Failed to launch AR: ' + err.message, 'error');
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (loading) {
    return (
      <div className="ar-viewer-page">
        <header className="ar-header">
          <div className="logo">🎨 ArtVerse AR</div>
          <button type="button" className="close-btn" onClick={() => window.close()}>✕ Close</button>
        </header>
        <div className="loading">✨ Loading AR experience...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ar-viewer-page">
        <header className="ar-header">
          <div className="logo">🎨 ArtVerse AR</div>
          <button type="button" className="close-btn" onClick={() => window.close()}>✕ Close</button>
        </header>
        <div className="error">
          <p>❌ Failed to load artwork</p>
          <button type="button" onClick={() => window.close()} className="back-btn">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ar-viewer-page">
      <header className="ar-header">
        <div className="logo">🎨 ArtVerse AR</div>
        <button type="button" className="close-btn" onClick={() => window.close()}>✕ Close</button>
      </header>

      <div className="ar-container">
        <div className="artwork-info">
          <div className="artwork-title">{artwork.name}</div>
          <div className="artwork-artist">{artwork.artist ? `by ${artwork.artist}` : ''}</div>
          <div className="artwork-price">{artwork.price ? `$${Number(artwork.price).toFixed(2)}` : ''}</div>
        </div>

        <div className="viewer-container">
          <model-viewer
            ref={viewerRef}
            ar
            ar-modes="webxr scene-viewer quick-look"
            ar-scale="auto"
            camera-controls
            shadow-intensity="1"
            exposure="1"
            auto-rotate
            poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666'%3ELoading 3D...%3C/text%3E%3C/svg%3E"
          />
          <div className="controls">
            {status.msg && <div className={`status ${status.type}`}>{status.msg}</div>}
            <button
              ref={arButtonRef}
              type="button"
              className="ar-button"
              disabled={!arReady}
              onClick={handleARClick}
            >
              {arReady ? '🥽 Launch AR Experience' : '🥽 Launch AR Experience'}
            </button>
            <div className="instructions">
              {isMobile && isARSupported()
                ? '📱 Tap the AR button to view this artwork in your space!'
                : isMobile
                  ? '📱 AR may not be supported on your device'
                  : '📱 For best AR experience, open this on a mobile device'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
