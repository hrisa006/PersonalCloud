import '@ant-design/v5-patch-for-react-19';
import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/routes/PrivateRoute";

import Login from "./components/pages/login/Login";
import Register from "./components/pages/register/Register";
import Main from "./components/pages/main/Main";
import { injectCssVariables } from "./styles/theme";
import "./App.css";

function App() {
  useEffect(() => {
    injectCssVariables();
  }, []);

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
