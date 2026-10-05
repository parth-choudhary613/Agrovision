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
    <div className="min-h-screen bg-[#F7F5EE] text-[#26332B] font-sans">
      {/* Fixed Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="min-h-screen p-4 sm:p-6 lg:p-8 lg:ml-72 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing & Authentication Portal */}
        <Route path="/" element={<Signup />} />

        {/* Protected Farmer Platform */}
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
