import React from "react";
import { FaMobileAlt } from "react-icons/fa";

const sizeClasses = {
  card: "h-36",
  details: "h-64 md:h-72",
  compare: "h-28"
};

const DeviceImage = ({src,alt,variant = "card",className = ""}) => {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`w-full ${sizeClasses[variant]} object-contain bg-transparent transition-transform duration-200 hover:scale-105 ${className}`}
    />
  );
};

export default DeviceImage;
