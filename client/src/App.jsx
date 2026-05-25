import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const Search = lazy(() => import('./pages/Search'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const BookingHistory = lazy(() => import('./pages/BookingHistory'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AddProperty = lazy(() => import('./pages/AddProperty'));
const EditProperty = lazy(() => import('./pages/EditProperty'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/properties/:id" element={<PropertyDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes — Any authenticated user */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                  } />
                  <Route path="/bookings" element={
                    <ProtectedRoute><BookingHistory /></ProtectedRoute>
                  } />
                  <Route path="/wishlist" element={
                    <ProtectedRoute><Wishlist /></ProtectedRoute>
                  } />
                  <Route path="/add-property" element={
                    <ProtectedRoute><AddProperty /></ProtectedRoute>
                  } />
                  <Route path="/edit-property/:id" element={
                    <ProtectedRoute><EditProperty /></ProtectedRoute>
                  } />

                  {/* Admin Only Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                  } />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>

            <Footer />
          </div>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a1a',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
              },
            }}
          />
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
