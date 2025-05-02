import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState<{ test: string }[]>([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_URL;
    axios
      .get(`${apiUrl}/api/test`)
      .then((response) => {
        setData(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      {data.map((item, id) => (
        <li key={id}>{item.test}</li>
      ))}
    </div>
  );
}

export default App;