import { Routes, Route, Navigate } from "react-router-dom";
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
import LocationManagementPage from "./pages/LocationManagementPage";
import FoundItemPage from "./pages/FoundItemPage";
import SelfServeLostItemPage from "./pages/SelfServeLostItemPage";
import { useSelfServeMode } from "./lib/selfServeMode";

function App() {
  return (
    <Layout>
      <AllRoutes />
    </Layout>
  );
}

const AllRoutes = () => {
  const computerName = localStorage.getItem("computerName") || "";
  const selfServeEnabled = useSelfServeMode();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <AmaanatPage />
          </StaffRoute>
        }
      />
      <Route
        path="/lost-items-list"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <LostItems />
          </StaffRoute>
        }
      />
      <Route
        path="/found-items-list"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <FoundItems />
          </StaffRoute>
        }
      />
      <Route
        path="/found-item/:foundItemId"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <FoundItemPage />
          </StaffRoute>
        }
      />
      <Route
        path="/lost-item-form"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <LostItemForm />
          </StaffRoute>
        }
      />
      <Route
        path="/found-item-form"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <FoundItemForm />
          </StaffRoute>
        }
      />
      <Route
        path="/amaanat/:userId"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <AmaanatUserPage />
          </StaffRoute>
        }
      />
      <Route
        path="/amaanat/sign-up"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <AmaanatSignUpForm />
          </StaffRoute>
        }
      />
      <Route
        path="/amaanat/add-items/:userId"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <AmaanatAddItemsForm computerName={computerName} />
          </StaffRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <Dashboard />
          </StaffRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <SettingsPage />
          </StaffRoute>
        }
      />
      <Route
        path="/location-settings"
        element={
          <StaffRoute selfServeEnabled={selfServeEnabled}>
            <LocationManagementPage />
          </StaffRoute>
        }
      />
      <Route
        path="/kiosk/lost-report"
        element={
          <SelfServeRoute selfServeEnabled={selfServeEnabled}>
            <SelfServeLostItemPage />
          </SelfServeRoute>
        }
      />
      <Route
        path="*"
        element={
          <Navigate
            to={selfServeEnabled ? "/kiosk/lost-report" : "/dashboard"}
            replace
          />
        }
      />
    </Routes>
  );
};

function StaffRoute({
  children,
  selfServeEnabled,
}: {
  children: JSX.Element;
  selfServeEnabled: boolean;
}) {
  if (selfServeEnabled) {
    return <Navigate to="/kiosk/lost-report" replace />;
  }

  return children;
}

function SelfServeRoute({
  children,
  selfServeEnabled,
}: {
  children: JSX.Element;
  selfServeEnabled: boolean;
}) {
  if (!selfServeEnabled) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default App;
