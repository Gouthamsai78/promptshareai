import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import ReelCard from '../components/ReelCard';
import ToolCard from '../components/ToolCard';
import { Post, Reel, Tool, Profile } from '../types';
import { DatabaseService } from '../services/database';
import { testConnection } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import { testFileUpload } from '../utils/uploadTest';

const TestPage: React.FC = () => {
  const { user, isOfflineMode } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [toolsTest, setToolsTest] = useState<{ status: string; count: number; error?: string }>({
    status: 'Not tested',
    count: 0
  });
  const [postsTest, setPostsTest] = useState<{ status: string; count: number; error?: string }>({
    status: 'Not tested',
    count: 0
  });
  const [reelsTest, setReelsTest] = useState<{ status: string; count: number; error?: string }>({
    status: 'Not tested',
    count: 0
  });
  const [uploadTest, setUploadTest] = useState<{ status: string; message: string }>({
    status: 'Not tested',
    message: ''
  });
  const [postCreationTest, setPostCreationTest] = useState<{ status: string; message: string }>({
    status: 'Not tested',
    message: ''
  });

  // Test Supabase connection on component mount
  useEffect(() => {
    const runTests = async () => {
      // Test connection
      try {
        const isConnected = await testConnection(5000);
        setConnectionStatus(isConnected ? 'Connected' : 'Failed');
      } catch (error) {
        setConnectionStatus('Error');
      }

      // Test tools fetching
      try {
        setToolsTest({ status: 'Testing...', count: 0 });
        const tools = await DatabaseService.getTools(10, 0);
        setToolsTest({ status: 'Success', count: tools.length });
      } catch (error: any) {
        setToolsTest({ status: 'Failed', count: 0, error: error.message });
      }

      // Test posts fetching
      try {
        setPostsTest({ status: 'Testing...', count: 0 });
        const posts = await DatabaseService.getPosts(10, 0);
        setPostsTest({ status: 'Success', count: posts.length });
      } catch (error: any) {
        setPostsTest({ status: 'Failed', count: 0, error: error.message });
      }

      // Test reels fetching
      try {
        setReelsTest({ status: 'Testing...', count: 0 });
        const reels = await DatabaseService.getReels(10, 0);
        setReelsTest({ status: 'Success', count: reels.length });
      } catch (error: any) {
        setReelsTest({ status: 'Failed', count: 0, error: error.message });
      }
    };

    runTests();
  }, []);

  // Test data for media display
  const testProfile: Profile = {
    id: 'test-user',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    bio: 'Test user for media display',
    website: null,
    verified: false,
    followers_count: 100,
    following_count: 50,
    posts_count: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // High-quality test images (different aspect ratios)
  const testImages = {
    landscape: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080',
    portrait: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1920',
    square: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1080&h=1080'
  };

  // Test videos (different aspect ratios)
  const testVideos = {
    horizontal: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    vertical: 'https://sample-videos.com/zip/10/mp4/480/SampleVideo_480x854_1mb_mp4.mp4' // This is a vertical video
  };

  const testImagePost: Post = {
    id: 'test-image-post',
    user_id: 'test-user',
    title: 'Test Image Post',
    description: 'Testing image display functionality',
    prompt: 'A beautiful landscape with mountains and lakes',
    tags: ['test', 'image'],
    media_urls: [testImages.portrait],
    media_type: 'image',
    allow_copy_prompt: true,
    status: 'published',
    likes_count: 10,
    comments_count: 5,
    saves_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: testProfile
  };

  const testVideoPost: Post = {
    id: 'test-video-post',
    user_id: 'test-user',
    title: 'Test Video Post',
    description: 'Testing video display functionality',
    prompt: 'A short video demonstration',
    tags: ['test', 'video'],
    media_urls: [testVideos.horizontal],
    media_type: 'video',
    allow_copy_prompt: true,
    status: 'published',
    likes_count: 15,
    comments_count: 8,
    saves_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: testProfile
  };

  const testCarouselPost: Post = {
    id: 'test-carousel-post',
    user_id: 'test-user',
    title: 'Test Carousel Post',
    description: 'Testing carousel display functionality',
    prompt: 'Multiple images in a carousel',
    tags: ['test', 'carousel'],
    media_urls: [testImages.landscape, testImages.portrait, testImages.square],
    media_type: 'carousel',
    allow_copy_prompt: true,
    status: 'published',
    likes_count: 20,
    comments_count: 12,
    saves_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: testProfile
  };

  const testReelHorizontal: Reel = {
    id: 'test-reel-horizontal',
    user_id: 'test-user',
    title: 'Horizontal Video Test',
    video_url: testVideos.horizontal,
    thumbnail_url: null,
    prompt: 'A horizontal test video reel',
    tags: ['test', 'reel', 'horizontal'],
    allow_copy_prompt: true,
    likes_count: 25,
    comments_count: 15,
    saves_count: 10,
    views_count: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: testProfile
  };

  const testReelVertical: Reel = {
    id: 'test-reel-vertical',
    user_id: 'test-user',
    title: 'Vertical Video Test',
    video_url: testVideos.vertical,
    thumbnail_url: null,
    prompt: 'A vertical test video reel (portrait mode)',
    tags: ['test', 'reel', 'vertical'],
    allow_copy_prompt: true,
    likes_count: 35,
    comments_count: 20,
    saves_count: 15,
    views_count: 150,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: testProfile
  };

  const testTool: Tool = {
    id: 'test-tool',
    user_id: 'test-user',
    name: 'Test AI Tool',
    description: 'A test AI tool for demonstration',
    website_url: 'https://example.com',
    logo_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=100',
    category: 'Test Category',
    tags: ['test', 'ai'],
    featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: testProfile
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            PromptShare Test Page
          </h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-2">
                ✅ Application is Working!
              </h2>
              <p className="text-green-700 dark:text-green-300">
                If you can see this page, the React application is running correctly.
              </p>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-400 mb-2">
                🔧 Debug Information
              </h2>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Environment: {import.meta.env.MODE}</li>
                <li>• Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing'}</li>
                <li>• Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}</li>
                <li>• User: {user ? `${user.email} (${isOfflineMode ? 'Offline' : 'Online'})` : 'Not logged in'}</li>
                <li>• Connection: {connectionStatus}</li>
                <li>• Tools Test: {toolsTest.status} ({toolsTest.count} tools) {toolsTest.error && `- ${toolsTest.error}`}</li>
                <li>• Posts Test: {postsTest.status} ({postsTest.count} posts) {postsTest.error && `- ${postsTest.error}`}</li>
                <li>• Reels Test: {reelsTest.status} ({reelsTest.count} reels) {reelsTest.error && `- ${reelsTest.error}`}</li>
                <li>• Upload Test: {uploadTest.status} {uploadTest.message && `- ${uploadTest.message}`}</li>
                <li>• Post Creation Test: {postCreationTest.status} {postCreationTest.message && `- ${postCreationTest.message}`}</li>
                <li>• <strong>Reels Workflow:</strong> Upload vertical video → Create page → Should appear in /reels</li>
                <li>• Timestamp: {new Date().toISOString()}</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                🚀 Quick Actions
              </h2>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/create'}
                  className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  🎬 Test Upload (Go to Create Page)
                </button>
                <button
                  onClick={async () => {
                    if (!user) {
                      setUploadTest({ status: 'Failed', message: 'Please log in first' });
                      return;
                    }
                    setUploadTest({ status: 'Testing...', message: 'Running upload test...' });
                    const result = await testFileUpload(user.id);
                    setUploadTest({
                      status: result.success ? 'Success' : 'Failed',
                      message: result.message
                    });
                  }}
                  className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
                >
                  🧪 Test File Upload (Storage RLS)
                </button>
                <button
                  onClick={async () => {
                    if (!user) {
                      setPostCreationTest({ status: 'Failed', message: 'Please log in first' });
                      return;
                    }
                    setPostCreationTest({ status: 'Testing...', message: 'Testing post creation...' });

                    try {
                      const testPostData = {
                        user_id: user.id,
                        title: 'Test Post - RLS Policy Check',
                        description: 'This is a test post to verify RLS policies are working correctly.',
                        prompt: 'Test prompt for RLS verification',
                        tags: ['test', 'rls', 'debug'],
                        media_urls: [],
                        media_type: null,
                        allow_copy_prompt: true,
                        status: 'published' as const
                      };

                      console.log('🧪 Testing post creation with data:', testPostData);
                      const result = await DatabaseService.createPost(testPostData);
                      console.log('✅ Test post created successfully:', result);

                      setPostCreationTest({
                        status: 'Success',
                        message: `Post created successfully! ID: ${result.id}`
                      });
                    } catch (error: any) {
                      console.error('❌ Test post creation failed:', error);
                      setPostCreationTest({
                        status: 'Failed',
                        message: error.message || 'Unknown error occurred'
                      });
                    }
                  }}
                  className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  📝 Test Post Creation (RLS Policies)
                </button>
                <button
                  onClick={() => window.location.href = '/reels'}
                  className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  📱 View Reels Page
                </button>
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Go to Login Page
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Clear Storage & Refresh
                </button>
              </div>
            </div>

            {/* Debugging Section */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-2">
                🔍 Upload & Reel Debugging
              </h2>
              <div className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                <p><strong>Expected Workflow:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Upload vertical video (height &gt; width) on Create page</li>
                  <li>SmartFileUpload should detect orientation and show "Reel (Vertical Video)"</li>
                  <li>Create page should call DatabaseService.createReel() instead of createPost()</li>
                  <li>Reel should be stored in 'reels' table, not 'posts' table</li>
                  <li>Reels page should fetch from 'reels' table and display the video</li>
                </ol>
                <p className="mt-3"><strong>Current Status:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reels in database: {reelsTest.count}</li>
                  <li>Video posts in database: Found videos in posts table (should be in reels table)</li>
                  <li>Storage policies: ✅ Fixed (RLS policies added)</li>
                  <li>Video detection: Enhanced with better debugging</li>
                </ul>
                <p className="mt-3 p-2 bg-orange-100 dark:bg-orange-800/30 rounded text-xs">
                  <strong>Debug Tip:</strong> Check browser console when uploading videos to see orientation detection logs.
                </p>
              </div>
            </div>

            {/* Media Display Tests */}
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-400 mb-4">
                🎨 Media Display Tests
              </h2>
              <p className="text-purple-700 dark:text-purple-300 mb-4">
                Testing image, video, and carousel display functionality with original quality preservation:
              </p>

              <div className="mb-4 p-3 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Media Quality Tests:</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• <strong>Portrait Image:</strong> {testImages.portrait.includes('1920') ? 'High-res (1080x1920)' : 'Standard'}</li>
                  <li>• <strong>Landscape Image:</strong> {testImages.landscape.includes('1920') ? 'High-res (1920x1080)' : 'Standard'}</li>
                  <li>• <strong>Square Image:</strong> {testImages.square.includes('1080') ? 'High-res (1080x1080)' : 'Standard'}</li>
                  <li>• <strong>Videos:</strong> Original aspect ratios preserved</li>
                  <li>• <strong>Expected:</strong> Images should display at original quality without cropping</li>
                  <li>• <strong>Expected:</strong> Vertical videos should fill height, horizontal videos should fill width</li>
                </ul>
              </div>

              <div className="space-y-6">
                {/* Image Post Test */}
                <div>
                  <h3 className="text-md font-medium text-purple-800 dark:text-purple-400 mb-2">
                    Image Post Test
                  </h3>
                  <PostCard post={testImagePost} />
                </div>

                {/* Video Post Test */}
                <div>
                  <h3 className="text-md font-medium text-purple-800 dark:text-purple-400 mb-2">
                    Video Post Test
                  </h3>
                  <PostCard post={testVideoPost} />
                </div>

                {/* Carousel Post Test */}
                <div>
                  <h3 className="text-md font-medium text-purple-800 dark:text-purple-400 mb-2">
                    Carousel Post Test
                  </h3>
                  <PostCard post={testCarouselPost} />
                </div>

                {/* Tool Card Test */}
                <div>
                  <h3 className="text-md font-medium text-purple-800 dark:text-purple-400 mb-2">
                    Tool Card Test
                  </h3>
                  <ToolCard tool={testTool} />
                </div>

                {/* Horizontal Reel Test */}
                <div>
                  <h3 className="text-md font-medium text-purple-800 dark:text-purple-400 mb-2">
                    Horizontal Reel Test (Preview)
                  </h3>
                  <div className="bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
                    <ReelCard reel={testReelHorizontal} isVisible={true} />
                  </div>
                </div>

                {/* Vertical Reel Test */}
                <div>
                  <h3 className="text-md font-medium text-purple-800 dark:text-purple-400 mb-2">
                    Vertical Reel Test (Preview) - Should show full video
                  </h3>
                  <div className="bg-black rounded-lg overflow-hidden" style={{ height: '400px' }}>
                    <ReelCard reel={testReelVertical} isVisible={true} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default TestPage;
