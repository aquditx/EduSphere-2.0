const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
];

export default function AvatarStack() {
  return (
    <div className="flex items-center">
      {avatars.map((avatar, index) => (
        <img
          key={avatar}
          src={avatar}
          alt="Student avatar"
          className={`h-10 w-10 rounded-full border-2 border-white object-cover ${index ? "-ml-3" : ""}`}
        />
      ))}
      <div className="-ml-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-950 text-xs font-semibold text-white">
        +12k
      </div>
    </div>
  );
}

