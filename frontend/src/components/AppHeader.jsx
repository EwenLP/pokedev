import { Link, useLocation, useNavigate } from "react-router-dom";
import { logout, isAuthenticated } from "../utils/auth";

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated()) {
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const navClass = (path) =>
    `px-3 py-2 rounded ${location.pathname.startsWith(path) ? "bg-indigo-600" : "bg-slate-700"}`;

  return (
    <header className="mb-6 flex flex-wrap gap-3 items-center justify-between">
      <nav className="flex gap-3">
        <Link className={navClass("/pokedex")} to="/pokedex">
          Pokédex
        </Link>
        <Link className={navClass("/team")} to="/team">
          Team
        </Link>
        <Link className={navClass("/profil")} to="/profil">
          Profil
        </Link>
      </nav>
      <button className="px-3 py-2 rounded bg-red-700 hover:bg-red-600" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}
