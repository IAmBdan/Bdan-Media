import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

interface Profile {
    username: string;
    name: string;
    role: string;
    created_at: string;
    email?: string;
    followers?: { id: number | string; username: string }[];
    following?: { id: number | string; username: string }[];
}

interface MediaItem {
    id: number;
    s3_key: string;
    type: string;
    uploaded_at: string;
}

const ProfilePage: React.FC = () => {
    const { user, logout, isLoggedIn } = useAuth();
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState<{ id: number; username: string }[]>([]);
    const [newFollower, setNewFollower] = useState('');

    useEffect(() => {
        const fetchProfileAndMedia = async () => {
            try {
                const profileResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/users/profile/${username}`
                );
                setProfile(profileResponse.data);

                const mediaResponse = await axios.get(
                    `${process.env.REACT_APP_API_BASE_URL}/api/users/${profileResponse.data.id}/content`
                );
                setMedia(mediaResponse.data);

                if (profileResponse.data.followers) {
                    setFollowers(profileResponse.data.followers);
                }
            } catch (error) {
                console.error('Error fetching profile or media:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileAndMedia();
    }, [username]);

    const handleAddFollower = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFollower) {
            alert("Enter a username to add!");
            return;
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/users/${user?.id}/followers`,
                { username: newFollower },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
    
            const follower = { id: response.data.followerId, username: newFollower };
            setFollowers([...followers, follower]);
    
            // Update the "following" list of the user being followed
            setProfile((prevProfile) => {
                if (prevProfile) {
                    return {
                        ...prevProfile,
                        following: [
                            ...(prevProfile.following || []),
                            { id: user?.id || '', username: user?.username || '' },
                        ],
                    };
                }
                return prevProfile;
            });
    
            setNewFollower("");
            alert("Follower added successfully!");
        } catch (error) {
            console.error("Error adding follower:", error);
            alert("Failed to add follower.");
        }
    };

    const handleRemoveFollower = async (followerId: number) => {
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_BASE_URL}/api/users/${user?.id}/followers/${followerId}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
    
            setFollowers(followers.filter((follower) => follower.id !== followerId));
    
            // Update the "following" list of the user being unfollowed
            setProfile((prevProfile) => {
                if (prevProfile) {
                    return {
                        ...prevProfile,
                        following: (prevProfile.following || []).filter(
                            (f) => String(f.id) !== String(user?.id) // Convert both to strings for comparison
                        ),
                    };
                }
                return prevProfile;
            });
    
            alert("Follower removed successfully!");
        } catch (error) {
            console.error("Error removing follower:", error);
            alert("Failed to remove follower.");
        }
    };

    const handleEdit = () => {
        navigate(`/profile/${username}/edit`);
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!profile) {
        return <p>User not found.</p>;
    }

    return (
        <div className="profile-container">
            <h1 className="profile-name">{profile.name || profile.username}</h1>
            <p className="profile-role">Role: {profile.role}</p>
            {isLoggedIn && user?.username === profile.username && (
                <p className="profile-email">Email: {profile.email}</p>
            )}

            <div>
                <h3 className="profile-follow-section">Followers</h3>
                {followers.length > 0 ? (
                    <ul className="profile-follow-list">
                        {followers.map((follower) => (
                            <li key={follower.id}>
                                <a className="profile-link" href={`/profile/${follower.username}`}>
                                    {follower.username}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No followers yet.</p>
                )}
            </div>

            <div>
                <h3 className="profile-follow-section">Following</h3>
                {profile.following && profile.following.length > 0 ? (
                    <ul className="profile-follow-list">
                        {profile.following.map((followed) => (
                            <li key={followed.id}>
                                <a className="profile-link" href={`/profile/${followed.username}`}>
                                    {followed.username}
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Not following anyone yet.</p>
                )}
            </div>

            {isLoggedIn && user?.role === 'wizard' && user?.username === profile.username && (
                <div className="manage-followers-section">
                    <h3>Manage Followers</h3>
                    <form onSubmit={handleAddFollower} className="manage-followers-form">
                        <input
                            type="text"
                            placeholder="Enter username to add"
                            value={newFollower}
                            onChange={(e) => setNewFollower(e.target.value)}
                            className="profile-input"
                        />
                        <button type="submit" className="profile-button">
                            Add Follower
                        </button>
                    </form>

                    <ul className="profile-follow-list">
                        {followers.map((follower) => (
                            <li key={follower.id}>
                                {follower.username}
                                <button
                                    onClick={() => handleRemoveFollower(follower.id)}
                                    className="profile-button-remove"
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="profile-media-section">
                <h3>Uploaded Media</h3>
                {media.length > 0 ? (
                    <div className="profile-media-grid">
                        {media.map((item) => (
                            <a
                                key={item.id}
                                href={`https://${process.env.REACT_APP_S3_BUCKET}/${item.s3_key}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="profile-media-item"
                            >
                                <p>{item.type}</p>
                                <p>{new Date(item.uploaded_at).toLocaleDateString()}</p>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p>No uploaded media yet.</p>
                )}
            </div>

            {isLoggedIn && user?.username === profile.username && (
                <div className="profile-action-buttons">
                    <button onClick={handleEdit} className="profile-edit-button">
                        Edit Profile
                    </button>
                    <button onClick={logout} className="profile-logout-button">
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;