import { Routes, Route } from "react-router-dom";
import { FileSystemProvider } from "../../../contexts/FileSystemContext";

import Dashboard from "./Dashboard";

function Main() {
  return (
    <FileSystemProvider>
      <Routes>
        <Route path="/*" element={<Dashboard />} />
        <Route path="/shared/*" element={<Dashboard />} />
        {/* TODO Search */}
      </Routes>
    </FileSystemProvider>
  );
}

export default Main;
