"use client"

import { useState } from "react";

const EventForm = () => {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState(false)
    const handleEvent = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => {
            setStatus(true)
        }, 1000);
    }
    return (
        <div id="book-event">
            {status ? <p>You are Signed Up</p> :<form action="" onSubmit={handleEvent}>
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
