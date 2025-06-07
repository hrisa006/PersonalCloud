// App.tsx or Main.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";

function Main() {
  return (

      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path="/shared/*" element={<Dashboard />} />
        {/* Add "/search" later if needed */}
      </Routes>

  );
}

export default Main;
