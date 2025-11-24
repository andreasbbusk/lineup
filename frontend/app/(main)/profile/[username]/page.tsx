interface PublicProfilePageProps {
  params: {
    username: string;
  };
}

export default function Page({
  params,
}: PublicProfilePageProps) {
  return (
    <main className="space-y-4">
      <h1 className="text-h1 font-semibold">@{params.username}</h1>
      <p className="text-body text-grey">
        Offentlig profilvisning med kommende sektioner for opslag, events og
        feedback.
      </p>
    </main>
  );
}

