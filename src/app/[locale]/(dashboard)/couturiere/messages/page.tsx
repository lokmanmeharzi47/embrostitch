import MessagingInterface from "@/components/shared/MessagingInterface";

export default async function CouturiereMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; recipient?: string; to?: string }>;
}) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="h-[calc(100vh-10rem)]">
      <MessagingInterface
        initialOrderId={resolvedSearchParams.orderId || null}
        initialRecipientId={resolvedSearchParams.recipient || resolvedSearchParams.to || null}
      />
    </div>
  );
}
