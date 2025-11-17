import { Schema, model, models, Document } from 'mongoose';

// Event document shape
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // 24h format HH:mm
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        // Agenda must be a non-empty list of non-empty strings.
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((v) => typeof v === 'string' && v.trim().length > 0),
        message: 'Agenda must be a non-empty array of non-empty strings',
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        // Tags must be a non-empty list of non-empty strings.
        validator: (value: string[]): boolean =>
          Array.isArray(value) &&
          value.length > 0 &&
          value.every((v) => typeof v === 'string' && v.trim().length > 0),
        message: 'Tags must be a non-empty array of non-empty strings',
      },
    },
  },
  {
    timestamps: true, // Auto-manage createdAt/updatedAt
    strict: true,
  }
);

// Note: `slug` declares `unique: true` in the schema, so an explicit
// index here is redundant and has been removed.

// Normalize time strings to a consistent HH:mm 24h format.
function normalizeTime(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})(?::?(\d{2}))?\s*([AaPp][Mm])?$/);

  if (!match) {
    throw new Error('Invalid time format');
  }

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridiem = match[3]?.toUpperCase();

  if (meridiem) {
    if (hours === 12) {
      hours = meridiem === 'AM' ? 0 : 12;
    } else if (meridiem === 'PM') {
      hours += 12;
    }
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('Invalid time value');
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Pre-validate hook: ensure `slug` is generated before Mongoose built-in
// validators run (schema-level `required: true` for `slug`). This prevents
// validation failures when `slug` is not provided by the caller.
EventSchema.pre<IEvent>('validate', function preValidate(next) {
  try {
    if (
      (this.isModified('title') || !this.slug) &&
      typeof this.title === 'string' &&
      this.title.trim().length > 0
    ) {
      const baseSlug = this.title
        .toLowerCase()
        .trim()
        .replace(/[\s\-_]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/^-+|-+$/g, '');

      this.slug = baseSlug;
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save hook: validate required fields and normalize date/time.
EventSchema.pre<IEvent>('save', function preSave(next) {
  try {
    // Ensure required string fields are present and non-empty.
    const requiredStringFields: (keyof IEvent)[] = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'mode',
      'audience',
      'organizer',
    ];

    for (const field of requiredStringFields) {
      const value = this[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Field "${String(field)}" is required and cannot be empty`);
      }
    }

    // Normalize date to an ISO date string (YYYY-MM-DD).
    const parsedDate = new Date(this.date);
    if (Number.isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    this.date = parsedDate.toISOString().split('T')[0];

    // Normalize time to HH:mm (24h).
    this.time = normalizeTime(this.time);

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Re-use existing model in dev/hot-reload environments.
export const Event = models.Event || model<IEvent>('Event', EventSchema);
