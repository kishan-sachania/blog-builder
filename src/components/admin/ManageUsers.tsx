'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePaginatedData, useApi } from '@/hooks/useApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Avatar } from '@/components/common/Avatar';
import {
  Users,
  Search,
  Calendar,
  ArrowUpDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserPlus,
  X,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, CreateUserFormData } from '@/lib/validations';
import { getRoleName, isAdminRole } from '@/lib/roles';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

const CreateUserForm: React.FC<{
  onSubmit: (data: CreateUserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'employee',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#343131]">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. John Doe"
              {...register('name')}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
                errors.name ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
              }`}
            />
          </div>
          {errors.name && <p className="text-[11px] text-rose-600">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#343131]">
            Corporate Email <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="john.doe@company.com"
              {...register('email')}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
                errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
              }`}
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-600">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[#343131]">
              Temporary Password <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-[#96918B]">Min 6 chars</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#96918B]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              {...register('password')}
              className={`w-full pl-10 pr-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
                errors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
              }`}
            />
          </div>
          {errors.password && <p className="text-[11px] text-rose-600">{errors.password.message}</p>}
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#343131]">
            Access Role <span className="text-rose-500">*</span>
          </label>
          <select
            {...register('role')}
            className={`w-full px-3.5 py-2.5 text-xs bg-white border rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] transition-colors ${
              errors.role ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-200' : 'border-[#EAE6DF]'
            }`}
          >
            <option value="employee">Employee / Author (Standard privileges)</option>
            <option value="admin">Administrator (Elevated governance & moderation)</option>
          </select>
          {errors.role && <p className="text-[11px] text-rose-600">{errors.role.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 text-xs rounded-xl border border-[#EAE6DF] text-[#6B6661] hover:bg-[#FAF8F5] cursor-pointer font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? 'Creating...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
};

export const ManageUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [datePreset, setDatePreset] = useState<'all' | '7d' | '30d' | 'year' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isFirstMount = useRef(true);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { post, put, del, loading: isMutating } = useApi();

  // Paginated user query
  const {
    data: users,
    loading,
    error,
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setPage,
    setLimit,
    setFilters,
    nextPage,
    prevPage,
    refetch,
  } = usePaginatedData('/api/user', 10, {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Apply filters whenever parameters change
  const applyFilters = (
    newSearch = searchQuery,
    newSortBy = sortBy,
    newSortOrder = sortOrder,
    newStartDate = startDate,
    newEndDate = endDate
  ) => {
    setPage(1);
    const filterObj: Record<string, any> = {
      sortBy: newSortBy,
      sortOrder: newSortOrder,
    };
    if (newSearch.trim()) filterObj.search = newSearch.trim();
    if (newStartDate) filterObj.startDate = newStartDate;
    if (newEndDate) filterObj.endDate = newEndDate;

    setFilters(filterObj);
  };

  // Debounced search effect - automatically queries API when user stops typing
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    applyFilters(debouncedSearch, sortBy, sortOrder, startDate, endDate);
  }, [debouncedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(searchQuery, sortBy, sortOrder, startDate, endDate);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let newSortBy: 'name' | 'createdAt' = 'createdAt';
    let newSortOrder: 'asc' | 'desc' = 'desc';

    if (val === 'name-asc') {
      newSortBy = 'name';
      newSortOrder = 'asc';
    } else if (val === 'name-desc') {
      newSortBy = 'name';
      newSortOrder = 'desc';
    } else if (val === 'date-asc') {
      newSortBy = 'createdAt';
      newSortOrder = 'asc';
    } else {
      newSortBy = 'createdAt';
      newSortOrder = 'desc';
    }

    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    applyFilters(searchQuery, newSortBy, newSortOrder, startDate, endDate);
  };

  const handleDatePresetChange = (preset: 'all' | '7d' | '30d' | 'year' | 'custom') => {
    setDatePreset(preset);
    let start = '';
    let end = '';

    const now = new Date();
    if (preset === '7d') {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      start = past.toISOString().split('T')[0];
    } else if (preset === '30d') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      start = past.toISOString().split('T')[0];
    } else if (preset === 'year') {
      const past = new Date(now.getFullYear(), 0, 1);
      start = past.toISOString().split('T')[0];
    }

    setStartDate(start);
    setEndDate(end);
    applyFilters(searchQuery, sortBy, sortOrder, start, end);
  };

  const handleCustomDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setDatePreset('custom');
    applyFilters(searchQuery, sortBy, sortOrder, start, end);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setDatePreset('all');
    setStartDate('');
    setEndDate('');
    setPage(1);
    setFilters({ sortBy: 'createdAt', sortOrder: 'desc' });
  };

  const handleCreateUser = async (data: CreateUserFormData) => {
    setActionError(null);
    try {
      await post('/api/user', data);

      setActionMessage(`Account created successfully for ${data.name}`);
      setIsAddingUser(false);
      refetch();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to create user account');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    const userId = user._id || user.id;
    try {
      await put(`/api/user/${userId}`, { role: newRole });
      setActionMessage(`Role for ${user.name} changed to ${newRole}.`);
      refetch();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to update user role');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    const userId = userToDelete._id || userToDelete.id;

    setIsDeleting(true);
    try {
      await del(`/api/user/${userId}`);
      setActionMessage(`User "${userToDelete.name}" deleted successfully.`);
      setTimeout(() => setActionMessage(null), 3000);
      setUserToDelete(null);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to delete user');
      setTimeout(() => setActionError(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatJoiningDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Metric Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFB22C] flex items-center justify-center text-[#343131]">
              <Users className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#343131]">
              Employee & User Governance
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6661] mt-1">
            Create employee accounts, manage permissions and roles, and govern active contributors.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setIsAddingUser(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[#FFB22C] text-[#343131] hover:bg-[#FF8F00] hover:text-white transition-all shadow-xs cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading}
            className="p-2 rounded-xl border border-[#EAE6DF] bg-white text-[#6B6661] hover:text-[#343131] hover:bg-[#FAF8F5] transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Action Notifications */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{actionMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddingUser && (
        <div className="p-6 rounded-2xl bg-white border border-[#FFB22C] shadow-sm animate-in fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#343131] flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-[#FF8F00]" />
              <span>Create New Employee Account</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingUser(false)}
              className="p-1 rounded-lg text-[#96918B] hover:text-[#343131] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setIsAddingUser(false)}
            isLoading={isMutating}
          />
        </div>
      )}

      {/* Filter & Sort Controls Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#96918B]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] placeholder-[#96918B] focus:outline-none focus:ring-2 focus:ring-[#FFB22C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  applyFilters('', sortBy, sortOrder, startDate, endDate);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#96918B] hover:text-[#343131]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Sorting Dropdown */}
          <div className="md:col-span-4 flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-[#6B6661] shrink-0" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="w-full p-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer"
            >
              <option value="createdAt-desc">Joining Date: Newest First</option>
              <option value="createdAt-asc">Joining Date: Oldest First</option>
              <option value="name-asc">Sort by Name: A → Z</option>
              <option value="name-desc">Sort by Name: Z → A</option>
            </select>
          </div>

          {/* Per Page Selector */}
          <div className="md:col-span-3 flex items-center justify-end space-x-2">
            <span className="text-xs text-[#6B6661]">Per page:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="p-2 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-xl text-[#343131] focus:outline-none focus:ring-2 focus:ring-[#FFB22C] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Joining Date Filters */}
        <div className="pt-3 border-t border-[#EAE6DF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-[#6B6661] flex items-center mr-1">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#FF8F00]" />
              Joining Date:
            </span>
            {(
              [
                { label: 'All Time', key: 'all' },
                { label: 'Last 7 Days', key: '7d' },
                { label: 'Last 30 Days', key: '30d' },
                { label: 'This Year', key: 'year' },
              ] as const
            ).map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => handleDatePresetChange(preset.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${datePreset === preset.key
                    ? 'bg-[#FFB22C] text-[#343131] font-bold'
                    : 'bg-[#FAF8F5] text-[#6B6661] hover:bg-[#EAE6DF]'
                  }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[11px] text-[#6B6661]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleCustomDateChange(e.target.value, endDate)}
              className="p-1.5 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-[#343131] focus:outline-none"
            />
            <span className="text-[11px] text-[#6B6661]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleCustomDateChange(startDate, e.target.value)}
              className="p-1.5 text-xs bg-[#FAF8F5] border border-[#EAE6DF] rounded-lg text-[#343131] focus:outline-none"
            />
            {(searchQuery || datePreset !== 'all' || startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 ml-2 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#EAE6DF] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-[#96918B]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#FF8F00]" />
            <span className="text-xs font-medium">Loading users...</span>
          </div>
        ) : error ? (
          <div className="py-16 text-center p-6 space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold rounded-xl text-[#343131] hover:bg-[#EAE6DF] cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center p-6 space-y-2">
            <Users className="w-8 h-8 text-[#C2BCB3] mx-auto" />
            <p className="text-sm font-semibold text-[#343131]">No users found</p>
            <p className="text-xs text-[#6B6661]">
              Try adjusting your search query, sort order, or date range filter.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#FAF8F5] border border-[#EAE6DF] text-xs font-semibold rounded-lg text-[#343131] hover:bg-[#EAE6DF] cursor-pointer"
            >
              <span>Clear Filters</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EAE6DF] text-[11px] font-bold uppercase tracking-wider text-[#6B6661]">
                  <th className="py-3 px-5">User</th>
                  <th className="py-3 px-4">Role & Access Level</th>
                  <th className="py-3 px-4">Stories</th>
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => {
                        const newOrder = sortBy === 'createdAt' && sortOrder === 'desc' ? 'asc' : 'desc';
                        setSortBy('createdAt');
                        setSortOrder(newOrder);
                        applyFilters(searchQuery, 'createdAt', newOrder, startDate, endDate);
                      }}
                      className="flex items-center space-x-1 hover:text-[#343131] cursor-pointer"
                    >
                      <span>Joining Date</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF] text-xs">
                {users.map((u: any) => {
                  const userId = u._id || u.id;
                  const roleName = getRoleName(u);
                  const isAdmin = isAdminRole(u);

                  return (
                    <tr key={userId} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      {/* User Avatar + Name + Email */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-3">
                          <Avatar src={u.avatar} name={u.name || 'User'} size="md" />
                          <div className="min-w-0">
                            <p className="font-semibold text-[#343131] truncate">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-[#6B6661] truncate font-mono">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isAdmin
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-[#FAF8F5] text-[#44403c] border border-[#EAE6DF]'
                              }`}
                          >
                            {isAdmin ? <Shield className="w-3 h-3 text-amber-700" /> : <UserCheck className="w-3 h-3 text-[#6B6661]" />}
                            <span className="capitalize">{roleName}</span>
                          </span>

                          <select
                            value={isAdmin ? 'admin' : 'employee'}
                            onChange={(e) => handleRoleChange(u, e.target.value)}
                            disabled={isMutating}
                            className="p-1 text-[11px] bg-white border border-[#EAE6DF] rounded-lg text-[#6B6661] hover:text-[#343131] cursor-pointer"
                          >
                            <option value="employee">Switch to Employee</option>
                            <option value="admin">Promote to Admin</option>
                          </select>
                        </div>
                      </td>

                      {/* Stories (Published & Drafts) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                            title="Published Articles"
                          >
                            <span className="font-bold">{u.publishedCount ?? 0}</span>
                            <span className="text-[10px] text-emerald-700">pub</span>
                          </span>
                          <span
                            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-800 border border-purple-200"
                            title="Draft Articles"
                          >
                            <span className="font-bold">{u.draftCount ?? 0}</span>
                            <span className="text-[10px] text-purple-700">draft</span>
                          </span>
                        </div>
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4 text-[#6B6661]">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#96918B]" />
                          <span>{formatJoiningDate(u.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          disabled={isMutating}
                          className="p-2 rounded-lg text-[#96918B] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {total > 0 && (
          <div className="p-4 border-t border-[#EAE6DF] bg-[#FAF8F5]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B6661]">
            <div>
              Showing{' '}
              <span className="font-semibold text-[#343131]">
                {Math.min((page - 1) * limit + 1, total)}
              </span>{' '}
              to{' '}
              <span className="font-semibold text-[#343131]">
                {Math.min(page * limit, total)}
              </span>{' '}
              of <span className="font-semibold text-[#343131]">{total}</span> users
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={prevPage}
                disabled={!hasPrevPage || loading}
                className="p-2 rounded-lg border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5 && page > 3) {
                    pageNum = page - 2 + idx;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                  }
                  if (pageNum < 1 || pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${page === pageNum
                          ? 'bg-[#FFB22C] text-[#343131]'
                          : 'border border-[#EAE6DF] bg-white text-[#6B6661] hover:bg-[#FAF8F5]'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={nextPage}
                disabled={!hasNextPage || loading}
                className="p-2 rounded-lg border border-[#EAE6DF] bg-white text-[#343131] hover:bg-[#FAF8F5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal for user deletion */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete user "${userToDelete?.name}" (${userToDelete?.email})? This action cannot be undone and will permanently remove their profile.`}
        confirmText="Delete User"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />
    </div>
  );
};
