import {useState} from "react";
import Navbar from "../../Components/Navbar/Navbar";

const sampleData = [
  {id: 1, title: "Buy groceries", date: "2025-01-10"},
  {id: 2, title: "Gym workout", date: "2025-01-15"},
  {id: 3, title: "Doctor appointment", date: "2025-01-20"},
  {id: 4, title: "Project submission", date: "2025-01-25"},
];

export default function DataFilter() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredData = sampleData.filter((item) => {
    if (!fromDate || !toDate) return true;

    const itemDate = new Date(item.date);
    const start = new Date(fromDate);
    const end = new Date(toDate);

    return itemDate >= start && itemDate <= end;
  });

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex justify-center p-6">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Filter Data by Date
          </h1>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
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
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3">
            {filteredData.length === 0 ? (
              <p className="text-center text-gray-500">
                No data found for selected range
              </p>
            ) : (
              filteredData.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 border rounded-lg bg-gray-50">
                  <span className="font-medium text-gray-800">
                    {item.title}
                  </span>
                  <span className="text-sm text-gray-500">{item.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
