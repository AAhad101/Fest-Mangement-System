import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import {Toaster} from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import EventCard from './components/EventCard';
import BrowseEvents from './pages/BrowseEvents';
import EventDetails from './pages/EventDetails';
import RegisterEvent from './pages/RegisterEvent';
import MyEvents from './pages/MyEvents';
import ClubsList from './pages/ClubsList';
import ClubDetails from './pages/ClubDetails';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateEvent from './pages/CreateEvent';
import EventParticipants from './pages/EventParticipants';
import EditEvent from './pages/EditEvent';
import AdminDashboard from './pages/AdminDashboard';
import ManageOrganizers from './pages/ManageOrganizers';
import PendingApprovals from './pages/PendingApprovals';
import QRScanner from './pages/QRScanner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Navbar /> {/* Navbar stays at the top */}
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['Participant']}>
                <div>Welcome to your Dashboard!</div>
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            <Route path="/browse" element={
              <ProtectedRoute>
                <BrowseEvents />
              </ProtectedRoute>
            } />

            <Route path="/events/:id" element={
              <ProtectedRoute allowedRoles={['Participant']}>
                <EventDetails />
              </ProtectedRoute>
            } />

            <Route path="/events/:id/register" element={
              <ProtectedRoute allowedRoles={['Participant']}>
                <RegisterEvent />
              </ProtectedRoute>
            } />

            <Route path="/my-events" element={
              <ProtectedRoute allowedRoles={['Participant']}>
                <MyEvents />
              </ProtectedRoute>
            } />

            <Route path="/clubs" element={
              <ProtectedRoute>
                <ClubsList />
              </ProtectedRoute>
            } />
      
            <Route path="/clubs/:id" element={
              <ProtectedRoute>
                <ClubDetails />
              </ProtectedRoute>
            } />

            <Route path="/organizer/dashboard" element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <OrganizerDashboard />
              </ProtectedRoute>
            } />

            <Route path="/organizer/create" element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <CreateEvent />
              </ProtectedRoute>
            } />

            <Route path="/organizer/event/:eventId/participants" element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <EventParticipants />
              </ProtectedRoute>
            } />

            <Route path="/organizer/event/:id/edit" element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <EditEvent />
              </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/manage-clubs" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <ManageOrganizers />
              </ProtectedRoute>
            } />

            <Route path="/organizer/approvals" element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <PendingApprovals />
              </ProtectedRoute>
            } />

            <Route path="/organizer/scan" element={
              <ProtectedRoute allowedRoles={['Organizer']}>
                <QRScanner />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
