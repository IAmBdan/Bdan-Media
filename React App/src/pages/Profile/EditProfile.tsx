import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const css = `
  .divider { width: 32px; height: 2px; background: #4db0f2; margin: 12px 0 32px; }

  .edit-input {
    padding: 11px 14px;
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
  .edit-input:focus { border-color: #4db0f2; }
  .edit-input::placeholder { color: #333; }

  .edit-label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.2em;
    color: #4a4a4a;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: block;
  }

  .edit-btn {
    padding: 11px 28px;
    background: #0d0d0d;
    color: #6a6a6a;
    border: 1px solid #181818;
    border-radius: 3px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }
  .edit-btn:hover { border-color: #4db0f2; color: #fff; }

  .edit-btn-confirm { border-color: #4db0f2; color: #a6d7f8; }
  .edit-btn-confirm:hover { border-color: #fff; color: #fff; }
`;

const EditProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/users/profile/${username}`
        );
        setUserId(res.data.id);
        setFormData({ username: res.data.username, email: res.data.email || '' });
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [username]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/${userId}`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate(`/profile/${formData.username}`);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile.');
    }
  };

  if (loading) return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Montserrat', fontSize: '0.65rem', letterSpacing: '0.22em', color: '#4db0f2', textTransform: 'uppercase' }}>Loading...</p>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <motion.div
        style={{ backgroundColor: '#080808', minHeight: '100vh', padding: '64px 48px 80px', fontFamily: 'Montserrat, sans-serif' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
      >
        <div style={{ maxWidth: '520px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>Account</p>
          <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '2.2rem', color: '#fff', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Edit Profile</h1>
          <div className="divider" />

          <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: 4, padding: '32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="edit-label">Username</label>
              <input className="edit-input" type="text" name="username" value={formData.username} onChange={handleChange} placeholder="Username" />
            </div>
            <div>
              <label className="edit-label">Email</label>
              <input className="edit-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
              <button className="edit-btn" onClick={() => navigate(`/profile/${username}`)}>Cancel</button>
              <button className="edit-btn edit-btn-confirm" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EditProfile;