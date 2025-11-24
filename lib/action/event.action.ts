import { Event } from "@/database"
import connectToDatabase from "../mongodb"

export const similarEvents = async(slug: string)=>{
    try {
        connectToDatabase()
        const event = await Event.findOne({slug})
        return await Event.find({_id: {$ne: event._id}, tags: {$in: event.tags}}).lean()
    } catch (error) {
        return []
    }
}