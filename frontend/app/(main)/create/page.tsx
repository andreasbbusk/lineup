"use client";

import { CreateForm } from "@/app/modules/features/posts/components/create-form";
import { PageTransition } from "@/app/modules/components/page-transition";

export default function Page() {
  return (
    <PageTransition>
      <main className="bg-white h-[calc(100dvh-64px)] max-w-200 mx-auto">
        <CreateForm />
      </main>
    </PageTransition>
  );
}
