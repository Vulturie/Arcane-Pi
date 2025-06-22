import React from "react";

function ConfirmationModal({ message, visible, onConfirm, onCancel }) {
  if (!visible) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={onCancel}
    >
      <div
        className="bg-gray-800 p-4 rounded text-center border-4 border-yellow-600"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-4">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            className="px-3 py-1 bg-green-700 rounded hover:bg-green-600"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1 bg-red-700 rounded hover:bg-red-600"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
