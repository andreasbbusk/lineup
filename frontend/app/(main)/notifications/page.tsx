import { NotificationsPage } from "@/app/modules/features/notifications/components/notifications-page";
import { PageTransition } from "@/app/modules/components/page-transition";

export default function NotificationsRoute() {
  return (
    <PageTransition>
      <NotificationsPage />
    </PageTransition>
  );
}
