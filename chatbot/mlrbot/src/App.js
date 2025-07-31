import { BrowserRouter, Route, Routes } from "react-router-dom";
import "../src/Pages/Home/Home";
import Home from "../src/Pages/Home/Home";
import "./App.css";
function App() {
  return (
    <div className="App">
      <>
        <BrowserRouter>
          <Routes>
             <Route path="/" element={<Home />} />
            <Route path="/Home" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </>
    </div>
  );
}

export default App;
