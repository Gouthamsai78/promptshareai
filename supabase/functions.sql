-- Database Functions and Triggers for PromptShare

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update post counts
CREATE OR REPLACE FUNCTION public.update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles 
        SET posts_count = posts_count + 1 
        WHERE id = NEW.user_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles 
        SET posts_count = posts_count - 1 
        WHERE id = OLD.user_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for post counts
CREATE TRIGGER on_post_created
    AFTER INSERT ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

CREATE TRIGGER on_post_deleted
    AFTER DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_post_counts();

-- Function to update like counts
CREATE OR REPLACE FUNCTION public.update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            UPDATE public.posts 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.post_id;
        ELSIF NEW.reel_id IS NOT NULL THEN
            UPDATE public.reels 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.reel_id;
        ELSIF NEW.comment_id IS NOT NULL THEN
            UPDATE public.comments 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.comment_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            UPDATE public.posts 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.post_id;
        ELSIF OLD.reel_id IS NOT NULL THEN
            UPDATE public.reels 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.reel_id;
        ELSIF OLD.comment_id IS NOT NULL THEN
            UPDATE public.comments 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.comment_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for like counts
CREATE TRIGGER on_like_created
    AFTER INSERT ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_like_counts();

CREATE TRIGGER on_like_deleted
    AFTER DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION public.update_like_counts();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            UPDATE public.posts 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.post_id;
        ELSIF NEW.reel_id IS NOT NULL THEN
            UPDATE public.reels 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.reel_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            UPDATE public.posts 
            SET comments_count = comments_count - 1 
            WHERE id = OLD.post_id;
        ELSIF OLD.reel_id IS NOT NULL THEN
            UPDATE public.reels 
            SET comments_count = comments_count - 1 
            WHERE id = OLD.reel_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for comment counts
CREATE TRIGGER on_comment_created
    AFTER INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();

CREATE TRIGGER on_comment_deleted
    AFTER DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();

-- Function to update save counts
CREATE OR REPLACE FUNCTION public.update_save_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            UPDATE public.posts
            SET saves_count = saves_count + 1
            WHERE id = NEW.post_id;
        ELSIF NEW.reel_id IS NOT NULL THEN
            UPDATE public.reels
            SET saves_count = saves_count + 1
            WHERE id = NEW.reel_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            UPDATE public.posts
            SET saves_count = saves_count - 1
            WHERE id = OLD.post_id;
        ELSIF OLD.reel_id IS NOT NULL THEN
            UPDATE public.reels
            SET saves_count = saves_count - 1
            WHERE id = OLD.reel_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for save counts
CREATE TRIGGER on_save_created
    AFTER INSERT ON public.saves
    FOR EACH ROW EXECUTE FUNCTION public.update_save_counts();

CREATE TRIGGER on_save_deleted
    AFTER DELETE ON public.saves
    FOR EACH ROW EXECUTE FUNCTION public.update_save_counts();

-- Function to update follow counts
CREATE OR REPLACE FUNCTION public.update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles
        SET following_count = following_count + 1
        WHERE id = NEW.follower_id;

        UPDATE public.profiles
        SET followers_count = followers_count + 1
        WHERE id = NEW.following_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles
        SET following_count = following_count - 1
        WHERE id = OLD.follower_id;

        UPDATE public.profiles
        SET followers_count = followers_count - 1
        WHERE id = OLD.following_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for follow counts
CREATE TRIGGER on_follow_created
    AFTER INSERT ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

CREATE TRIGGER on_follow_deleted
    AFTER DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.update_follow_counts();

-- Function to safely increment reel views with rate limiting
CREATE OR REPLACE FUNCTION public.increment_reel_views(reel_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.reels
    SET views_count = views_count + 1,
        updated_at = NOW()
    WHERE id = reel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
