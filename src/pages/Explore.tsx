import { FormEvent, useEffect, useRef, useState, WheelEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Heart, MessageCircle, Share2, Play, HandHeart, X, ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { UserAvatar } from '@/components/UserAvatar';
import { FundingProgress } from '@/components/fundraising/FundingProgress';
import { categoryLabel, fetchTotals, REQUEST_COLUMNS, RequestTotals, STATUS_BADGE, STATUS_LABELS, SupportRequest } from '@/lib/athylift';

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
  post_type?: string | null;
  support_request_id?: string | null;
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
  role: string | null;
  sport: string | null;
};

const POST_TYPE_LABELS: Record<string, string> = {
  achievement: 'Achievement',
  support_request: 'Funding request',
};

const PAGE_SIZE = 10;
const MAX_COMMENT_CHARS = 2000;
const POST_COLUMNS =
  'id, user_id, content, attachment_url, attachment_kind, attachment_name, attachment_preview, created_at, likes_count, comments_count, share_count, post_type, support_request_id';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Escapes LIKE wildcards so a search for "50%" matches literally.
// PostgREST also treats * as a wildcard and offers no escape for it, so it is dropped.
const escapeLike = (value: string) => value.replace(/\*/g, '').replace(/[\\%_]/g, (char) => `\\${char}`);

