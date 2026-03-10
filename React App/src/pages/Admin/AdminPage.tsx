import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

interface Section {
  id: string;
  name: string;
  path: string;
  parent_id?: string | null;
  hidden?: boolean;
}

const css = `
  .divider { width: 32px; height: 2px; background: #4db0f2; margin: 12px 0 32px; }

  .admin-input {
    padding: 10px 14px;
    background: #0a0a0a;
    color: #c0c0c0;
    border: 1px solid #181818;
    border-radius: 3px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    outline: none;
    transition: border-color 0.2s ease;
    width: 100%;
  }
  .admin-input:focus { border-color: #4db0f2; }
  .admin-input::placeholder { color: #333; }

  .btn {
    padding: 9px 20px;
    border-radius: 3px;
    border: 1px solid #181818;
    background: #0d0d0d;
    color: #6a6a6a;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.2s ease, color 0.2s ease;
  }
  .btn:hover { border-color: #4db0f2; color: #fff; }
  .btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .btn-danger { border-color: #2a0a0a; color: #883333; }
  .btn-danger:hover { border-color: #ff4444; color: #ff6666; }

  .btn-confirm { border-color: #4db0f2; color: #a6d7f8; }
  .btn-confirm:hover { border-color: #fff; color: #fff; }

  .section-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border: 1px solid #181818;
    border-radius: 3px;
    background: #0d0d0d;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }
  .section-row.child {
    margin-left: 32px;
    background: #0a0a0a;
    border-color: #141414;
  }

  .section-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #c0c0c0;
    flex: 1;
    min-width: 80px;
  }
  .section-path {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.6rem;
    color: #3a3a3a;
    letter-spacing: 0.08em;
  }
  .section-count {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.58rem;
    color: #4db0f2;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  .add-form {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    padding: 14px 16px;
    border: 1px dashed #222;
    border-radius: 3px;
    margin-bottom: 6px;
  }
  .add-form.child { margin-left: 32px; }

  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.8);
    z-index: 100;
    display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: #0d0d0d;
    border: 1px solid #181818;
    border-radius: 4px;
    padding: 36px;
    width: 100%;
    max-width: 420px;
  }

  .toast {
    position: fixed;
    bottom: 32px; right: 32px;
    background: #0d0d0d;
    border: 1px solid #4db0f2;
    border-radius: 3px;
    padding: 12px 20px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
    letter-spacing: 0.14em;
    color: #a6d7f8;
    text-transform: uppercase;
    z-index: 200;
  }
`;

