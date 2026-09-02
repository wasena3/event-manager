import { EventDetailsContent } from "@/components/event-detail-content";
import { getSession } from "@/lib/auth/server";

export default async function EventDetailsPage({
    params,
}: {
    params: Promise<{ eventId: string }>;
}) {
    const { eventId } = await params;
    const { data: session, error } = await getSession();

    if (error) {
        throw new Error(error.message);
    }

    return (
        <EventDetailsContent
            userId={session?.user?.id}
            eventId={eventId}
        />
    );
}