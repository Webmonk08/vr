
'use client'
import withAuth from '@/component/withAuth';
import { UserManagementService, UserManagementData, CreateUserPayload, UpdateUserPayload, ROLES, Role } from '@/services/userManagement.service';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/component/UserStats';
import { UserList } from '@/component/UserList';
import { AddUserModal, EditUserModal, DeleteUserConfirm } from '@/component/UserModals';

const UserManagementPage = () => {
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagementData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState<CreateUserPayload>({
    name: '',
    email: '',
    phone_no: '',
    role: ROLES.MANAGER,
    password: '',
  });

  const [editPayload, setEditPayload] = useState<UpdateUserPayload>({});

  const roles = ["Choose the Role ", 'admin', 'manager', 'owner', 'customer'];

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null)
      const data = await UserManagementService.getAll();
      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);



  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await UserManagementService.create(newUser);
      setNewUser({ name: '', email: '', phone_no: '', role: ROLES.MANAGER, password: '' });
      setShowAddModal(false);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setActionLoading(true);
      await UserManagementService.update(editingUser.id, editPayload);
      setShowEditModal(false);
      setEditingUser(null);
      setEditPayload({});
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      setActionLoading(true);
      await UserManagementService.delete(deletingUserId);
      setShowDeleteConfirm(false);
      setDeletingUserId(null);
      await fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: UserManagementData) => {
    setEditingUser(user);
    setEditPayload({
      name: user.name,
      email: user.email,
      phone_no: user.phone_no,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen ">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage users, roles, and permissions</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full transition flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add New User
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <UserStats users={users} />

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent transition"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700">
            {error}
            <button onClick={fetchUsers} className="ml-4 underline">Retry</button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Loader2 className="w-10 h-10 text-green-700 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading users...</p>
          </div>
        ) : (
          /* Users List */
          <UserList
            users={filteredUsers}
            onEdit={openEditModal}
            onDelete={(id) => {
              setDeletingUserId(id);
              setShowDeleteConfirm(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
        newUser={newUser}
        setNewUser={setNewUser}
        roles={roles}
        actionLoading={actionLoading}
      />

      <EditUserModal
        show={showEditModal && editingUser !== null}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
          setEditPayload({});
        }}
        onSubmit={handleEditUser}
        editPayload={editPayload}
        setEditPayload={setEditPayload}
        roles={roles}
        actionLoading={actionLoading}
      />

      <DeleteUserConfirm
        show={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingUserId(null);
        }}
        onConfirm={handleDeleteUser}
        actionLoading={actionLoading}
      />
    </div>
  );
}
export default withAuth(UserManagementPage, ['OWNER'])
