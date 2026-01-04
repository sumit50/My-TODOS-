import {NavLink, useNavigate} from "react-router-dom";
import {useState, useEffect} from "react";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  ClipboardCheck,
  User,
  LogOut,
  Menu,
  X,
  Plus,
  Sun,
  Moon,
} from "lucide-react";

interface NavbarProps {
  theme?: "light" | "dark";
}

const Navbar = ({theme = "light"}: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(theme === "dark");
  const navigate = useNavigate();

  useEffect(() => {
    const html = document.documentElement;
    darkMode ? html.classList.add("dark") : html.classList.remove("dark");
  }, [darkMode]);

  const NAV_ITEMS = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={16} />,
    },
    {path: "/todo", label: "Tasks", icon: <ClipboardCheck size={16} />},
    {path: "/profile", label: "Profile", icon: <User size={16} />},
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 shadow-sm ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo */}
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/dashboard")}>
              <ClipboardCheck className="w-6 h-6 text-blue-500" />
              <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-white">
                TodoApp
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({isActive}) =>
                    `px-3 py-1.5 rounded-md mx-1 flex items-center gap-1.5 text-sm font-medium ${
                      isActive
                        ? darkMode
                          ? "bg-gray-800 text-white"
                          : "bg-blue-50 text-blue-600"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                    }`
                  }>
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-md mx-1 ${
                  darkMode ? "text-yellow-300" : "text-gray-600"
                }`}>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={handleLogout}
                className={`px-3 py-1.5 rounded-md mx-1 flex items-center gap-1.5 text-sm font-medium ${
                  darkMode
                    ? "text-gray-300 hover:bg-red-900/30 hover:text-red-300"
                    : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                }`}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div
            className={`md:hidden shadow-lg ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}>
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({isActive}) =>
                    `px-5 py-3 flex items-center gap-3 border-b text-sm font-medium ${
                      isActive
                        ? darkMode
                          ? "bg-blue-900/30 text-blue-300 border-blue-800"
                          : "bg-blue-50 text-blue-600 border-blue-100"
                        : darkMode
                        ? "text-gray-300 hover:bg-gray-700 border-gray-700"
                        : "text-gray-700 hover:bg-gray-50 border-gray-100"
                    }`
                  }
                  onClick={() => setOpen(false)}>
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className={`px-5 py-3 flex items-center gap-3 border-b text-sm font-medium ${
                  darkMode
                    ? "text-red-400 hover:bg-gray-700 border-gray-700"
                    : "text-red-500 hover:bg-red-50 border-gray-100"
                }`}>
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <NavLink
          to="/todo/new"
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all ${
            darkMode
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}>
          <Plus size={20} />
        </NavLink>
      </div>

      {/* Padding for fixed navbar */}
      <div className="h-14"></div>
    </>
  );
};

export default Navbar;
