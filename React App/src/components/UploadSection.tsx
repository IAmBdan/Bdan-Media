import React, { useState, ChangeEvent } from 'react';
import axios from 'axios';

interface UploadSectionProps {
  section: string;
  onUploadComplete: () => void;
  onDelete: () => void;
  isEditMode: boolean;
  toggleSelectionMode: () => void;
  clearSelection: () => void;
  selectedMedia: Set<string>;
}

const css = `
  .upload-input {
    width: 100%;
    max-width: 320px;
    padding: 11px 14px;
    background: #0a0a0a;
    color: #c0c0c0;
    border: 1px solid #181818;
    border-radius: 3px;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    outline: none;
    transition: border-color 0.2s ease;
  }

  .upload-input:focus {
    border-color: #4db0f2;
  }

  .upload-input::placeholder {
    color: #3a3a3a;
  }

  .btn {
    padding: 11px 28px;
    border-radius: 3px;
    border: 1px solid #181818;
    background: #0d0d0d;
    color: #6a6a6a;
    font-family: 'Montserrat', sans-serif;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: border-color 0.2s ease, color 0.2s ease;
  }

  .btn:hover {
    border-color: #4db0f2;
    color: #fff;
  }

  .btn-danger {
    border-color: #4a1a1a;
    color: #cc4444;
  }

  .btn-danger:hover {
    border-color: #ff4444;
    color: #ff6666;
  }

  .btn-active {
    border-color: #4db0f2;
    color: #a6d7f8;
  }

  .preview-thumb {
    position: relative;
    width: 90px;
    height: 90px;
    border: 1px solid #181818;
    border-radius: 3px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .preview-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: rgba(0,0,0,0.8);
    border: 1px solid #444;
    color: #aaa;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
  }

  .preview-remove:hover {
    border-color: #ff4444;
    color: #ff4444;
  }
`;

const UploadSection: React.FC<UploadSectionProps> = ({
  section,
  onUploadComplete,
  onDelete,
  isEditMode,
  toggleSelectionMode,
  clearSelection,
  selectedMedia,
}) => {
  const [files, setFiles]           = useState<File[]>([]);
  const [tags, setTags]             = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    setPreviewUrls((prev) => [...prev, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const handleRemoveFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviewUrls((prev) => prev.filter((_, idx) => idx !== i));
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
    if (!files.length || !section) {
      alert('Please select files and ensure the section is valid.');
      return;
    }
    try {
      const withDims = await Promise.all(files.map(async (f) => ({ file: f, ...(await getDimensions(f)) })));

      const presigned = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/media/presigned-urls`, {
        files: withDims.map(({ file }) => ({ fileName: file.name, fileType: file.type })),
        sectionPath: section,
      });

      await Promise.all(
        withDims.map(({ file }, i) =>
          axios.put(presigned.data.urls[i].url, file, { headers: { 'Content-Type': file.type } })
        )
      );

      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/media/metadata`, {
        media: withDims.map(({ file, width, height }) => ({
          s3_key: `${section}/${file.name}`,
          sectionPath: section,
          tags: tags ? tags.split(',').map((t) => t.trim()) : [],
          type: file.type.startsWith('image/') ? 'image' : 'video',
          width,
          height,
          uploaded_by: 1,
        })),
      });

      alert('Files uploaded successfully!');
      onUploadComplete();
      setFiles([]);
      setTags('');
      setPreviewUrls([]);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload files.');
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedMedia.size) { alert('No media selected.'); return; }
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/media/delete`, { ids: Array.from(selectedMedia) });
      alert('Deleted successfully!');
      clearSelection();
      onUploadComplete();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete.');
    }
  };

  const capitalSection = section ? section.charAt(0).toUpperCase() + section.slice(1) : '';

  return (
    <>
      <style>{css}</style>
      <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: '4px', padding: '28px 32px', marginBottom: '40px' }}>

        {/* Header */}
        <p style={{ fontFamily: 'Montserrat', fontSize: '0.58rem', fontWeight: 600, letterSpacing: '0.22em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 6px' }}>
          Admin
        </p>
        <h3 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '1.1rem', color: '#fff', margin: '0 0 24px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Upload to {capitalSection}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>

          {/* File picker */}
          <label className="btn" style={{ cursor: 'pointer' }}>
            Choose Files
            <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
          </label>

          {/* Previews */}
          {previewUrls.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {previewUrls.map((url, i) => (
                <div key={i} className="preview-thumb">
                  {files[i].type.startsWith('image/') ? (
                    <img src={url} alt={`preview-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <button className="preview-remove" onClick={() => handleRemoveFile(i)}>&times;</button>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="upload-input"
          />

          {/* Upload */}
          <button onClick={handleUpload} className="btn">
            Upload
          </button>
        </div>

        {/* Edit mode controls */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #181818', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={toggleSelectionMode} className={`btn ${isEditMode ? 'btn-active' : ''}`}>
            {isEditMode ? 'Exit Edit Mode' : 'Edit'}
          </button>
          {isEditMode && (
            <>
              <button onClick={handleDeleteSelected} className="btn btn-danger">
                Delete Selected ({selectedMedia.size})
              </button>
              <button onClick={clearSelection} className="btn">
                Clear Selection
              </button>
            </>
          )}
        </div>

      </div>
    </>
  );
};

export default UploadSection;