import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import CreatePost from './pages/CreatePost';
import PostsHistory from './pages/PostsHistory';
import MemberProfile from './pages/MemberProfile';
import BannedMembers from './pages/BannedMembers';
import Rules from './pages/Rules';
import Staff from './pages/Staff';
import Analytics from './pages/Analytics';
import Members from './pages/Members'; 
import Logs from './pages/Logs';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
        <Route
          path="/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
            path="/dashboard/posts"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
        <Route
          path="/dashboard/posts/history"
          element={
            <ProtectedRoute>
              <PostsHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/member/:discordId"
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/bans"
          element={
            <ProtectedRoute>
              <BannedMembers />
            </ProtectedRoute>
          }
        />
        <Route path="/regras" element={<Rules />} />
        <Route path="/equipa" element={<Staff />} />
        <Route path="/dashboard/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}