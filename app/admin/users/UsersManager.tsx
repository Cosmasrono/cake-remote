'use client';

import { useState } from 'react';
import { FaUserCircle, FaUserPlus, FaCheck, FaTimes, FaShieldAlt, FaCashRegister } from 'react-icons/fa';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string | Date;
}

export default function UsersManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New user form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CASHIER',
  });

  // Role updating state
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUsers([data.user, ...users]);
      setSuccess(`Staff account for ${data.user.name} created successfully!`);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'CASHIER' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch (err: any) {
      setError(err.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <FaShieldAlt className="text-[10px]" />
            {role}
          </span>
        );
      case 'CASHIER':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            <FaCashRegister className="text-[10px]" />
            POS CASHIER
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
            CUSTOMER
          </span>
        );
    }
  };

  return (
    <div>
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Users & Staff Directory</h2>
          <p className="text-sm text-stone-500">
            Manage store logins, counter cashiers, and administrators ({users.length} total)
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setError('');
            setSuccess('');
          }}
          className="bakery-button flex items-center gap-2"
        >
          <FaUserPlus />
          Add Staff / Cashier
        </button>
      </div>

      {error && (
        <div className="notice mb-6" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-sm flex items-center gap-2">
          <FaCheck className="text-emerald-600" />
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Current Role</th>
                <th className="px-6 py-3.5">Change Access</th>
                <th className="px-6 py-3.5">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-sm">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-stone-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <FaUserCircle className="text-3xl text-stone-300" />
                        <div>
                          <p className="font-semibold text-stone-900">{user.name}</p>
                          <p className="text-xs text-stone-400 font-mono">ID: {user.id.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-stone-600 font-mono text-xs">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        aria-label={`Change role for ${user.name}`}
                        disabled={updatingUserId === user.id || user.role === 'SUPER_ADMIN'}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="text-xs border border-stone-300 rounded px-2.5 py-1.5 bg-white text-stone-700 focus:border-[#713c46] focus:ring-1 focus:ring-[#713c46]"
                      >
                        <option value="USER">Customer (User)</option>
                        <option value="CASHIER">POS Cashier / Staff</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-stone-500">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-md w-full p-6 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-stone-100">
              <h3 className="font-serif text-2xl text-stone-900">Add Staff / Cashier</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Mwangi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-stone-300 rounded p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@japhescakes.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-stone-300 rounded p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Temporary login password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-stone-300 rounded p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Assigned Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-stone-300 rounded p-2.5 text-sm bg-white"
                >
                  <option value="CASHIER">POS Cashier (POS Access Only)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                  <option value="USER">Customer (Storefront Only)</option>
                </select>
                <p className="text-xs text-stone-500 mt-1">
                  Cashiers can access the POS terminal at <code className="text-[#713c46]">/pos</code> to ring up sales.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded text-sm hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bakery-button text-sm py-2 px-4"
                >
                  {isSubmitting ? 'Creating account…' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
