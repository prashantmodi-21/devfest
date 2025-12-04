"use client"
import { BookEvent } from "@/lib/action/booking.action";
import posthog from "posthog-js";
import { useState } from "react";

const EventForm = ({eventId, slug}: {eventId: string, slug: string}) => {

    const [email, setEmail] = useState("")
    const [status, setStatus] = useState(false)

    const handleEvent = async(e: React.FormEvent) => {
        e.preventDefault();
        const {success} = await BookEvent({eventId, slug, email})
        
        if(success){
            setStatus(true)
            posthog.capture("Event Booked", {eventId, slug, email})
        }else{
            setStatus(false)
            posthog.captureException("Event Booking Failed")
        }
    }
    return (
        <div id="book-event">
            {status ? <p>You are Already Signed Up</p> :<form onSubmit={handleEvent}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" name="email" id="email" placeholder="Enter Your Email" onChange={(e)=> setEmail(e.target.value)}/>
                </div>
                <button type="submit" className="button-submit">Submit</button>
            </form>}
        </div>
    )
}

export default EventForm
