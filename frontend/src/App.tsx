import { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from './components/SearchForm/SearchForm';
import './App.css';

function App() {
  const [data, setData] = useState<{ test: string }[]>([]);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_URL || 'http://localhost:8081';
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
    <div className="app-container">
      <header>
        <h1>Personal Cloud</h1>
      </header>
      
      <main>
        <SearchBar />
        
        <div className="test-data">
          <h2>Test Data</h2>
          <ul>
            {data.map((item, id) => (
              <li key={id}>{item.test}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;