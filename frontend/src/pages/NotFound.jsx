import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-black gradient-text animate-float">404</h1>
        <h2 className="text-2xl font-bold mt-4 mb-2">Page Not Found</h2>
        <p className="text-text-secondary mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Go Home
        </Link>
      </div>
    </div>
  );
}
