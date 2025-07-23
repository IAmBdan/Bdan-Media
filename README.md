

# Bdan Media Website

#BdanMedia.com

## Project Overview
This is a fully functional portfolio website designed for showcasing photography and videography work. It includes various features such as section-based navigation, responsive design, media uploads, and a contact form. The project utilizes both frontend and backend technologies, integrated with AWS services for media hosting.

## Features
1. **Dynamic Section Navigation**: Allows users to browse through different sections and their subsections dynamically, any time sections or photos are added, everything 
2. **Responsive Design**: Ensures compatibility across devices with various screen sizes.
3. **AWS S3 Integration**: Handles media upload and storage, allows me to upload directly from the site.
4. **Secure Backend**: Built with Node.js and Express, utilizing PostgreSQL for data storage.
5. **Custom Font and Branding**: Includes a custom font ('Azonix') and logos for unique branding.
6. **Contact Form**: Enables visitors to reach out via Formspree.

## Technologies Used
- **Frontend**: React, TypeScript, CSS, Cloutfront for deployment
- **Backend**: Node.js, Express.js, PostgreSQL hosted on ASW RDS, Lightsail for backend hosting
- **Hosting & Storage**: AWS S3 for media storage, Route 53 for website configuration, 
- **Security**: AWS ACM for SL/TLS certificates
- **Styling**: Custom responsive CSS.
- **Other Tools**: Formspree for contact form handling.

---

## Setup Instructions
1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2. Navigate to the `Node App` and `React App` directories to install dependencies:
    ```bash
    cd Node App && npm install
    cd ../React App && npm install
    ```
3. Configure environment variables in `.env` files for both apps.
4. Start the backend:
    ```bash
    nodemon index.js
    ```
5. Start the frontend:
    ```bash
    npm start
    ```

For detailed instructions, refer to the step-by-step guide.

## Author
Developed by Brian Daniels.
