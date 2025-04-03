import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Purchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    buyerName: "",
    buyerEmail: "",
    buyerPhone: "",
    shippingAddress: "",
    paymentMethod: "credit_card",
  });

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  const fetchArtwork = async () => {
    try {
      const response = await api.get(`/artworks/${id}`);
      setArtwork(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create sale record
      const saleData = {
        artworkId: artwork._id,
        ...formData,
        price: artwork.price,
        saleDate: new Date().toISOString(),
      };

      await api.post("/sales", saleData);

      // Update artwork status
      await api.put(`/artworks/${artwork._id}`, {
        ...artwork,
        status: "sold",
      });

      navigate("/");
    } catch (err) {
      setError(err.message);
    }
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
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Artwork not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Purchase Artwork
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Artwork Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Artwork Details
                </h2>
                {artwork.imageUrl && (
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <div className="space-y-2">
                  <p className="text-lg font-medium">{artwork.title}</p>
                  <p className="text-gray-600">{artwork.description}</p>
                  <p className="text-gray-600">
                    Artist: {artwork.artist?.name}
                  </p>
                  <p className="text-gray-600">Medium: {artwork.medium}</p>
                  <p className="text-gray-600">
                    Dimensions:{" "}
                    {artwork.dimensions
                      ? `${artwork.dimensions.height}${artwork.dimensions.unit} × ${artwork.dimensions.width}${artwork.dimensions.unit}`
                      : "N/A"}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${artwork.price?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Purchase Form */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Purchase Information
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.buyerName}
                      onChange={(e) =>
                        setFormData({ ...formData, buyerName: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.buyerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, buyerEmail: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.buyerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, buyerPhone: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <textarea
                      value={formData.shippingAddress}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shippingAddress: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="credit_card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Complete Purchase
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;
