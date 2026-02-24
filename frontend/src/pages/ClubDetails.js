import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import {Heart, Mail, Info, Calendar} from 'lucide-react';
import {toast} from 'react-hot-toast';

const ClubDetails = () => {
    const {id} = useParams();
    const [data, setData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try{
                const res = await api.get(`/clubs/${id}`);
                setData(res.data);
                
                const user = JSON.parse(localStorage.getItem('user'));
                setIsFollowing(user.followedClubs?.includes(id));
            } 
            catch(err){
                toast.error("Club details not found");
            }
        };
        fetchDetails();
    }, [id]);

    const handleFollow = async () => {
        try{
            const res = await api.post('/users/follow', { organizerId: id });
            setIsFollowing(res.data.followedClubs.includes(id));
            toast.success(res.data.message);
            
            const user = JSON.parse(localStorage.getItem('user'));
            user.followedClubs = res.data.followedClubs;
            localStorage.setItem('user', JSON.stringify(user));
        } 
        catch(err){
            toast.error("Action failed");
        }
    };

    if(!data) return <div className="loading">Loading club...</div>;

    return (
        <div className="club-details-container">
            <header className="club-profile-header">
                <div className="header-main">
                    <h1>{data.club.organizerName}</h1>
                    <span className="category-tag">{data.club.category}</span>
                </div>
                <button 
                    className={`follow-btn ${isFollowing ? 'active' : ''}`}
                    onClick={handleFollow}
                >
                    <Heart size={18} fill={isFollowing ? "currentColor" : "none"} />
                    {isFollowing ? 'Following' : 'Follow Club'}
                </button>
            </header>

            <div className="club-info-grid">
                <div className="info-card">
                    <h3><Info size={18} /> About</h3>
                    <p>{data.club.description}</p>
                </div>
                <div className="info-card">
                    <h3><Mail size={18} /> Contact</h3>
                    <p>{data.club.contactEmail}</p>
                </div>
            </div>

            <section className="events-timeline">
                <h2 className="timeline-title">Upcoming Events</h2>
                <div className="events-grid">
                    {data.events.upcoming.length > 0 
                        ? data.events.upcoming.map(e => <EventCard key={e._id} event={e} />)
                        : <p className="empty-msg">No upcoming events scheduled.</p>}
                </div>

                <h2 className="timeline-title past">Past Events</h2>
                <div className="events-grid past-grid">
                    {data.events.past.length > 0 
                        ? data.events.past.map(e => <EventCard key={e._id} event={e} />)
                        : <p className="empty-msg">No past events found.</p>}
                </div>
            </section>
        </div>
    );
};

export default ClubDetails;