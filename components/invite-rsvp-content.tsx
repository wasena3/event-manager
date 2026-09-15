import Link from "next/link";
import { Button } from "./ui/button";
import { prisma } from "@/lib/auth/prisma";
import type { RsvpStatus as PrismaRsvpStatus } from "@/app/generated/prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { count } from "console";
import { notFound } from "next/navigation";
import { Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { submitOrUpdateRsvpAction } from "@/lib/actions/events";

export async function InviteRsvpContent({ token, submitted }: { token: string; submitted: boolean }) {
  const row = await prisma.eventInvite.findFirst({
    where: {
      token,
    },
    include:{
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          eventDate: true,
          location: true,
          rsvpDeadline: true
        },
      },
    }
  });
  if (!row) {
    notFound();
  }

  const e = row.event;
  const event = {
    title: e.title,
    description: e.description,
    location: e.location,
    eventDate: e.eventDate ? e.eventDate.toISOString() : null,
    rsvpDeadline: e.rsvpDeadline ? e.rsvpDeadline.toISOString() : null,
  }
  const isClosed = new Date() > row.event.rsvpDeadline;

  const submitRsvpForToken = submitOrUpdateRsvpAction.bind(null, token);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <Card>
        <CardHeader className="space-y-3">
          <Badge variant='secondary' className="w-fit">
            RSVP
          </Badge>
          <CardTitle>{event.title}</CardTitle>
          <p className= 'text-sm text-foreground'>
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString()
              : "No date"}
              {event.location ? ` - ${event.location}` : ""}
          </p>
          {event.description ? (
            <p className="text-sm text-muted-foreground">{event.description}</p>
          ): null}
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="mb-4 rounded border border-accent/50 bg-accent/15">
              Thanks for RSVPing!
            </p>
          ): null}
          {isClosed ? (
            <p className="mb-4 rounded border border-destructive/50 bg-destructive/15">
              RSVP is closed for this event.
            </p>
          ): (
          <form action={submitRsvpForToken}>
            <Field>
              <FieldLabel htmlFor="Name">Name</FieldLabel>
              <Input id='name' name='name' required placeholder="Your name"/>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id='email' name='email' required placeholder="you@example.com"/>
            </Field>
            <Field>
              <FieldLabel htmlFor='attendance'>
                <select
                id='status'
                name='status'
                required
                defaultValue='going'
                className='flex h-10 w-full rounded-md border border-border bg-surface px-3'
                >
                  <option value='going'>Going</option>
                  <option value='not_going'>Not Going</option>
                  <option value='maybe'>Maybe</option>
                </select>
              </FieldLabel>
            </Field>
            <Button type='submit'>Submit RSVP</Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
