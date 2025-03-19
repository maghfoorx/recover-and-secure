import { Routes, Route } from "react-router-dom";
import LostItemForm from "./pages/LostItemForm";
import AmaanatPage from "./pages/AmaanatPage";
import FoundItemForm from "./pages/FoundItemForm";
import AmaanatUserPage from "./pages/AmaanatUserPage";
import AmaanatSignUpForm from "./pages/AmaanatSignUpForm";
import AmaanatAddItemsForm from "./pages/AmaanatAddItemsForm";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import LostItems from "./components/LostItems";
import FoundItems from "./components/FoundItems";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Layout>
      <AllRoutes />
    </Layout>
  );
}

const AllRoutes = () => {
  const computerName = localStorage.getItem("computerName") || "";

  return (
    <Routes>
      <Route path="/" element={<AmaanatPage />} />
      <Route path="/lost-items-list" element={<LostItems />} />
      <Route path="/found-items-list" element={<FoundItems />} />
      <Route path="/lost-item-form" element={<LostItemForm />} />
      <Route path="/found-item-form" element={<FoundItemForm />} />
      <Route path="/amaanat/:userId" element={<AmaanatUserPage />} />
      <Route path="/amaanat/sign-up" element={<AmaanatSignUpForm />} />
      <Route
        path="/amaanat/add-items/:userId"
        element={<AmaanatAddItemsForm computerName={computerName} />}
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};

export default App;
