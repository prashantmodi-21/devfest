"use server"
import { Booking, Event } from "@/database"
import connectToDatabase from "../mongodb"

export const EventEntries = async(eventId: string)=>{
    try {
        await connectToDatabase()
        const count = await Booking.countDocuments({eventId})
        return count
    } catch (error) {
        return 0
    }
}