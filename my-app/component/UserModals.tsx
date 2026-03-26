import React from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { CreateUserPayload, UpdateUserPayload, Role } from '@/services/userManagement.service';

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newUser: CreateUserPayload;
  setNewUser: (user: CreateUserPayload) => void;
  roles: string[];
  actionLoading: boolean;
}

export function AddUserModal({ show, onClose, onSubmit, newUser, setNewUser, roles, actionLoading }: AddUserModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900">Add New User</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-gray-900">Full Name *</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Email Address *</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Password *</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Phone Number *</label>
              <input
                type="tel"
                value={newUser.phone_no}
                onChange={(e) => setNewUser({ ...newUser, phone_no: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Role *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editPayload: UpdateUserPayload;
  setEditPayload: (payload: UpdateUserPayload) => void;
  roles: string[];
  actionLoading: boolean;
}

export function EditUserModal({ show, onClose, onSubmit, editPayload, setEditPayload, roles, actionLoading }: EditUserModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-900">Edit User</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-gray-900">Full Name</label>
              <input
                type="text"
                value={editPayload.name || ''}
                onChange={(e) => setEditPayload({ ...editPayload, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Email Address</label>
              <input
                type="email"
                value={editPayload.email || ''}
                onChange={(e) => setEditPayload({ ...editPayload, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Phone Number</label>
              <input
                type="tel"
                value={editPayload.phone_no || ''}
                onChange={(e) => setEditPayload({ ...editPayload, phone_no: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Password (leave empty to keep current)</label>
              <input
                type="password"
                value={editPayload.password || ''}
                onChange={(e) => setEditPayload({ ...editPayload, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-900">Role</label>
              <select
                value={editPayload.role || ''}
                onChange={(e) => setEditPayload({ ...editPayload, role: e.target.value as Role })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-1 px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface DeleteUserConfirmProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionLoading: boolean;
}

export function DeleteUserConfirm({ show, onClose, onConfirm, actionLoading }: DeleteUserConfirmProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl text-center text-gray-900 mb-2">Delete User</h2>
        <p className="text-center text-gray-600 mb-6">
          Are you sure you want to delete this user? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}
