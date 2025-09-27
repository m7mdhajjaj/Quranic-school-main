import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const useAdminGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminAuth = () => {
      const user = localStorage.getItem("user");

      if (!user) {
        // No user logged in, redirect to login
        navigate("/login", { replace: true });
        return;
      }

      try {
        const userObj = JSON.parse(user);

        // Check if user is admin
        if (userObj.role !== "admin") {
          // Not an admin, redirect to home
          navigate("/", { replace: true });
          return;
        }

        // Admin is authenticated, allow access
        return true;
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Invalid user data, redirect to login
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }
    };

    // Check admin authentication
    checkAdminAuth();

    // Protect against browser back button
    const handlePopState = () => {
      const user = localStorage.getItem("user");

      if (!user) {
        window.history.pushState(null, "", "/login");
        navigate("/login", { replace: true });
        return;
      }

      try {
        const userObj = JSON.parse(user);
        if (userObj.role !== "admin") {
          window.history.pushState(null, "", "/");
          navigate("/", { replace: true });
        }
      } catch (error) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        window.history.pushState(null, "", "/login");
        navigate("/login", { replace: true });
      }
    };

    // Add listener for popstate event
    window.addEventListener("popstate", handlePopState);

    // Add entry to history to prevent going back
    window.history.pushState(null, "", window.location.href);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location.pathname]);
};

export default useAdminGuard;
