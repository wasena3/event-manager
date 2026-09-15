import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  FieldDescription,
  FieldGroup,
  FieldSeparator,
  FieldSet,
} from "./ui/field";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import Link from "next/link";
import { Label } from "./ui/label";

type EventFormProps = {
  action: (formData: FormData) => Promise<void>;
  heading: string;
  cancelHref: string;
  submitLabel: string;
  defaultValues?: {
    title: string;
    description: string;
    location: string;
    eventDate: string;
    rsvpDeadline: string;
  };
};

export function EventForm({
  action,
  heading,
  submitLabel,
  defaultValues,
  cancelHref,
}: EventFormProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{heading}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <FieldGroup>
              <FieldSet>
                <Label>Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Date Night"
                  defaultValue={defaultValues?.title}
                />
              </FieldSet>
            </FieldGroup>
            <FieldSeparator />
            <FieldGroup>
              <FieldSet>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={defaultValues?.description}
                  placeholder="Describe your event..."
                />
              </FieldSet>
            </FieldGroup>
            <FieldSeparator />
            <FieldGroup>
              <FieldSet>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={defaultValues?.location}
                  placeholder="Event location..."
                />
              </FieldSet>
            </FieldGroup>
            <FieldSeparator />
            <FieldGroup>
              <FieldSet>
                <Label htmlFor="eventDate">Date and Time</Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="datetime-local"
                  defaultValue={defaultValues?.eventDate}
                  placeholder="Select event date and time..."
                />
              </FieldSet>
            </FieldGroup>
            <FieldSeparator />
            <FieldGroup>
              <FieldSet>
                <Label htmlFor="rsvpDeadline">RSVP Deadline</Label>
                <Input
                  id="rsvpDeadline"
                  name="rsvpDeadline"
                  type="datetime-local"
                  required
                  defaultValue={defaultValues?.rsvpDeadline}
                  placeholder="Select RSVP deadline..."
                />
              </FieldSet>
            </FieldGroup>
            <div className="flex items-center justify-end gap-3">
              <Button type="submit">{submitLabel}</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={cancelHref}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
