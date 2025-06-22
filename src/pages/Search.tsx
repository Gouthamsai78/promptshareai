import React, { useState } from 'react';
import { Search as SearchIcon, Filter, X, Sliders } from 'lucide-react';
import PostCard from '../components/PostCard';
import ToolCard from '../components/ToolCard';
import { mockPosts, mockTools } from '../data/mockData';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'prompts' | 'tools'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'most_copied'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(new Set([
    ...mockPosts.flatMap(post => post.tags),
    ...mockTools.flatMap(tool => tool.tags)
  ]));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setSortBy('newest');
  };

  // Filter and search logic
  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => post.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const filteredTools = mockTools.filter(tool => {
    const matchesSearch = searchTerm === '' ||
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => tool.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 md:pt-24 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Search
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Find prompts, tools, and inspiration
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for prompts, tools, or tags..."
            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white text-lg"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-4 top-3.5 p-1 rounded transition-colors ${
              showFilters || selectedTags.length > 0
                ? 'text-blue-500'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Sliders size={20} />
          </button>
        </div>

        {/* Search Type Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'prompts', label: 'Prompts' },
            { key: 'tools', label: 'Tools' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSearchType(key as typeof searchType)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                searchType === key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Sort By */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Sort By
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'newest', label: 'Newest' },
                  { key: 'popular', label: 'Most Popular' },
                  { key: 'most_copied', label: 'Most Copied' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSortBy(key as typeof sortBy)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      sortBy === key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => toggleTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="space-y-8">
          {/* Prompts Section */}
          {(searchType === 'all' || searchType === 'prompts') && filteredPosts.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Prompts ({filteredPosts.length})
              </h2>
              <div className="space-y-6">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Tools Section */}
          {(searchType === 'all' || searchType === 'tools') && filteredTools.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Tools ({filteredTools.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTools.map(tool => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredPosts.length === 0 && filteredTools.length === 0 && searchTerm && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try different keywords or adjust your filters
              </p>
            </div>
          )}

          {/* Initial State */}
          {!searchTerm && selectedTags.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Start searching
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter keywords to find prompts and tools
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;