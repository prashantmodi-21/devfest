import { Schema, model, models, Document, Types } from 'mongoose';
import { Event } from './event.model';

// Booking document shape
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        // Basic email format validation.
        validator: (value: string): boolean => emailRegex.test(value),
        message: 'Invalid email address',
      },
    },
  },
  {
    timestamps: true, // Auto-manage createdAt/updatedAt
    strict: true,
  }
);

// Index eventId for efficient lookups by event.
BookingSchema.index({ eventId: 1 });

// Pre-save hook: validate email and ensure referenced event exists.
BookingSchema.pre<IBooking>('save', async function preSave(next) {
  try {
    if (!this.eventId) {
      throw new Error('eventId is required');
    }

    if (!emailRegex.test(this.email)) {
      throw new Error('Invalid email address');
    }

    const existingEvent = await Event.exists({ _id: this.eventId });
    if (!existingEvent) {
      throw new Error('Referenced event does not exist');
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Re-use existing model in dev/hot-reload environments.
export const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);
