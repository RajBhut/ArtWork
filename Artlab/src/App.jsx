import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Artworks from "./pages/Artworks";
import Artists from "./pages/Artists";
import Exhibitions from "./pages/Exhibitions";
import ExhibitionDetails from "./pages/ExhibitionDetails";
import Sales from "./pages/Sales";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import Purchase from "./pages/Purchase";

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artworks"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Artworks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artists"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Artists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exhibitions"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Exhibitions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exhibitions/:id"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ExhibitionDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route path="/purchase/:id" element={<Purchase />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
