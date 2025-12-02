interface MessageThreadPageProps {
  params: {
    id: string;
  };
}

export default function Page({
  params,
}: MessageThreadPageProps) {
  return (
    <main className="space-y-4">
      <h1 className="text-h1 font-semibold">Conversation</h1>
      <p className="text-body text-grey">
        Shows details for conversation #{params.id}. Content will be dynamic once
        the messaging system is in place.
      </p>
    </main>
  );
}

