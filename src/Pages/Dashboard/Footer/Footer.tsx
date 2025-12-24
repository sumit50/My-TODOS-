import {Link} from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-6 py-14">
        {/* TOP */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          {/* BRAND */}
          <div>
            <h3 className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">
              My<span className="text-blue-600">Todos</span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
              Organize your day. Focus better. Achieve more with clarity.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex gap-8 text-sm font-medium">
            <Link
              to="/dashboard"
              className="group relative text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
              Dashboard
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
            </Link>
            <Link
              to="/todo"
              className="group relative text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
              Tasks
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
            </Link>
            <Link
              to="/feedback"
              className="group relative text-gray-600 dark:text-gray-400 hover:text-blue-600 transition">
              Feedback
              <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-blue-600 transition-all group-hover:w-full" />
            </Link>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="border-t border-gray-200 dark:border-gray-800 my-10"></div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            © 2025{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              MyTodos
            </span>
            . All rights reserved.
          </p>

          <p className="flex items-center gap-2">
            Built with
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium">
              React
            </span>
            &
            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 font-medium">
              Tailwind
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};
