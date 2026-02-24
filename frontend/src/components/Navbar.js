import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    Search, 
    Users, 
    User, 
    LogOut, 
    PlusSquare, 
    ShieldCheck 
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/">Felicity 2026</Link>
            </div>

            <div className="nav-links">
                {/* Participant Navigation */}
                {user.role === 'Participant' && (
                    <>
                        <Link to="/my-events"><LayoutDashboard size={18}/> Dashboard</Link>
                        <Link to="/browse"><Search size={18}/> Browse Events</Link>
                        <Link to="/clubs"><Users size={18}/> Clubs</Link>
                    </>
                )}

                {/* Organizer Navigation */}
                {user.role === 'Organizer' && (
                    <>
                        <Link to="/organizer/dashboard"><LayoutDashboard size={18}/> Dashboard</Link>
                        <Link to="/organizer/create"><PlusSquare size={18}/> Create Event</Link>
                        <Link to="/organizer/approvals">Approvals</Link>
                    </>
                )}

                {/* Admin Navigation: Simplified per your request */}
                {user.role === 'Admin' && (
                    <>
                        <Link to="/admin/dashboard"><ShieldCheck size={18}/> Dashboard</Link>
                        <Link to="/admin/manage-clubs"><Users size={18}/> Manage Organizers</Link>
                    </>
                )}
            </div>

            <div className="nav-user">
                {/* Profile link hidden for Admin per your request */}
                {user.role !== 'Admin' && (
                    <Link to="/profile" className="profile-link">
                        <User size={18}/> Profile
                    </Link>
                )}
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18}/> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;