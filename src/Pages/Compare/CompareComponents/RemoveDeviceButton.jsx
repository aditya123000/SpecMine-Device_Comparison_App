import React from "react";

const RemoveDeviceButton = ({ onRemove, label = "Remove device" }) => {
  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label={label}
      title={label}
      className="inline-flex h-6 w-6 items-center justify-center text-sm font-semibold text-rose-300 transition-colors hover:text-rose-500 active:text-rose-700"
    >
      x
    </button>
  );
};

export default RemoveDeviceButton;
