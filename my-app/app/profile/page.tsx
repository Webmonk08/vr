'use client'
import { useState, useEffect } from 'react';
import { Wheat, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, LogOut, ShoppingBag, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUser, changePassword } from '@/services/user.service';
import { ErrorPage } from '@/component/error-page';


export default function ProfilePage() {
  // Mock user data - in a real app, this would come from auth state
  const router = useRouter();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const { user, role } = useAuthStore()
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: () => getUserProfile(user?.id || ''),
  });
  console.log(userData)
  if (userData) {
    userData.email = user?.email || ''
  }
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (userData) {
      setEditedData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    }
  }, [userData]);

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setIsEditingDetails(false);
      alert('Details updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update details: ' + error.message);
    }
  });

  const passwordMutation = useMutation({
    mutationFn: async (password: string) => {
      const session = useAuthStore.getState().session;
      return changePassword(password, session?.access_token || '');
    },
    onSuccess: () => {
      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    },
    onError: (error) => {
      alert('Failed to change password: ' + error.message);
    }
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleUpdateDetails = () => {
    updateMutation.mutate({
      UserId: user?.id,
      name: editedData.name,
      phone: editedData.phone,
      address: editedData.address
    });
  };

  const handleCancelEdit = () => {
    if (userData) {
      setEditedData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    }
    setIsEditingDetails(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }
    passwordMutation.mutate(passwordData.newPassword);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
      logout()
      router.replace(' / ');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorPage errorType="general" message="Failed to load profile data. Please try again later." />
    );
  }

  if (!userData && !isLoading) {
    router.push('/login');
    return null;
  }

  const orderHistory = [
    {
      id: 'ORD-2025-001',
      date: 'Jan 15, 2025',
      items: 'Premium Jasmine Rice x2',
      total: 49.98,
      status: 'Delivered'
    },
    {
      id: 'ORD-2025-002',
      date: 'Dec 28, 2024',
      items: 'Premium Basmati Rice x1',
      total: 29.99,
      status: 'Delivered'
    },
    {
      id: 'ORD-2024-098',
      date: 'Dec 10, 2024',
      items: 'Brown Rice Blend x3',
      total: 68.97,
      status: 'Delivered'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-3xl mb-2">{userData?.name}</h1>
              <p className="text-green-100">{userData?.email}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-green-700" />
                  <h2 className="text-xl text-gray-900">Personal Information</h2>
                </div>
                {!isEditingDetails ? (
                  <button
                    onClick={() => setIsEditingDetails(true)}
                    className="text-green-700 hover:text-green-800 transition text-sm"
                  >
                    Edit Details
                  </button>
                ) : null}
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                  {isEditingDetails ? (
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editedData.name}
                        onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-900 bg-gray-50 px-4 py-3 rounded-full">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{userData?.name}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Email Address</label>
                  <div className="flex items-center gap-3 text-gray-900 bg-gray-50 px-4 py-3 rounded-full">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>{userData?.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-4">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Phone Number</label>
                  {isEditingDetails ? (
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={editedData.phone}
                        onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-gray-900 bg-gray-50 px-4 py-3 rounded-full">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{userData?.phone}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Delivery Address</label>
                  {isEditingDetails ? (
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-4" />
                      <textarea
                        value={editedData.address}
                        onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                        rows={2}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-700 focus:outline-none resize-none"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-gray-900 bg-gray-50 px-4 py-3 rounded-2xl">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span>{userData?.address}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {isEditingDetails && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateDetails}
                      className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-full transition"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-green-700" />
                <h2 className="text-xl text-gray-900">Security Settings</h2>
              </div>

              {!isChangingPassword ? (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full border-2 border-green-700 text-green-700 hover:bg-green-50 py-3 rounded-full transition"
                >
                  Change Password
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Current Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-green-700 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleChangePassword}
                      className="flex-1 bg-green-700 hover:bg-green-800 text-white py-3 rounded-full transition"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl mb-6 text-gray-900">Recent Orders</h2>
              <div className="space-y-4">
                {orderHistory.map((order) => (
                  <div key={order.id} className="border-2 border-gray-100 rounded-2xl p-4 hover:border-green-200 transition">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Order #{order.id}</span>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-gray-900 mb-1">{order.items}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{order.date}</span>
                      <span className="text-gray-900">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-green-700 hover:text-green-800 transition py-2">
                View All Orders →
              </button>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="mb-4 text-gray-900">Account Overview</h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl text-gray-900">12</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl text-gray-900">$348.94</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="mb-4 text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
                {role === 'OWNER' && (
                  <button
                    onClick={() => router.push('/user-management')}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-full transition"
                  >
                    User Management
                  </button>
                )}
                <button
                  onClick={() => router.push('/products')}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-full transition"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => router.push('/cart')}
                  className="w-full border-2 border-green-700 text-green-700 hover:bg-green-50 py-3 rounded-full transition"
                >
                  View Cart
                </button>
                <button className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-3 rounded-full transition">
                  Track Order
                </button>
              </div>
            </div>

            {/* Logout */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-full transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
