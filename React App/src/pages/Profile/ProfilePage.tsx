import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

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

const css = `
  .divider { width: 32px; height: 2px; background: #4db0f2; margin: 12px 0 32px; }

  .profile-input {
    padding: 10px 14px;
    background: #0a0a0a;
    color: #c0c0c0;
    border: 1px solid #181818;
    border-radius: 3px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .profile-input:focus { border-color: #4db0f2; }

  .profile-btn {
    padding: 10px 24px;
    background: #0d0d0d;
    color: #6a6a6a;
    border: 1px solid #181818;
    border-radius: 3px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .profile-btn:hover { border-color: #4db0f2; color: #fff; }

  .profile-btn-danger { border-color: #2a0a0a; color: #883333; }
  .profile-btn-danger:hover { border-color: #ff4444; color: #ff6666; }

  .follow-link {
    color: #4db0f2;
    text-decoration: none;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    transition: color 0.2s;
  }
  .follow-link:hover { color: #fff; }

  .media-thumb {
    border: 1px solid #181818;
    border-radius: 3px;
    padding: 12px;
    background: #0d0d0d;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.62rem;
    color: #555;
    text-decoration: none;
    transition: border-color 0.2s, color 0.2s;
    text-align: center;
  }
  .media-thumb:hover { border-color: #4db0f2; color: #a6d7f8; }
`;

const ProfilePage: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [profile, setProfile]       = useState<Profile | null>(null);
  const [media, setMedia]           = useState<MediaItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [followers, setFollowers]   = useState<{ id: number; username: string }[]>([]);
  const [newFollower, setNewFollower] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const profileRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/profile/${username}`
        );
        setProfile(profileRes.data);

        const mediaRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/${profileRes.data.id}/content`
        );
        setMedia(mediaRes.data);

        if (profileRes.data.followers) setFollowers(profileRes.data.followers);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [username]);

  const handleAddFollower = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFollower) return;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${user?.id}/followers`,
        { username: newFollower },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setFollowers([...followers, { id: res.data.followerId, username: newFollower }]);
      setNewFollower('');
    } catch (err) {
      alert('Failed to add follower.');
    }
  };

  const handleRemoveFollower = async (followerId: number) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${user?.id}/followers/${followerId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setFollowers(followers.filter((f) => f.id !== followerId));
    } catch (err) {
      alert('Failed to remove follower.');
    }
  };

  if (loading) return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Montserrat', fontSize: '0.65rem', letterSpacing: '0.22em', color: '#4db0f2', textTransform: 'uppercase' }}>Loading...</p>
    </div>
  );

  if (!profile) return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Azonix, sans-serif', color: '#fff' }}>User not found.</p>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <motion.div
        style={{ backgroundColor: '#080808', minHeight: '100vh', padding: '64px 48px 80px', fontFamily: 'Montserrat, sans-serif' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
      >
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

          {/* Header */}
          <p style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>Profile</p>
          <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '2.2rem', color: '#fff', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {profile.name || profile.username}
          </h1>
          <div className="divider" />

          {/* Info */}
          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: 4, padding: '32px', marginBottom: 24 }}>
            <p style={{ fontSize: '0.7rem', color: '#555', margin: '0 0 8px', letterSpacing: '0.08em' }}>
              Role: <span style={{ color: '#c0c0c0' }}>{profile.role}</span>
            </p>
            {isLoggedIn && user?.username === profile.username && (
              <p style={{ fontSize: '0.7rem', color: '#555', margin: '0 0 8px', letterSpacing: '0.08em' }}>
                Email: <span style={{ color: '#c0c0c0' }}>{profile.email}</span>
              </p>
            )}
            <p style={{ fontSize: '0.7rem', color: '#555', margin: 0, letterSpacing: '0.08em' }}>
              Member since: <span style={{ color: '#c0c0c0' }}>{new Date(profile.created_at).toLocaleDateString()}</span>
            </p>
          </div>

          {/* Followers / Following */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[{ label: 'Followers', list: followers }, { label: 'Following', list: profile.following || [] }].map(({ label, list }) => (
              <div key={label} style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: 4, padding: '24px' }}>
                <p style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.22em', color: '#4a4a4a', textTransform: 'uppercase', margin: '0 0 16px' }}>{label}</p>
                {list.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {list.map((f) => (
                      <li key={f.id}>
                        <a href={`/profile/${f.username}`} className="follow-link">{f.username}</a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ fontSize: '0.65rem', color: '#333', margin: 0 }}>None yet</p>
                )}
              </div>
            ))}
          </div>

          {/* Manage followers (wizard only) */}
          {isLoggedIn && user?.role === 'wizard' && user?.username === profile.username && (
            <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: 4, padding: '24px', marginBottom: 24 }}>
              <p style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.22em', color: '#4a4a4a', textTransform: 'uppercase', margin: '0 0 16px' }}>Manage Followers</p>
              <form onSubmit={handleAddFollower} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input className="profile-input" type="text" placeholder="Username to add" value={newFollower} onChange={(e) => setNewFollower(e.target.value)} />
                <button type="submit" className="profile-btn">Add</button>
              </form>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {followers.map((f) => (
                  <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: '#c0c0c0' }}>{f.username}</span>
                    <button className="profile-btn profile-btn-danger" onClick={() => handleRemoveFollower(f.id)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Media */}
          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: 4, padding: '24px', marginBottom: 24 }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.22em', color: '#4a4a4a', textTransform: 'uppercase', margin: '0 0 16px' }}>Uploaded Media</p>
            {media.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {media.map((item) => (
                  <a key={item.id} href={`https://${process.env.REACT_APP_S3_BUCKET}/${item.s3_key}`} target="_blank" rel="noopener noreferrer" className="media-thumb">
                    <p style={{ margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.type}</p>
                    <p style={{ margin: 0 }}>{new Date(item.uploaded_at).toLocaleDateString()}</p>
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.65rem', color: '#333', margin: 0 }}>No media uploaded yet</p>
            )}
          </div>

          {/* Actions */}
          {isLoggedIn && user?.username === profile.username && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="profile-btn" onClick={() => navigate(`/profile/${username}/edit`)}>Edit Profile</button>
              <button className="profile-btn profile-btn-danger" onClick={logout}>Logout</button>
            </div>
          )}

        </div>
      </motion.div>
    </>
  );
};

export default ProfilePage;