import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Exhibitions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExhibition, setNewExhibition] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    location: {
      venue: "",
      address: "",
      city: "",
      country: "",
    },
    imageUrl: "",
  });

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/exhibitions");
        setExhibitions(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  const handleAddExhibition = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/exhibitions", newExhibition);
      setExhibitions([...exhibitions, response.data]);
      setShowAddModal(false);
      setNewExhibition({
        title: "",
        description: "",
        startDate: "",
        endDate: "",
        location: {
          venue: "",
          address: "",
          city: "",
          country: "",
        },
        imageUrl: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredExhibitions = exhibitions.filter((exhibition) => {
    const matchesSearch = exhibition.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "upcoming" &&
        new Date(exhibition.startDate) > new Date()) ||
      (filterStatus === "current" &&
        new Date(exhibition.startDate) <= new Date() &&
        new Date(exhibition.endDate) >= new Date()) ||
      (filterStatus === "past" && new Date(exhibition.endDate) < new Date());

    return matchesSearch && matchesStatus;
  });

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exhibitions</h1>
            <p className="mt-2 text-gray-600">
              Browse and manage art exhibitions
            </p>
          </div>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Exhibition
            </button>
          )}
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search exhibitions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=" py-2 px-2 w-full focus:ring-blue-200 focus:border-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Exhibitions</option>
            <option value="upcoming">Upcoming</option>
            <option value="current">Current</option>
            <option value="past">Past</option>
          </select>
        </div>

        {/* Exhibitions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExhibitions.map((exhibition) => (
            <div
              key={exhibition._id || exhibition.id}
              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() =>
                navigate(`/exhibitions/${exhibition._id || exhibition.id}`)
              }
            >
              <div className="relative h-48">
                <img
                  src={exhibition.imageUrl}
                  alt={exhibition.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/fallback-image.jpg";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h3 className="text-xl font-semibold text-white">
                    {exhibition.title}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-600 line-clamp-2">
                  {exhibition.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(exhibition.startDate).toLocaleDateString()} -{" "}
                    {new Date(exhibition.endDate).toLocaleDateString()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {typeof exhibition.location === "object"
                      ? `${exhibition.location.venue}, ${exhibition.location.city}`
                      : exhibition.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Exhibition Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Add New Exhibition
                  </h2>
                  <button
                    onClick={() => setShowAddModal(false)}
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
                <form onSubmit={handleAddExhibition} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newExhibition.title}
                      onChange={(e) =>
                        setNewExhibition({
                          ...newExhibition,
                          title: e.target.value,
                        })
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
                      value={newExhibition.description}
                      onChange={(e) =>
                        setNewExhibition({
                          ...newExhibition,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={newExhibition.startDate}
                        onChange={(e) =>
                          setNewExhibition({
                            ...newExhibition,
                            startDate: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={newExhibition.endDate}
                        onChange={(e) =>
                          setNewExhibition({
                            ...newExhibition,
                            endDate: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={newExhibition.location.venue}
                      onChange={(e) =>
                        setNewExhibition({
                          ...newExhibition,
                          location: {
                            ...newExhibition.location,
                            venue: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      value={newExhibition.location.address}
                      onChange={(e) =>
                        setNewExhibition({
                          ...newExhibition,
                          location: {
                            ...newExhibition.location,
                            address: e.target.value,
                          },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        value={newExhibition.location.city}
                        onChange={(e) =>
                          setNewExhibition({
                            ...newExhibition,
                            location: {
                              ...newExhibition.location,
                              city: e.target.value,
                            },
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        value={newExhibition.location.country}
                        onChange={(e) =>
                          setNewExhibition({
                            ...newExhibition,
                            location: {
                              ...newExhibition.location,
                              country: e.target.value,
                            },
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={newExhibition.imageUrl}
                      onChange={(e) =>
                        setNewExhibition({
                          ...newExhibition,
                          imageUrl: e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Exhibition
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

export default Exhibitions;
