import React, {useState, useEffect} from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import {Search, Filter} from 'lucide-react';

const BrowseEvents = () => {
    const [trending, setTrending] = useState([]);
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [followedOnly, setFollowedOnly] = useState(false); // New state for Section 9.3
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, [followedOnly]); // Refetch when toggle changes

    const fetchEvents = async (query = '') => {
        try {
            // Append followedOnly to existing search query
            const baseQuery = query || `?search=${search}`;
            const finalQuery = `${baseQuery}&followedOnly=${followedOnly}`;
            
            const res = await api.get(`/events/browse${finalQuery}`);
            setTrending(res.data.trending);
            setEvents(res.data.allEvents);
        } 
        catch(err){
            console.error("Error fetching events", err);
        } 
        finally{
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchEvents(`?search=${search}`);
    };

    if(loading) return <div>Loading Events...</div>;

    return (
        <div className="browse-container">
            {/* Trending Section */}
            <section className="trending-section">
                <h2> Trending Events</h2>
                <div className="trending-grid">
                    {trending.map((event, index) => (
                        <div key={event._id} className="trending-card">
                            <span className="rank">#{index + 1}</span>
                            <h4>{event.name}</h4>
                            <p>{event.recentCount} new signups!</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Search & Filter Bar */}
            <form className="search-bar" onSubmit={handleSearch}>
                <div className="input-wrapper">
                    <Search size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by event or club..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                {/* Followed Clubs Filter Toggle */}
                <div className="filter-toggle">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            checked={followedOnly}
                            onChange={(e) => setFollowedOnly(e.target.checked)}
                        />
                        Followed Clubs Only
                    </label>
                </div>

                <button type="submit">Search</button>
            </form>

            {/* All Events Grid */}
            <section className="events-grid-section">
                <h2>All Events</h2>
                <div className="events-grid">
                    {events.map(event => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BrowseEvents;