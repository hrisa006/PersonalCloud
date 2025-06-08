import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

const PrivateRoute: React.FC<Props> = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
