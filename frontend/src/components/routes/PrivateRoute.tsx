// src/components/Routes/PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

// Replace this with your actual auth check (e.g., from context, Redux, or localStorage)
const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token"); // or any flag you set on login
};

const PrivateRoute: React.FC<Props> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
