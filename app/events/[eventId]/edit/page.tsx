import { EventForm } from "@/components/event-form";
import { updateEventAction } from "@/lib/actions/events";
import { prisma } from "@/lib/auth/prisma";
import { getSession } from "@/lib/auth/server";
import { toLocalDateTimeInputValue } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await getSession();
  const { eventId } = await params;

  const userId = session?.data?.user?.id;

  const eventEdit = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    select: {
      title: true,
      description: true,
      location: true,
      eventDate: true,
    },
  });

  if (!eventEdit) {
    notFound();
  }

  const event = {
    title: eventEdit.title,
    description: eventEdit.description ?? "",
    location: eventEdit.location ?? "",
    eventDate: eventEdit.eventDate ? toLocalDateTimeInputValue(eventEdit.eventDate) : "",
  };
  return (
    <>
      <EventForm
        action={updateEventAction.bind(null, eventId)}
        heading="Edit Event"
        submitLabel="Save Changes"
        defaultValues={event}
        cancelHref={`/events/${eventId}`}
      />
    </>
  );
}
