"use server";

import { redirect } from "next/navigation";
import { prisma } from "../auth/prisma";
import { getSession } from "../auth/server";
import { revalidatePath } from "next/cache";
import { RsvpStatus } from "@/app/generated/prisma/enums";

function parseEventInput(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3 || title.length > 120) {
    throw new Error("Title must be between 3 and 120 characters");
  }
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();

  const rsvpDeadline = String(formData.get("rsvpDeadline") ?? "").trim();
  if (!rsvpDeadline) {
    throw new Error("RSVP deadline is required");
  }
  if (isNaN(Date.parse(rsvpDeadline))) {
    throw new Error("RSVP deadline must be a valid date");
  }
  return {
    title,
    description: description.length ? description.slice(0, 300) : null,
    location: location.length ? location.slice(0, 300) : null,
    eventDate: eventDate.length ? eventDate : null,
    rsvpDeadline: new Date(rsvpDeadline),
  };
}

const RSVP_STATUSES = ["going", "maybe", "not_going"] as const;
function isRsvpStatus(s: string): s is RsvpStatus {
  return (RSVP_STATUSES as readonly string[]).includes(s);
}

function parseRsvp(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 3 || name.length > 120) {
    throw new Error("Name must be between 3 and 120 characters");
  }
  const email = String(formData.get("email") ?? "").trim();
  if (email.length < 3 || email.length > 320 || !email.includes("@")) {
    throw new Error("Please enter a valid email");
  }
  const status = String(formData.get("status") ?? "").trim();
  if (!isRsvpStatus(status)) {
    throw new Error("Invalid RSVP status.");
  }
  return { name, email, status };
}

function parseGuestInput(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 3 || name.length > 120) {
    throw new Error("Name must be between 3 and 120 characters");
  }
  const email = String(formData.get("email") ?? "").trim();
  if (email.length < 3 || email.length > 320 || !email.includes("@")) {
    throw new Error("Please enter a valid email");
  }
  return { name, email };
}

export async function createEventAction(formData: FormData) {
  const session = await getSession();
  const userId = session?.data?.user?.id;
  const input = parseEventInput(formData);

  let created;
  try {
    created = await prisma.event.create({
      data: {
        ownerUserId: userId ?? "",
        title: input.title,
        description: input.description,
        location: input.location,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        rsvpDeadline: input.rsvpDeadline
      },
    });
  } catch (err) {
    console.error(err);
    throw err; // or handle/display the error, but don't swallow it silently
  }

  redirect(`/events/${created.id}`);
}

export async function createInviteLinkAction(eventId: string) {
  const session = await getSession();
  const userId = session?.data?.user?.id;

  const owns = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!owns) {
    throw new Error("Event not found");
  }

  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  await prisma.eventInvite.upsert({
    where: { eventId },
    create: { eventId, token },
    update: { token },
  });
  revalidatePath(`/events/${eventId}`);
}

export async function submitOrUpdateRsvpAction(
  token: string,
  formData: FormData,
) {
  const input = parseRsvp(formData);

  const invite = await prisma.eventInvite.findFirst({
    where: {
      token,
    },
    select: {
      id: true,
      event: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!invite) {
    throw new Error("Invite link Invalid");
  }

  const eventId = invite.event.id;
  const emailNormalized = input.email.toLowerCase();

  await prisma.eventRsvp.upsert({
    where: {
      eventId_emailNormalized: {
        eventId,
        emailNormalized,
      },
    },
    create: {
      eventId,
      inviteId: invite.id,
      name: input.name,
      email: input.email,
      emailNormalized,
      status: input.status as RsvpStatus,
    },
    update: {
      name: input.name,
      status: input.status as RsvpStatus,
      respondedAt: new Date(),
    },
  });

  redirect(`/invite/${token}?submitted=1`);
}

export async function updateEventAction(eventId: string, formData: FormData) {
  const session = await getSession();
  const userId = session?.data?.user?.id;

  const owns = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!owns) {
    throw new Error("Event not found");
  }
  const input = parseEventInput(formData);

  try {
    await prisma.event.update({
      where: { id: eventId },
      data: {
        title: input.title,
        description: input.description,
        location: input.location,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        rsvpDeadline: input.rsvpDeadline
      },
    });
  } catch (err) {
    console.error(err);
    throw err; // or handle/display the error, but don't swallow it silently
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}
export async function deleteEventAction(eventId: string) {
  const session = await getSession();
  const userId = session?.data?.user?.id;

  const owns = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: userId,
    },
    select: { id: true },
  });
  if (!owns) {
    throw new Error("Event not found");
  }

  await prisma.event.delete({
    where: { id: eventId },
  });

  redirect("/dashboard?deleted=1");
}

export async function addGuestAction(eventId: string, formData: FormData) {
  const session = await getSession();
  const userId = session?.data?.user?.id;

  const owns = await prisma.event.findFirst({
    where: {
      id: eventId,
      ownerUserId: userId,
    },
    select: { id: true },
  });

  if (!owns) {
    throw new Error("Event not found");
  }
  const input = parseGuestInput(formData);
  const emailNormalized = input.email.toLowerCase();
  try {
    await prisma.eventGuest.create({
      data: {
        eventId,
        name: input.name,
        email: input.email,
        emailNormalized,
      },
    });
  } catch (err) {
    console.error(err);
    throw err; // or handle/display the error, but don't swallow it silently
  }

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

export async function removeGuestAction(eventId: string, guestId: string) {
  const session = await getSession();
  const userId = session?.data?.user?.id;

  const guest = await prisma.eventGuest.findFirst({
    where: {
      id: guestId,
      eventId: eventId,
      event: {
        ownerUserId: userId,
      },
    },
    select: { id: true },
  });

  if (!guest) {
    throw new Error("Event not found");
  }

  await prisma.eventGuest.delete({
    where: { id: guestId },
  });

  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}
