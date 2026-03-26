import React from 'react';
import { Users, Shield } from 'lucide-react';
import { UserManagementData, ROLES } from '@/services/userManagement.service';

interface UserStatsProps {
  users: UserManagementData[];
}

export function UserStats({ users }: UserStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <h3 className="text-3xl text-gray-900">{users.length}</h3>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-green-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Admins</p>
            <h3 className="text-3xl text-gray-900">{users.filter(u => u.role === ROLES.ADMIN).length}</h3>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-red-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Managers</p>
            <h3 className="text-3xl text-gray-900">{users.filter(u => u.role === ROLES.MANAGER).length}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
