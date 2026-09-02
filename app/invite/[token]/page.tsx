import { InviteRsvpContent } from "@/components/invite-rsvp-content";
import { getSession } from "@/lib/auth/server";

export default async function InvitePage({
    params,
    searchParams
}: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{submitted?: string}>
}) {
    const { token } = await params;
    const query = await searchParams;

    return (
        <InviteRsvpContent
            token={token}
            submitted={query.submitted === '1'}
        />
    );
}