import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Pokedex from "./pages/Pokedex.jsx";
import PokemonDetail from "./components/PokemonDetail.jsx";
import TeamBuilder from "./pages/TeamBuilder.jsx";
import Login from "./pages/Login.jsx";
import Profile from "./pages/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppHeader from "./components/AppHeader.jsx";

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <AppHeader />
      <Routes>
        <Route path="/" element={<Pokedex />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/pokedex" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
