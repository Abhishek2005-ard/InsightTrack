import Session from '../models/Session.js';
import Event from '../models/Event.js';

export const getStats = async (req, res) => {
  try {
    let days = 7;
    if (req.query.days) {
      const parsedDays = parseInt(req.query.days, 10);
      if (isNaN(parsedDays) || parsedDays <= 0 || parsedDays > 30) {
        return res.status(400).json({ error: 'Days parameter must be a positive integer <= 30' });
      }
      days = parsedDays;
    }

    const totalSessions = await Session.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalClicks = await Event.countDocuments({ eventType: 'click' });
    
    // Average page views per session
    const pageViews = await Event.countDocuments({ eventType: 'page_view' });
    const avgPageViews = totalSessions > 0 ? (pageViews / totalSessions).toFixed(1) : 0;

    // Device breakdown
    const sessions = await Session.find();
    const devices = {};
    const browsers = {};

    sessions.forEach(s => {
      const dev = s.metadata?.device || 'Desktop';
      const br = s.metadata?.browser || 'Unknown';
      devices[dev] = (devices[dev] || 0) + 1;
      browsers[br] = (browsers[br] || 0) + 1;
    });

    // Daily visits & clicks for the configured number of days
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    
    const eventsLastWeek = await Event.find({ timestamp: { $gte: sinceDate } });
    const dailyData = {};

    // Initialize days list
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyData[dateStr] = { date: dateStr, pageviews: 0, clicks: 0 };
    }

    eventsLastWeek.forEach(e => {
      const dateStr = new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyData[dateStr]) {
        if (e.eventType === 'page_view') {
          dailyData[dateStr].pageviews += 1;
        } else if (e.eventType === 'click') {
          dailyData[dateStr].clicks += 1;
        }
      }
    });

    res.json({
      summary: {
        totalSessions,
        totalEvents,
        totalClicks,
        avgPageViews
      },
      devices: Object.keys(devices).map(key => ({ name: key, count: devices[key] })),
      browsers: Object.keys(browsers).map(key => ({ name: key, count: browsers[key] })),
      trend: Object.values(dailyData)
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSessions = async (req, res) => {
  try {
    let limit = 50;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 200) {
        return res.status(400).json({ error: 'Limit parameter must be a positive integer <= 200' });
      }
      limit = parsedLimit;
    }

    const sessions = await Session.find().sort({ createdAt: -1 }).limit(limit);
    const result = [];

    for (const session of sessions) {
      const events = await Event.find({ sessionId: session._id }).sort({ timestamp: 1 });
      result.push({
        _id: session._id,
        metadata: session.metadata,
        createdAt: session.createdAt,
        events
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getHeatmap = async (req, res) => {
  try {
    const filter = { eventType: 'click' };
    if (req.query.pageUrl) {
      if (typeof req.query.pageUrl !== 'string' || req.query.pageUrl.length > 2048) {
        return res.status(400).json({ error: 'Invalid pageUrl parameter' });
      }
      filter.pageUrl = req.query.pageUrl;
    }

    const clicks = await Event.find(filter).select('pageUrl clickCoords timestamp');
    res.json(clicks);
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
