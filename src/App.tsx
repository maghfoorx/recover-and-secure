import NavBar from "./components/NavBar";
import { Routes, Route } from "react-router-dom"
import LostItemForm from "./Pages/LostItemForm";
import LostPropertyPage from "./Pages/LostPropertyPage";
import AmaanatPage from "./Pages/amaanat/AmaanatPage";
import FoundItemForm from "./Pages/FoundItemForm";
import "./styles/globals.css"
import AmaanatUserPage from "./Pages/amaanat-user/AmaanatUserPage";

function App() {

  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<LostPropertyPage />} />
        <Route path="/amaanat" element={<AmaanatPage />} />
        <Route path="/lost-item-form" element={<LostItemForm />} />
        <Route path="/found-item-form" element={<FoundItemForm />} />
        <Route path="/amaanat/:userId" element={<AmaanatUserPage />}/>
      </Routes>
    </div>
  );
}

export default App;
