import React, {useEffect, useState} from 'react';
import api from '../api/axios';
import {toast} from 'react-hot-toast';
import {User, Mail, Phone, Heart, Edit2, Save, X} from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        contactNumber: '',
        interests: '' // Handled as comma-separated string for easy editing
    });

    const fetchProfile = async () => {
        try{
            const res = await api.get('/users/profile');
            setProfile(res.data);
            setFormData({
                firstName: res.data.firstName,
                lastName: res.data.lastName,
                contactNumber: res.data.contactNumber || '',
                interests: res.data.interests?.join(', ') || ''
            });
        } 
        catch(err){
            toast.error("Failed to load profile");
        } 
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Convert string "Music, Tech" -> ["Music", "Tech"]
            const interestArray = formData.interests
                .split(',')
                .map(i => i.trim())
                .filter(i => i !== "");

            const response = await api.put('/users/profile', {
                ...formData,
                interests: interestArray
            });

            toast.success(response.data.message);
            setIsEditing(false);
            fetchProfile(); // Refresh to show new data
        } catch (err) {
            // Improved error feedback
            const errorMsg = err.response?.data?.message || "Update failed";
            toast.error(errorMsg);
            console.error("Profile update error:", err.response?.data);
        }
    };

    if (loading) return <div className="loading">Loading Profile...</div>;

    return (
        <div className="profile-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Your Profile</h2>
                {!isEditing ? (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        <Edit2 size={18} /> Edit Profile
                    </button>
                ) : (
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                        <X size={18} /> Cancel
                    </button>
                )}
            </div>

            <div className="profile-card">
                {isEditing ? (
                    <form onSubmit={handleUpdate} className="edit-profile-form">
                        <label>First Name</label>
                        <input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                        
                        <label>Last Name</label>
                        <input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                        
                        <label>Contact Number</label>
                        <input value={formData.contactNumber} onChange={(e) => setFormData({...formData, contactNumber: e.target.value})} />
                        
                        <label>Interests (comma separated)</label>
                        <input value={formData.interests} onChange={(e) => setFormData({...formData, interests: e.target.value})} />
                        
                        <button type="submit" className="save-btn"><Save size={18} /> Save Changes</button>
                    </form>
                ) : (
                    <>
                        <div className="info-group">
                            <User size={20} />
                            <span><strong>Name:</strong> {profile?.firstName} {profile?.lastName}</span>
                        </div>
                        <div className="info-group">
                            <Mail size={20} />
                            <span><strong>Email:</strong> {profile?.email} (Non-Editable)</span>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;