"use server"
import { Event } from "@/database"
import connectToDatabase from "../mongodb"

export const similarEvents = async(slug: string)=>{
    try {
        // ensure DB connection is ready before running queries
        await connectToDatabase()

        // look up the requested event
        const event = await Event.findOne({ slug })

        // If the event wasn't found or doesn't have any tags, return an empty
        // result early to avoid dereferencing null/undefined.
        if (!event || !Array.isArray(event.tags) || event.tags.length === 0) {
            return []
        }

        return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean()
    } catch (error) {
        return []
    }
}