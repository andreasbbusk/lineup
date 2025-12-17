import { NotificationsPage } from "@/app/modules/features/notifications/components/notifications-page";
import { PageTransition } from "@/app/modules/components/page-transition";
import { ErrorBoundary } from "@/app/modules/components/error-boundary";

export default function NotificationsRoute() {
  return (
    <PageTransition>
      <ErrorBoundary>
        <NotificationsPage />
      </ErrorBoundary>
    </PageTransition>
  );
}