import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom"
import LostItemForm from "./Pages/LostItemForm";
import LostPropertyPage from "./Pages/LostPropertyPage";
import AmaanatPage from "./Pages/AmaanatPage";
import FoundItemForm from "./Pages/FoundItemForm";

function App() {

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<LostPropertyPage />} />
        <Route path="/amaanat" element={<AmaanatPage />} />
        <Route path="/lost-item-form" element={<LostItemForm />} />
        <Route path="/found-item-form" element={<FoundItemForm />} />
      </Routes>
    </div>
  );
}

export default App;
