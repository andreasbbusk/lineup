interface PostDetailsPageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PostDetailsPageProps) {
  return (
    <main className="space-y-4">
      <h1 className="text-h1 font-semibold">Opslag</h1>
      <p className="text-body text-grey">
        Viser detaljer for opslag #{params.id}. Her kommer indhold, kommentarer
        og handlinger.
      </p>
    </main>
  );
}

