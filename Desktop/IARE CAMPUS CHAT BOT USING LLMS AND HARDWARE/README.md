# Iare Campus Bot

## Project info

## How can I edit this code?

There are several ways of editing your application.

## Architecture and Flowchart

### Architecture Overview

This application is a comprehensive campus chatbot with hardware integration, built as a modern web application. The architecture consists of:

- **Frontend**: React application built with TypeScript, using Vite for fast development and building. Styled with Tailwind CSS and shadcn-ui components for a responsive and accessible UI.
- **Backend**: Supabase provides the backend services, including database, authentication, and serverless functions for AI chat processing and text-to-speech.
- **Features**:
  - Text and voice chat interfaces
  - User authentication and profiles
  - Analytics dashboard
  - Hardware device integration for voice input/output
  - Real-time messaging with streaming responses

### Application Flowchart

```mermaid
graph TD
    A[User Visits App] --> B{Authentication}
    B -->|Not Logged In| C[Sign In/Sign Up]
    B -->|Logged In| D[Chat Selection]
    D --> E{Choose Chat Type}
    E -->|Text Chat| F[Text Chat Interface]
    E -->|Voice Chat| G[Voice Chat Interface]
    
    F --> H[Send Message]
    G --> I[Voice Input]
    
    H --> J[Process with AI]
    I --> K[Speech Recognition]
    K --> J
    
    J --> L[Generate Response]
    L --> M{Response Type}
    M -->|Text| N[Display Text Response]
    M -->|Voice| O[Text-to-Speech]
    O --> P[Play Audio Response]
    
    N --> Q[User Feedback/Analytics]
    P --> Q
    
    C --> B
    Q --> D
```

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Iare Campus Bot.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy to Render

1. **Sign up/Login to Render**: Go to [render.com](https://render.com) and sign in with your GitHub account.

2. **Connect Repository**: Click "New" and select "Static Site", then connect your GitHub repository.

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Node Version: 18 or latest

4. **Environment Variables**: Add the following environment variables in the project settings:
   - `VITE_SUPABASE_PROJECT_ID`: `bwpebgmfkdfemxfjdexv`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cGViZ21ma2RmZW14ZmpkZXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMzUyMDEsImV4cCI6MjA4MzYxMTIwMX0.Wj5kDCj4C_BPz7Q2gQ4WPdTe8Kfy2LL7wK1hbER-k1E`
   - `VITE_SUPABASE_URL`: `https://bwpebgmfkdfemxfjdexv.supabase.co`

5. **Deploy**: Click "Create Static Site" to start the deployment process.

Your app will be live at a Render-provided URL (e.g., `your-project.onrender.com`). You can customize the domain in Render's dashboard.
