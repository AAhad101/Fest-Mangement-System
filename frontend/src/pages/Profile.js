import React, {useEffect, useState} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {User, Mail, Phone, Heart} from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try{
                // This is the call that will show up in your Network Tab!
                const res = await api.get('/users/profile');
                setProfile(res.data);
            } 
            catch(err){
                toast.error("Failed to load profile");
            } 
            finally{
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <div className="loading">Loading Profile...</div>;

    return (
        <div className="profile-container">
            <h2>Your Profile</h2>
            <div className="profile-card">
                <div className="info-group">
                    <User size={20} />
                    <span><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</span>
                </div>
                <div className="info-group">
                    <Mail size={20} />
                    <span><strong>Email:</strong> {profile?.email}</span>
                </div>
                <div className="info-group">
                    <Phone size={20} />
                    <span><strong>Contact:</strong> {profile?.contactNumber || 'Not provided'}</span>
                </div>
                
                <div className="interests-section">
                    <h3>Interests</h3>
                    <div className="tags">
                        {profile?.interests?.length > 0 
                            ? profile.interests.map((int, i) => <span key={i} className="tag">{int}</span>)
                            : <span>No interests added yet.</span>
                        }
                    </div>
                </div>

                <div className="clubs-section">
                    <h3>Followed Clubs</h3>
                    <div className="club-list">
                        {profile?.followedClubs?.length > 0 
                            ? profile.followedClubs.map(club => (
                                <div key={club._id} className="club-item">
                                    {club.organizerName} ({club.category})
                                </div>
                              ))
                            : <span>You aren't following any clubs yet.</span>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;