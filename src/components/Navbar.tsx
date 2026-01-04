import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function Navbar({ user }: { user: any }) {
  const handleLogout = () => signOut(auth);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="max-w-2xl mx-auto flex justify-around items-center">
        <Link to="/" className="p-3">🏠 Home</Link>
        <Link to="/upload" className="p-3">➕</Link>
        {user ? (
          <button onClick={handleLogout} className="p-3 text-red-500">Logout</button>
        ) : (
          <Link to="/login" className="p-3">Login</Link>
        )}
      </div>
    </nav>
  );
}