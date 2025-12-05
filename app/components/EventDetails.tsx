import EventCard from "@/app/components/EventCard";
import EventForm from "@/app/components/EventForm";
import { IEvent } from "@/database";
import { EventEntries } from "@/lib/action/entries.action";
import { similarEvents } from "@/lib/action/event.action";
import { cacheLife } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";

  const EventDetail = ({ image, alt, info }: { image: string, alt: string, info: string }) => (
    <div className="flex items-center gap-2">
      <Image src={image} alt={alt} width={16} height={16} />
      <p>{info}</p>
    </div>
  )

  const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
      <h3 className="my-4">Agenda</h3>
      <ul>
        {agendaItems.map((item, index) => (
          <li key={index}>
            {item}
          </li>
        )
        )}
      </ul>
    </div>
  )

  const EventTags = ({ tags }: { tags: string[] }) => (
    <div>
      <h3 className="my-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span key={index} className="pill">{tag}</span>
        ))}
      </div>
    </div>
  )

  

const EventDetails = async({params}: {params: Promise<string>}) => {
  "use cache"
  cacheLife('hours')
    const slug = await params

    const Entries = await EventEntries(slug);

  let event;
    try {
        const request = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`, {
            next: { revalidate: 60 }
        });

        if (!request.ok) {
            if (request.status === 404) {
                return notFound();
            }
            throw new Error(`Failed to fetch event: ${request.statusText}`);
        }

        const response = await request.json();
        event = response.event;

        if (!event) {
            return notFound();
        }
    } catch (error) {
        console.error('Error fetching event:', error);
        return notFound();
    }

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer, title, venue } = event;

  const events = await similarEvents(slug) as unknown as IEvent[];
  return (
    <section id="event">

      <div className="header">
        <h1>{title}</h1>
        <p className="mt-2">{description}</p>
      </div>
      <div className="details">
        <div className="content">
        <Image src={image} alt={title} width={800} height={800} className="rounded-lg item banner" />
          <section className="flex flex-col gap-2">
            <h3 className="my-4">Overview</h3>
            <p>{overview}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="my-4">Event Details</h3>
            <EventDetail image="/icons/calendar.svg" alt="Calendar Icon" info={date} />
            <EventDetail image="/icons/clock.svg" alt="Clock Icon" info={time} />
            <EventDetail image="/icons/pin.svg" alt="Location Icon" info={`${venue}, ${location}`} />
            <EventDetail image="/icons/mode.svg" alt="Mode Icon" info={mode} />
            <EventDetail image="/icons/audience.svg" alt="Audience Icon" info={audience} />
          </section>

          <EventAgenda agendaItems={agenda} />

          <section className="flex flex-col gap-2">
            <h3 className="my-4">About the Organizer</h3>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>
      
        <aside className="booking">
          <div className="signup-card">
            {Entries>0 ? <h2>Join {Entries} People already Registered</h2> : <h2>Be the First to Book Your Spot</h2>}
              <EventForm eventId={event._id} slug={slug}/>
          </div>
        </aside>
        
      </div>
      <div>
        <h2 className="my-4">Similar Event</h2>
        <div className="events">
          {events.length > 0 && events.map((event: IEvent)=>(
            <EventCard key={event.slug} {...event} />
          ))}
        </div>
      </div>


    </section>
  )
}

export default EventDetails
