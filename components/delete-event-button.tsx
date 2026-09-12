"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteEventAction } from "@/lib/actions/events";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the event
          and all associated data. Are you sure you want to continue?
        </DialogDescription>
        <DialogFooter className="flex justify-between sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
            <form action={deleteEventAction.bind(null, eventId)}>
              <Button type="submit" variant="destructive">
                Delete Event
              </Button>
            </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
