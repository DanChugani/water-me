export interface WateringEvent {
  date: Date;
  user: string;
  note?: string;
}

export interface Plant {
  name: string;
  lastWatered: Date | null;
  isWatered: boolean;
  lastUpdatedBy: string;
  wateringHistory: WateringEvent[];
} 