import { Layout } from '@/components/Layout';
import { Edit, Trash2, Eye } from 'lucide-react';

const MyPosts = () => {
  const posts = [
    {
      id: 1,
      title: 'Morning Run Achievement!',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
      createdAt: '2 days ago',
      likes: 142,
      comments: 23,
      views: 1234,
    },
    {
      id: 2,
      title: 'Gym Progress Update',
      image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      createdAt: '5 days ago',
      likes: 89,
      comments: 15,
      views: 892,
    },
  ];

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-normal mb-8 text-base-content">My Posts</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="card bg-base-100 shadow-xl">
              <figure>
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              </figure>
              <div className="card-body">
                <h3 className="card-title text-base-content">{post.title}</h3>
                <p className="text-sm text-base-content/60">{post.createdAt}</p>
                
                <div className="flex gap-4 text-sm text-base-content/60 mt-2">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {post.views}
                  </span>
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comments}</span>
                </div>

                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-sm btn-ghost text-base-content">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="btn btn-sm btn-ghost text-error">
                    <Trash2 className="h-4 w-4" />
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

export default MyPosts;
