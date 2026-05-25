import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 pt-16">
    <div className="text-center max-w-lg px-6">
      <div className="text-8xl font-bold font-display text-gray-200 mb-2">404</div>
      <div className="text-5xl mb-6">🏚️</div>
      <h1 className="text-3xl font-bold font-display text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8 leading-relaxed">
        Looks like this page packed its bags and left. Let's get you back on track!
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-primary flex items-center justify-center gap-2">
          <FiHome /> Go Home
        </Link>
        <Link to="/search" className="btn-secondary flex items-center justify-center gap-2">
          <FiSearch /> Browse Properties
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
