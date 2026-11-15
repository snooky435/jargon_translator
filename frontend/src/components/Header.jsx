// The bar at the top of every page, with the logo and navigation links.
import { NavLink } from "react-router-dom";

// NavLink tells us if its link is the current page (isActive),
// so we can make the current page's link stand out.
function linkClass({ isActive }) {
  return isActive
    ? "rounded-lg bg-white/10 px-3 py-1.5 text-white"
    : "rounded-lg px-3 py-1.5 text-gray-400 hover:text-white";
}

export default function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <span className="text-2xl">💼</span>
          Jargon Translator
        </NavLink>
        <nav className="flex gap-1 text-sm">
          <NavLink to="/" end className={linkClass}>
            Translate
          </NavLink>
          <NavLink to="/dictionary" className={linkClass}>
            Dictionary
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
