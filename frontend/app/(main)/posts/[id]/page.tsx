interface PostDetailsPageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PostDetailsPageProps) {
  return (
    <main className="space-y-4">
      <h1 className="text-h1 font-semibold">Post</h1>
      <p className="text-body text-grey">
        Shows details for post #{params.id}. Content, comments and actions will
        appear here.
      </p>
    </main>
  );
}

