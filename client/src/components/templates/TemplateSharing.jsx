import { useState, useCallback, useRef, useEffect } from 'react';

export default function TemplateSharing({ template, onClose }) {
  const [activeTab, setActiveTab] = useState('link');
  const [copied, setCopied] = useState(false);
  const [customDomain, setCustomDomain] = useState('');
  const linkInputRef = useRef(null);
  const embedInputRef = useRef(null);

  const baseUrl = customDomain || window.location.origin;

  const shareUrl = `${baseUrl}/editor/${template?.id}`;
  const previewUrl = `${baseUrl}/overlay/${template?.id}`;
  const embedCode = `<iframe src="${previewUrl}" width="1920" height="1080" frameborder="0" allowfullscreen style="max-width:100%"></iframe>`;
  const obsCode = `<browser-source>\n  <url>${previewUrl}</url>\n  <width>1920</width>\n  <height>1080</height>\n  <css>body { margin: 0; background: transparent; }</css>\n</browser-source>`;

  const socialLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this broadcast template: ${template?.name}`)}&url=${encodeURIComponent(shareUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(template?.name || 'Template')}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${template?.name}: ${shareUrl}`)}`
  };

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const downloadQR = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#000';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('QR Code', 100, 90);
    ctx.fillText(shareUrl, 100, 110);

    const link = document.createElement('a');
    link.download = `${template?.name || 'template'}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, [template, shareUrl]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!template) return null;

  return (
    <div className="tpl-share-overlay" onClick={onClose}>
      <div className="tpl-share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tpl-share-header">
          <h3>Share "{template.name}"</h3>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>✕</button>
        </div>

        <div className="tpl-share-tabs">
          <button
            className={`tpl-share-tab ${activeTab === 'link' ? 'active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            🔗 Link
          </button>
          <button
            className={`tpl-share-tab ${activeTab === 'embed' ? 'active' : ''}`}
            onClick={() => setActiveTab('embed')}
          >
            { } Embed
          </button>
          <button
            className={`tpl-share-tab ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            📱 QR Code
          </button>
          <button
            className={`tpl-share-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            📢 Social
          </button>
        </div>

        <div className="tpl-share-body">
          <div className="tpl-share-domain">
            <label className="label">Custom Domain (optional)</label>
            <input
              type="url"
              className="input"
              placeholder="https://your-domain.com"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
            />
          </div>

          {activeTab === 'link' && (
            <div className="tpl-share-links">
              <div className="tpl-share-link-group">
                <label>Edit Link</label>
                <div className="tpl-share-row">
                  <input
                    ref={linkInputRef}
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="input"
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => copyToClipboard(shareUrl)}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
              <div className="tpl-share-link-group">
                <label>Preview Link</label>
                <div className="tpl-share-row">
                  <input
                    type="text"
                    readOnly
                    value={previewUrl}
                    className="input"
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => copyToClipboard(previewUrl)}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="tpl-share-embed">
              <div className="tpl-share-link-group">
                <label>HTML Embed Code</label>
                <div className="tpl-share-row">
                  <textarea
                    ref={embedInputRef}
                    readOnly
                    value={embedCode}
                    className="input"
                    rows={3}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', resize: 'none' }}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => copyToClipboard(embedCode)}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
              <div className="tpl-share-link-group">
                <label>OBS Browser Source</label>
                <div className="tpl-share-row">
                  <textarea
                    readOnly
                    value={obsCode}
                    className="input"
                    rows={4}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', resize: 'none' }}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => copyToClipboard(obsCode)}
                  >
                    {copied ? '✓' : '📋'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="tpl-share-qr">
              <div className="tpl-qr-display">
                <div className="tpl-qr-box">
                  <svg viewBox="0 0 100 100" width="160" height="160">
                    <rect width="100" height="100" fill="#fff" />
                    <text x="50" y="45" textAnchor="middle" fontSize="10" fill="#333">QR Code</text>
                    <text x="50" y="60" textAnchor="middle" fontSize="6" fill="#666">{template.name}</text>
                  </svg>
                </div>
                <p className="tpl-qr-hint">Scan to open template</p>
                <button className="btn btn-sm btn-secondary" onClick={downloadQR}>
                  ⬇ Download QR
                </button>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="tpl-share-social">
              <p className="tpl-share-social-desc">Share this template on social media</p>
              <div className="tpl-share-social-grid">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`tpl-social-btn tpl-social-${platform}`}
                  >
                    <span className="tpl-social-icon">
                      {platform === 'twitter' && '🐦'}
                      {platform === 'facebook' && '📘'}
                      {platform === 'linkedin' && '💼'}
                      {platform === 'reddit' && '🔴'}
                      {platform === 'whatsapp' && '💬'}
                    </span>
                    <span className="tpl-social-label">{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
