"use server"
import { Event } from "@/database"
import connectToDatabase from "../mongodb"

export const EventEntries = async(slug: string)=>{
    try {
        await connectToDatabase()
        const count = await Event.countDocuments({slug})
        return count
    } catch (error) {
        return 0
    }
}