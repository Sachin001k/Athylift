import { useEffect, useRef, useState, WheelEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Heart, MessageCircle, Share2, Play, Gift, X, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type FeedPost = {
  id: string;
  content: string | null;
  user_id?: string | null;
  attachment_url: string | null;
  attachment_kind: string | null;
  attachment_name?: string | null;
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

type ProfileInfo = {
  full_name: string | null;
  avatar_url: string | null;
};

const PAGE_SIZE = 10;
const MAX_COMMENT_CHARS = 2000;
const MAX_DONATION = 1000000;
const MAX_DONATION_MESSAGE = 1000;
const POST_COLUMNS =
  'id, user_id, content, attachment_url, attachment_kind, attachment_name, attachment_preview, created_at, likes_count, comments_count, share_count';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Escapes LIKE wildcards so a search for "50%" matches literally.
const escapeLike = (value: string) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

const Explore = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim();
  const sharedPostParam = searchParams.get('post');
  const sharedPostId = sharedPostParam && UUID_PATTERN.test(sharedPostParam) ? sharedPostParam : null;
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  // Number of feed rows fetched so far (excludes a pinned shared post), used as the next page offset.
  const [feedOffset, setFeedOffset] = useState(0);
  const pendingLikes = useRef(new Set<string>());
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [donateSubmitting, setDonateSubmitting] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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
  const [profileMap, setProfileMap] = useState<Record<string, ProfileInfo>>({});
  const [donateModalPostId, setDonateModalPostId] = useState<string | null>(null);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateMessage, setDonateMessage] = useState('');
  const [thankYouInfo, setThankYouInfo] = useState<{ name: string; amount: string } | null>(null);

  const videoPosts = posts.filter((post) => post.attachment_kind === 'video' && post.attachment_url);

  const fetchProfiles = async (userIds: (string | null | undefined)[]) => {
    const idsToFetch = Array.from(
      new Set(userIds.filter((id): id is string => Boolean(id) && !profileMap[id!]))
    );
    if (idsToFetch.length === 0) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', idsToFetch);
    if (error || !data) return;
    setProfileMap((prev) => {
      const next = { ...prev };
      data.forEach((p) => {
        next[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url };
      });
      return next;
    });
  };

  useEffect(() => {
    const loadInitial = async () => {
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user ?? null);
      await loadPosts(userData.user?.id);
      if (userData.user?.id) {
        await fetchProfiles([userData.user.id]);
      }
    };
    loadInitial();
    // Reload when the search (?q=) or shared post (?post=) in the URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sharedPostId]);

  // Escape closes the top-most open modal.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (thankYouInfo) setThankYouInfo(null);
      else if (donateModalPostId) setDonateModalPostId(null);
      else if (commentModalPostId) setCommentModalPostId(null);
      else if (imageModalUrl) setImageModalUrl(null);
      else if (showVideoModal) setShowVideoModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [thankYouInfo, donateModalPostId, commentModalPostId, imageModalUrl, showVideoModal]);

  const fetchPostsPage = async (offset: number) => {
    let query = supabase.from('posts').select(POST_COLUMNS);
    if (searchQuery) query = query.ilike('content', `%${escapeLike(searchQuery)}%`);
    return query.order('created_at', { ascending: false }).range(offset, offset + PAGE_SIZE - 1);
  };

  const fetchLikedIds = async (userId: string | null | undefined, postIds: string[]) => {
    if (!userId || postIds.length === 0) return [];
    const { data, error } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);
    if (error) {
      console.warn('Could not load likes:', error.message);
      return [];
    }
    return (data || []).map((row) => row.post_id as string);
  };

  const loadPosts = async (userId?: string | null) => {
    setLoadingPosts(true);
    const { data, error } = await fetchPostsPage(0);
    if (!error && data) {
      let fetched = data as FeedPost[];
      setFeedOffset(fetched.length);
      setHasMorePosts(fetched.length === PAGE_SIZE);
      // A shared link (?post=<id>) pins that post at the top of the feed.
      if (sharedPostId) {
        const { data: shared } = await supabase.from('posts').select(POST_COLUMNS).eq('id', sharedPostId).maybeSingle();
        if (shared) {
          fetched = [shared as FeedPost, ...fetched.filter((p) => p.id !== sharedPostId)];
        } else {
          toast({ title: 'Post not found', description: 'It may have been deleted.' });
        }
      }
      setPosts(fetched);
      await fetchProfiles(fetched.map((p) => p.user_id));
      setLiked(await fetchLikedIds(userId, fetched.map((p) => p.id)));
    } else if (error) {
      toast({ title: 'Could not load posts', description: error.message, variant: 'destructive' });
    }
    setLoadingPosts(false);
  };

  const showMorePosts = async () => {
    setLoadingMore(true);
    const { data, error } = await fetchPostsPage(feedOffset);
    if (error) {
      toast({ title: 'Could not load more posts', description: error.message, variant: 'destructive' });
    } else if (data) {
      const fetched = data as FeedPost[];
      setFeedOffset((prev) => prev + fetched.length);
      setPosts((prev) => [...prev, ...fetched.filter((p) => !prev.some((existing) => existing.id === p.id))]);
      setHasMorePosts(fetched.length === PAGE_SIZE);
      await fetchProfiles(fetched.map((p) => p.user_id));
      const newlyLiked = await fetchLikedIds(user?.id, fetched.map((p) => p.id));
      setLiked((prev) => Array.from(new Set([...prev, ...newlyLiked])));
    }
    setLoadingMore(false);
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to like posts.', variant: 'destructive' });
      return;
    }
    // Ignore clicks while this post's like/unlike request is in flight, so requests can't cross.
    if (pendingLikes.current.has(postId)) return;
    pendingLikes.current.add(postId);
    try {
      await applyLikeToggle(postId);
    } finally {
      pendingLikes.current.delete(postId);
    }
  };

  const applyLikeToggle = async (postId: string) => {
    if (!user) return;
    const isLiked = liked.includes(postId);
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
      }
    } else {
      setLiked((prev) => [...prev, postId]);
      updateCounts(1);
      // The database updates likes_count and notifies the post owner.
      const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      // 23505 = already liked (e.g. from another tab); keep the liked state.
      if (error && error.code !== '23505') {
        setLiked((prev) => prev.filter((id) => id !== postId));
        updateCounts(-1);
        toast({ title: 'Could not like post', description: error.message, variant: 'destructive' });
      } else if (error) {
        updateCounts(-1);
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

  const openDonateModal = (postId: string) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to donate.', variant: 'destructive' });
      return;
    }
    setDonateModalPostId(postId);
    setDonateAmount('');
    setDonateMessage('');
  };

  const submitDonation = async () => {
    if (!donateModalPostId || donateSubmitting) return;
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to donate.', variant: 'destructive' });
      return;
    }
    const numericAmount = Math.round(parseFloat(donateAmount) * 100) / 100;
    if (Number.isNaN(numericAmount) || numericAmount < 1 || numericAmount > MAX_DONATION) {
      toast({
        title: 'Enter an amount',
        description: `Please enter an amount between ₹1 and ₹${MAX_DONATION.toLocaleString('en-IN')}.`,
        variant: 'destructive',
      });
      return;
    }
    const finalName = profileMap[user.id || '']?.full_name || user.email || 'Supporter';
    setDonateSubmitting(true);
    const { error } = await supabase.from('donations').insert({
      user_id: user.id,
      beneficiary_name: null,
      post_reference: donateModalPostId,
      post_id: donateModalPostId,
      cause_id: null,
      cause_title: 'Post donation',
      cause_image: null,
      amount: numericAmount,
      currency: 'INR',
      frequency: 'one-time',
      payment_method: 'app',
      message: donateMessage.trim().slice(0, MAX_DONATION_MESSAGE) || null,
      dedication: null,
      country: null,
      cover_fees: false,
      allow_updates: false,
    });
    setDonateSubmitting(false);
    if (error) {
      toast({ title: 'Could not save donation', description: error.message || 'Try again.', variant: 'destructive' });
      return;
    }

    setDonateModalPostId(null);
    setThankYouInfo({ name: finalName, amount: numericAmount.toFixed(2) });
  };

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
      await fetchProfiles(data.map((c) => c.user_id));
    } else if (error) {
      toast({ title: 'Could not load comments', description: error.message, variant: 'destructive' });
    }
    setCommentsLoading(false);
  };

  const submitComment = async () => {
    if (!commentModalPostId || !commentDraft.trim() || commentSubmitting) return;
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to comment.', variant: 'destructive' });
      return;
    }
    if (commentDraft.trim().length > MAX_COMMENT_CHARS) {
      toast({ title: 'Comment too long', description: `Keep it under ${MAX_COMMENT_CHARS} characters.`, variant: 'destructive' });
      return;
    }
    setCommentSubmitting(true);
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: commentModalPostId, content: commentDraft.trim(), user_id: user.id })
      .select()
      .single();
    setCommentSubmitting(false);
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
    // The database updates comments_count and notifies the post owner.
    await fetchProfiles([user.id]);
    setCommentDraft('');
  };

  const sharePost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const shareUrl = `${window.location.origin}/explore?post=${post.id}`;
    const shareData = {
      title: 'Athlyft post',
      text: post.content || 'Check out this post on Athlyft',
      url: shareUrl,
    };

    let shared = false;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
      }
    }

    if (!shared) {
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link copied', description: 'Share it with your friends.' });
        shared = true;
      } catch {
        toast({ title: 'Share unavailable', description: 'Could not open share dialog', variant: 'destructive' });
      }
    }

    if (!shared) return;

    const { data: shareCount, error } = await supabase.rpc('increment_share', { p_post_id: postId });
    if (error) {
      toast({ title: 'Share failed', description: error.message, variant: 'destructive' });
    } else {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, share_count: (shareCount as number | null) ?? p.share_count } : p))
      );
      toast({ title: 'Post shared' });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{searchQuery ? `Results for "${searchQuery}"` : 'Explore Feed'}</h1>
        {searchQuery ? (
          <Link to="/explore" className="link link-primary text-sm mb-6 inline-block">Clear search</Link>
        ) : (
          <div className="mb-6" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingPosts && (
            <div className="col-span-full flex justify-center py-6">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}
          {!loadingPosts && posts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No posts match your search.' : 'No posts yet. Create one to get started.'}
            </p>
          )}
          {!loadingPosts && posts.map((post) => (
            <div
              key={post.id}
              className={`card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow ${
                post.id === sharedPostId ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="card-body p-4">
                {/* Author Header */}
                <div className="flex items-center justify-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={
                          profileMap[post.user_id || '']?.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id || 'member'}`
                        }
                      />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">
                        {profileMap[post.user_id || '']?.full_name || 'Athlyft Member'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {post.user_id ? 'Member' : 'Community'}
                      </p>
                    </div>
                  </div>
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

                {(post.attachment_kind === 'file' && post.attachment_url) && (
                  <a
                    href={post.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-base-300 px-3 py-2 text-sm hover:border-primary"
                  >
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="truncate">{post.attachment_name || 'Open attachment'}</span>
                  </a>
                )}

                {/* Post Content */}
                <div className="space-y-2 mt-3">
                  <p className="text-sm whitespace-pre-line">{post.content}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <button
                    onClick={() => toggleLike(post.id)}
                    aria-label={liked.includes(post.id) ? 'Unlike' : 'Like'}
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

                  <button className="btn btn-ghost btn-sm gap-2" onClick={() => openCommentModal(post.id)} aria-label="Comments">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments_count ?? 0}</span>
                  </button>

                  <button className="btn btn-ghost btn-sm gap-2" onClick={() => sharePost(post.id)} aria-label="Share">
                    <Share2 className="h-5 w-5" />
                    <span>{post.share_count ?? 0}</span>
                  </button>

                  <button className="btn btn-secondary btn-sm gap-2 text-base-900 p-2" onClick={() => openDonateModal(post.id)}>
                    <Gift className="h-5 w-5" />
                    Donate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loadingPosts && hasMorePosts && (
          <div className="flex justify-center mt-6">
            <button className="btn btn-outline" onClick={showMorePosts} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Show more'}
            </button>
          </div>
        )}
      </div>

      {showVideoModal && videoPosts.length > 0 && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onWheel={handleVideoWheel}
          onClick={(e) => e.target === e.currentTarget && closeVideoModal()}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl">
            <button
              onClick={closeVideoModal}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
              aria-label="Close"
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
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    className="btn btn-primary btn-sm text-base-900 p-2"
                    onClick={() => toggleLike(videoPosts[activeVideoIndex].id)}
                  >
                    <Heart className={`h-4 w-4 ${liked.includes(videoPosts[activeVideoIndex].id) ? 'fill-current' : ''}`} />
                    {liked.includes(videoPosts[activeVideoIndex].id) ? 'Liked' : 'Like'} ({videoPosts[activeVideoIndex].likes_count ?? 0})
                  </button>
                  <button
                    className="btn btn-secondary btn-sm text-base-900 p-2"
                    onClick={() => openCommentModal(videoPosts[activeVideoIndex].id)}
                  >
                    Comment ({videoPosts[activeVideoIndex].comments_count ?? 0})
                  </button>
                  <button
                    className="btn btn-accent btn-sm text-base-900 p-2"
                    onClick={() => openDonateModal(videoPosts[activeVideoIndex].id)}
                  >
                    Donate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {imageModalUrl && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeImageModal()}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl">
            <button
              onClick={closeImageModal}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <img src={imageModalUrl} alt="Post" className="w-full h-full object-contain bg-black max-h-[80vh]" />
          </div>
        </div>
      )}

      {commentModalPostId !== null && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setCommentModalPostId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg">
            <button
              onClick={() => setCommentModalPostId(null)}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
              aria-label="Close"
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
                  <div key={c.id} className="rounded-lg border border-base-300 p-3 text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            profileMap[c.user_id || '']?.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.user_id || 'anon'}`
                          }
                        />
                        <AvatarFallback>US</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="font-semibold">
                          {profileMap[c.user_id || '']?.full_name || (c.user_id ? 'Member' : 'Anon')}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {new Date(c.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p>{c.content}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  placeholder="Add your comment..."
                  maxLength={MAX_COMMENT_CHARS}
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setCommentModalPostId(null)}>Close</button>
                  <button
                    className="btn btn-primary btn-sm text-base-900 p-2"
                    onClick={submitComment}
                    disabled={commentSubmitting || !commentDraft.trim()}
                  >
                    {commentSubmitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {donateModalPostId && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setDonateModalPostId(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg">
            <button
              onClick={() => setDonateModalPostId(null)}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      profileMap[user?.id || '']?.avatar_url ||
                      (user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : undefined)
                    }
                  />
                  <AvatarFallback>{(user?.email || 'AT').slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">Send a donation</h3>
                  <p className="text-sm text-muted-foreground">Support this creator with a quick tip.</p>
                </div>
              </div>
              <div className="space-y-3">
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Amount (₹)</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={MAX_DONATION}
                    step="0.01"
                    className="input input-bordered w-full"
                    placeholder="Enter amount"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(e.target.value)}
                  />
                </label>
                <label className="form-control w-full">
                  <div className="label">
                    <span className="label-text">Message (optional)</span>
                  </div>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Share a note with your donation"
                    maxLength={MAX_DONATION_MESSAGE}
                    value={donateMessage}
                    onChange={(e) => setDonateMessage(e.target.value)}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setDonateModalPostId(null)}>Cancel</button>
                <button
                  className="btn btn-primary btn-sm text-base-900 p-2"
                  onClick={submitDonation}
                  disabled={donateSubmitting}
                >
                  {donateSubmitting ? 'Saving...' : 'Donate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {thankYouInfo && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setThankYouInfo(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
            <button
              onClick={() => setThankYouInfo(null)}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-base-900 shadow-lg border border-base-300">
                  🎊
                </div>
              </div>
              <h3 className="text-2xl font-semibold">Thank you, {thankYouInfo.name}!</h3>
              <p className="text-sm text-muted-foreground">
                We recorded your ₹{thankYouInfo.amount} pledge. Online payments are not connected yet, so no money has been charged.
              </p>
              <div className="bg-base-200 rounded-xl p-3 text-sm text-base-content border border-base-300">
                <p className="font-semibold">Message</p>
                <p className="text-muted-foreground">{donateMessage?.trim() || 'No message provided.'}</p>
              </div>
              <button className="btn btn-primary text-base-900 p-2 w-full" onClick={() => setThankYouInfo(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Explore;
