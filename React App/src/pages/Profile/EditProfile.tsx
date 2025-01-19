import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const EditProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
    });

    const [loading, setLoading] = useState(true); // Add a loading state

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
            });
            setLoading(false); // Stop loading once user data is loaded
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            alert('User not logged in');
            return;
        }
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/users/${user.id}`, formData);
            alert('Profile updated successfully');
            navigate(`/profile/${formData.username}`);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    if (loading) {
        return <div className="profile-container">Loading...</div>;
    }

    if (!user) {
        return <div className="profile-container">Please log in to edit your profile.</div>;
    }

    return (
        <div className="profile-container">
            <h2 className="profile-name">Edit Profile</h2>
            <form onSubmit={handleSubmit}>
                <div className="profile-input-group">
                    <label className="profile-label" htmlFor="username">Username:</label>
                    <input
                        id="username"
                        className="profile-input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                </div>
                <div className="profile-input-group">
                    <label className="profile-label" htmlFor="email">Email:</label>
                    <input
                        id="email"
                        className="profile-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>
                <div className="profile-action-buttons">
                    <button type="submit" className="profile-edit-button">Save Changes</button>
                    <button
                        type="button"
                        className="profile-logout-button"
                        onClick={() => navigate(`/profile/${user.username}`)}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;