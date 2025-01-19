CREATE TABLE media (
    id SERIAL PRIMARY KEY,          -- Unique ID for each media file
    s3_key TEXT NOT NULL,           -- S3 key for the file
    section TEXT NOT NULL,          -- Section the media belongs to
    tags TEXT[] NOT NULL,           -- Tags for categorization
    type TEXT NOT NULL,             -- Media type (e.g., 'image' or 'video')
    width INTEGER,                  -- Width of the media (optional initially)
    height INTEGER,                 -- Height of the media (optional initially)
    uploaded_by TEXT,               -- ID or username of the uploader
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp for when it was uploaded
);


CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15),
    address VARCHAR(255),
    followers JSONB DEFAULT '[]', -- List of user IDs following this user
    following JSONB DEFAULT '[]'  -- List of user IDs this user is following
);
