import React from "react";

function NotificationModal({ message, visible, onClose }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-4 rounded text-center border-4 border-yellow-600"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4">{message}</p>
        <button
          className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;