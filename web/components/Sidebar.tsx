import Link from "next/link";
import { Home, Library, Calendar, Settings, User } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { name: "Inicio", href: "/", icon: Home },
    { name: "Tu Biblioteca", href: "/songs", icon: Library },
    { name: "Eventos", href: "/events", icon: Calendar },
    { name: "Admin", href: "/admin", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-50 border-r border-surface-100 p-6 z-40 hidden md:flex flex-col">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">
          PUCMM <span className="text-brand-blue-primary">Band</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:bg-surface-100 hover:text-text-primary rounded-md transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-surface-200">
        <Link href="/profile" className="flex items-center space-x-3 px-4 py-2 text-text-secondary hover:text-text-primary">
            <div className="w-8 h-8 rounded-full bg-brand-blue-primary flex items-center justify-center text-brand-yellow font-bold text-xs">
                JP
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">Juan Perez</span>
                <span className="text-xs text-text-tertiary">Saxofón Alto</span>
            </div>
        </Link>
      </div>
    </aside>
  );
}
