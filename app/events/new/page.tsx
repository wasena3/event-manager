import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEventAction } from "@/lib/actions/events";
import Link from "next/link";

export default async function NewEventPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Event</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEventAction}>
            <FieldGroup>
              <FieldSet>
                <Label>Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Date Night"
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
                  placeholder="Select event date and time..."
                />
                <FieldDescription>
                  Optional, you can leave this blank if you want to create a draft event.
                </FieldDescription>
              </FieldSet>
            </FieldGroup>

            <div className='flex items-center justify-end gap-3'>
                <Button type="submit">Create Event</Button>
                <Button type="button" variant='outline' asChild>
                    <Link href={"/dashboard"}>Cancel</Link>
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
