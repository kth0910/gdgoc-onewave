## 1. Project Overview

- **Service Name**: Vidifolio
- **Slogan**: "Promote yourself as a product through a high-quality advertisement video."
- **Core Value**: An AI-driven service that extracts key strengths from a user's resume, project code, and performance metrics to automatically generate a 60-second "Shorts-form" promotional video.

## 2. Key Functionalities

### 2.1 Project Storage (Asset Management)

- **Static Storage**: A dedicated space to store and manage professional assets such as resumes and code snippets without direct modification within the storage view.
- **File Management**: Supports various file types including PDF resumes, JavaScript/Python code modules, and portfolio documents.
- **Usage Monitoring**: Real-time tracking of storage capacity (e.g., 1.7GB used out of 2GB).

### 2.2 AI Video Generation Workspace

- **Asset Selection**: Users can select files directly from the internal storage or drag-and-drop external files into the workspace.
- **AI Scripting**: Automatically generates video scripts based on uploaded assets, divided into segments like "Introduction" and "Core Competencies."
- **Style Customization**: Offers various visual themes such as "Tech Minimalist," "Cyberpunk (Neon High-Energy)," and "Eco Modern."
- **Language Specification**: The system is designed to generate content and videos in **Korean** by default to cater to the target market.

### 2.3 Editing & Export

- **Real-time Preview**: Features a mobile-view mockup (9:16 aspect ratio) to preview the video before final rendering.
- **Segment Editing**: Allows users to modify AI-generated scripts and adjust the sequence of video blocks (Intro, Career, Code, Outro).
- **Download**: Enables users to export the final high-definition (1080p) video for use on social media or professional platforms.

## 3. Screen Specifications

### 3.1 Start Screen

- Provides entry points for Login, Sign-up, Portfolio Upload, and Video Generation.

### 3.2 Project Organization Page

- **Sidebar**: Navigation for the Dashboard, Folder (Storage), Statistics, and Settings.
- **Asset List**: Displays stored files with metadata such as modification dates and file types.
- **Search & Filter**: Includes a search bar for assets and quick filters for "Resume" or "Code."

### 3.3 Workspace (Editor)

- **Header**: Displays project status (e.g., "DRAFT") with "Preview" and "Generate Video" buttons.
- **Main Panel**: Contains the drag-and-drop upload zone, style selection grid, and the editable AI script timeline.
- **Preview Panel**: A 9:16 vertical video player showing the current project (e.g., "Alex Rivera - Senior Software Engineer").
- **Footer**: A timeline interface displaying different segments (Intro, Career, Code, Overlay, Outro) with playback controls.

## 4. Technical Stack

- **Frontend**: Built with React and Tailwind CSS for a modern, responsive interface.
- **Design System**: Utilizes "Inter" and "Noto Sans KR" fonts for professional typography and Material Symbols for iconography.
- **Video Output**: Optimized for 1080p resolution in a vertical 9:16 format suitable for mobile "Shorts" content.

## 5. Interface Spec

### **Auth API**

**API: POST /api/register**

- **Description**: User registration for the Vidifolio service.
- **Response**: `201 Created` with User Profile.
- **Error**: `400 Bad Request` if validation fails.

**API: POST /api/login**

- **Description**: User authentication and session issuance.
- **Response**: `200 OK` with Auth Token.
- **Error**: `401 Unauthorized` for invalid credentials.

---

### **Portfolio Asset API**

**API: POST /api/portfolio**

- **Description**: Upload professional assets (Resumes, Code snippets, Performance metrics).
- **Body**: `File` (PDF, JS, PY, etc.).
- **Response**: `201 Created` with Asset Metadata.

**API: GET /api/portfolio**

- **Description**: Retrieve a list of stored portfolio assets for the workspace.
- **Query Params**: `type` (Optional: resume, code).
- **Response**: `List[Asset]`.
- **Error**: `404 Not Found` if the storage is empty.

**API: DELETE /api/portfolio**

- **Description**: Remove an asset from the storage.
- **Query Params**: `assetId`.
- **Response**: `204 No Content`.

---

### **Video Generation & Management API**

**API: POST /api/video/generate**

- **Description**: Submit selected assets and request AI-driven "Shorts" video generation in **Korean**.
- **Body**: `assetIds`, `theme` (e.g., Cyberpunk, Tech Minimalist).
- **Response**: `202 Accepted` with `videoId`.

**API: GET /api/video/{Id}**

- **Description**: Issue a secure download URL for the generated 1080p high-definition video.
- **Response**: `200 OK` with `downloadUrl`.
- **Error**: `404 Not Found` if the video is still rendering or does not exist.

**API: PATCH /api/videos/{id}/edit**

- **Description**: Partial updates to the video project, such as modifying the AI-generated Korean script segments or changing the style theme.
- **Body**: `scriptSegments` (Optional), `theme` (Optional).
- **Response**: `200 OK` with Updated Video Project.

## 6. Data Spec

### **User Object**

Represents a registered user and their current resource status.

- **id** (`uuid`): Unique identifier for the user.
- **clerk_id** (`text`): External authentication ID (Clerk).
- **email** (`text`): User's primary email address.
- **full_name** (`text`): User's display name.
- **credits** (`integer`): Remaining balance for video generation (default: 5).
- **created_at** (`timestamp`): Account creation date.

### **Portfolio Object**

Represents the professional assets uploaded by the user to be used as video source material.

- **id** (`uuid`): Unique identifier for the asset.
- **user_id** (`uuid`): Reference to the owner (Users table).
- **title** (`text`): Name of the file or project (e.g., "Senior_Resume.pdf").
- **pdf_path** (`text`): Storage path/URL for the uploaded file.
- **raw_data** (`jsonb`): Extracted text or structured data from the asset for AI analysis.
- **created_at** (`timestamp`): Upload timestamp.

### **Video Object**

Represents a video generation project and its current production state.

- **id** (`uuid`): Unique identifier for the video.
- **user_id** (`uuid`): Reference to the user who requested the video.
- **portfolio_id** (`uuid`): Reference to the primary asset used for generation.
- **status** (`text`): Current state of production (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`).
- **ai_metadata** (`jsonb`): Detailed configuration for the AI generation, including:
    - `model`: The AI model used (e.g., "veo-3.1-standard").
    - `prompt`: The specific prompt used to generate the Korean script.
    - `segments`: List of video blocks (Intro, Career, etc.).
- **video_url** (`text`): The final link to the generated 1080p video file.
- **updated_at** (`timestamp`): Last modification time (e.g., when a script is edited).