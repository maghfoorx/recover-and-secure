import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom"
import LostProperty from "./components/LostProperty";
import Amaanat from "./components/Amaanat";

function App() {

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<LostProperty />} />
        <Route path="/amaanat" element={<Amaanat />} />
      </Routes>
    </div>
  );
}

export default App;
