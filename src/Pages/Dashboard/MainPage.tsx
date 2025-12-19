// src/Pages/Dashboard/DashbordPage.tsx
import Navbar from "../../Components/Navbar/Navbar";
import {Link} from "react-router-dom";
import {Form} from "./feedbackForm.tsx/Form";
import {Footer} from "./Footer/Footer";
export const DashbordPage = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen px-6 md:px-12 flex items-center justify-center bg-gray-200">
        <div
          className="bg-white w-full max-w-5xl p-10 rounded-2xl shadow-2xl border border-gray-100 text-center
">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to your <span className="text-blue-600"> Dashboard</span>{" "}
          </h1>

          <p className="text-lg text-gray-600 mb-8 pt-3">
            Organize your day, focus your mind, and get things done efficiently.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div
              className="
  bg-blue-50 p-6 rounded-xl shadow-sm
  transition-all duration-300 delay-150
  hover:shadow-lg hover:-translate-y-1
">
              <h3 className="text-xl font-semibold text-blue-700 mb-2">
                ✍️ Create Tasks
              </h3>
              <p className="text-gray-600 text-sm">
                Add tasks quickly and never forget important work.
              </p>
            </div>

            <div
              className="bg-green-50 p-6 rounded-xl shadow-sm  transition-all duration-300 ease-out
    transform
    hover:-translate-y-1 hover:scale-[1.02]
    hover:shadow-xl">
              <h3 className="text-xl font-semibold text-green-700 mb-2">
                ✅ Stay Productive
              </h3>
              <p className="text-gray-600 text-sm">
                Track progress and keep your workflow clean.
              </p>
            </div>

            <div
              className="bg-purple-50 p-6 rounded-xl shadow-sm  transition-all duration-300 delay-150
  hover:shadow-lg hover:-translate-y-1">
              <h3 className="text-xl font-semibold text-purple-700 mb-2">
                🧠 Clear Mind
              </h3>
              <p className="text-gray-600 text-sm">
                Clear tasks. Clear mind. Less stress, more focus.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 p-6 rounded-xl  pt-5">
            <p className="text-gray-700 text-base  ">
              Ready to manage your Todo
            </p>

            <Link to="/todo">
              <button className="  hover:shadow-lg hover:-translate-y-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition ">
                My Todo's→
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-28 px-6 md:px-12 flex justify-center mb-12">
        <div className="w-full max-w-3xl">
          <Form />
        </div>
      </div>
      <Footer />
    </>
  );
};
