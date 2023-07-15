import NavBar from "./components/NavBar";
import { Routes, Route, Link } from "react-router-dom"
import LostItemForm from "./Pages/LostItemForm";
import LostPropertyPage from "./Pages/LostPropertyPage";
import AmaanatPage from "./Pages/amaanat/AmaanatPage";
import FoundItemForm from "./Pages/FoundItemForm";
import "./styles/globals.css"
import AmaanatUserPage from "./Pages/amaanat-user/AmaanatUserPage";
import AmaanatSignUpForm from "./Pages/amaanat-sign-up/AmaanatSignUpForm";
import AmaanatAddItemsForm from "./Pages/amaanat-add-items/AmaanatAddItemsForm";
import { useState } from "react";
import Dashboard from "./Pages/dashboard/Dashboard";

function App() {
  const [computerName, setComputerName] = useState('');

  const handleSelectChange = (event: any) => {
    setComputerName(event.target.value);
  };

  return (
    <div className="App">
      <div className="settings">
      <select value={computerName} onChange={handleSelectChange} className="laptop-name">
        <option value="">Name The Computer</option>
        <option value="Masroor">Masroor</option>
        <option value="Tahir">Tahir</option>
        <option value="Nasir">Nasir</option>
        <option value="Basheer">Basheer</option>
        <option value="Noor">Noor</option>
      </select>
      <Link to={"/dashboard"}>📊</Link>
    </div>
      <NavBar />
      <Routes>
        <Route path="/" element={<LostPropertyPage />} />
        <Route path="/amaanat" element={<AmaanatPage computerName={computerName}/>} />
        <Route path="/lost-item-form" element={<LostItemForm />} />
        <Route path="/found-item-form" element={<FoundItemForm />} />
        <Route path="/amaanat/:userId" element={<AmaanatUserPage />}/>
        <Route path="/amaanat/sign-up" element={<AmaanatSignUpForm />}/>
        <Route path="/amaanat/add-items/:userId" element={<AmaanatAddItemsForm computerName={computerName}/>}/>
        <Route path="/dashboard" element={<Dashboard />}/>
      </Routes>
    </div>
  );
}

export default App;
