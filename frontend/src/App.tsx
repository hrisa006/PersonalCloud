import FileExplorer from "./pages/FileExplorer";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { FaCloud } from "react-icons/fa";
// import SearchBar from './components/SearchForm/SearchForm';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './components/Login/Login';
// import Register from './components/Register/Register';
import "./App.css";
import Main from "./pages/main/Main";

function App() {
  return (
    <div className="app">
      <Main></Main>

      {/* <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes> */}
    </div>
  );
}

export default App;
