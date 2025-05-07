import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Plant from '@/models/Plant';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      let plant = await Plant.findOne().sort({ createdAt: -1 });
      
      if (!plant) {
        plant = await Plant.create({
          isWatered: false,
          lastWatered: null,
          lastUpdatedBy: 'system',
          wateringHistory: [],
        });
      }
      
      // Ensure wateringHistory exists (migration for old documents)
      if (!plant.wateringHistory) {
        plant.wateringHistory = [];
        await plant.save();
      }
      
      res.status(200).json(plant);
    } else if (req.method === 'POST') {
      const { isWatered, lastWatered, lastUpdatedBy, note } = req.body;
      
      // Sanitize note to prevent XSS
      const sanitize = (str: string) => str.replace(/<[^>]*>?/gm, '');
      const safeNote = note ? sanitize(note) : '';
      const newEvent = {
        date: lastWatered || new Date(),
        user: lastUpdatedBy,
        note: safeNote,
      };
      
      // Use findOneAndUpdate to ensure we get the updated document back
      const plant = await Plant.findOneAndUpdate(
        {}, // find the first document
        {
          $set: {
            isWatered: isWatered,
            lastWatered: lastWatered,
            lastUpdatedBy: lastUpdatedBy,
          },
          // Add the new event at the beginning of wateringHistory array, or create the array if it doesn't exist
          $push: {
            wateringHistory: {
              $each: [newEvent],
              $position: 0,
              $slice: 5 // Keep only the 5 most recent events
            }
          }
        },
        { 
          new: true, // Return the updated document
          upsert: true, // Create if it doesn't exist
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );
      
      res.status(200).json(plant);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
} 