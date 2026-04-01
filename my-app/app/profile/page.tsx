'use client'
import { useState, useEffect } from 'react';
import { Wheat, User, Mail, Phone, MapPin, Lock, Eye, EyeOff, LogOut, ShoppingBag, Settings, Clock, Truck, CheckCircle, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUser, changePassword } from '@/services/user.service';
import { OrdersService, Order } from '@/services/orders.service';
import { ErrorPage } from '@/component/error-page';
import Link from 'next/link';


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

  // Fetch real user orders
  const { data: userOrders, isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ['userOrders', user?.id],
    queryFn: () => OrdersService.getByUser(user?.id || ''),
    enabled: !!user?.id,
  });

  // Compute account overview stats
  const totalOrders = userOrders?.length || 0;
  const totalSpent = userOrders?.reduce((sum, o) => sum + o.total_amount, 0) || 0;
  const pendingOrders = userOrders?.filter(o => o.status === 'PENDING').length || 0;
  const deliveredOrders = userOrders?.filter(o => o.status === 'DELIVERED').length || 0;
  const recentOrders = userOrders?.slice(0, 5) || [];

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
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-5 h-5 text-green-700" />
                <h2 className="text-xl text-gray-900">Recent Orders</h2>
              </div>
              {ordersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No orders yet</p>
                  <Link href="/products">
                    <button className="mt-3 text-green-700 hover:text-green-800 transition text-sm">Start Shopping →</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => {
                    const statusColor = order.status === 'DELIVERED'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'SHIPPED'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-yellow-100 text-yellow-700';
                    const StatusIcon = order.status === 'DELIVERED'
                      ? CheckCircle
                      : order.status === 'SHIPPED'
                        ? Truck
                        : Clock;
                    const itemSummary = order.items
                      ?.map(item => `${item.product_name || 'Product'} x${item.quantity}`)
                      .join(', ') || 'No items';

                    return (
                      <Link key={order.id} href={`/order/${order.id}`}>
                        <div className="border-2 border-gray-100 rounded-2xl p-4 hover:border-green-200 transition cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              <StatusIcon className="w-3 h-3" />
                              {order.status}
                            </span>
                          </div>
                          <p className="text-gray-900 mb-1 text-sm truncate">{itemSummary}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="font-semibold text-gray-900">${order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {totalOrders > 5 && (
                <Link href="/order">
                  <button className="w-full mt-4 text-green-700 hover:text-green-800 transition py-2 text-sm font-medium">
                    View All Orders ({totalOrders}) →
                  </button>
                </Link>
              )}
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
                  <p className="text-2xl text-gray-900">{totalOrders}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-2xl text-gray-900">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl text-gray-900">{pendingOrders}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Delivered</p>
                  <p className="text-2xl text-gray-900">{deliveredOrders}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="mb-4 text-gray-900">Quick Actions</h3>
              <div className="space-y-3">
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
