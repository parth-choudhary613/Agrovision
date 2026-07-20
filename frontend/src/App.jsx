import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
// import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';

// A Layout component to wrap protected content with the navigation
const DashboardLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        {/* <Navbar /> */}
        <main className="p-6">
          <Outlet /> {/* This renders the specific page like Dashboard */}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: No Navbar or Sidebar here */}
        <Route path="/" element={<Signup />} />
        {/* Protected Routes: Only accessible after login */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;