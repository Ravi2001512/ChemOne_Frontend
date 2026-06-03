# ChemBridge Frontend 🧪

The modern web interface for the ChemBridge platform, designed to provide an interactive and seamless experience for both students and administrators. Built with React 19, Vite, and Tailwind CSS.

## 🚀 Features

### For Students
- **Interactive Learning**: Access daily worksheets and spot tests to reinforce chemistry knowledge.
- **AI Chatbot**: Get instant help and explanations for complex chemistry topics.
- **Performance Tracking**: View results from physical exams and spot tests.
- **Gamified Experience**: Engage with chemistry-themed games.
- **Secure Access**: Personal dashboards, profile settings, and secure authentication.

### For Administrators
- **Dashboard**: High-level overview of platform activity.
- **Content Management**: Create and manage daily worksheets and spot tests.
- **Student Management**: Oversee student progress and manage records.
- **Result Management**: Process and notify students of their physical exam results.
- **AI Knowledge Management**: Train and manage the AI chatbot's knowledge base.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

## ⚙️ Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ChemOne/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── components/   # Reusable UI components
├── context/      # Context API for state management
├── pages/        # Page components (Admin & Student views)
├── routes/       # Route definitions and navigation
├── services/     # API service layer (Axios)
├── styles/       # Global styles and Tailwind configuration
├── App.jsx       # Main application component
└── main.jsx      # Entry point
```

## 📜 Available Scripts

- `npm run dev`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm run lint`: Checks for linting errors.
- `npm run preview`: Previews the production build locally.

## 🔒 Security

- **Auto-Logout**: Automatically logs users out after 30 minutes of inactivity to protect sensitive data.
- **Authentication**: JWT-based authentication for secure API communication.

---



