import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

const UserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [user, setUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: '',
        followers: [],
        following: [],
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get(`/api/users/${id}`);
                setUser(response.data);
                setFormData({
                    username: response.data.username,
                    email: response.data.email || '',
                    role: response.data.role,
                    followers: response.data.followers,
                    following: response.data.following,
                });
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        try {
            const response = await axios.put(`/api/users/${id}`, formData);
            setUser(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: '#333', borderRadius: '8px' }}>
            <h2>{user.username}'s Profile</h2>
            <div>
                {!isEditing ? (
                    <>
                        <p>Email: {user.email || 'Hidden'}</p>
                        <p>Role: {user.role}</p>
                        <p>Followers: {user.followers.length}</p>
                        <p>Following: {user.following.length}</p>
                        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
                    </>
                ) : (
                    <div>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Username"
                        />
                        <input
                            type="text"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                        />
                        <button onClick={handleUpdate}>Save</button>
                        <button onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
