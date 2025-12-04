import EventDetails from "@/app/components/EventDetails";
import { Suspense } from "react";

const EventPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const slug = params.then((p)=> p.slug);
  
  return (
    <Suspense fallback={<div>Loading Event Details...</div>}>
      <EventDetails params={slug} />
    </Suspense>
  )
}

export default EventPage
