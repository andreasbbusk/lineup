import { NotificationsPage } from "@/app/modules/features/notifications/components/notifications-page";
import { ErrorBoundary } from "@/app/modules/components/error-boundary";

export default function NotificationsRoute() {
  return (
    <ErrorBoundary>
      <NotificationsPage />
    </ErrorBoundary>
  );
}

