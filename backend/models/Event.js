import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      ref: 'Session',
      required: true
    },
    eventType: {
      type: String, // 'page_view', 'click'
      required: true
    },
    pageUrl: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    clickCoords: {
      x: Number,        // absolute coordinate
      y: Number,        // absolute coordinate
      percentX: Number, // percentage-based coordinate for responsiveness
      percentY: Number  // percentage-based coordinate for responsiveness
    }
  },
  {
    timestamps: true
  }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;
