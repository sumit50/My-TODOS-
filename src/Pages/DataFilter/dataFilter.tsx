import {useState} from "react";
import Navbar from "../../Components/Navbar/Navbar";

interface DataItem {
  id: number;
  title: string;
  date: string;
  category?: string;
  status?: "pending" | "completed";
}

const sampleData: DataItem[] = [
  {
    id: 1,
    title: "Buy groceries",
    date: "2025-01-10",
    category: "Personal",
    status: "pending",
  },
  {
    id: 2,
    title: "Gym workout",
    date: "2025-01-15",
    category: "Health",
    status: "completed",
  },
  {
    id: 3,
    title: "Doctor appointment",
    date: "2025-01-20",
    category: "Health",
    status: "pending",
  },
  {
    id: 4,
    title: "Project submission",
    date: "2025-01-25",
    category: "Work",
    status: "completed",
  },
  {
    id: 5,
    title: "Team meeting",
    date: "2025-01-05",
    category: "Work",
    status: "pending",
  },
  {
    id: 6,
    title: "Car service",
    date: "2025-01-30",
    category: "Personal",
    status: "pending",
  },
  {
    id: 7,
    title: "Read book",
    date: "2025-01-12",
    category: "Personal",
    status: "completed",
  },
  {
    id: 8,
    title: "Pay bills",
    date: "2025-01-28",
    category: "Finance",
    status: "pending",
  },
];

export default function DataFilter() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get unique categories for filter dropdown
  const categories = [
    "all",
    ...new Set(sampleData.map((item) => item.category).filter(Boolean)),
  ];

  const filteredData = sampleData.filter((item) => {
    // Date filter
    if (fromDate && toDate) {
      const itemDate = new Date(item.date);
      const start = new Date(fromDate);
      const end = new Date(toDate);

      if (itemDate < start || itemDate > end) return false;
    }

    // Category filter
    if (category !== "all" && item.category !== category) return false;

    // Status filter
    if (status !== "all" && item.status !== status) return false;

    // Search filter
    if (
      searchTerm &&
      !item.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Calculate statistics
  const totalItems = sampleData.length;
  const filteredCount = filteredData.length;
  const pendingCount = sampleData.filter(
    (item) => item.status === "pending"
  ).length;
  const completedCount = sampleData.filter(
    (item) => item.status === "completed"
  ).length;

  // Clear all filters
  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setCategory("all");
    setStatus("all");
    setSearchTerm("");
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if any filter is active
  const isFilterActive =
    fromDate || toDate || category !== "all" || status !== "all" || searchTerm;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Data Filter Dashboard
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Filter and search through your data using date ranges, categories,
              and status
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Filter Controls Section */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Filters & Search
                </h2>

                {isFilterActive && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 flex items-center gap-2">
                    <span>🗑️</span>
                    Clear All Filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Search Tasks
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                    />
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      🔍
                    </span>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Date Range Display */}
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    Date Range
                  </label>
                  <p className="text-sm text-gray-700">
                    {fromDate && toDate
                      ? `${fromDate} to ${toDate}`
                      : "Select date range"}
                  </p>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                    max={toDate || "2025-12-31"}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                    min={fromDate || "2025-01-01"}
                  />
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="p-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Items
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {totalItems}
                  </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                  <p className="text-sm text-yellow-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {pendingCount}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-sm text-green-600 font-medium">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-700">
                    {completedCount}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm text-purple-600 font-medium">
                    Filtered Items
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {filteredCount}
                  </p>
                </div>
              </div>

              {/* Results Header */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Results ({filteredCount} items)
                </h3>
                {filteredCount !== totalItems && (
                  <span className="text-sm text-gray-500">
                    Showing {filteredCount} of {totalItems} items
                  </span>
                )}
              </div>

              {/* Results List */}
              {filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No items found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters or search term
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200">
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredData.map((item) => (
                    <div
                      key={item.id}
                      className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                          {item.status === "completed"
                            ? "Completed"
                            : "Pending"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-gray-600">
                            📅 {formatDate(item.date)}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            🏷️ {item.category}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          ID: {item.id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary */}
              {filteredData.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-gray-600">
                        Showing{" "}
                        <span className="font-semibold">{filteredCount}</span>{" "}
                        items
                        {isFilterActive && " with filters applied"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const today = new Date().toISOString().split("T")[0];
                          setFromDate("2025-01-01");
                          setToDate(today);
                        }}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200">
                        Set Year Range
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date();
                          const lastWeek = new Date(today);
                          lastWeek.setDate(today.getDate() - 7);
                          setFromDate(lastWeek.toISOString().split("T")[0]);
                          setToDate(today.toISOString().split("T")[0]);
                        }}
                        className="px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200">
                        Last 7 Days
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