const API = process.env.REACT_APP_API_BASE_URL;

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [hierarchical, setHierarchical]     = useState<Record<string, Section[]>>({});
  const [sectionCounts, setSectionCounts]   = useState<Record<string, number>>({});
  const [collapsed, setCollapsed]           = useState<Set<string>>(new Set());
  const [editingId, setEditingId]           = useState<string | null>(null);
  const [editName, setEditName]             = useState('');
  const [editPath, setEditPath]             = useState('');
  const [addingUnder, setAddingUnder]       = useState<string | null>(null);
  const [newName, setNewName]               = useState('');
  const [newPath, setNewPath]               = useState('');
  const [deleteModal, setDeleteModal]       = useState<Section | null>(null);
  const [uploadModal, setUploadModal]       = useState<Section | null>(null);
  const [uploadFiles, setUploadFiles]       = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [uploadTags, setUploadTags]         = useState('');
  const [uploading, setUploading]           = useState(false);
  const [toast, setToast]                   = useState('');

  // ── Guards ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'admin') navigate('/');
  }, [user, navigate]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleCollapse = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchSections = async () => {
    try {
      const { data } = await axios.get(`${API}/api/sections`);
      const grouped = data.reduce((acc: Record<string, Section[]>, s: Section) => {
        const k = s.parent_id || '0';
        if (!acc[k]) acc[k] = [];
        acc[k].push(s);
        return acc;
      }, {});
      setHierarchical(grouped);

      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (s: Section) => {
          try {
            const { data: media } = await axios.get(`${API}/api/media/section`, { params: { sectionPath: s.path } });
            counts[s.id] = media.length;
          } catch { counts[s.id] = 0; }
        })
      );
      setSectionCounts(counts);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchSections(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleCreate = async (parentId: string | null) => {
    if (!newName.trim() || !newPath.trim()) return;
    try {
      await axios.post(`${API}/api/sections`, {
        name: newName.trim(), path: newPath.trim(),
        parent_id: parentId === '0' ? null : parentId,
      }, authHeader());
      setNewName(''); setNewPath(''); setAddingUnder(null);
      await fetchSections();
      showToast('Section created');
    } catch (e: any) { alert(e.response?.data?.error || 'Failed to create section'); }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() && !editPath.trim()) return;
    try {
      await axios.put(`${API}/api/sections/${id}`, {
        name: editName.trim() || undefined,
        path: editPath.trim() || undefined,
      }, authHeader());
      setEditingId(null);
      await fetchSections();
      showToast('Section updated');
    } catch (e: any) { alert(e.response?.data?.error || 'Failed to update section'); }
  };

  const handleToggleHide = async (id: string) => {
    try {
      await axios.patch(`${API}/api/sections/${id}/hide`, {}, authHeader());
      await fetchSections();
      showToast('Visibility updated');
    } catch (e: any) { alert(e.response?.data?.error || 'Failed to update visibility'); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await axios.delete(`${API}/api/sections/${deleteModal.id}`, authHeader());
      setDeleteModal(null);
      await fetchSections();
      showToast('Section deleted');
    } catch (e: any) { alert(e.response?.data?.error || 'Failed to delete section'); }
  };

  const handleDeleteAllMedia = async (sectionPath: string) => {
    if (!window.confirm(`Delete ALL media in "${sectionPath}"? This cannot be undone.`)) return;
    try {
      await axios.post(`${API}/api/media/delete-all`, { sectionPath }, authHeader());
      await fetchSections();
      showToast('All media deleted');
    } catch (e: any) { alert(e.response?.data?.error || 'Failed to delete media'); }
  };

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setUploadFiles((prev) => [...prev, ...selected]);
    setUploadPreviews((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removeUploadFile = (i: number) => {
    setUploadFiles((prev) => prev.filter((_, idx) => idx !== i));
    setUploadPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const getDimensions = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      } else {
        const vid = document.createElement('video');
        vid.onloadedmetadata = () => resolve({ width: vid.videoWidth, height: vid.videoHeight });
        vid.onerror = reject;
        vid.src = URL.createObjectURL(file);
      }
    });

  const handleUpload = async () => {
    if (!uploadModal || !uploadFiles.length) return;
    setUploading(true);
    try {
      const withDims = await Promise.all(uploadFiles.map(async (f) => ({ file: f, ...(await getDimensions(f)) })));
      const presigned = await axios.post(`${API}/api/media/presigned-urls`, {
        files: withDims.map(({ file }) => ({ fileName: file.name, fileType: file.type })),
        sectionPath: uploadModal.path,
      }, authHeader());
      await Promise.all(
        withDims.map(({ file }, i) =>
          axios.put(presigned.data.urls[i].url, file, { headers: { 'Content-Type': file.type } })
        )
      );
      await axios.post(`${API}/api/media/metadata`, {
        media: withDims.map(({ file, width, height }) => ({
          s3_key: `${uploadModal.path}/${file.name}`,
          sectionPath: uploadModal.path,
          tags: uploadTags ? uploadTags.split(',').map((t) => t.trim()) : [],
          type: file.type.startsWith('image/') ? 'image' : 'video',
          width, height, uploaded_by: 1,
        })),
      }, authHeader());
      setUploadModal(null);
      setUploadFiles([]); setUploadPreviews([]); setUploadTags('');
      await fetchSections();
      showToast(`${withDims.length} file${withDims.length > 1 ? 's' : ''} uploaded`);
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally { setUploading(false); }
  };

  // ── Render row ────────────────────────────────────────────────────────────
  const renderSection = (section: Section, isChild = false) => {
    const isEditing   = editingId === section.id;
    const children    = hierarchical[section.id] || [];
    const hasChildren = children.length > 0;
    const isCollapsed = collapsed.has(section.id);

    return (
      <div key={section.id}>
        <div
          className={`section-row ${isChild ? 'child' : ''}`}
          style={section.hidden ? { opacity: 0.45, borderColor: '#1a1a1a' } : {}}
        >
          {isEditing ? (
            <>
              <input className="admin-input" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" style={{ maxWidth: 160 }} />
              <input className="admin-input" value={editPath} onChange={(e) => setEditPath(e.target.value)} placeholder="Path" style={{ maxWidth: 200 }} />
              <button className="btn btn-confirm" onClick={() => handleUpdate(section.id)}>Save</button>
              <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
            </>
          ) : (
            <>
              {hasChildren && (
                <button className="btn" style={{ padding: '9px 12px', color: '#4a4a4a', minWidth: 32 }} onClick={() => toggleCollapse(section.id)}>
                  {isCollapsed ? '▸' : '▾'}
                </button>
              )}
              <span className="section-name">{section.name}</span>
              <span className="section-path">{section.path}</span>
              <span className="section-count">{sectionCounts[section.id] ?? '—'} items</span>
              <button className="btn" onClick={() => window.open(`/${section.path}`, '_blank')}>View</button>
              {!hasChildren && (
                <button className="btn btn-confirm" onClick={() => {
                  setUploadModal(section);
                  setUploadFiles([]); setUploadPreviews([]); setUploadTags('');
                }}>+ Media</button>
              )}
              <button className="btn" onClick={() => { setEditingId(section.id); setEditName(section.name); setEditPath(section.path); }}>Edit</button>
              {!isChild && (
                <button className="btn" onClick={() => { setAddingUnder(section.id); setNewName(''); setNewPath(''); }}>+ Sub</button>
              )}
              <button
                className="btn"
                style={section.hidden ? { borderColor: '#4db0f2', color: '#a6d7f8' } : {}}
                onClick={() => handleToggleHide(section.id)}
              >
                {section.hidden ? 'Unhide' : 'Hide'}
              </button>
              <button className="btn btn-danger" onClick={() => handleDeleteAllMedia(section.path)}>Clear</button>
              <button className="btn btn-danger" onClick={() => setDeleteModal(section)}>Delete</button>
            </>
          )}
        </div>

        {addingUnder === section.id && (
          <div className="add-form child">
            <input className="admin-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Subsection name" style={{ maxWidth: 160 }} />
            <input className="admin-input" value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="Subsection path" style={{ maxWidth: 200 }} />
            <button className="btn btn-confirm" onClick={() => handleCreate(section.id)}>Create</button>
            <button className="btn" onClick={() => setAddingUnder(null)}>Cancel</button>
          </div>
        )}

        {!isCollapsed && children.map((child) => renderSection(child, true))}
      </div>
    );
  };

  if (!user || user.role !== 'admin') return null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <motion.div
        style={{ minHeight: '100vh', backgroundColor: '#080808', padding: '64px 48px 80px', fontFamily: 'Montserrat, sans-serif' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <p style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>Admin</p>
          <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '2.2rem', color: '#fff', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Manage Sections</h1>
          <div className="divider" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.22em', color: '#4a4a4a', textTransform: 'uppercase', margin: 0 }}>Sections</p>
            <button className="btn btn-confirm" onClick={() => { setAddingUnder('0'); setNewName(''); setNewPath(''); }}>+ New Section</button>
          </div>

          {addingUnder === '0' && (
            <div className="add-form" style={{ marginBottom: 16 }}>
              <input className="admin-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Section name" style={{ maxWidth: 180 }} />
              <input className="admin-input" value={newPath} onChange={(e) => setNewPath(e.target.value)} placeholder="Path (e.g. music)" style={{ maxWidth: 200 }} />
              <button className="btn btn-confirm" onClick={() => handleCreate(null)}>Create</button>
              <button className="btn" onClick={() => setAddingUnder(null)}>Cancel</button>
            </div>
          )}

          {(hierarchical['0'] || []).map((s) => renderSection(s))}
        </div>
      </motion.div>

      {/* Upload modal */}
      <AnimatePresence>
        {uploadModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setUploadModal(null); }}
          >
            <motion.div className="modal" style={{ maxWidth: 560 }} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.24em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 8px' }}>Upload Media</p>
              <h3 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '1.2rem', color: '#fff', margin: '0 0 24px' }}>{uploadModal.name.toUpperCase()}</h3>
              <label className="btn" style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 16 }}>
                Choose Files
                <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
              {uploadPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {uploadPreviews.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: 80, height: 80, border: '1px solid #181818', borderRadius: 3, overflow: 'hidden' }}>
                      {uploadFiles[i].type.startsWith('image/') ? (
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <button onClick={() => removeUploadFile(i)} style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: '1px solid #444', color: '#aaa', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input className="admin-input" value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="Tags (comma-separated, optional)" style={{ marginBottom: 24 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setUploadModal(null)}>Cancel</button>
                <button className="btn btn-confirm" onClick={handleUpload} disabled={uploading || !uploadFiles.length}>
                  {uploading ? 'Uploading...' : `Upload${uploadFiles.length > 0 ? ` (${uploadFiles.length})` : ''}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}>
              <p style={{ fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.24em', color: '#cc4444', textTransform: 'uppercase', margin: '0 0 12px' }}>Confirm Delete</p>
              <h3 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '1.2rem', color: '#fff', margin: '0 0 8px' }}>{deleteModal.name.toUpperCase()}</h3>
              <p style={{ fontSize: '0.7rem', color: '#555', margin: '0 0 24px', lineHeight: 1.6 }}>
                This will permanently delete the section, all subsections, and all media from S3. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setDeleteModal(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete Everything</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminPage;