// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Profile from './Pages/Profile';
import Login from './components/Login'; // if needed
import Signup from './components/SignUp';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile/:uid" element={<Profile />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      {/* Add more routes as needed */}
    </Routes>
  );
}

export default App;