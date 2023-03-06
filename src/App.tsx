import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom"
import LostProperty from "./components/LostProperty";
import Amaanat from "./components/Amaanat";
import LostItemForm from "./components/LostItemForm";

function App() {

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<LostProperty />} />
        <Route path="/amaanat" element={<Amaanat />} />
        <Route path="/lost-item-form" element={<LostItemForm />} />
      </Routes>
    </div>
  );
}

export default App;
