import { useEffect, useRef, useState, WheelEvent } from 'react';
import { Layout } from '@/components/Layout';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Gift, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type FeedPost = {
  id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_kind: string | null;
  attachment_preview: string | null;
  created_at?: string;
  likes_count?: number | null;
  comments_count?: number | null;
  share_count?: number | null;
};

type PostComment = {
  id: string;
  post_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
};

const Explore = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [liked, setLiked] = useState<string[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const lastScrollRef = useRef(0);
  const [commentModalPostId, setCommentModalPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [comments, setComments] = useState<{ [postId: string]: PostComment[] }>({});
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const videoPosts = posts.filter((post) => post.attachment_kind === 'video' && post.attachment_url);

  useEffect(() => {
    const loadInitial = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user ?? null);
      await loadPosts(userData.user?.id);
    };
    loadInitial();
  }, []);

  const loadPosts = async (userId?: string | null) => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, content, attachment_url, attachment_kind, attachment_preview, created_at, likes_count, comments_count, share_count')
      .order('created_at', { ascending: false });
    if (!error && data) {
      const fetched = data as FeedPost[];
      setPosts(fetched);
      if (userId && fetched.length > 0) {
        const ids = fetched.map((p) => p.id);
        const { data: likedRows } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', ids);
        setLiked((likedRows || []).map((row) => row.post_id));
      } else {
        setLiked([]);
      }
    } else if (error) {
      toast({ title: 'Could not load posts', description: error.message, variant: 'destructive' });
    }
    setLoadingPosts(false);
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to like posts.', variant: 'destructive' });
      return;
    }
    const isLiked = liked.includes(postId);
    const currentLikes = posts.find((p) => p.id === postId)?.likes_count ?? 0;
    const updateCounts = (delta: number) =>
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, likes_count: (p.likes_count ?? 0) + delta } : p))
      );

    if (isLiked) {
      setLiked((prev) => prev.filter((id) => id !== postId));
      updateCounts(-1);
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
      if (error) {
        setLiked((prev) => [...prev, postId]);
        updateCounts(1);
        toast({ title: 'Could not remove like', description: error.message, variant: 'destructive' });
      } else {
        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, currentLikes - 1) })
          .eq('id', postId);
      }
    } else {
      setLiked((prev) => [...prev, postId]);
      updateCounts(1);
      const { error } = await supabase.from('post_likes').upsert({ post_id: postId, user_id: user.id });
      if (error) {
        setLiked((prev) => prev.filter((id) => id !== postId));
        updateCounts(-1);
        toast({ title: 'Could not like post', description: error.message, variant: 'destructive' });
      } else {
        await supabase
          .from('posts')
          .update({ likes_count: currentLikes + 1 })
          .eq('id', postId);
      }
    }
  };

  const openVideoModalByPost = (postId: string) => {
    const idx = videoPosts.findIndex((p) => p.id === postId);
    if (idx >= 0) {
      setActiveVideoIndex(idx);
      setShowVideoModal(true);
    }
  };

  const closeVideoModal = () => setShowVideoModal(false);
  const nextVideo = () => setActiveVideoIndex((prev) => (prev + 1) % videoPosts.length || 0);
  const prevVideo = () => setActiveVideoIndex((prev) => (prev - 1 + videoPosts.length) % videoPosts.length || 0);

  const handleVideoWheel = (e: WheelEvent) => {
    if (!showVideoModal || videoPosts.length === 0) return;
    const now = Date.now();
    if (now - lastScrollRef.current < 400) return;
    lastScrollRef.current = now;
    if (e.deltaY > 0) {
      nextVideo();
    } else if (e.deltaY < 0) {
      prevVideo();
    }
  };

  const openImageModal = (url: string) => setImageModalUrl(url);
  const closeImageModal = () => setImageModalUrl(null);

  const openCommentModal = async (postId: string) => {
    setCommentModalPostId(postId);
    setCommentDraft('');
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select('id, post_id, user_id, content, created_at')
      .eq('post_id', postId)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setComments((prev) => ({ ...prev, [postId]: data as PostComment[] }));
    } else if (error) {
      toast({ title: 'Could not load comments', description: error.message, variant: 'destructive' });
    }
    setCommentsLoading(false);
  };

  const submitComment = async () => {
    if (!commentModalPostId || !commentDraft.trim()) return;
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to comment.', variant: 'destructive' });
      return;
    }
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: commentModalPostId, content: commentDraft.trim(), user_id: user.id })
      .select()
      .single();
    if (error) {
      toast({ title: 'Could not post comment', description: error.message, variant: 'destructive' });
      return;
    }
    const newComment = data as PostComment;
    setComments((prev) => ({
      ...prev,
      [commentModalPostId]: [newComment, ...(prev[commentModalPostId] || [])],
    }));
    setPosts((prev) =>
      prev.map((p) =>
        p.id === commentModalPostId ? { ...p, comments_count: (p.comments_count ?? 0) + 1 } : p
      )
    );
    await supabase
      .from('posts')
      .update({ comments_count: (posts.find((p) => p.id === commentModalPostId)?.comments_count ?? 0) + 1 })
      .eq('id', commentModalPostId);
    setCommentDraft('');
  };

  const sharePost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const nextCount = (post.share_count ?? 0) + 1;
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, share_count: nextCount } : p)));
    const { error } = await supabase.from('posts').update({ share_count: nextCount }).eq('id', postId);
    if (error) {
      toast({ title: 'Share failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Post shared' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Feed</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingPosts && (
            <div className="col-span-full flex justify-center py-6">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}
          {!loadingPosts && posts.length === 0 && (
            <p className="text-sm text-muted-foreground">No posts yet. Create one to get started.</p>
          )}
          {!loadingPosts && posts.map((post) => (
            <div key={post.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body p-4">
                {/* Author Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=member" />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">Athlyft Member</p>
                      <p className="text-sm text-muted-foreground">Community</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm btn-circle">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Post Media */}
                {(post.attachment_kind === 'image' && post.attachment_url) && (
                  <button onClick={() => openImageModal(post.attachment_url!)} className="w-full">
                    <img
                      src={post.attachment_url}
                      alt="post"
                      className="w-full aspect-video object-cover rounded-lg border border-base-300"
                    />
                  </button>
                )}

                {(post.attachment_kind === 'video' && post.attachment_url) && (
                  <button onClick={() => openVideoModalByPost(post.id)} className="w-full relative">
                    <video
                      src={post.attachment_url}
                      poster={post.attachment_preview || undefined}
                      className="w-full aspect-video object-cover rounded-lg border border-base-300"
                      muted
                      loop
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                      <Play className="h-12 w-12 text-base-900 p-2" />
                    </div>
                  </button>
                )}

                {/* Post Content */}
                <div className="space-y-2 mt-3">
                  <p className="text-sm whitespace-pre-line">{post.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`btn btn-ghost btn-sm gap-2 ${
                      liked.includes(post.id) ? 'text-error' : ''
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        liked.includes(post.id) ? 'fill-error' : ''
                      }`}
                    />
                    <span>{post.likes_count ?? 0}</span>
                  </button>

                  <button className="btn btn-ghost btn-sm gap-2" onClick={() => openCommentModal(post.id)}>
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments_count ?? 0}</span>
                  </button>

                  <button className="btn btn-ghost btn-sm gap-2" onClick={() => sharePost(post.id)}>
                    <Share2 className="h-5 w-5" />
                    <span>{post.share_count ?? 0}</span>
                  </button>

                  <button className="btn btn-secondary btn-sm gap-2 text-base-900 p-2">
                    <Gift className="h-5 w-5" />
                    Donate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showVideoModal && videoPosts.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onWheel={handleVideoWheel}
        >
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl">
            <button
              onClick={closeVideoModal}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-4">
              <div className="lg:col-span-3 bg-black">
                <video
                  key={videoPosts[activeVideoIndex].id}
                  src={videoPosts[activeVideoIndex].attachment_url || undefined}
                  poster={videoPosts[activeVideoIndex].attachment_preview || undefined}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full max-h-[70vh] object-contain bg-black"
                />
              </div>
              <div className="p-4 space-y-3 bg-base-100">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">Video</span>
                  <span className="text-sm text-muted-foreground">Scroll to browse</span>
                </div>
                <h3 className="text-xl font-semibold">{videoPosts[activeVideoIndex].content?.slice(0, 60) || 'Video post'}</h3>
                <p className="text-sm text-muted-foreground">{videoPosts[activeVideoIndex].content}</p>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={prevVideo}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={nextVideo}>
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="btn btn-primary btn-sm text-base-900 p-2">Like</button>
                  <button className="btn btn-secondary btn-sm text-base-900 p-2">Comment</button>
                  <button className="btn btn-accent btn-sm text-base-900 p-2">Donate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {imageModalUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl">
            <button
              onClick={closeImageModal}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={imageModalUrl} alt="Post" className="w-full h-full object-contain bg-black max-h-[80vh]" />
          </div>
        </div>
      )}

      {commentModalPostId !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg">
            <button
              onClick={() => setCommentModalPostId(null)}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
            >
              <X className="h-4 w-4" />
            </button>
              <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Comments</h3>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {commentsLoading && (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner text-primary" />
                  </div>
                )}
                {!commentsLoading && (comments[commentModalPostId] || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Be the first to comment.</p>
                )}
                {(comments[commentModalPostId] || []).map((c) => (
                  <div key={c.id} className="rounded-lg border border-base-300 p-2 text-sm">
                    <p className="font-semibold">{c.user_id ? 'Member' : 'Anon'}</p>
                    <p>{c.content}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{new Date(c.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Add your comment..."
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setCommentModalPostId(null)}>Close</button>
                  <button className="btn btn-primary btn-sm text-base-900 p-2" onClick={submitComment}>Post Comment</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Explore;
