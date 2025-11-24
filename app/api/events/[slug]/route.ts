import { NextResponse } from "next/server";
import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";

// Expected shape of the dynamic route parameters for this handler
interface EventSlugRouteParams {
  slug?: string;
}

// Public shape of an event returned by this endpoint.
// Adjust fields to match your Event schema as needed.
interface EventResponse {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  date?: string;
  location?: string;
  image?: string;
  [key: string]: unknown; // allow additional typed fields without using `any`
}

// Small helper to keep error responses consistent.
const jsonError = (message: string, status: number) =>
  NextResponse.json({ message }, { status });

/**
 * GET /api/events/[slug]
 * Fetch a single event by its slug.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<EventSlugRouteParams> }
) {
  try {
    // In Next.js (App Router), `params` can be a Promise and must be awaited
    const { slug } = await params;

    // Validate slug
    if (!slug || typeof slug !== "string" || !slug.trim()) {
      return jsonError("A valid event slug is required", 400);
    }

    // Ensure a DB connection (safe to call repeatedly)
    await connectToDatabase();

    // Look up event by slug
    const event = await Event.findOne({ slug }).lean<EventResponse | null>();

    if (!event) {
      return jsonError("Event not found", 404);
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
      },
      { status: 200 }
    );
  } catch (reason: unknown) {
    // Optionally hook into your logging/monitoring here

    const message =
      reason instanceof Error
        ? reason.message
        : "An unexpected error occurred while fetching the event";

    return jsonError(message, 500);
  }
}
