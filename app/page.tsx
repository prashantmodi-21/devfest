<<<<<<< HEAD
"use cache"
=======
import { events } from '@/lib/contants'
>>>>>>> main
import EventCard from './components/EventCard'
import ExploreBtn from './components/ExploreBtn'

const page = () => {
  return (
    <>
      <section className='text-center'>
        <h1>DevFest <br />A Community of Developers </h1>
        <p className='mt-5'>A Platform for Developers to Engage with Dev Community</p>
        <ExploreBtn />
      </section>

      <section className='mt-20 my-7' id='events'>
        <h3 className='mb-5'>Feature Events</h3>
        <div className='events'>
<<<<<<< HEAD
          {events?.length > 0 && events.map((event: IEvent) => (
=======
          {events.map((event) => (
>>>>>>> main
            <div key={event.slug}>
              <EventCard {...event} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default page
