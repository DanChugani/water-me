import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Plant from '@/models/Plant';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('Successfully connected to MongoDB');

    if (req.method === 'GET') {
      console.log('Fetching plant data...');
      let plant = await Plant.findOne().sort({ createdAt: -1 });
      
      if (!plant) {
        console.log('No plant found, creating new plant...');
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
      
      console.log('GET response:', JSON.stringify(plant));
      res.status(200).json(plant);
    } else if (req.method === 'POST') {
      console.log('POST received:', JSON.stringify(req.body));
      const { isWatered, lastWatered, lastUpdatedBy, note } = req.body;
      console.log('Extracted note:', note);
      
      const newEvent = {
        date: lastWatered || new Date(),
        user: lastUpdatedBy,
        note: note || '',
      };
      console.log('New watering event:', JSON.stringify(newEvent));
      
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
      
      console.log('POST response:', JSON.stringify(plant));
      res.status(200).json(plant);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error details:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' });
  }
} 