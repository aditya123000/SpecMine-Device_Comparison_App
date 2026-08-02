import React from "react";
import { useNavigate } from "react-router-dom";
import { FaTriangleExclamation } from "react-icons/fa6";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <FaTriangleExclamation className="text-sky-400 text-5xl" />

      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
        Page not found
      </h1>

      <p className="max-w-md text-slate-600 dark:text-slate-400">
        The page or resource you are trying to access does not exist.
      </p>

      <button
        onClick={() => navigate("/devices")}
        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded text-white"
      >
        Go to Devices
      </button>
    </div>
  );
};

export default NotFound;
