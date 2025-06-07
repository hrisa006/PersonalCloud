

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { FaCloud } from "react-icons/fa";
// import SearchBar from './components/SearchForm/SearchForm';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/pages/login/Login";
import Register from "./components/pages/register/Register";
import "./App.css";
import PrivateRoute from "./components/routes/PrivateRoute";
import Main from "./components/pages/main/Main";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*"
          element={
            <PrivateRoute>
              <Main />
            </PrivateRoute>
          }
        />

        {/* Default to login */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </div>
  );
}

export default App;
