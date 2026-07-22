**Tomorrow X Together — Trial Web Project**

**Overview**
This is a small experimental website that presents **Tomorrow X Together**’s discography alongside simple interactive features for casual practice and fan engagement.

**Objectives**
1. Build a polished, responsive web prototype showcasing TXT’s discography and interactive features.
2. Implement a reliable audio player with shuffle, play/pause, and animated visual feedback.
3. Create an attractive, accessible visual discography that communicates release history clearly.

**Features**

**1. CD player**: A graphical CD element that plays TXT tracks on shuffle. The CD rotates while playing and displays animated musical notes. Clicking the CD toggles play/pause.

**2. Discography**: A visual presentation of TXT releases since debut. Selecting an album plays its tracks on shuffle.

**3. Games**: Section reserved for future mini-games and interactive content.

**4. Custom Cursor**: User can choose which TXT member they want to use as a cursor. (idea by Jamelah ZA)

**Assistance needed**
1. UI design
2. Feature and idea development


**DEEPSEEK**

Database & Data Flow – Conceptual Overview
🗄️ The Database (MySQL)
Two main tables: albums (stores album info) and songs (stores track details).

Each song is linked to one album via a relationship key.

The database stores metadata (title, release date, track number, duration) plus a file path that points to the actual MP3 file on your server.

Why not store the audio file itself? Because it slows down the database; storing just the path keeps everything fast and lightweight.

🔌 The Backend (API Server)
A small server (Node.js) acts as a middleman between your website and MySQL.

It exposes two main endpoints (URLs):

/api/albums – returns the full list of TXT albums.
/api/albums/:id/songs – returns all tracks for a specific album.
When a request arrives, the backend runs a SELECT query on MySQL, turns the result into JSON, and sends it back to the frontend.

🖥️ The Frontend (User Interface)
When the page loads, the UI automatically calls /api/albums to fetch and display album covers.

When a user clicks an album, the UI calls /api/albums/[albumID]/songs, grabs the track list, and loads it into the CD player.

For shuffle, the frontend randomly reorders the track list locally (no extra database work needed).

The CD rotates and visual effects (floating notes) are triggered by the play/pause state of the HTML audio element.

🔄 The Full Data Pipeline
User interacts with the page (clicks an album or presses play).

Frontend sends a request to the backend API.

Backend queries the MySQL database.

MySQL returns the matching rows.

Backend formats them as JSON and sends a response.

Frontend parses the JSON and updates the HTML/CSS to show the new content.

💸 Cost to Run This (Spoiler: Free!)
Local development: MySQL, Node.js, VS Code – all free.

Live hosting: Use free tiers from platforms like Vercel (frontend), Render/Railway (backend), and Aiven/Railway (database). No credit card required for basic usage.

The only paid item: Buying a custom domain name (like txt-army.com) – which is optional; the free subdomains work perfectly fine.

Summary:
Database stores the info → Backend fetches it on demand → Frontend shows it beautifully. All of this costs zero dollars to build and launch.
