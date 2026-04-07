import { useState } from "react";
import Button from "@/components/ui/Button.jsx";
import ErrorState from "@/components/ui/ErrorState.jsx";
import Spinner from "@/components/ui/Spinner.jsx";
import Tabs from "@/components/ui/Tabs.jsx";
import { PageShell } from "@/components/layout/PageShell.jsx";
import { useInstructorProfile, useUpdateInstructorProfile } from "@/hooks/useInstructorHooks.js";

const tabItems = [
  { label: "Profile", value: "profile" },
  { label: "Notifications", value: "notifications" },
  { label: "Payment", value: "payment" },
  { label: "Account", value: "account" },
];

function Section({ title, children }) {
  return (
    <div className="surface p-6">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

export default function InstructorSettingsPage() {
  const [selectedTab, setSelectedTab] = useState("profile");
  const profileQuery = useInstructorProfile();
  const updateProfile = useUpdateInstructorProfile();

  if (profileQuery.isLoading) {
    return (
      <PageShell title="Settings" subtitle="Manage your instructor profile, notifications, payments, and account.">
        <Spinner label="Loading profile settings" />
      </PageShell>
    );
  }

  if (profileQuery.isError) {
    return (
      <PageShell title="Settings" subtitle="Manage your instructor profile, notifications, payments, and account.">
        <ErrorState message={profileQuery.error.message} onAction={() => profileQuery.refetch()} />
      </PageShell>
    );
  }

  const profile = profileQuery.data;

  return (
    <PageShell title="Settings" subtitle="Manage your instructor profile, notifications, payments, and account.">
      <Tabs items={tabItems} value={selectedTab} onChange={setSelectedTab} />
      <div className="mt-6 space-y-6">
        {selectedTab === "profile" && (
          <Section title="Profile">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">Display name</label>
                <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" value={profile.name} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Headline</label>
                <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" value={profile.headline} readOnly />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Bio</label>
              <textarea rows={4} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" value={profile.bio || ""} readOnly />
            </div>
          </Section>
        )}

        {selectedTab === "notifications" && (
          <Section title="Notifications">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-950">Email notifications</p>
                <p className="mt-2 text-sm text-slate-600">New enrollment, review, and weekly summary toggles are managed by backend.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-950">In-app notifications</p>
                <p className="mt-2 text-sm text-slate-600">New course activity appears in your instructor inbox.</p>
              </div>
            </div>
          </Section>
        )}

        {selectedTab === "payment" && (
          <Section title="Payment">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-950">Payout method</p>
                <p className="mt-2 text-sm text-slate-600">Stripe Connect status: connected</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-950">Tax information</p>
                <p className="mt-2 text-sm text-slate-600">W-9 / W-8BEN details are managed through the payout provider.</p>
              </div>
            </div>
          </Section>
        )}

        {selectedTab === "account" && (
          <Section title="Account">
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-950">Change email</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-medium text-slate-950">Change password</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-950">Delete account</p>
                    <p className="mt-2 text-sm text-slate-600">Delete your instructor access and associated data.</p>
                  </div>
                  <Button variant="danger">Delete account</Button>
                </div>
              </div>
            </div>
          </Section>
        )}
      </div>
    </PageShell>
  );
}
