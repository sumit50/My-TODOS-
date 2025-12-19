import {NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";
import toast from "react-hot-toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className=" w-full bg-gradient-to-r from-blue-900 to-blue-500 text-white py-4 shadow-lg fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10">
          <NavLink to="/dashboard">
            <p className="font-bold text-xl md:text-2xl tracking-wider uppercase ">
              My Todos
            </p>
          </NavLink>

          <div className="flex gap-6 text-sm md:text-base font-medium ">
            <NavLink
              to="/dashboard"
              className={({isActive}) =>
                `relative group ${
                  isActive ? "text-yellow-200 font-semibold" : "text-white"
                }`
              }>
              Dashboard
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-200 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>

            <NavLink
              to="/todo"
              className={({isActive}) =>
                `relative group ${
                  isActive
                    ? "text-yellow-200 font-semibold"
                    : "text-white hover:text-white"
                }`
              }>
              My Task
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-200 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>

            <NavLink
              to="/DataFilter"
              className={({isActive}) =>
                `relative group ${
                  isActive
                    ? "text-yellow-200 font-semibold"
                    : "text-white hover:text-white"
                }`
              }>
              Data Filter
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-200 transition-all duration-300 group-hover:w-full"></span>
            </NavLink>

            <button
              onClick={() => setOpen(true)}
              className="relative group text-white hover:text-white">
              Logout
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-200 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* 🔹 MODAL (added without changing anything above) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal box */}
          <div className="relative bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Confirm Logout
            </h2>

            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded-lg">
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token"); // 🔥 THIS is logout
                  toast.success("Logged out successfully 👋");
                  navigate("/login");
                }}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
