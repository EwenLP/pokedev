import { Navigate } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../utils/auth";

export default function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}