const Explore = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') ?? '').trim();
  const sharedPostParam = searchParams.get('post');
  const sharedPostId = sharedPostParam && UUID_PATTERN.test(sharedPostParam) ? sharedPostParam : null;
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  // Number of feed rows fetched so far (excludes a pinned shared post), used as the next page offset.
  const [feedOffset, setFeedOffset] = useState(0);
  const pendingLikes = useRef(new Set<string>());
  // Incremented on every feed reload so a slower, older request can't overwrite newer results.
  const loadIdRef = useRef(0);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
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
  // Request + funding totals behind each support_request post.
  const [requestMap, setRequestMap] = useState<Record<string, { request: SupportRequest; totals?: RequestTotals }>>({});

  const videoPosts = posts.filter((post) => post.attachment_kind === 'video' && post.attachment_url);
  // Clamp in case the post list changed while the video viewer was open.
  const activeVideo = videoPosts[Math.min(activeVideoIndex, videoPosts.length - 1)];

  const fetchProfiles = async (userIds: (string | null | undefined)[]) => {
    const idsToFetch = Array.from(
      new Set(userIds.filter((id): id is string => Boolean(id) && !profileMap[id!]))
    );
    if (idsToFetch.length === 0) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role, sport')
      .in('id', idsToFetch);
    if (error || !data) return;
    setProfileMap((prev) => {
      const next = { ...prev };
      data.forEach((p) => {
        next[p.id] = { full_name: p.full_name, avatar_url: p.avatar_url, role: p.role, sport: p.sport };
      });
      return next;
    });
  };

  const fetchRequests = async (feedPosts: FeedPost[]) => {
    const ids = Array.from(new Set(feedPosts.map((p) => p.support_request_id).filter((id): id is string => Boolean(id))));
    if (ids.length === 0) return;
    const [{ data }, totals] = await Promise.all([
      supabase.from('support_requests').select(REQUEST_COLUMNS).in('id', ids),
      fetchTotals(ids),
    ]);
    setRequestMap((prev) => {
      const next = { ...prev };
      ((data as SupportRequest[]) || []).forEach((r) => (next[r.id] = { request: r, totals: totals[r.id] }));
      return next;
    });
  };

  useEffect(() => {
    setShowVideoModal(false);
    setActiveVideoIndex(0);
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
      if (commentModalPostId) setCommentModalPostId(null);
      else if (imageModalUrl) setImageModalUrl(null);
      else if (showVideoModal) setShowVideoModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commentModalPostId, imageModalUrl, showVideoModal]);

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
    const loadId = ++loadIdRef.current;
    const isStale = () => loadId !== loadIdRef.current;
    setLoadingPosts(true);
    const { data, error } = await fetchPostsPage(0);
    if (isStale()) return;
    if (!error && data) {
      let fetched = data as FeedPost[];
      setFeedOffset(fetched.length);
      setHasMorePosts(fetched.length === PAGE_SIZE);
      // A shared link (?post=<id>) pins that post at the top of the feed.
      if (sharedPostId) {
        const { data: shared } = await supabase.from('posts').select(POST_COLUMNS).eq('id', sharedPostId).maybeSingle();
        if (shared) {
          fetched = [shared as FeedPost, ...fetched.filter((p) => p.id !== sharedPostId)];
        } else if (!isStale()) {
          toast({ title: 'Post not found', description: 'It may have been deleted.' });
        }
      }
      if (isStale()) return;
      setPosts(fetched);
      await Promise.all([fetchProfiles(fetched.map((p) => p.user_id)), fetchRequests(fetched)]);
      const likedIds = await fetchLikedIds(userId, fetched.map((p) => p.id));
      if (isStale()) return;
      setLiked(likedIds);
    } else if (error) {
      setPosts([]);
      setHasMorePosts(false);
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
      await Promise.all([fetchProfiles(fetched.map((p) => p.user_id)), fetchRequests(fetched)]);
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
    if (error) {
      setCommentSubmitting(false);
      toast({ title: 'Could not post comment', description: error.message, variant: 'destructive' });
      return;
    }
    // Clear the draft before re-enabling the button so a second click can't post it again.
    setCommentDraft('');
    setCommentSubmitting(false);
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
  };

  const sharePost = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const shareUrl = `${window.location.origin}/feed?post=${post.id}`;
    const shareData = {
      title: 'Athylift post',
      text: post.content || 'Check out this post on Athylift',
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
        toast({ title: 'Link copied', description: 'Share it to help this athlete find supporters.' });
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
        <div className="mx-auto mb-6 flex max-w-2xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{searchQuery ? `Results for "${searchQuery}"` : 'Athlete Feed'}</h1>
            {searchQuery && <Link to="/feed" className="link link-primary text-sm">Clear search</Link>}
          </div>
          <form
            className="relative w-full md:max-w-xs"
            role="search"
            onSubmit={(e: FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const query = String(new FormData(e.currentTarget).get('q') ?? '').trim();
              setSearchParams(query ? { q: query } : {});
            }}
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" />
            <input
              key={searchQuery}
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder="Search posts"
              aria-label="Search posts"
              className="input input-bordered w-full pl-10"
              maxLength={100}
            />
          </form>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {loadingPosts && (
            <div className="flex justify-center py-6">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          )}
          {!loadingPosts && posts.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/80">
              {searchQuery ? 'No posts match your search.' : "No posts yet. Athletes' stories, training updates and support requests will show up here."}
            </div>
          )}
          {!loadingPosts && posts.map((post) => {
            const author = profileMap[post.user_id || ''];
            const isAthlete = author?.role === 'athlete';
            const linked = post.support_request_id ? requestMap[post.support_request_id] : undefined;
            // Request posts are "title\n\ndescription"; show the title as a heading.
            const [requestTitle, ...rest] = linked ? (post.content || '').split('\n\n') : [];
            const body = linked ? linked.request.description || rest.join('\n\n') : post.content;
            return (
            <article
              key={post.id}
              className={`card bg-base-100 shadow-md ring-1 ring-base-300 transition-shadow hover:shadow-lg ${
                post.id === sharedPostId ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="card-body gap-4 p-5">
                {/* Author Header */}
                <header className="flex items-start gap-3">
                  <UserAvatar id={post.user_id} name={author?.full_name} url={author?.avatar_url} className="h-11 w-11" />
                  <div className="min-w-0 flex-1">
                    {isAthlete ? (
                      <Link to={`/athletes/${post.user_id}`} className="block truncate font-semibold hover:text-primary">
                        {author?.full_name || 'Athlete'}
                      </Link>
                    ) : (
                      <p className="truncate font-semibold">{author?.full_name || 'Athylift Member'}</p>
                    )}
                    <p className="truncate text-sm text-base-content/70">
                      {isAthlete ? author?.sport || 'Athlete' : author?.role === 'donor' ? 'Supporter' : 'Member'}
                      {post.created_at && ` · ${new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                    </p>
                  </div>
                  {post.post_type && POST_TYPE_LABELS[post.post_type] && (
                    <span
                      className={`badge shrink-0 whitespace-nowrap ${
                        post.post_type === 'support_request' ? 'badge-primary text-white' : 'badge-accent'
                      }`}
                    >
                      {POST_TYPE_LABELS[post.post_type]}
                    </span>
                  )}
                </header>

                {/* Post Content */}
                {linked ? (
                  <div className="space-y-2">
                    <Link to={`/requests/${linked.request.id}`} className="block text-lg font-semibold leading-snug hover:text-primary">
                      {linked.request.title || requestTitle}
                    </Link>
                    <p className="line-clamp-3 whitespace-pre-line text-base-content/85">{body}</p>
                  </div>
                ) : (
                  post.content && <p className="whitespace-pre-line text-base-content/90">{post.content}</p>
                )}

                {/* Post Media */}
                {(post.attachment_kind === 'image' && post.attachment_url) && (
                  <button onClick={() => openImageModal(post.attachment_url!)} className="w-full">
                    <img
                      src={post.attachment_url}
                      alt=""
                      className="w-full aspect-video object-cover rounded-xl border border-base-300"
                    />
                  </button>
                )}

                {(post.attachment_kind === 'video' && post.attachment_url) && (
                  <button onClick={() => openVideoModalByPost(post.id)} className="w-full relative">
                    <video
                      src={post.attachment_url}
                      poster={post.attachment_preview || undefined}
                      className="w-full aspect-video object-cover rounded-xl border border-base-300"
                      muted
                      loop
                      autoPlay
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl">
                      <Play className="h-12 w-12 text-white" />
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

                {/* Funding summary for request posts */}
                {linked && (
                  <div className="space-y-3 rounded-xl bg-base-200 p-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-outline">{categoryLabel(linked.request.category)}</span>
                      <span className={`badge ${STATUS_BADGE[linked.request.status]}`}>{STATUS_LABELS[linked.request.status]}</span>
                    </div>
                    <FundingProgress
                      target={Number(linked.request.target_amount)}
                      currency={linked.request.currency}
                      totals={linked.totals}
                      compact
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-1 border-t border-base-300 pt-3">
                  <button
                    onClick={() => toggleLike(post.id)}
                    aria-label={liked.includes(post.id) ? 'Unlike' : 'Like'}
                    className={`btn btn-ghost btn-sm gap-2 ${liked.includes(post.id) ? 'text-error' : ''}`}
                  >
                    <Heart className={`h-5 w-5 ${liked.includes(post.id) ? 'fill-error' : ''}`} />
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

                  <div className="ml-auto">
                    {post.support_request_id && (!linked || linked.request.status === 'active') ? (
                      <Link to={`/requests/${post.support_request_id}`} className="btn btn-primary btn-sm gap-2 text-white">
                        <HandHeart className="h-4 w-4" />
                        Support this athlete
                      </Link>
                    ) : post.support_request_id ? (
                      <Link to={`/requests/${post.support_request_id}`} className="btn btn-outline btn-sm">
                        View request
                      </Link>
                    ) : isAthlete ? (
                      <Link to={`/athletes/${post.user_id}`} className="btn btn-outline btn-sm">
                        View profile
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
            );
          })}
        </div>

        {!loadingPosts && hasMorePosts && (
          <div className="flex justify-center mt-6">
            <button className="btn btn-outline" onClick={showMorePosts} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Show more'}
            </button>
          </div>
        )}
      </div>

      {showVideoModal && activeVideo && (
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
                  key={activeVideo.id}
                  src={activeVideo.attachment_url || undefined}
                  poster={activeVideo.attachment_preview || undefined}
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
                <h3 className="text-xl font-semibold">{activeVideo.content?.slice(0, 60) || 'Video post'}</h3>
                <p className="text-sm text-muted-foreground">{activeVideo.content}</p>
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
                    className="btn btn-primary btn-sm text-white"
                    onClick={() => toggleLike(activeVideo.id)}
                  >
                    <Heart className={`h-4 w-4 ${liked.includes(activeVideo.id) ? 'fill-current' : ''}`} />
                    {liked.includes(activeVideo.id) ? 'Liked' : 'Like'} ({activeVideo.likes_count ?? 0})
                  </button>
                  <button
                    className="btn btn-secondary btn-sm text-white"
                    onClick={() => openCommentModal(activeVideo.id)}
                  >
                    Comment ({activeVideo.comments_count ?? 0})
                  </button>
                  {activeVideo.support_request_id && (
                    <Link to={`/requests/${activeVideo.support_request_id}`} className="btn btn-accent btn-sm text-white">
                      Support
                    </Link>
                  )}
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
                      <UserAvatar
                        id={c.user_id}
                        name={profileMap[c.user_id || '']?.full_name}
                        url={profileMap[c.user_id || '']?.avatar_url}
                        className="h-8 w-8"
                        textClassName="text-xs"
                      />
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
                    className="btn btn-primary btn-sm text-white"
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

    </Layout>
  );
};

export default Explore;
