import React, { useState, useEffect } from 'react';
import { Settings, Grid, Bookmark, Calendar, Link as LinkIcon, Edit, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/database';
import { Post } from '../types';
import PostCard from '../components/PostCard';
import FileUpload from '../components/FileUpload';

const Profile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      setLoading(true);
    };
  }, []);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    website: '',
  });

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [posts, saved] = await Promise.all([
          DatabaseService.getUserPosts(user.id),
          DatabaseService.getUserSavedPosts(user.id),
        ]);

        if (isMounted) {
          setUserPosts(posts);
          setSavedPosts(saved);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const handleAvatarUpload = async (urls: string[]) => {
    if (urls.length > 0 && user) {
      try {
        await updateProfile({ avatar_url: urls[0] });
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return userPosts;
      case 'saved':
        return savedPosts;
      default:
        return userPosts;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Profile not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200`}
                alt={profile.username}
                className="w-24 h-24 rounded-full object-cover"
              />
              {profile.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                <Camera size={12} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    @{profile.username}
                  </p>
                </div>

                <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit Profile</span>
                  </button>
                  <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <Settings size={20} />
                  </button>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {profile.bio}
                </p>
              )}

              {/* Additional Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center space-x-1">
                    <LinkIcon size={16} />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.posts_count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Posts
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.followers_count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Followers
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {profile.following_count}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Following
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Edit Profile
              </h2>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <FileUpload
                    onFilesUploaded={handleAvatarUpload}
                    onError={(error) => console.error('Upload error:', error)}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                    maxFiles={1}
                    maxSizeInMB={5}
                    bucket="avatars"
                    className="mb-4"
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Your full name"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'posts', label: 'Posts', icon: Grid },
            { key: 'saved', label: 'Saved', icon: Bookmark }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded-full">
                {getTabContent().length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {getTabContent().map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Empty State */}
        {getTabContent().length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'posts' && <Grid size={32} className="text-gray-400" />}
              {activeTab === 'saved' && <Bookmark size={32} className="text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No {activeTab} yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'posts' && "You haven't created any posts yet"}
              {activeTab === 'saved' && "You haven't saved any posts yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;