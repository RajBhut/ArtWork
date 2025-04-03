import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Artworks = () => {
  const { user } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    artistId: "",
    exhibitionId: "",
    price: "",
    medium: "",
    dimensions: {
      height: "",
      width: "",
      unit: "cm",
    },
    year: "",
    imageUrl: "",
    category: "",
    status: "available",
    tags: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [artworksRes, artistsRes, exhibitionsRes] = await Promise.all([
        api.get("/artworks"),
        api.get("/artists"),
        api.get("/exhibitions"),
      ]);
      setArtworks(artworksRes.data);
      setArtists(artistsRes.data);
      setExhibitions(exhibitionsRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArtwork) {
        await api.put(`/artworks/${editingArtwork._id}`, formData);
      } else {
        await api.post("/artworks", formData);
      }
      setIsModalOpen(false);
      setEditingArtwork(null);
      setFormData({
        title: "",
        description: "",
        artistId: "",
        exhibitionId: "",
        price: "",
        medium: "",
        dimensions: {
          height: "",
          width: "",
          unit: "cm",
        },
        year: "",
        imageUrl: "",
        category: "",
        status: "available",
        tags: [],
      });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (artwork) => {
    setEditingArtwork(artwork);
    setFormData({
      ...artwork,
      artistId: artwork.artist._id,
      dimensions: artwork.dimensions || {
        height: "",
        width: "",
        unit: "cm",
      },
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    console.log("Attempting to delete artwork with ID:", id);
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        console.log("Making delete request to:", `/artworks/${id}`);
        const response = await api.delete(`/artworks/${id}`);
        console.log("Delete response:", response);

        if (response.status === 200) {
          // Remove the artwork from the local state immediately
          setArtworks(artworks.filter((artwork) => artwork._id !== id));
          setError(null); // Clear any previous errors
        }
      } catch (err) {
        console.error("Delete error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });

        // Show more detailed error message to the user
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to delete artwork";

        setError(errorMessage);

        // Show error in a more visible way
        alert(`Error deleting artwork: ${errorMessage}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Artworks</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Artwork
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {artworks.map((artwork) => (
            <div
              key={artwork._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {artwork.imageUrl && (
                <img
                  src={artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {artwork.title}
                </h3>
                <p className="mt-2 text-gray-600">{artwork.description}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Artist:</span>{" "}
                    {artwork.artist?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Exhibition:</span>{" "}
                    {exhibitions.find((e) => e.id === artwork.exhibitionId)
                      ?.title || "Not in exhibition"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Category:</span>{" "}
                    {artwork.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Medium:</span>{" "}
                    {artwork.medium}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Dimensions:</span>{" "}
                    {artwork.dimensions
                      ? `${artwork.dimensions.height}${artwork.dimensions.unit} × ${artwork.dimensions.width}${artwork.dimensions.unit}`
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Year:</span> {artwork.year}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Price:</span> $
                    {artwork.price?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`capitalize ${
                        artwork.status === "available"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {artwork.status}
                    </span>
                  </p>
                  {artwork.tags && artwork.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {artwork.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-6 flex space-x-3">
                  <Link
                    to={`/purchase/${artwork._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Purchase
                  </Link>
                  <button
                    onClick={() => handleEdit(artwork)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(artwork._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingArtwork ? "Edit Artwork" : "Add Artwork"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Artist
                    </label>
                    <select
                      value={formData.artistId}
                      onChange={(e) =>
                        setFormData({ ...formData, artistId: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select an artist</option>
                      {artists.map((artist) => (
                        <option key={artist.id} value={artist.id}>
                          {artist.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Exhibition
                    </label>
                    <select
                      value={formData.exhibitionId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          exhibitionId: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select an exhibition (optional)</option>
                      {exhibitions.map((exhibition) => (
                        <option key={exhibition.id} value={exhibition.id}>
                          {exhibition.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Medium
                    </label>
                    <input
                      type="text"
                      value={formData.medium}
                      onChange={(e) =>
                        setFormData({ ...formData, medium: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Dimensions
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <input
                          type="number"
                          value={
                            typeof formData.dimensions === "object"
                              ? formData.dimensions.height
                              : ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dimensions: {
                                ...(typeof formData.dimensions === "object"
                                  ? formData.dimensions
                                  : {}),
                                height: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Height"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={
                            typeof formData.dimensions === "object"
                              ? formData.dimensions.width
                              : ""
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dimensions: {
                                ...(typeof formData.dimensions === "object"
                                  ? formData.dimensions
                                  : {}),
                                width: parseFloat(e.target.value) || 0,
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Width"
                          required
                        />
                      </div>
                      <div>
                        <select
                          value={
                            typeof formData.dimensions === "object"
                              ? formData.dimensions.unit
                              : "cm"
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dimensions: {
                                ...(typeof formData.dimensions === "object"
                                  ? formData.dimensions
                                  : {}),
                                unit: e.target.value,
                              },
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="cm">cm</option>
                          <option value="in">in</option>
                          <option value="m">m</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Year
                    </label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="reserved">Reserved</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags.join(", ")}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="e.g., modern, abstract, landscape"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingArtwork(null);
                        setFormData({
                          title: "",
                          description: "",
                          artistId: "",
                          exhibitionId: "",
                          price: "",
                          medium: "",
                          dimensions: {
                            height: "",
                            width: "",
                            unit: "cm",
                          },
                          year: "",
                          imageUrl: "",
                          category: "",
                          status: "available",
                          tags: [],
                        });
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {editingArtwork ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artworks;
