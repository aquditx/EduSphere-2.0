import Badge from "@/components/common/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import EmptyState from "@/components/ui/EmptyState.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import { useInstructorNotifications, useMarkNotificationRead } from "@/hooks/useInstructorHooks.js";

function NotificationRow({ notification, onMarkRead }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-950">{notification.title}</p>
          <p className="mt-2 text-sm text-slate-600">{notification.body}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">{notification.time}</span>
          {!notification.read ? <Badge className="mt-2 bg-brand-50 text-brand-700">New</Badge> : null}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        {!notification.read ? (
          <Button variant="secondary" onClick={() => onMarkRead(notification.id)}>
            Mark as read
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function InstructorNotificationsPage() {
  const notificationsQuery = useInstructorNotifications();
  const markReadMutation = useMarkNotificationRead();

  if (notificationsQuery.isLoading) {
    return (
      <PageShell title="Notifications" subtitle="Review enrollment, review, and platform alerts.">
        <Spinner label="Loading notifications" />
      </PageShell>
    );
  }

  if (notificationsQuery.isError) {
    return (
      <PageShell title="Notifications" subtitle="Review enrollment, review, and platform alerts.">
        <ErrorState message={notificationsQuery.error.message} onAction={() => notificationsQuery.refetch()} />
      </PageShell>
    );
  }

  const items = notificationsQuery.data;

  return (
    <PageShell title="Notifications" subtitle="Review enrollment, review, and platform alerts.">
      <section className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Inbox</h2>
          <p className="mt-2 text-sm text-slate-500">Mark items as read to clear your notification badge.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-slate-100 text-slate-700">{items.filter((item) => !item.read).length} unread</Badge>
          <Button variant="secondary" onClick={() => items.forEach((item) => !item.read && markReadMutation.mutate(item.id))}>
            Mark all read
          </Button>
        </div>
      </section>

      {items.length === 0 ? (
        <EmptyState title="No notifications" message="You’re all caught up. Check back when new events happen." />
      ) : (
        <div className="space-y-4">
          {items.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} onMarkRead={(id) => markReadMutation.mutate(id)} />
          ))}
        </div>
      )}
    </PageShell>
  );
}
