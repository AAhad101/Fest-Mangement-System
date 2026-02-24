import React from 'react';
import {Link} from 'react-router-dom';
import {Calendar, MapPin, Tag} from 'lucide-react';

const EventCard = ({event}) => {
    return (
        <div className="event-card">
            <div className="event-card-header">
                <span className={`status-badge ${event.status.toLowerCase()}`}>{event.status}</span>
                <span className="category-tag">{event.category}</span>
            </div>
            <h3>{event.name}</h3>
            <p className="organizer-name">by {event.organizer?.organizerName}</p>
            
            <div className="event-details">
                <div className="detail-item">
                    <Calendar size={14} />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                    <Tag size={14} />
                    <span>{event.eventType}</span>
                </div>
            </div>

            <Link to={`/events/${event._id}`} className="view-btn">View Details</Link>
        </div>
    );
};

export default EventCard;