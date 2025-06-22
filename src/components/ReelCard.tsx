import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Copy, Check, Play, Pause } from 'lucide-react';
import { Reel } from '../types';

interface ReelCardProps {
  reel: Reel;
  isVisible: boolean;
}

const ReelCard: React.FC<ReelCardProps> = ({ reel, isVisible }) => {
  const [isLiked, setIsLiked] = useState(reel.isLiked || false);
  const [isSaved, setIsSaved] = useState(reel.isSaved || false);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isVisible]);

  // Handle video metadata loading to determine aspect ratio
  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const aspectRatio = video.videoWidth / video.videoHeight;
      setVideoAspectRatio(aspectRatio);
      console.log('Video dimensions:', video.videoWidth, 'x', video.videoHeight, 'Aspect ratio:', aspectRatio);
    }
  };

  const handleCopyPrompt = async () => {
    if (reel.prompt && reel.allowCopyPrompt) {
      await navigator.clipboard.writeText(reel.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Determine video display style based on aspect ratio
  const getVideoStyle = () => {
    if (videoAspectRatio === null) {
      // Default while loading
      return "w-full h-full object-cover";
    }

    // For vertical videos (aspect ratio < 1), use object-contain to show full video
    // For horizontal videos (aspect ratio > 1), use object-cover to fill screen
    if (videoAspectRatio < 1) {
      // Vertical video - show full video, center it
      return "w-full h-full object-contain";
    } else {
      // Horizontal video - crop to fill screen
      return "w-full h-full object-cover";
    }
  };

  return (
    <div className="relative w-full h-screen flex-shrink-0 bg-black overflow-hidden flex items-center justify-center">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        className={getVideoStyle()}
        loop
        muted
        playsInline
        onClick={togglePlay}
        onLoadedMetadata={handleVideoLoadedMetadata}
        onError={() => {
          console.error('Video failed to load:', reel.video_url);
        }}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          // Ensure high quality video rendering
          imageRendering: 'high-quality' as any
        }}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <button
            onClick={togglePlay}
            className="p-4 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <Play size={32} className="text-white ml-1" />
          </button>
        </div>
      )}

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30 pointer-events-none" />

      {/* Author Info - Top Left */}
      <div className="absolute top-16 left-4 flex items-center space-x-3">
        <img
          src={reel.author.avatar_url || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100`}
          alt={reel.author.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
        />
        <div>
          <div className="flex items-center space-x-1">
            <h3 className="font-semibold text-white">
              {reel.author.username}
            </h3>
            {reel.author.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions - Right Side */}
      <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6">
        <button
          onClick={() => setIsLiked(!isLiked)}
          className={`flex flex-col items-center space-y-1 transition-transform hover:scale-110 ${
            isLiked ? 'text-red-500' : 'text-white'
          }`}
        >
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
            <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
          </div>
          <span className="text-xs font-medium text-white">{reel.likes}</span>
        </button>

        <button className="flex flex-col items-center space-y-1 text-white transition-transform hover:scale-110">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
            <MessageCircle size={24} />
          </div>
          <span className="text-xs font-medium">{reel.comments}</span>
        </button>

        <button
          onClick={() => setIsSaved(!isSaved)}
          className={`flex flex-col items-center space-y-1 transition-transform hover:scale-110 ${
            isSaved ? 'text-yellow-400' : 'text-white'
          }`}
        >
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
            <Bookmark size={24} fill={isSaved ? 'currentColor' : 'none'} />
          </div>
          <span className="text-xs font-medium text-white">{reel.saves}</span>
        </button>

        {reel.allowCopyPrompt && (
          <button
            onClick={handleCopyPrompt}
            className={`flex flex-col items-center space-y-1 transition-all duration-200 hover:scale-110 ${
              copied ? 'text-green-400' : 'text-white'
            }`}
          >
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
              {copied ? <Check size={24} /> : <Copy size={24} />}
            </div>
            <span className="text-xs font-medium text-white">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>
        )}
      </div>

      {/* Content - Bottom Left */}
      <div className="absolute bottom-20 left-4 right-20">
        <h2 className="text-lg font-bold text-white mb-2">
          {reel.title}
        </h2>
        
        {reel.prompt && (
          <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 mb-3">
            <p className="text-sm text-white/90">
              {reel.prompt}
            </p>
          </div>
        )}

        {reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {reel.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm text-white rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelCard;