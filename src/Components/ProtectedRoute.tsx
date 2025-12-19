import {Navigate, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import toast from "react-hot-toast";

type Props = {
  children: JSX.Element;
};

const ProtectedRoute = ({children}: Props) => {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState(!!localStorage.getItem("token"));

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAllowed(false);
        toast.error("Login first");
        navigate("/login");
      }
    };

    // check on mount
    checkToken();

    // listen for token deletion (other tabs or devtools)
    window.addEventListener("storage", checkToken);

    return () => {
      window.removeEventListener("storage", checkToken);
    };
  }, [navigate]);

  if (!isAllowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
