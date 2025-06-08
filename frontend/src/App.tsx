// import SearchBar from './components/SearchForm/SearchForm';
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/routes/PrivateRoute";

import Login from "./components/pages/login/Login";
import Register from "./components/pages/register/Register";
import Main from "./components/pages/main/Main";

import "./App.css";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Main />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
