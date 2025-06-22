import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { MockDatabaseService } from './mockDatabase';
import { Post, Reel, Tool, Comment, Profile } from '../types';

type Tables = Database['public']['Tables'];
type PostRow = Tables['posts']['Row'];
type ReelRow = Tables['reels']['Row'];
type ToolRow = Tables['tools']['Row'];
type CommentRow = Tables['comments']['Row'];

// Helper function to detect if we should use offline mode
const isOfflineMode = (): boolean => {
  // Check if we're in offline mode by looking at localStorage
  return localStorage.getItem('mock-auth-session') !== null;
};

export class DatabaseService {
  // Posts
  static async getPosts(limit: number = 20, offset: number = 0): Promise<Post[]> {
    // Use mock data if in offline mode
    if (isOfflineMode()) {
      return MockDatabaseService.getPosts(offset, limit);
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles(*)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return data.map(post => ({
        ...post,
        author: post.author as Profile,
      })) as Post[];
    } catch (error: any) {
      // If network error, fall back to mock data
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
        console.log('🔄 Network error in getPosts, using mock data');
        return MockDatabaseService.getPosts(offset, limit);
      }
      throw error;
    }
  }

  static async getPostById(id: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      ...data,
      author: data.author as Profile,
    } as Post;
  }

  static async createPost(post: Tables['posts']['Insert']): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert(post)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      author: data.author as Profile,
    } as Post;
  }

  static async updatePost(id: string, updates: Tables['posts']['Update']): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      author: data.author as Profile,
    } as Post;
  }

  static async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getUserPosts(userId: string, limit: number = 20, offset: number = 0): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data.map(post => ({
      ...post,
      author: post.author as Profile,
    })) as Post[];
  }

  // Reels
  static async getReels(limit: number = 20, offset: number = 0): Promise<Reel[]> {
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        author:profiles(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data.map(reel => ({
      ...reel,
      author: reel.author as Profile,
    })) as Reel[];
  }

  static async createReel(reel: Tables['reels']['Insert']): Promise<Reel> {
    const { data, error } = await supabase
      .from('reels')
      .insert(reel)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      author: data.author as Profile,
    } as Reel;
  }

  static async updateReelViews(id: string): Promise<void> {
    const { error } = await supabase
      .from('reels')
      .update({
        views_count: supabase.sql`views_count + 1`,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
  }

  // Tools
  static async getTools(limit: number = 20, offset: number = 0, category?: string): Promise<Tool[]> {
    // Use mock data if in offline mode
    if (isOfflineMode()) {
      return MockDatabaseService.getTools(category);
    }

    try {
      let query = supabase
        .from('tools')
        .select(`
          *,
          author:profiles(*)
        `)
        .order('created_at', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      return data.map(tool => ({
        ...tool,
        author: tool.author as Profile,
      })) as Tool[];
    } catch (error: any) {
      // If network error, fall back to mock data
      if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('ERR_NAME_NOT_RESOLVED'))) {
        console.log('🔄 Network error in getTools, using mock data');
        return MockDatabaseService.getTools(category);
      }
      throw error;
    }
  }

  static async createTool(tool: Tables['tools']['Insert']): Promise<Tool> {
    const { data, error } = await supabase
      .from('tools')
      .insert(tool)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      author: data.author as Profile,
    } as Tool;
  }

  static async searchTools(query: string, category?: string): Promise<Tool[]> {
    let dbQuery = supabase
      .from('tools')
      .select(`
        *,
        author:profiles(*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (category && category !== 'All') {
      dbQuery = dbQuery.eq('category', category);
    }

    const { data, error } = await dbQuery;

    if (error) throw error;

    return data.map(tool => ({
      ...tool,
      author: tool.author as Profile,
    })) as Tool[];
  }

  // Comments
  static async getComments(postId?: string, reelId?: string): Promise<Comment[]> {
    let query = supabase
      .from('comments')
      .select(`
        *,
        author:profiles(*)
      `)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (postId) {
      query = query.eq('post_id', postId);
    } else if (reelId) {
      query = query.eq('reel_id', reelId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      data.map(async (comment) => {
        const replies = await this.getCommentReplies(comment.id);
        return {
          ...comment,
          author: comment.author as Profile,
          replies,
        } as Comment;
      })
    );

    return commentsWithReplies;
  }

  static async getCommentReplies(parentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('parent_id', parentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data.map(comment => ({
      ...comment,
      author: comment.author as Profile,
    })) as Comment[];
  }

  static async createComment(comment: Tables['comments']['Insert']): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert(comment)
      .select(`
        *,
        author:profiles(*)
      `)
      .single();

    if (error) throw error;

    return {
      ...data,
      author: data.author as Profile,
    } as Comment;
  }

  // Likes
  static async likePost(userId: string, postId: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (error) throw error;
  }

  static async unlikePost(userId: string, postId: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  }

  static async likeReel(userId: string, reelId: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: userId,
        reel_id: reelId,
      });

    if (error) throw error;
  }

  static async unlikeReel(userId: string, reelId: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('reel_id', reelId);

    if (error) throw error;
  }

  static async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  static async isReelLiked(userId: string, reelId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('reel_id', reelId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Saves
  static async savePost(userId: string, postId: string): Promise<void> {
    const { error } = await supabase
      .from('saves')
      .insert({
        user_id: userId,
        post_id: postId,
      });

    if (error) throw error;
  }

  static async unsavePost(userId: string, postId: string): Promise<void> {
    const { error } = await supabase
      .from('saves')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) throw error;
  }

  static async isPostSaved(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saves')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Follows
  static async followUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error) throw error;
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  }

  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Search
  static async searchPosts(query: string, limit: number = 20): Promise<Post[]> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(*)
      `)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,prompt.ilike.%${query}%`)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(post => ({
      ...post,
      author: post.author as Profile,
    })) as Post[];
  }

  static async searchUsers(query: string, limit: number = 20): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order('followers_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Profile[];
  }

  static async getUserSavedPosts(userId: string): Promise<Post[]> {
    const { data, error } = await supabase
      .from('saves')
      .select(`
        post:posts(
          *,
          author:profiles(*)
        )
      `)
      .eq('user_id', userId)
      .not('post_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data
      .filter(save => save.post)
      .map(save => ({
        ...save.post,
        author: save.post.author as Profile,
      })) as Post[];
  }
}
