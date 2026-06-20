(function () {
  let backendBase = 'http://localhost:5000';
  if (document.currentScript && document.currentScript.src) {
    try {
      backendBase = new URL(document.currentScript.src).origin;
    } catch (e) {
      console.warn('InsightTrack: Failed to parse currentScript origin, using default.', e);
    }
  }
  const BACKEND_URL = `${backendBase}/api/track`;

  // 1. Helper to generate a unique session ID
  function generateSessionID() {
    return 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // 2. Retrieve or initialize Session ID in sessionStorage
  let sessionId = sessionStorage.getItem('insighttrack_session_id');
  let isNewSession = false;
  if (!sessionId) {
    sessionId = generateSessionID();
    sessionStorage.setItem('insighttrack_session_id', sessionId);
    isNewSession = true;
  }

  // 3. Detect Client Metadata
  function detectMetadata() {
    const ua = navigator.userAgent;
    let os = 'Unknown OS';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Unknown Browser';
    if (/OPR/i.test(ua)) browser = 'Opera';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Safari/i.test(ua)) browser = 'Safari';

    let device = 'Desktop';
    if (/Mobi|Android|iPhone/i.test(ua)) {
      device = 'Mobile';
    } else if (/iPad|Tablet/i.test(ua) || (window.innerWidth <= 1024 && window.innerWidth >= 768)) {
      device = 'Tablet';
    }

    return {
      os,
      browser,
      device,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height
    };
  }

  // 4. Send Event to API
  function trackEvent(eventType, extraData = {}) {
    const payload = {
      sessionId,
      eventType,
      pageUrl: window.location.pathname + window.location.search,
      ...extraData
    };

    // If it's a new session, attach the device metadata so the backend can record the session
    if (isNewSession) {
      payload.metadata = detectMetadata();
      isNewSession = false; // Send metadata only once per page session
    }

    fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        console.log('InsightTrack event tracked:', data);
      })
      .catch(err => {
        console.error('InsightTrack tracking error:', err);
      });
  }

  // 5. Track Page View on Load
  window.addEventListener('load', () => {
    trackEvent('page_view');
  });

  // 6. Track Click Events on Document
  document.addEventListener('click', (event) => {
    // Avoid tracking clicks on inputs if we want privacy, but for a general tracker we record click coordinates
    const docWidth = document.documentElement.scrollWidth || window.innerWidth;
    const docHeight = document.documentElement.scrollHeight || window.innerHeight;

    const clickCoords = {
      x: event.pageX,
      y: event.pageY,
      percentX: parseFloat(((event.pageX / docWidth) * 100).toFixed(2)),
      percentY: parseFloat(((event.pageY / docHeight) * 100).toFixed(2))
    };

    trackEvent('click', { clickCoords });
  });

  console.log('InsightTrack tracker.js initialized successfully.');
})();
