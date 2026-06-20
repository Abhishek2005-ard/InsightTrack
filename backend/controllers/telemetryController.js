import Session from '../models/Session.js';
import Event from '../models/Event.js';

export const trackEvent = async (req, res) => {
  try {
    const { sessionId, eventType, pageUrl, clickCoords, metadata } = req.body;

    // Strict input type validation to prevent Type Confusion
    if (typeof sessionId !== 'string' || sessionId.trim().length === 0 || sessionId.length > 100) {
      return res.status(400).json({ error: 'Invalid or missing sessionId' });
    }
    if (typeof eventType !== 'string' || !['page_view', 'click'].includes(eventType)) {
      return res.status(400).json({ error: 'Invalid or missing eventType (must be page_view or click)' });
    }
    if (typeof pageUrl !== 'string' || pageUrl.trim().length === 0 || pageUrl.length > 2048) {
      return res.status(400).json({ error: 'Invalid or missing pageUrl' });
    }

    // Validate clickCoords for click event type
    if (eventType === 'click') {
      if (!clickCoords || typeof clickCoords !== 'object') {
        return res.status(400).json({ error: 'clickCoords is required for click events' });
      }
      const { x, y, percentX, percentY } = clickCoords;
      if (
        typeof x !== 'number' || isNaN(x) ||
        typeof y !== 'number' || isNaN(y) ||
        typeof percentX !== 'number' || isNaN(percentX) ||
        typeof percentY !== 'number' || isNaN(percentY)
      ) {
        return res.status(400).json({ error: 'Invalid clickCoords values (must be numbers)' });
      }
    }

    // Validate metadata if provided
    if (metadata) {
      if (typeof metadata !== 'object') {
        return res.status(400).json({ error: 'metadata must be an object' });
      }
      const { os, browser, device, screenWidth, screenHeight } = metadata;
      if (os && (typeof os !== 'string' || os.length > 100)) {
        return res.status(400).json({ error: 'Invalid OS metadata format' });
      }
      if (browser && (typeof browser !== 'string' || browser.length > 100)) {
        return res.status(400).json({ error: 'Invalid browser metadata format' });
      }
      if (device && (typeof device !== 'string' || device.length > 100)) {
        return res.status(400).json({ error: 'Invalid device metadata format' });
      }
      if (screenWidth && (typeof screenWidth !== 'number' || isNaN(screenWidth))) {
        return res.status(400).json({ error: 'Invalid screenWidth format' });
      }
      if (screenHeight && (typeof screenHeight !== 'number' || isNaN(screenHeight))) {
        return res.status(400).json({ error: 'Invalid screenHeight format' });
      }
    }

    // Upsert Session
    let session = await Session.findById(sessionId);
    if (!session) {
      session = new Session({
        _id: sessionId,
        metadata: {
          os: metadata?.os || 'Unknown',
          browser: metadata?.browser || 'Unknown',
          device: metadata?.device || 'Desktop',
          screenWidth: metadata?.screenWidth || 1920,
          screenHeight: metadata?.screenHeight || 1080
        }
      });
      await session.save();
    }

    // Create Event
    const event = new Event({
      sessionId,
      eventType,
      pageUrl,
      clickCoords: eventType === 'click' ? {
        x: clickCoords.x,
        y: clickCoords.y,
        percentX: clickCoords.percentX,
        percentY: clickCoords.percentY
      } : undefined
    });
    await event.save();

    res.status(201).json({ success: true, event });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
