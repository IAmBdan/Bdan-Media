import React, { useState, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
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

const UploadSection: React.FC<UploadSectionProps> = ({
    section,
    onUploadComplete,
    onDelete,
    isEditMode,
    toggleSelectionMode,
    clearSelection,
    selectedMedia,
}) => {
    
    const [files, setFiles] = useState<File[]>([]);
    const [tags, setTags] = useState<string>('');
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const updatedFiles = [...files, ...selectedFiles]; // Merge existing files with new ones
    
            setFiles(updatedFiles);
    
            // Generate preview URLs for images and videos
            const updatedPreviews = [
                ...previewUrls,
                ...selectedFiles.map((file) =>
                    file.type.startsWith("image/")
                        ? URL.createObjectURL(file) // For images
                        : URL.createObjectURL(file) // For videos
                ),
            ];
    
            setPreviewUrls(updatedPreviews);
            setFileNames(updatedFiles.map((file) => file.name)); // Update file names
        }
    };
    
    
    // Remove a single file and its preview
    const handleRemoveFile = (index: number) => {
        // Remove the file, preview URL, and filename at the given index
        const updatedFiles = [...files];
        const updatedPreviews = [...previewUrls];
        const updatedFileNames = [...fileNames];
    
        updatedFiles.splice(index, 1);
        updatedPreviews.splice(index, 1);
        updatedFileNames.splice(index, 1);
    
        setFiles(updatedFiles);
        setPreviewUrls(updatedPreviews);
        setFileNames(updatedFileNames);
    };
    

    const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.width, height: img.height });
          img.onerror = (err) => reject(err);
          img.src = URL.createObjectURL(file);
        });
      };
    
      const getVideoDimensions = (file: File): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
          const video = document.createElement('video');
          video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
          video.onerror = (err) => reject(err);
          video.src = URL.createObjectURL(file);
        });
      };

      const handleUpload = async () => {
        if (!files.length || !section) {
            
          alert('Please select files and ensure the section is valid.'+section);
          return;
        }
    
        try {
          // Calculate dimensions for all files
          const filesWithDimensions = await Promise.all(
            files.map(async (file) => {
              if (file.type.startsWith('image/')) {
                const { width, height } = await getImageDimensions(file);
                return { file, width, height };
              } else if (file.type.startsWith('video/')) {
                const { width, height } = await getVideoDimensions(file);
                return { file, width, height };
              } else {
                // Default dimensions for unsupported types
                return { file, width: 0, height: 0 };
              }
            })
          );
    
          // Request presigned URLs from the server
          const presignedResponse = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/media/presigned-urls`, {
            files: filesWithDimensions.map(({ file }) => ({
              fileName: file.name,
              fileType: file.type,
            })),
            sectionPath: section,
          });
    
          // Upload files to S3
          await Promise.all(
            filesWithDimensions.map(({ file }, index) =>
              axios.put(presignedResponse.data.urls[index].url, file, {
                headers: { 'Content-Type': file.type },
              })
            )
          );
    
          // Save metadata to the database
          const metadata = filesWithDimensions.map(({ file, width, height }) => ({
            s3_key: `${section}/${file.name}`,
            sectionPath: section,
            tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
            type: file.type.startsWith('image/') ? 'image' : 'video',
            width,
            height,
            uploaded_by: 1, // Replace with actual user ID
          }));
    
          await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/media/metadata`, { media: metadata });
    
          alert('Files uploaded successfully!');
          onUploadComplete();
          setFiles([]);
          setTags('');
          setPreviewUrls([]);
        } catch (error) {
          console.error('Error uploading files:', error);
          alert('Failed to upload files.');
        }
      };
    
      const handleDeleteSelectedMedia = async () => {
        if (selectedMedia.size === 0) {
            alert('No media selected for deletion.');
            return;
        }
    
        try {
            const idsToDelete = Array.from(selectedMedia);
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/media/delete`, {
                ids: idsToDelete,
            });
    
            alert('Selected media deleted successfully!');
            clearSelection();
            onUploadComplete(); // Refresh the list of media
        } catch (error) {
            console.error('Error deleting selected media:', error);
            alert('Failed to delete selected media.');
        }
    };
    const capitalSection: string = section ? section.charAt(0).toUpperCase() + section.slice(1) : "";

    return (
        <div
    style={{
        backgroundColor: '#333',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        color: 'white',
    }}
>
    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>
        Upload to {capitalSection}
    </h3>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        {/* File Selector */}
        <label
            style={{
                cursor: 'pointer',
                backgroundColor: '#555',
                padding: '10px',
                borderRadius: '4px',
            }}
        >
            Choose Files
            <input type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        {/* File Previews */}
        {previewUrls.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', maxWidth: '100%' }}>
                {previewUrls.map((url, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'relative',
                            width: '100px',
                            height: '100px',
                            border: '1px solid #555',
                            borderRadius: '4px',
                            overflow: 'hidden',
                        }}
                    >
                        {files[index].type.startsWith('image/') ? (
                            <img
                                src={url}
                                alt={`Preview ${index}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <video
                                src={url}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                controls
                            />
                        )}
                        {/* Remove Button */}
                        <button
                            onClick={() => handleRemoveFile(index)}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                backgroundColor: 'red',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        )}

        {/* Tags Input */}
        <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={{
                width: '100%',
                maxWidth: '300px',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #777',
                backgroundColor: '#222',
                color: 'white',
            }}
        />

        {/* Upload Button */}
        <button
            onClick={handleUpload}
            style={{
                backgroundColor: '#555',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '10px',
            }}
        >
            Upload
        </button>
    </div>
    
    {isEditMode && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    <button
                onClick={handleDeleteSelectedMedia}

                        style={{
                            backgroundColor: '#ff0000',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Delete Selected
                    </button>
                    <button
                        onClick={clearSelection}
                        style={{
                            backgroundColor: '#555',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
            <button
                onClick={toggleSelectionMode}
                style={{
                    width: '100%',
                    backgroundColor: isEditMode ? '#ff5f5f' : '#555',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                }}
            >
                {isEditMode ? 'Exit Edit Mode' : 'Edit'}
            </button>
        </div>
    );
};

export default UploadSection;
