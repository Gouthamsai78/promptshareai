import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Image, Video, X, Plus, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DatabaseService } from '../services/database';
import FileUpload from '../components/FileUpload';

const Create: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    tags: [] as string[],
    allowCopyPrompt: true,
    mediaType: 'image' as 'image' | 'video' | 'carousel',
    status: 'published' as 'draft' | 'published'
  });

  const [currentTag, setCurrentTag] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMediaUpload = (urls: string[]) => {
    setMediaUrls(urls);
    setError('');
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (formData.title.length > 100) {
      setError('Title must be less than 100 characters');
      return false;
    }
    if (formData.description && formData.description.length > 500) {
      setError('Description must be less than 500 characters');
      return false;
    }
    if (formData.prompt && formData.prompt.length > 2000) {
      setError('Prompt must be less than 2000 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a post');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const postData = {
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        prompt: formData.prompt.trim() || null,
        tags: formData.tags,
        media_urls: mediaUrls,
        media_type: mediaUrls.length > 0 ? formData.mediaType : null,
        allow_copy_prompt: formData.allowCopyPrompt,
        status: formData.status
      };

      await DatabaseService.createPost(postData);

      setSuccess(true);

      // Reset form
      setFormData({
        title: '',
        description: '',
        prompt: '',
        tags: [],
        allowCopyPrompt: true,
        mediaType: 'image',
        status: 'published'
      });
      setMediaUrls([]);
      setCurrentTag('');

      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Post Created Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your post has been published and will appear in the feed.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to home...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Post
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your amazing AI prompts with the community
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Post Information
            </h3>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter a catchy title for your prompt"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe what your prompt does..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  AI Prompt
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your AI prompt here..."
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.prompt.length}/2000 characters
                </p>
              </div>
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Media (Optional)
            </h3>

            {/* Media Type Selection */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => handleInputChange('mediaType', 'image')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  formData.mediaType === 'image'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Image size={18} />
                <span>Image</span>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('mediaType', 'carousel')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  formData.mediaType === 'carousel'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Plus size={18} />
                <span>Carousel</span>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('mediaType', 'video')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  formData.mediaType === 'video'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Video size={18} />
                <span>Video</span>
              </button>
            </div>

            {/* File Upload Component */}
            <FileUpload
              onFilesUploaded={handleMediaUpload}
              onError={handleUploadError}
              acceptedTypes={
                formData.mediaType === 'video'
                  ? ['video/mp4', 'video/webm', 'video/quicktime']
                  : ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
              }
              maxFiles={formData.mediaType === 'carousel' ? 10 : 1}
              maxSizeInMB={formData.mediaType === 'video' ? 100 : 10}
              bucket="media"
            />
          </div>

          {/* Tags and Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tags & Settings
            </h3>

            <div className="space-y-4">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {/* Tag List */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Settings */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.allowCopyPrompt}
                    onChange={(e) => handleInputChange('allowCopyPrompt', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Allow others to copy this prompt
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => {
                handleInputChange('status', 'draft');
                handleSubmit(new Event('submit') as any);
              }}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && formData.status === 'draft' ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting && formData.status === 'published' ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;