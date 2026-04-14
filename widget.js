/**
 * Feedback Widget - Embeddable feedback collection widget
 * Usage: <script src="https://feedback-widget.netlify.app/widget.js" async></script>
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    position: window.FeedbackWidget?.position || 'bottom-right',
    theme: window.FeedbackWidget?.theme || 'dark',
    projectId: window.FeedbackWidget?.projectId || 'default',
    primaryColor: '#cc1100',
    bgColor: '#000000',
    textColor: '#f0ede8',
    mutedColor: '#6b6660',
    borderColor: '#1c1a17'
  };

  // Create widget HTML
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'feedback-widget';
    widget.innerHTML = `
      <style>
        #feedback-widget {
          position: fixed;
          z-index: 999999;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .fw-trigger {
          position: fixed;
          ${config.position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : 'left: 20px; bottom: 20px;'}
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #000000;
          border: 2px solid #cc1100;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #cc1100;
          box-shadow: 0 4px 20px rgba(204, 17, 0, 0.4);
          transition: all 0.3s ease;
          z-index: 999999;
        }
        
        .fw-trigger:hover {
          transform: scale(1.1);
          background: #000000;
          box-shadow: 0 6px 30px rgba(204, 17, 0, 0.5);
        }
        
        .fw-trigger.active {
          transform: rotate(180deg);
        }
        
        .fw-panel {
          position: fixed;
          ${config.position === 'bottom-right' ? 'right: 20px; bottom: 90px;' : 'left: 20px; bottom: 90px;'}
          width: 380px;
          max-width: calc(100vw - 40px);
          background: ${config.bgColor};
          border: 1px solid ${config.borderColor};
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          transform: scale(0.9) translateY(20px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: 999998;
        }
        
        .fw-panel.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          visibility: visible;
        }
        
        .fw-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .fw-title {
          font-size: 18px;
          font-weight: 700;
          color: ${config.textColor};
          margin: 0;
        }
        
        .fw-close {
          background: none;
          border: none;
          color: ${config.mutedColor};
          font-size: 24px;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .fw-close:hover {
          background: ${config.borderColor};
          color: ${config.textColor};
        }
        
        .fw-form-group {
          margin-bottom: 16px;
        }
        
        .fw-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: ${config.mutedColor};
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        
        .fw-input,
        .fw-textarea,
        .fw-select {
          width: 100%;
          padding: 12px 16px;
          background: ${config.borderColor};
          border: 1px solid ${config.borderColor};
          border-radius: 8px;
          color: ${config.textColor};
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        
        .fw-input:focus,
        .fw-textarea:focus,
        .fw-select:focus {
          outline: none;
          border-color: ${config.primaryColor};
        }
        
        .fw-textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .fw-section-marker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        
        .fw-section-btn {
          padding: 6px 12px;
          background: ${config.borderColor};
          border: 1px solid ${config.borderColor};
          border-radius: 20px;
          color: ${config.mutedColor};
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .fw-section-btn:hover,
        .fw-section-btn.active {
          border-color: ${config.primaryColor};
          color: ${config.primaryColor};
        }
        
        .fw-submit {
          width: 100%;
          padding: 14px 24px;
          background: ${config.primaryColor};
          border: none;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .fw-submit:hover {
          opacity: 0.9;
          background: ${config.primaryColor};
        }
        
        .fw-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .fw-success {
          text-align: center;
          padding: 40px 20px;
        }
        
        .fw-success-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .fw-success h3 {
          color: ${config.textColor};
          margin: 0 0 8px 0;
        }
        
        .fw-success p {
          color: ${config.mutedColor};
          margin: 0;
        }
        
        @media (max-width: 480px) {
          .fw-panel {
            ${config.position === 'bottom-right' ? 'right: 10px; left: 10px;' : 'left: 10px; right: 10px;'}
            width: auto;
            bottom: 80px;
          }
          
          .fw-trigger {
            ${config.position === 'bottom-right' ? 'right: 10px;' : 'left: 10px;'}
            bottom: 10px;
          }
        }
      </style>
      
      <button class="fw-trigger" aria-label="Open feedback">▶▶▶</button>
      
      <div class="fw-panel">
        <div class="fw-form">
          <div class="fw-header">
            <h3 class="fw-title">Feedback senden</h3>
            <button class="fw-close" aria-label="Close">×</button>
          </div>
          
          <form id="fw-form">
            <div class="fw-form-group">
              <label class="fw-label">Bereich</label>
              <div class="fw-section-marker">
                <button type="button" class="fw-section-btn" data-section="Hero">Hero</button>
                <button type="button" class="fw-section-btn" data-section="Über uns">Über uns</button>
                <button type="button" class="fw-section-btn" data-section="Leistungen">Leistungen</button>
                <button type="button" class="fw-section-btn" data-section="Prozess">Prozess</button>
                <button type="button" class="fw-section-btn" data-section="Sonstiges">Sonstiges</button>
              </div>
            </div>
            
            <div class="fw-form-group">
              <label class="fw-label" for="fw-category">Kategorie</label>
              <select class="fw-select" id="fw-category" name="category">
                <option value="general">Allgemeines Feedback</option>
                <option value="bug">Fehler melden</option>
                <option value="feature">Feature Request</option>
                <option value="design">Design Feedback</option>
              </select>
            </div>
            
            <div class="fw-form-group">
              <label class="fw-label" for="fw-message">Nachricht *</label>
              <textarea class="fw-textarea" id="fw-message" name="message" placeholder="Ihr Feedback..." required></textarea>
            </div>
            
            <div class="fw-form-group">
              <label class="fw-label" for="fw-name">Name (optional)</label>
              <input type="text" class="fw-input" id="fw-name" name="name" placeholder="Ihr Name">
            </div>
            
            <div class="fw-form-group">
              <label class="fw-label" for="fw-email">E-Mail (optional)</label>
              <input type="email" class="fw-input" id="fw-email" name="email" placeholder="Ihre E-Mail">
            </div>
            
            <input type="hidden" name="pageUrl" id="fw-page-url">
            <input type="hidden" name="section" id="fw-section">
            <input type="hidden" name="projectId" value="${config.projectId}">
            
            <button type="submit" class="fw-submit">Feedback senden</button>
          </form>
        </div>
        
        <div class="fw-success" style="display: none;">
          <div class="fw-success-icon">✓</div>
          <h3>Vielen Dank!</h3>
          <p>Ihr Feedback wurde erfolgreich gesendet.</p>
        </div>
      </div>
    `;
    
    return widget;
  }

  // Initialize widget
  function init() {
    // Check if already initialized
    if (document.getElementById('feedback-widget')) return;
    
    // Create and append widget
    const widget = createWidget();
    document.body.appendChild(widget);
    
    // Elements
    const trigger = widget.querySelector('.fw-trigger');
    const panel = widget.querySelector('.fw-panel');
    const closeBtn = widget.querySelector('.fw-close');
    const form = widget.querySelector('#fw-form');
    const formView = widget.querySelector('.fw-form');
    const successView = widget.querySelector('.fw-success');
    const sectionBtns = widget.querySelectorAll('.fw-section-btn');
    const sectionInput = widget.querySelector('#fw-section');
    const pageUrlInput = widget.querySelector('#fw-page-url');
    
    // Set page URL
    pageUrlInput.value = window.location.href;
    
    // Toggle panel
    function togglePanel() {
      const isOpen = panel.classList.contains('open');
      if (isOpen) {
        panel.classList.remove('open');
        trigger.classList.remove('active');
        trigger.innerHTML = '▶▶▶';
      } else {
        panel.classList.add('open');
        trigger.classList.add('active');
        trigger.innerHTML = '✕';
      }
    }
    
    trigger.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', togglePanel);
    
    // Section marker
    sectionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        sectionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        sectionInput.value = btn.dataset.section;
      });
    });
    
    // Form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('.fw-submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet...';
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Relay Config
      const RELAY_URL = 'https://feedback-widget-ffwd.netlify.app/.netlify/functions/submit';
      
      // Build payload
      const payload = {
        section: data.section || 'Nicht angegeben',
        category: data.category || 'general',
        pageUrl: data.pageUrl || window.location.href,
        name: data.name || 'Anonym',
        email: data.email || '',
        message: data.message,
        projectId: data.projectId || config.projectId,
        timestamp: new Date().toISOString()
      };
      
      try {
        // Send to relay server
        const response = await fetch(RELAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
          formView.style.display = 'none';
          successView.style.display = 'block';
          
          // Reset after 3 seconds
          setTimeout(() => {
            form.reset();
            sectionBtns.forEach(b => b.classList.remove('active'));
            formView.style.display = 'block';
            successView.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Feedback senden';
            togglePanel();
          }, 3000);
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error) {
        console.error('Feedback submission error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Feedback senden';
        alert('Fehler beim Senden. Bitte versuchen Sie es erneut.');
      }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!widget.contains(e.target) && panel.classList.contains('open')) {
        togglePanel();
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
