import { useRef, useState, WheelEvent } from 'react';
import { Layout } from '@/components/Layout';
import { Heart, MessageCircle, Share2, MoreVertical, Play, Gift, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Explore = () => {
  const [posts] = useState([
    {
      id: 1,
      author: 'Sarah Johnson',
      email: 'sarah.j@athlete.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      title: 'Morning Run Achievement!',
      content: 'Just completed my best 10K time! The early morning training sessions are really paying off. Feeling stronger every day!',
      likes: 142,
      comments: 23,
    },
    {
      id: 2,
      author: 'Mike Chen',
      email: 'mike.chen@athlete.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
      title: 'Gym Progress Update',
      content: 'Hit a new PR on deadlifts today! 405lbs! Big thanks to my training partner for the motivation.',
      likes: 89,
      comments: 15,
    },
    {
      id: 3,
      author: 'Emma Williams',
      email: 'emma.w@athlete.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
      title: 'Race Day Ready',
      content: 'Marathon prep is complete. Ready to crush this weekend\'s race! Thanks for all the support!',
      likes: 234,
      comments: 41,
    },
    {
      id: 4,
      author: 'James Rodriguez',
      email: 'james.r@athlete.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800',
      title: 'Recovery Day Vibes',
      content: 'Sometimes rest is just as important as training. Yoga and stretching session today.',
      likes: 67,
      comments: 8,
    },
    {
      id: 5,
      author: 'Lisa Park',
      email: 'lisa.p@athlete.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800',
      title: 'Swimming Competition',
      content: 'First place in the 200m freestyle! All those early morning pool sessions were worth it!',
      likes: 198,
      comments: 32,
    },
    {
      id: 6,
      author: 'David Kim',
      email: 'david.k@athlete.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
      title: 'Trail Running Adventure',
      content: 'Explored a new mountain trail today. The views were absolutely incredible!',
      likes: 156,
      comments: 19,
    },
  ]);

  const [liked, setLiked] = useState<number[]>([]);
  const [showReel, setShowReel] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const lastScrollRef = useRef(0);
  const [commentModalPostId, setCommentModalPostId] = useState<number | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [comments, setComments] = useState<{ [postId: number]: string[] }>({});

  const videoPosts = posts.filter((post) => post.video);

  const reels = [
    {
      id: 'r1',
      title: 'Track focus',
      video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      poster: 'https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=800',
      duration: '0:30',
    },
    {
      id: 'r2',
      title: 'Strength burst',
      video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/paint.mp4',
      poster: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800',
      duration: '0:41',
    },
    {
      id: 'r3',
      title: 'Focus drill',
      video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
      poster: 'https://images.unsplash.com/photo-1505678261036-a3fcc5e884ee?w=800',
      duration: '0:25',
    },
  ];

  const toggleLike = (postId: number) => {
    setLiked(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const openReel = (index: number) => {
    setActiveReelIndex(index);
    setShowReel(true);
  };

  const closeReel = () => setShowReel(false);

  const openVideoModalByPost = (postId: number) => {
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

  const openCommentModal = (postId: number) => {
    setCommentModalPostId(postId);
    setCommentDraft('');
  };

  const submitComment = () => {
    if (!commentModalPostId || !commentDraft.trim()) return;
    setComments((prev) => ({
      ...prev,
      [commentModalPostId]: [...(prev[commentModalPostId] || []), commentDraft.trim()],
    }));
    setCommentDraft('');
  };

  const nextReel = () => setActiveReelIndex((prev) => (prev + 1) % reels.length);
  const prevReel = () => setActiveReelIndex((prev) => (prev - 1 + reels.length) % reels.length);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Explore Feed</h1>

        {/* Reels rail */}
        <div className="card bg-base-100 shadow-xl mb-8 border border-base-300">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Short, under-2-minute reels</p>
                <h2 className="text-2xl font-semibold">Watch Reels</h2>
              </div>
              <button className="btn btn-outline btn-primary" onClick={() => openReel(0)}>
                Play now
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reels.map((reel, idx) => (
                <button
                  key={reel.id}
                  onClick={() => openReel(idx)}
                  className="relative group overflow-hidden rounded-xl border border-base-300"
                >
                  <img src={reel.poster} alt={reel.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-10 w-10 text-base-100" />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-base-100 text-sm drop-shadow">
                    <span className="font-semibold">{reel.title}</span>
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs">{reel.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body p-4">
                {/* Author Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.avatar} />
                      <AvatarFallback>{post.author[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{post.author}</p>
                      <p className="text-sm text-muted-foreground">{post.email}</p>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm btn-circle">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Post Media */}
                <figure className="rounded-lg overflow-hidden relative">
                  {post.video ? (
                    <button onClick={() => openVideoModalByPost(post.id)} className="w-full">
                      <video
                        src={post.video}
                        poster={post.poster}
                        className="w-full aspect-video object-cover"
                        muted
                        loop
                        autoPlay
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="h-12 w-12 text-base-100" />
                      </div>
                    </button>
                  ) : (
                    <button onClick={() => post.image && openImageModal(post.image)} className="w-full">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full aspect-video object-cover"
                      />
                    </button>
                  )}
                </figure>

                {/* Post Content */}
                <div className="space-y-2 mt-3">
                  <h3 className="font-bold text-lg">{post.title}</h3>
                  <p className="text-sm line-clamp-2">{post.content}</p>
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
                    <span>{post.likes + (liked.includes(post.id) ? 1 : 0)}</span>
                  </button>

                  <button className="btn btn-ghost btn-sm gap-2" onClick={() => openCommentModal(post.id)}>
                    <MessageCircle className="h-5 w-5" />
                    <span>{comments[post.id]?.length ?? post.comments}</span>
                  </button>

                  <button className="btn btn-ghost btn-sm gap-2" onClick={() => openCommentModal(post.id)}>
                    <Share2 className="h-5 w-5" />
                  </button>

                  <button className="btn btn-secondary btn-sm gap-2 text-base-100">
                    <Gift className="h-5 w-5" />
                    Donate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showReel && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-5xl">
            <button
              onClick={closeReel}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-4">
              <div className="lg:col-span-3 bg-black">
                <video
                  key={reels[activeReelIndex].id}
                  src={reels[activeReelIndex].video}
                  poster={reels[activeReelIndex].poster}
                  controls
                  autoPlay
                  className="w-full h-full max-h-[70vh] object-contain bg-black"
                />
              </div>
              <div className="p-4 space-y-3 bg-base-100">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">Reel</span>
                  <span className="text-sm text-muted-foreground">Auto-loads next two</span>
                </div>
                <h3 className="text-xl font-semibold">{reels[activeReelIndex].title}</h3>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={prevReel}>
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={nextReel}>
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Up next</p>
                  <div className="space-y-2">
                    {[1, 2].map((offset) => {
                      const idx = (activeReelIndex + offset) % reels.length;
                      const upcoming = reels[idx];
                      return (
                        <button
                          key={upcoming.id}
                          className="flex items-center gap-2 w-full text-left rounded-lg border border-base-300 p-2 hover:border-primary"
                          onClick={() => openReel(idx)}
                        >
                          <img src={upcoming.poster} alt={upcoming.title} className="w-14 h-14 rounded object-cover" />
                          <div>
                            <p className="font-semibold">{upcoming.title}</p>
                            <p className="text-xs text-muted-foreground">{upcoming.duration}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="btn btn-primary btn-sm text-base-100">Like</button>
                  <button className="btn btn-secondary btn-sm text-base-100">Comment</button>
                  <button className="btn btn-accent btn-sm text-base-100">Donate</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  src={videoPosts[activeVideoIndex].video}
                  poster={videoPosts[activeVideoIndex].poster}
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
                <h3 className="text-xl font-semibold">{videoPosts[activeVideoIndex].title}</h3>
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
                  <button className="btn btn-primary btn-sm text-base-100">Like</button>
                  <button className="btn btn-secondary btn-sm text-base-100">Comment</button>
                  <button className="btn btn-accent btn-sm text-base-100">Donate</button>
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
                {(comments[commentModalPostId] || []).length === 0 && (
                  <p className="text-sm text-muted-foreground">Be the first to comment.</p>
                )}
                {(comments[commentModalPostId] || []).map((c, idx) => (
                  <div key={idx} className="rounded-lg border border-base-300 p-2 text-sm">
                    {c}
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
                  <button className="btn btn-primary btn-sm text-base-100" onClick={submitComment}>Post Comment</button>
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
