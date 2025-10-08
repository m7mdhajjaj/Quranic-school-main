import React from "react";
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  title?: string;
  description?: string;
}

// Enhanced Profile Page Skeleton
const ProfilePageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Hero Section Skeleton */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Avatar Section Skeleton */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="w-40 h-40 bg-white/20 rounded-full shimmer-alt border-4 border-white/30"></div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-400/80 rounded-full shimmer border-4 border-white"></div>
              </div>
            </div>
            
            {/* Profile Info Skeleton */}
            <div className="flex-1 text-center md:text-right text-white space-y-4">
              <div className="h-12 bg-white/20 rounded-2xl shimmer-alt w-80 mx-auto md:mx-0"></div>
              <div className="h-6 bg-white/15 rounded-lg shimmer w-48 mx-auto md:mx-0"></div>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start mt-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-8 bg-white/20 rounded-full shimmer-alt w-24"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Section Skeleton */}
      <div className="container mx-auto px-4 -mt-16 relative z-10 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { gradient: 'from-blue-500 to-indigo-500', icon: '🎓' },
            { gradient: 'from-orange-500 to-red-500', icon: '⚡' },
            { gradient: 'from-emerald-500 to-teal-500', icon: '📊' }
          ].map((config, i) => (
            <div key={i} className="group bg-white rounded-3xl shadow-lg border-2 border-slate-100 p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-2xl mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shimmer-alt`}>
              </div>
              <div className="h-4 bg-gray-200 rounded shimmer w-24 mb-2"></div>
              <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded-lg shimmer w-20"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Information Section Skeleton */}
      <div className="container mx-auto px-4 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg shimmer-alt w-16 h-16"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded-lg shimmer w-48 mb-2"></div>
              <div className="h-5 bg-gray-100 rounded shimmer w-40"></div>
            </div>
          </div>

          {/* Form Fields Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 bg-gray-200 rounded shimmer w-32"></div>
                <div className="h-12 bg-gray-100 rounded-xl shimmer w-full"></div>
              </div>
            ))}
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <div className="h-12 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-xl shimmer-alt flex-1"></div>
            <div className="h-12 bg-gray-200 rounded-xl shimmer w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat Page Skeleton
const ChatSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full shimmer-alt"></div>
              <div>
                <div className="h-6 bg-gray-200 rounded shimmer w-32 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded shimmer w-24"></div>
              </div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded-full shimmer"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat List Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-96 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="h-6 bg-gray-200 rounded shimmer w-24 mb-3"></div>
                <div className="h-10 bg-gray-100 rounded-lg shimmer w-full"></div>
              </div>
              <div className="p-2 space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full shimmer-alt mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded shimmer w-24 mb-1"></div>
                      <div className="h-3 bg-gray-100 rounded shimmer w-32"></div>
                    </div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full shimmer-alt"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Messages Skeleton */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 h-96 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full shimmer-alt mr-3"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded shimmer w-32 mb-1"></div>
                  <div className="h-3 bg-gray-100 rounded shimmer w-20"></div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-2xl ${i % 2 === 0 ? 'bg-blue-100 shimmer-alt' : 'bg-gray-100 shimmer'}`}>
                      <div className="h-4 bg-gray-200 rounded shimmer w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded shimmer w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded shimmer w-16 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-10 bg-gray-100 rounded-full shimmer"></div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full shimmer-alt"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Skeleton
const DashboardSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="relative">
            <div className="h-8 bg-white/20 rounded-lg shimmer-alt w-64 mb-4"></div>
            <div className="h-6 bg-white/15 rounded shimmer w-96 mb-6"></div>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-full shimmer-alt"></div>
              <div>
                <div className="h-5 bg-white/25 rounded shimmer w-32 mb-2"></div>
                <div className="h-4 bg-white/15 rounded shimmer w-24"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { color: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50' },
            { color: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50' },
            { color: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50' },
            { color: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50' }
          ].map((config, i) => (
            <div key={i} className={`bg-gradient-to-br ${config.bg} rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${config.color} rounded-xl shimmer-alt`}></div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded shimmer w-16 mb-1"></div>
                  <div className="h-8 bg-gray-300 rounded-lg shimmer w-12"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-100 rounded shimmer w-24"></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-200 rounded shimmer w-32"></div>
                <div className="h-8 bg-gray-100 rounded-lg shimmer w-24"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full shimmer-alt mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded shimmer w-48 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded shimmer w-32"></div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded shimmer w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded shimmer w-24 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shimmer"></div>
                ))}
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded shimmer w-20 mb-4"></div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded shimmer"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Profile Card Skeleton
const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-8 transform hover:scale-105 transition-all duration-300">
      <div className="flex flex-col items-center">
        {/* Enhanced Avatar Skeleton with glow effect */}
        <div className="relative mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full shimmer-alt relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse"></div>
          </div>
          <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shimmer border-2 border-white"></div>
        </div>
        
        {/* Enhanced Name and Role */}
        <div className="space-y-3 text-center w-full">
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer w-48 mx-auto"></div>
          <div className="h-5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full shimmer-alt w-32 mx-auto"></div>
        </div>
        
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-6 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="h-6 bg-gradient-to-r from-emerald-200 to-teal-200 rounded shimmer-gold w-12 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded shimmer w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Test Page Skeleton
const TestSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Enhanced Header Section Skeleton */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="h-12 bg-gradient-to-r from-indigo-200 to-blue-200 rounded-2xl shimmer-alt w-96 mx-auto"></div>
            <div className="absolute -top-1 -left-1 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl opacity-50"></div>
          </div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer w-80 mx-auto"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Surah Selection Section Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-3"></div>

            {/* Action Buttons Skeleton */}
            <div className="mb-3 flex gap-2">
              <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-20"></div>
              <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-20"></div>
            </div>

            {/* Surah List Container Skeleton */}
            <div className="max-h-60 overflow-y-auto border-2 border-gray-300 rounded-xl p-4 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div
                  key={i}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse ml-3"></div>
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-64"></div>
                </div>
              ))}
            </div>

            {/* Selected Surahs Info Skeleton */}
            <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16"></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                ))}
                <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24"></div>
              </div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-80 mt-3"></div>
            </div>
          </div>

          {/* Timer Information Section Skeleton */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-2 h-2 bg-gray-200 rounded-full ml-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-64"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button Skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

// Test Question Skeleton
const TestQuestionSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            <div className="flex items-center space-x-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2 animate-pulse"></div>
          <div className="w-full bg-gray-200 rounded-full h-1 animate-pulse"></div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Question Preparation Skeleton */}
          <div className="text-center mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mx-auto"></div>
          </div>

          {/* Question Section Skeleton */}
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-24 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-full mb-4"></div>

            {/* Context Box Skeleton */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-5 bg-gray-200 rounded animate-pulse w-5/6"></div>
              </div>
            </div>
          </div>

          {/* Answer Options Skeleton */}
          <div className="space-y-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-4 mr-2"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-48"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button Skeleton */}
          <div className="h-12 bg-gray-200 rounded-xl animate-pulse w-full"></div>
        </div>
      </div>
    </div>
  );
};

// Reports Page Skeleton
const ReportsSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto py-8" dir="rtl">
      {/* Header Skeleton */}
      <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-6 w-32 mx-auto"></div>

      {/* Filter Section Skeleton */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-8 max-w-md mx-auto">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-48 mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
            <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </div>

      {/* Chart Section Skeleton */}
      <div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto mt-8">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-48 mx-auto"></div>

        {/* Chart Area Skeleton */}
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse mb-4 relative overflow-hidden">
          {/* Chart bars simulation */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around p-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="bg-gray-300 animate-pulse w-8 rounded-t"
                  style={{ height: `${Math.random() * 120 + 40}px` }}></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-12 mt-2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Description Skeleton */}
        <div className="text-center mt-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-80 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

// Quran Audio Page Skeleton
const QuranAudioSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse w-96 mx-auto"></div>
        </div>

        {/* Reciter Selection Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Surah Selection Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4 w-32"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
              (i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-5 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Audio Controls Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-48 mx-auto mb-2"></div>
            <div className="h-5 bg-gray-100 rounded animate-pulse w-32 mx-auto"></div>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-48"></div>
          </div>
        </div>

        {/* Ayahs Display Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24 mx-auto mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-5/6"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-4/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quran Page Skeleton
const QuranPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-64 mx-auto"></div>
          <div className="h-5 bg-gray-100 rounded animate-pulse w-96 mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Search Skeleton */}
          <div className="mb-6">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
          </div>

          {/* Surahs Grid Skeleton */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            dir="rtl">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md p-4 border-r-4 border-gray-300">
                <div className="text-right">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-24 mb-1"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-40"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Quran Reading View Skeleton
const QuranReadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-64 mx-auto"></div>
          <div className="h-5 bg-gray-100 rounded animate-pulse w-96 mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Controls Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="text-center">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
              </div>
            </div>
          </div>

          {/* Bismillah Skeleton */}
          <div className="text-center mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-80 mx-auto"></div>
          </div>

          {/* Ayahs Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div
                  key={i}
                  className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="text-right mb-2">
                    <div className="flex items-end justify-between">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                      <div className="flex-1 mr-2 space-y-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-full"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-5/6"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Skeleton */}
          <div className="flex items-center justify-center gap-4 bg-white rounded-lg shadow-md p-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
            <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Daily Marks Page Skeleton
const DailyMarksSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        {/* Header Section Skeleton */}
        <div className="text-center mb-10">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-100 rounded animate-pulse w-64 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-32 mx-auto"></div>
          </div>
        </div>

        {/* Month and Year Filter Skeleton */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white rounded-xl shadow-md p-4">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-64 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-2"></div>
                <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher View Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List Card Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden lg:col-span-1">
            <div className="bg-gray-200 py-4 px-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded animate-pulse w-24"></div>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="py-3">
                    <div className="w-full py-2 px-4 rounded-lg bg-gray-100 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 space-y-3">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse w-full"></div>
            </div>
          </div>

          {/* Student Details and Marks Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gray-200 py-4 px-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded animate-pulse w-64"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr className="text-right">
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </th>
                      <th className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                            <div className="w-16 h-2 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-20"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Averages Section Skeleton */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mx-auto mb-4"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg p-4 shadow-sm border-r-4 border-gray-300">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Goals Page Skeleton
const GoalsSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100"
      dir="rtl">
      <div className="container mx-auto py-12 px-4">
        {/* Header Section Skeleton */}
        <div className="text-center mb-16">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-48 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
            <div className="h-5 bg-gray-100 rounded animate-pulse w-2/3 mx-auto"></div>
          </div>
        </div>

        {/* Main Goals Grid Skeleton */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row">
                {/* Icon Section Skeleton */}
                <div className="bg-gray-200 animate-pulse p-6 md:w-1/4 flex justify-center items-center">
                  <div className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
                {/* Content Section Skeleton */}
                <div className="p-6 md:w-3/4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-4/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Goals Section Skeleton */}
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-2xl shadow-lg py-10 px-6 mb-16 animate-pulse">
          <div className="h-7 bg-gray-500 rounded animate-pulse w-48 mx-auto mb-10"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/20 backdrop-blur-sm p-6 rounded-lg">
                <div className="w-14 h-14 bg-gray-400 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-400 rounded animate-pulse w-32 mx-auto mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-400 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-400 rounded animate-pulse w-5/6 mx-auto"></div>
                  <div className="h-4 bg-gray-400 rounded animate-pulse w-4/5 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote Section Skeleton */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gray-200 animate-pulse"></div>
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-80 mx-auto"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Absence Page Skeleton
const AbsenceSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4"
      dir="rtl">
      <div className="container mx-auto max-w-6xl">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-2 w-80 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-4 animate-pulse"></div>
          <div className="h-5 bg-gray-100 rounded-lg animate-pulse w-96 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Control Panel Skeleton */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              {/* Date Input Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full"></div>
              </div>

              {/* Group Filter Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mb-1"></div>
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full"></div>
              </div>

              {/* Search Input Skeleton */}
              <div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1"></div>
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse w-full"></div>
              </div>

              {/* Buttons Skeleton */}
              <div className="flex gap-2 items-end w-full">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse flex-1"></div>
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-24"></div>
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto mb-2"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Students Table Skeleton */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Table Header Skeleton */}
            <div className="bg-gray-200 py-4 px-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    </th>
                    <th className="py-3 px-4 text-right">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </th>
                    <th className="py-3 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Save Button Skeleton */}
            <div className="p-4 bg-gray-50 flex justify-center">
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-32"></div>
            </div>
          </div>

          {/* Instructions Card Skeleton */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse ml-1"></div>
              <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="space-y-2 mr-6">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// News Page Skeleton
const NewsSkeleton: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-12" dir="rtl">
      <section className="mb-12">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-80"></div>
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
        </div>

        {/* Description Skeleton */}
        <div className="mb-12">
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-96 mb-2"></div>
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-80"></div>
        </div>

        {/* News Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Image Skeleton */}
              <div className="w-full h-64 bg-gray-200 animate-pulse"></div>

              {/* Content Skeleton */}
              <div className="p-6">
                {/* Title and Date Skeleton */}
                <div className="flex justify-between items-center mb-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="h-6 bg-gray-100 rounded-full animate-pulse w-24 px-3 py-1"></div>
                </div>

                {/* Content Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-4/6"></div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex flex-wrap justify-between items-center mt-4 gap-2">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-28"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-20"></div>
                    <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

// Arrangement Page Skeleton
const ArrangementSkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-16">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-96 mx-auto mb-8"></div>

          {/* Controls Skeleton */}
          <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-48"></div>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40"></div>
          </div>

          {/* Period Title Skeleton */}
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-48 mx-auto mt-8"></div>
        </div>

        {/* Olympic Podium Skeleton */}
        <div className="mb-20 relative">
          <div className="flex justify-center items-end h-96 mb-8">
            {/* Second place - left */}
            <div className="w-1/4 flex flex-col items-center mx-2">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse mb-4"></div>
              <div className="text-center mb-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
              </div>
              <div className="w-full bg-gray-200 h-40 rounded-t-lg animate-pulse"></div>
            </div>

            {/* First place - center */}
            <div className="w-1/3 flex flex-col items-center mx-2 -mt-10">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gray-200 animate-pulse mb-4"></div>
              <div className="text-center mb-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-36 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-24"></div>
              </div>
              <div className="w-full bg-gray-200 h-52 rounded-t-lg animate-pulse"></div>
            </div>

            {/* Third place - right */}
            <div className="w-1/4 flex flex-col items-center mx-2">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse mb-4"></div>
              <div className="text-center mb-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-20"></div>
              </div>
              <div className="w-full bg-gray-200 h-32 rounded-t-lg animate-pulse"></div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Top 10 Table Skeleton */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gray-200 py-4 px-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr className="text-right">
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </th>
                  <th className="py-3 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Criteria Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse mb-4 mx-auto"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20 mx-auto mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Activity Page Skeleton
const ActivitySkeleton: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4"
      dir="rtl">
      <div className="container mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-16">
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse mb-4 w-80 mx-auto"></div>
          <div className="w-24 h-1 bg-gray-200 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded-lg animate-pulse w-96 mx-auto mb-8"></div>

          {/* Add Activity Button Skeleton */}
          <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40 mx-auto"></div>
        </div>

        {/* Filter Buttons Skeleton */}
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 rounded-full animate-pulse w-20"></div>
          ))}
        </div>

        {/* Activities Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Image Skeleton */}
              <div className="h-80 bg-gray-200 animate-pulse"></div>

              {/* Content Skeleton */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-40"></div>
                  <div className="flex gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>

                {/* Date Skeleton */}
                <div className="flex items-center">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse ml-1"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  title = "جاري تحميل البيانات...",
  description = "الرجاء الانتظار",
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse float"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8" dir="rtl">
        {/* Enhanced Header Skeleton */}
        <div className="mb-12 text-center">
          <div className="relative inline-block mb-6">
            <div className="h-12 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-2xl shimmer-alt w-80 mx-auto"></div>
            <div className="absolute -top-1 -left-1 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl transform -skew-x-12 opacity-50"></div>
          </div>
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer w-64 mx-auto"></div>
        </div>

        {/* Enhanced Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer mb-3 w-24"></div>
                  <div className="h-8 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-xl shimmer-alt w-20"></div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shimmer-alt relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {[
            { gradient: 'from-blue-100 to-indigo-100', shimmer: 'shimmer-alt' },
            { gradient: 'from-emerald-100 to-teal-100', shimmer: 'shimmer-gold' },
            { gradient: 'from-purple-100 to-pink-100', shimmer: 'shimmer' }
          ].map((config, i) => (
            <div
              key={i}
              className="group bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
              <div className={`h-6 bg-gradient-to-r ${config.gradient} rounded-lg ${config.shimmer} mb-8 w-48`}></div>
              <div className="relative">
                <div className={`h-80 bg-gradient-to-br ${config.gradient} rounded-2xl ${config.shimmer} relative overflow-hidden`}>
                  {/* Chart simulation elements */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-around">
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <div key={j} className={`bg-white/40 rounded-t-lg skeleton-chart-bar w-6 ${j === 1 ? 'h-16' : j === 2 ? 'h-20' : j === 3 ? 'h-24' : j === 4 ? 'h-28' : j === 5 ? 'h-20' : 'h-16'}`}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Loading Spinner Section */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            {/* Multi-layered loading spinner */}
            <div className="relative mb-8">
              <div className="loading-spinner animate-spin rounded-full h-20 w-20 border-4 border-blue-500 mx-auto"></div>
              <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-emerald-500 mx-auto rotate-slow"></div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {title}
              </h3>
              <p className="text-gray-600 text-lg font-medium max-w-md mx-auto leading-relaxed">
                {description}
              </p>
              
              {/* Progress dots */}
              <div className="loading-dots flex justify-center space-x-2 mt-6">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <span key={dot} className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
export {
  DashboardSkeleton,
  ChatSkeleton,
  ProfilePageSkeleton,
  ProfileCardSkeleton,
  ActivitySkeleton,
  ArrangementSkeleton,
  NewsSkeleton,
  AbsenceSkeleton,
  GoalsSkeleton,
  DailyMarksSkeleton,
  QuranPageSkeleton,
  QuranReadingSkeleton,
  QuranAudioSkeleton,
  ReportsSkeleton,
  TestSkeleton,
  TestQuestionSkeleton,
};
