import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DiseaseDetectionPage from "./pages/DiseaseDetectionPage";
import MyCropsPage from "./pages/MyCropsPage";
import SpraySchedulerPage from "./pages/SpraySchedulerPage";
import WeatherPage from "./pages/WeatherPage";
import HistoryReportsPage from "./pages/HistoryReportsPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="min-h-screen p-6 lg:ml-72">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />

        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/disease-detection"
              element={<DiseaseDetectionPage />}
            />
            <Route path="/my-crops" element={<MyCropsPage />} />
            <Route path="/spray-scheduler" element={<SpraySchedulerPage />} />
            <Route path="/weather-advisory" element={<WeatherPage />} />
            <Route path="/history-reports" element={<HistoryReportsPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
