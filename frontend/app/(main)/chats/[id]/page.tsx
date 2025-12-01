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
      <h1 className="text-h1 font-semibold">Samtale</h1>
      <p className="text-body text-grey">
        Viser detaljer for samtale #{params.id}. Indholdet bliver dynamisk, når
        beskedsystemet er på plads.
      </p>
    </main>
  );
}

