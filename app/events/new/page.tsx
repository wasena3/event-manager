import { EventForm } from "@/components/event-form";
import { createEventAction } from "@/lib/actions/events";

export default async function NewEventPage() {
  return (
    <EventForm
      action={createEventAction}
      heading="Create Event"
      submitLabel="Create Event"
      cancelHref="/dashboard"
    />
  );
}