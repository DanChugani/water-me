import mongoose from 'mongoose';

const WateringEventSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  user: { type: String, required: true },
  note: { type: String, default: '' },
}, { _id: false });

const PlantSchema = new mongoose.Schema({
  isWatered: {
    type: Boolean,
    default: false,
  },
  lastWatered: {
    type: Date,
    default: null,
  },
  lastUpdatedBy: {
    type: String,
    required: true,
  },
  wateringHistory: {
    type: [WateringEventSchema],
    default: [],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Plant || mongoose.model('Plant', PlantSchema); 