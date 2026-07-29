
import React, { useState } from 'react';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

const DeleteAccountCard = ({ onDelete, isDeleting }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <FiAlertTriangle size={20} className="text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">Delete Account</h3>
          <p className="text-sm text-gray-500 mt-1">
            Once you delete your account, there is no going back. All your data will be permanently removed.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-4 inline-flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
            >
              <FiTrash2 size={16} />
              Delete Account
            </button>
          ) : (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-red-800">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountCard;