import React from "react";

const sizeClasses = {
  card: "h-36",
  details: "h-64 md:h-72",
  compare: "h-28"
};

const FALLBACK_IMAGE = "https://img.icons8.com/fluency/480/iphone-x.png";

const DeviceImage = ({src,alt,variant = "card",className = ""}) => {
  return (
    <img
      src={src || FALLBACK_IMAGE}
      alt={alt}
      loading="lazy"
      onError={(event) => {
        if (event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
          return;
        }

        event.currentTarget.src = FALLBACK_IMAGE;
      }}
      className={`w-full ${sizeClasses[variant]} object-contain bg-transparent transition-transform duration-200 hover:scale-105 ${className}`}
    />
  );
};

export default DeviceImage;
