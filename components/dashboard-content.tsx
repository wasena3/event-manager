import Link from "next/link";
import { Button } from "./ui/button";
import { prisma } from "@/lib/auth/prisma";
import type { RsvpStatus as PrismaRsvpStatus } from "@/app/generated/prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { count } from "console";

export function countByStatus(rsvps: { status: PrismaRsvpStatus }[], status: string) {
  let goingCount = 0;
  let maybeCount = 0;
  let notGoingCount = 0;

  for (const r of rsvps) {
    if (r.status === "going") {
      goingCount++;
    }
    if (r.status === "maybe") {
      maybeCount++;
    }
    if (r.status === "not_going") {
      notGoingCount++;
    }
  }
  return { goingCount, maybeCount, notGoingCount };
}
export async function DashboardContent({ userId }: { userId: string }) {
  const rows = await prisma.event.findMany({
    where: {
      ownerUserId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
      rsvps: { select: { status: true } },
    },
  });

  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    eventDate: e.eventDate ? e.eventDate.toISOString() : null,
    location: e.location,
    ...countByStatus(e.rsvps, 'status'),
  }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your events</h1>
          <p className="text-sm text-muted-foreground">
            Track Attendee responses and manage invite links
          </p>
        </div>

        <Button asChild>
          <Link href={"/events/new"}>Create new event</Link>
        </Button>
      </div>

      {/* List of events */}
      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No events yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You haven't created any events yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Button asChild variant="link" size="sm">
                    <Link href={`/events/${event.id}`}>View</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge>Going: {event.goingCount}</Badge>
                  <Badge variant="secondary">Maybe: {event.maybeCount}</Badge>
                  <Badge variant="outline">{""} Not Going: {event.notGoingCount}</Badge>
                </div>
                <p>
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleString()
                    : "No date selected"}

                  {event.location ? ` - ${event.location}` : ""}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
