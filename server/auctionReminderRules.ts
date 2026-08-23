export function shouldSendAuctionReminder(input: { status: string; endsAt: number; reminderSentAt: number | null }, now: number) {
  return input.status === "live" && input.reminderSentAt === null && input.endsAt > now && input.endsAt <= now + 30 * 60 * 1000;
}
