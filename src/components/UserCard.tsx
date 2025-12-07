import { User } from '../types/user.types';

type UserCardProps = {
  user: User;
};

export default function UserCard({ user }: UserCardProps) {
  return (
    <div
      key={user.id}
      className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-900">
          {user.name}
        </span>
      </div>
    </div>
  );
}
