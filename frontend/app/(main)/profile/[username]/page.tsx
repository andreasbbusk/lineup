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
        Public profile view with upcoming sections for posts, events and
        feedback.
      </p>
    </main>
  );
}

