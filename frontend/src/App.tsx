import { useEffect, useState } from "react";
import axios from "axios";
// import "./App.css";

function App() {
  const [data, setData] = useState<{ test: string }[]>([]);

  useEffect(() => {
    axios.defaults.headers.get["Content-Type"] = "application/json";

    axios
      .get("http://localhost:8080/api/test")
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      {data.map((item, index) => (
        <li key={index}>{item.test}</li>
      ))}
    </div>
  );
}

export default App;
