"use server";

import { prisma } from "@/lib/auth/prisma";
import { notFound } from "next/navigation";
import { countByStatus } from "./dashboard-content";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  addGuestAction,
  createInviteLinkAction,
  removeGuestAction,
} from "@/lib/actions/events";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { DeleteEventButton } from "./delete-event-button";
import { Input } from "./ui/input";
import { Field, FieldLabel } from "./ui/field";

export async function EventDetailsContent({
  userId,
  eventId,
}: {
  userId: string | undefined;
  eventId: string;
}) {
  const row = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      eventDate: true,
      invite: { select: { token: true } },
      rsvps: { select: { id: true, userId: true, status: true } },
    },
  });

  if (!row) {
    notFound();
  }

  const counts = countByStatus(row.rsvps, "status");

  const event = {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    eventDate: row.eventDate ? row.eventDate.toISOString() : null,
    inviteToken: row.invite?.token ?? null,
    goingCount: counts.goingCount,
    maybeCount: counts.maybeCount,
    notGoingCount: counts.notGoingCount,
  };

  const guestsRows = await prisma.eventGuest.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      emailNormalized: true,
    },
  });

  const rsvpsRows = await prisma.eventRsvp.findMany({
    where: { eventId },
    orderBy: { respondedAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      respondedAt: true,
      emailNormalized: true,
    },
  });

  const rsvps = rsvpsRows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    status: r.status,
    respondedAt: r.respondedAt ? r.respondedAt.toISOString() : null,
    emailNormalized: r.emailNormalized,
  }));

  const respondedEmails = new Set(rsvps.map((r) => r.emailNormalized));

  const guests = guestsRows.map((g) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    responded: respondedEmails.has(g.emailNormalized),
  }));

  const totalInvited = guests.length;
  const totalResponded = guests.filter((g) => g.responded).length;
  const responsePercentage =
    totalInvited === 0 ? 0 : Math.round((totalResponded / totalInvited) * 100);

  const CreateInviteActionForEvent = createInviteLinkAction.bind(
    null,
    event.id,
  );

  const inviteURL = event.inviteToken
    ? `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/invite/${event.inviteToken}`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {event.title}
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString()
              : "No date selected"}
            {event.location ? ` - ${event.location}` : ""}
          </p>
          {event.description && <p>{event.description}</p>}
        </div>
        <Button asChild variant="default" size="sm">
          <Link href={`/events/${event.id}/edit`}>Edit</Link>
        </Button>
        <DeleteEventButton eventId={event.id} />
        <Button asChild variant="outline">
          <Link href={"/dashboard"}>Back</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>Responses</CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {totalResponded} of {totalInvited} invited guests have responded (
            {responsePercentage}%)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>Guests List</CardHeader>
        <CardContent className="space-y-4">
          <form action={addGuestAction.bind(null, event.id)}>
            <Field>
              <FieldLabel htmlFor="Name">Name</FieldLabel>
              <Input id="name" name="name" required placeholder="Your name" />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" />
            </Field>
            <Button type="submit">Add Guest</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Responded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.id}>
                  <TableCell>{guest.name}</TableCell>
                  <TableCell>{guest.email}</TableCell>
                  <TableCell>
                    <Badge variant={guest.responded ? "secondary" : "outline"}>
                      {guest.responded ? "Responded" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <form
                      action={removeGuestAction.bind(null, event.id, guest.id)}
                    >
                      <Button type="submit" variant="destructive" size="sm">
                        Delete
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex flex-wrap gap-2 text-">
        <Badge>Going: {event.goingCount}</Badge>
        <Badge variant="secondary">Maybe: {event.maybeCount}</Badge>
        <Badge variant="outline">
          {""} Not Going: {event.notGoingCount}
        </Badge>
      </div>

      <Card>
        <CardHeader>Invite Link</CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Share this link with your friends to invite them to your event, no
            account needed!
          </p>
          {inviteURL ? (
            <div className="rounded-md border border-border bg-(--surface)] p-3 text-sm">
              {inviteURL}
            </div>
          ) : (
            <p className="text-sm text-foreground">
              No invite Link generated yet
            </p>
          )}
          <form action={CreateInviteActionForEvent}>
            <Button type="submit">Generate Link</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Atendees</CardTitle>
        </CardHeader>
        <CardContent>
          {rsvps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendees yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell>{rsvp.name}</TableCell>
                    <TableCell>{rsvp.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {rsvp.status === "not_going"
                          ? "Not Going"
                          : rsvp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rsvp.respondedAt
                        ? new Date(rsvp.respondedAt).toLocaleString()
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
