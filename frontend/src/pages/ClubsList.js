import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api/axios';
import {Users, ChevronRight} from 'lucide-react';
import {toast} from 'react-hot-toast';

const ClubsList = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClubs = async () => {
            try{
                const res = await api.get('/clubs');
                setClubs(res.data);
            } 
            catch(err){
                toast.error("Failed to load clubs");
            } 
            finally{
                setLoading(false);
            }
        };
        fetchClubs();
    }, []);

    if(loading) return <div className="loading">Discovering Clubs...</div>;

    return (
        <div className="clubs-container">
            <h1 className="section-title">Clubs & Organizers</h1>
            <div className="clubs-grid">
                {clubs.map(club => (
                    <div key={club._id} className="club-card" onClick={() => navigate(`/clubs/${club._id}`)}>
                        <div className="club-card-content">
                            <div className="club-icon-bg">
                                <Users size={24} color="#007bff" />
                            </div>
                            <div className="club-text">
                                <h3>{club.organizerName}</h3>
                                <span className="category-pill">{club.category}</span>
                                <p className="line-clamp">{club.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="arrow-icon" size={20} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClubsList;