import { Event } from "@/database"
import connectToDatabase from "@/lib/mongodb"
import { NextRequest, NextResponse } from "next/server"
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    await connectToDatabase()
    const events = await Event.find().sort({ createdAt: -1 })
    return NextResponse.json({message: "Events Fetched Successfully", events}, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return NextResponse.json({message: 'Failed to fetch events'}, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    connectToDatabase()
    let event;
    const formData = await request.formData();
    try {
        event = Object.fromEntries(formData)
    } catch (error) {
        return NextResponse.json({message: 'Invalid form data'}, { status: 400 })
    }
    const file = formData.get('image') as File
    if(!file) return NextResponse.json({message: 'Image file is required'}, { status: 400 })

    const imageData = await file.arrayBuffer()
    const buffer = Buffer.from(imageData)

    const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevFest' }, (error, results) => {
                if(error) return reject(error);

                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;
        let agenda = JSON.parse(event.agenda as string)
        let tags = JSON.parse(event.tags as string)
        
    const createdEvent = await Event.create({ ...event, agenda, tags })
    return NextResponse.json({message: 'Event created', event: createdEvent}, { status: 201 })
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : 'Unexpected error'
 
    return NextResponse.json(message, { status: 500 })
  }
}