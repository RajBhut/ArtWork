import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ExhibitionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exhibition, setExhibition] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchExhibitionDetails = async () => {
      try {
        setLoading(true);
        const [exhibitionRes, artworksRes] = await Promise.all([
          api.get(`/exhibitions/${id}`),
          api.get(`/exhibitions/${id}/artworks`),
        ]);

        setExhibition(exhibitionRes.data);
        setArtworks(artworksRes.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitionDetails();
  }, [id]);

  const handleArtworkClick = (artwork) => {
    setSelectedArtwork(artwork);
    setShowModal(true);
  };

  const handlePurchase = (artworkId) => {
    navigate(`/purchase/${artworkId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-mono bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {exhibition?.title}
              </h1>
              <p className="mt-2 text-gray-600">{exhibition?.description}</p>
              <div className="mt-4 flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  Start Date:{" "}
                  {new Date(exhibition?.startDate).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  End Date: {new Date(exhibition?.endDate).toLocaleDateString()}
                </span>
                <span className="text-sm text-gray-500">
                  Location: {exhibition?.location}
                </span>
              </div>
            </div>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate(`/exhibitions/${id}/edit`)}
                className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Exhibition
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => handleArtworkClick(artwork)}
            >
              <div className="relative h-64">
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/fallback-image.jpg";
                  }}
                />
                {artwork.isSold && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                    Sold
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {artwork.title}
                </h3>
                <p className="text-gray-600">{artwork.artist?.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{artwork.price?.toLocaleString()}
                  </span>
                  {!artwork.isSold && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(artwork._id);
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                    >
                      Purchase
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Artwork Modal */}
        {showModal && selectedArtwork && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedArtwork.title}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative h-96">
                    <img
                      src={selectedArtwork.imageUrl}
                      alt={selectedArtwork.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Artist: {selectedArtwork.artist?.name}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {selectedArtwork.description}
                    </p>
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900">Details</h4>
                      <ul className="mt-2 space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Medium:</span>
                          <span className="text-gray-900">
                            {selectedArtwork.medium}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Dimensions:</span>
                          <span className="text-gray-900">
                            {selectedArtwork.dimensions.height} X{" "}
                            {selectedArtwork.dimensions.width}{" "}
                            {selectedArtwork.dimensions.unit}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Year:</span>
                          <span className="text-gray-900">
                            {selectedArtwork.year}
                          </span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="text-gray-900">
                            ₹{selectedArtwork.price?.toLocaleString()}
                          </span>
                        </li>
                      </ul>
                    </div>
                    {!selectedArtwork.isSold && (
                      <button
                        onClick={() => handlePurchase(selectedArtwork._id)}
                        className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Purchase Artwork
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExhibitionDetails;
