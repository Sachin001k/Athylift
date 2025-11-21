import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Upload, X, Loader2, Image as ImageIcon, Video, Link2, Smile, Hash, Users, Clock3, Globe2, Tag, AtSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_CHARS = 1300;

const AddPost = () => {
  const { toast } = useToast();
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<'image' | 'video' | null>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [audience, setAudience] = useState<'connections' | 'public' | 'private'>('connections');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAttachmentType('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setImagePreview(null);
    setAttachmentType(null);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const disablePost = !content.trim() && !headline.trim();

  const handleSave = async () => {
    if (disablePost) {
      toast({
        title: 'Add a thought first',
        description: 'Write something or add media to share.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Shared to feed',
      description: 'Your post is live for your audience.',
    });

    setLoading(false);
    setHeadline('');
    setContent('');
    setImagePreview(null);
    setAttachmentType(null);
    setLinkUrl('');
    setTags([]);
    setHashtags([]);
  };

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Start a post</h1>

        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body space-y-6">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-primary text-base-100 rounded-full w-10">
                    <span>YO</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold">You</p>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as typeof audience)}
                    className="select select-xs select-bordered"
                  >
                    <option value="connections">Connections only</option>
                    <option value="public">Public</option>
                    <option value="private">Private draft</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button className={`btn btn-sm ${audience === 'public' ? 'btn-primary text-base-100' : 'btn-ghost'}`} onClick={() => setAudience('public')}>
                  <Globe2 className="h-4 w-4 mr-1" />
                  Public
                </button>
                <button className={`btn btn-sm ${audience === 'connections' ? 'btn-secondary text-base-100' : 'btn-ghost'}`} onClick={() => setAudience('connections')}>
                  <Users className="h-4 w-4 mr-1" />
                  Connections
                </button>
              </div>
            </div>

            <div className="form-control">
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Add a headline"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <textarea
                className="textarea textarea-bordered h-40"
                placeholder="What do you want to talk about?"
                value={content}
                maxLength={MAX_CHARS}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="text-right text-xs text-muted-foreground mt-1">{content.length}/{MAX_CHARS}</div>
            </div>

            {imagePreview && (
              <div className="relative rounded-lg overflow-hidden border border-base-300">
                <img src={imagePreview} alt="preview" className="w-full max-h-80 object-cover" />
                <button
                  onClick={handleRemoveMedia}
                  className="btn btn-circle btn-sm absolute top-2 right-2 bg-error text-base-100"
                  aria-label="Remove media"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2"><Tag className="h-4 w-4" /> Tag people</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="@name"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <button className="btn btn-outline" type="button" onClick={handleAddTag}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="badge badge-primary badge-outline gap-1">
                      <AtSign className="h-3 w-3" />{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-2"><Hash className="h-4 w-4" /> Hashtags</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="#parenting"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHashtag())}
                  />
                  <button className="btn btn-outline" type="button" onClick={handleAddHashtag}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((t) => (
                    <span key={t} className="badge badge-secondary badge-outline">#{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2"><Link2 className="h-4 w-4" /> Add a link</span>
              </label>
              <input
                type="url"
                className="input input-bordered w-full"
                placeholder="https://"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3 items-center border border-base-300 rounded-lg p-3 bg-base-200/60">
              <label className="btn btn-ghost btn-sm gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              <button className={`btn btn-ghost btn-sm gap-2 ${attachmentType === 'video' ? 'text-primary' : ''}`} onClick={() => setAttachmentType('video')}>
                <Video className="h-4 w-4 text-secondary" />
                Video
              </button>
              <button className="btn btn-ghost btn-sm gap-2">
                <Smile className="h-4 w-4 text-accent" />
                Feeling/Activity
              </button>
              <button className="btn btn-ghost btn-sm gap-2">
                <Clock3 className="h-4 w-4 text-muted-foreground" />
                Schedule
              </button>
            </div>

            <div className="card-actions justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setHeadline('');
                  setContent('');
                  setImagePreview(null);
                  setAttachmentType(null);
                  setLinkUrl('');
                  setTags([]);
                  setHashtags([]);
                }}
                disabled={loading}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary text-base-100"
                disabled={loading || disablePost}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddPost;
