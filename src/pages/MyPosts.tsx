import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

type Post = {
  id: string;
  content: string | null;
  created_at: string;
  attachment_url: string | null;
  attachment_kind: string | null;
};

const MyPosts = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      setUser(userData.user);
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, created_at, attachment_url, attachment_kind')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      if (error) {
        toast({ title: 'Could not load posts', description: error.message, variant: 'destructive' });
      } else {
        setPosts((data as Post[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-normal mb-8 text-base-content">My Posts</h1>

        {loading && <p>Loading...</p>}
        {!loading && !user && <p>Please log in to see your posts.</p>}

        {!loading && user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
            {posts.map((post) => (
              <div key={post.id} className="card bg-base-100 shadow-xl">
                {post.attachment_kind === 'image' && post.attachment_url && (
                  <figure>
                    <img src={post.attachment_url} alt="post" className="w-full h-48 object-cover" />
                  </figure>
                )}
                <div className="card-body">
                  <p className="text-sm text-base-content/80 whitespace-pre-line">{post.content}</p>
                  <p className="text-xs text-base-content/60">{new Date(post.created_at).toLocaleString()}</p>

                  <div className="flex gap-4 text-sm text-base-content/60 mt-2">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> —
                    </span>
                    <span>❤️ 0</span>
                    <span>💬 0</span>
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
        )}
      </div>
    </Layout>
  );
};

export default MyPosts;
