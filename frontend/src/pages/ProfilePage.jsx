import { UserCircle2, ShieldCheck } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-green-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700">
            <UserCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-600">
              Manage your account and keep your farm details up to date.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-green-700">
          <ShieldCheck size={18} />
          <h3 className="font-semibold">Account overview</h3>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          This page is ready for future profile customization and account
          settings.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
