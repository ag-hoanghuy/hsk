import { NavLink, Outlet, useLocation } from "react-router-dom";

const NAV = [
  { to: "/", label: "Bài học", end: true },
  { to: "/speaking", label: "Luyện nói" },
  { to: "/reading", label: "Luyện đọc" },
  { to: "/listening", label: "Luyện nghe" },
  { to: "/tests", label: "Kiểm tra" },
];

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-rose-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-2 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="font-han text-2xl font-bold text-rose-500">汉语</span>
            <span className="text-sm font-medium text-stone-500">Học tiếng Trung</span>
          </div>
          <nav className="flex flex-wrap gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    isActive || (item.end && pathname.startsWith("/lesson"))
                      ? "bg-rose-500 text-white shadow-card"
                      : "text-stone-600 hover:bg-rose-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
