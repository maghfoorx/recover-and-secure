import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom"
import LostItemForm from "./components/LostItemForm";
import LostPropertyPage from "./Pages/LostPropertyPage";
import AmaanatPage from "./Pages/AmaanatPage";

function App() {

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<LostPropertyPage />} />
        <Route path="/amaanat" element={<AmaanatPage />} />
        <Route path="/lost-item-form" element={<LostItemForm />} />
      </Routes>
    </div>
  );
}

export default App;
