import {Routes, Route, Navigate} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import ProtectedRoute from "./Components/ProtectedRoute";

// 📄 Pages (normal imports)
import {LoginPage} from "./Pages/auth/login";
import {RegisterPage} from "./Pages/auth/register";
import {DashbordPage} from "./Pages/Dashboard/MainPage";
import {TodoPage} from "./Pages/todo/page";
import {ForgetPage} from "./Pages/Forget/forget";
import DataFilter from "./Pages/DataFilter/dataFilter";
function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* 🌐 Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forget" element={<ForgetPage />} />
        <Route path="/useTodos" element={<TodoPage />} />

        <Route path="/datafilter" element={<DataFilter />} />

        {/* 🔐 Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashbordPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/todo"
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/data-filter"
          element={
            <ProtectedRoute>
              <DataFilter />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
