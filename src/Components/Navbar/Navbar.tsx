import {NavLink, useNavigate} from "react-router-dom";
import {useState} from "react";
import toast from "react-hot-toast";

const NAV_LINKS = [
  {path: "/dashboard", label: "Dashboard"},
  {path: "/todo", label: "My Task"},
  {path: "/DataFilter", label: "Data Filter"},
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully 👋");
    setOpen(false);
    navigate("/login");
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full bg-gradient-to-r from-blue-900 to-blue-500 text-white py-4 shadow-lg fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-10">
          <NavLink to="/dashboard">
            <p className="font-bold text-xl md:text-2xl tracking-wider uppercase hover:opacity-80 transition-opacity">
              My Todos
            </p>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="flex gap-6 text-sm md:text-base font-medium">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({isActive}) =>
                  `relative group transition-colors ${
                    isActive
                      ? "text-yellow-200 font-semibold"
                      : "text-white/90 hover:text-white"
                  }`
                }>
                {link.label}
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-200 transition-all duration-300 group-hover:w-full"></span>
              </NavLink>
            ))}

            <button
              onClick={() => setOpen(true)}
              className="relative group text-white/90 hover:text-white transition-colors">
              Logout
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-yellow-200 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </div>
        </div>
      </nav>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Modal box */}
          <div className="relative bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl transform transition-all scale-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Confirm Logout
              </h2>
              <p className="text-gray-600 mb-8">
                Are you sure you want to logout? You'll need to sign in again to
                access your tasks.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium shadow-md shadow-red-200">
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
