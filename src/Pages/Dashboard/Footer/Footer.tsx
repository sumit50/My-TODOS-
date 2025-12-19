import React from "react";
import {Link} from "react-router-dom";
export const Footer = () => {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Top Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-800">MyTodos</h3>
            <p className="text-sm text-gray-500 mt-1">
              Organize your day. Focus better.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm text-gray-600">
            <Link to="/dashboard" className="hover:text-blue-600 transition">
              Dashboard
            </Link>

            <Link to="/tasks" className="hover:text-blue-600 transition">
              Tasks
            </Link>

            <Link to="/feedback" className="hover:text-blue-600 transition">
              Feedback
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-8"></div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2025 MyTodos. All rights reserved.</p>

          <p>
            Built with <span className="font-medium">React</span> &{" "}
            <span className="font-medium">Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
