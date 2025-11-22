import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Edit, Trash2, Eye, Loader2, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

const ATTACHMENT_BUCKET = 'post-attachments';

type Attachment = { kind: 'image' | 'video' | 'file'; url?: string; name?: string; file?: File };

type Post = {
  id: string;
  content: string | null;
  created_at: string;
  attachment_url: string | null;
  attachment_kind: string | null;
  likes_count?: number | null;
  comments_count?: number | null;
  share_count?: number | null;
  tags?: string[] | null;
  hashtags?: string[] | null;
};

const MyPosts = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editContent, setEditContent] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editAttachment, setEditAttachment] = useState<Attachment | null>(null);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editHashtags, setEditHashtags] = useState<string[]>([]);
  const [editHashtagInput, setEditHashtagInput] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }
      setUser(userData.user);
      await fetchPosts(userData.user.id);
    };
    load();
  }, [toast]);

  const fetchPosts = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('id, content, created_at, attachment_url, attachment_kind, likes_count, comments_count, share_count, tags, hashtags')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Could not load posts', description: error.message, variant: 'destructive' });
    } else {
      setPosts((data as Post[]) || []);
    }
    setLoading(false);
  };

  const startEdit = (post: Post) => {
    setEditingPost(post);
    setEditContent(post.content ?? '');
    setEditTags(post.tags ?? []);
    setEditHashtags(post.hashtags ?? []);
    setEditTagInput('');
    setEditHashtagInput('');
    setEditAttachment(null);
    setRemoveAttachment(false);
  };

  const saveEdit = async () => {
    if (!editingPost) return;
    if (!editContent.trim()) {
      toast({ title: 'Add content', description: 'Post cannot be empty.', variant: 'destructive' });
      return;
    }
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in again.', variant: 'destructive' });
      return;
    }

    let attachmentUrl: string | null | undefined = undefined;
    let attachmentPath: string | null | undefined = undefined;
    let attachmentKind: string | null | undefined = undefined;
    let attachmentName: string | null | undefined = undefined;
    let attachmentPreview: string | null | undefined = undefined;

    if (removeAttachment) {
      attachmentUrl = null;
      attachmentPath = null;
      attachmentKind = null;
      attachmentName = null;
      attachmentPreview = null;
    } else if (editAttachment?.file) {
      const kind = editAttachment.kind;
      const file = editAttachment.file;
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .upload(path, file, { upsert: true });
      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        return;
      }
      const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);
      attachmentUrl = data.publicUrl;
      attachmentPath = path;
      attachmentKind = kind;
      attachmentName = file.name;
      attachmentPreview = editAttachment.url ?? null;
    }

    const updatePayload: Record<string, unknown> = {
      content: editContent.trim(),
      tags: editTags,
      hashtags: editHashtags,
    };

    if (attachmentUrl !== undefined) {
      updatePayload.attachment_url = attachmentUrl;
      updatePayload.attachment_path = attachmentPath;
      updatePayload.attachment_kind = attachmentKind;
      updatePayload.attachment_name = attachmentName;
      updatePayload.attachment_preview = attachmentPreview;
    }

    setSavingEdit(true);
    const { error } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', editingPost.id)
      .eq('user_id', user.id);
    setSavingEdit(false);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === editingPost.id
          ? {
              ...p,
              content: editContent.trim(),
              tags: editTags,
              hashtags: editHashtags,
              attachment_url:
                attachmentUrl !== undefined ? attachmentUrl : p.attachment_url,
              attachment_kind:
                attachmentKind !== undefined ? attachmentKind : p.attachment_kind,
            }
          : p
      )
    );
    toast({ title: 'Post updated' });
    setEditingPost(null);
    setEditContent('');
    setEditAttachment(null);
  };

  const handleEditFile = (file: File) => {
    const kind = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
      ? 'video'
      : 'file';
    if (kind === 'image' || kind === 'video') {
      const reader = new FileReader();
      reader.onloadend = () =>
        setEditAttachment({ kind, url: reader.result as string, name: file.name, file });
      reader.readAsDataURL(file);
    } else {
      setEditAttachment({ kind, name: file.name, file });
    }
    setRemoveAttachment(false);
  };

  const handleEditDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleEditFile(file);
  };

  const addEditTag = () => {
    const value = editTagInput.trim();
    if (!value) return;
    if (!editTags.includes(value)) setEditTags([...editTags, value]);
    setEditTagInput('');
  };

  const addEditHashtag = () => {
    const value = editHashtagInput.trim().replace(/^#*/, '');
    if (!value) return;
    if (!editHashtags.includes(value)) setEditHashtags([...editHashtags, value]);
    setEditHashtagInput('');
  };

  const confirmDelete = async (postId: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeletingId(postId);
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user?.id ?? '');
    setDeletingId(null);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast({ title: 'Post deleted' });
  };

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-normal mb-8 text-base-content">My Posts</h1>

        {loading && (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        )}
        {!loading && !user && <p>Please log in to see your posts.</p>}

        {!loading && user && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.length === 0 && <p className="text-sm text-muted-foreground">No posts yet.</p>}
            {posts.map((post) => (
              <div key={post.id} className="card bg-base-100 shadow-xl max-h-[400px] overflow-hidden flex flex-col">
                {post.attachment_kind === 'image' && post.attachment_url && (
                  <figure className="h-[170px] overflow-hidden">
                    <img src={post.attachment_url} alt="post" className="w-full h-full object-cover" />
                  </figure>
                )}
                {post.attachment_kind === 'video' && post.attachment_url && (
                  <div className="w-full h-[170px] bg-black overflow-hidden">
                    <video src={post.attachment_url} className="w-full h-full object-cover" controls />
                  </div>
                )}
                <div className="card-body flex-1 overflow-hidden">
                  <p className="text-sm text-base-content/80 whitespace-pre-line line-clamp-3">{post.content}</p>
                  <p className="text-xs text-base-content/60">{new Date(post.created_at).toLocaleString()}</p>

                  <div className="flex gap-4 text-sm text-base-content/60 mt-2">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> —
                    </span>
                    <span>❤️ {post.likes_count ?? 0}</span>
                    <span>💬 {post.comments_count ?? 0}</span>
                    <span>↗️ {post.share_count ?? 0}</span>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-sm btn-ghost text-base-content" onClick={() => startEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-error"
                      onClick={() => confirmDelete(post.id)}
                      disabled={deletingId === post.id}
                    >
                      {deletingId === post.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingPost && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative bg-base-100 rounded-2xl shadow-2xl overflow-hidden w-full max-w-3xl">
            <button
              onClick={() => setEditingPost(null)}
              className="btn btn-circle btn-sm absolute top-3 right-3 bg-base-100 text-base-content"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Edit post</h3>
              <div className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="px-5 pt-5 pb-3 flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-base-900 p-2 text-sm font-semibold">
                    ME
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-base-content/90">You</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-base-200 text-muted-foreground uppercase tracking-[0.15em]">
                        member
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Updating your post</p>
                  </div>
                </div>

                <div className="px-5 pb-5 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content/80">Caption</label>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      rows={4}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Update your post caption..."
                    />
                  </div>

                  <div
                    className="border border-dashed border-base-300 rounded-xl p-4 bg-base-200/50 text-center cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleEditDrop}
                  >
                    <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleEditFile(file);
                        }}
                      />
                      <Paperclip className="h-5 w-5 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop media to replace (leave empty to keep current)
                      </p>
                    </label>
                    {editAttachment && editAttachment.url && (
                      <div className="mt-3">
                        {editAttachment.kind === 'image' ? (
                          <img
                            src={editAttachment.url}
                            alt="new preview"
                            className="w-full max-h-48 object-cover rounded-lg border border-base-300"
                          />
                        ) : (
                          <video
                            src={editAttachment.url}
                            className="w-full max-h-48 rounded-lg border border-base-300 object-contain"
                            controls
                          />
                        )}
                      </div>
                    )}
                    <div className="flex justify-center gap-2 mt-3">
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => {
                          setEditAttachment(null);
                          setRemoveAttachment(false);
                        }}
                      >
                        Clear new media
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => {
                          setEditAttachment(null);
                          setRemoveAttachment(true);
                        }}
                      >
                        Remove current media
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content/80">Tags</label>
                    <div className="flex gap-2">
                      <input
                        className="input input-bordered input-sm flex-1"
                        placeholder="Add tag"
                        value={editTagInput}
                        onChange={(e) => setEditTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addEditTag();
                          }
                        }}
                      />
                      <button className="btn btn-sm btn-primary text-base-900 p-2" type="button" onClick={addEditTag}>
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editTags.map((tag) => (
                        <span key={tag} className="badge badge-outline gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => setEditTags(editTags.filter((t) => t !== tag))}
                            className="ml-1 text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-base-content/80">Hashtags / People</label>
                    <div className="flex gap-2">
                      <input
                        className="input input-bordered input-sm flex-1"
                        placeholder="#add"
                        value={editHashtagInput}
                        onChange={(e) => setEditHashtagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addEditHashtag();
                          }
                        }}
                      />
                      <button className="btn btn-sm btn-primary text-base-900 p-2" type="button" onClick={addEditHashtag}>
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editHashtags.map((tag) => (
                        <span key={tag} className="badge badge-outline gap-1">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => setEditHashtags(editHashtags.filter((t) => t !== tag))}
                            className="ml-1 text-xs"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingPost(null)} disabled={savingEdit}>
                      Cancel
                    </button>
                    <button className="btn btn-primary btn-sm text-base-900 p-2" onClick={saveEdit} disabled={savingEdit}>
                      {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MyPosts;
