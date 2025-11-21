import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
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

  const toggleLike = (postId: number) => {
    setLiked(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Explore Feed</h1>
        
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

                {/* Post Image */}
                <figure className="rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full aspect-video object-cover"
                  />
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

                  <button className="btn btn-ghost btn-sm gap-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </button>

                  <button className="btn btn-ghost btn-sm gap-2">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Explore;
