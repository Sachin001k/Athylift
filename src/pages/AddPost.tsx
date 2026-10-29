import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Upload, Loader2, Image as ImageIcon, Tag, Share2, Globe2, Paperclip } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import {
  ATTACHMENT_BUCKET,
  AttachmentKind,
  MAX_POST_CHARS as MAX_CHARS,
  checkAttachment,
  removeStoredFile,
  userFilePath,
} from '@/lib/storage';

type Attachment = { kind: AttachmentKind; url?: string; name?: string; file?: File; contentType?: string };

const AddPost = () => {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [audience, setAudience] = useState<'anyone' | 'connections'>('anyone');
  const [postType, setPostType] = useState<'update' | 'achievement'>('update');
  const { role } = useAuth();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Release the in-memory preview when the attachment changes or the page unmounts.
  useEffect(() => {
    const previewUrl = attachment?.url;
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [attachment]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again (after removing it) still fires onChange.
    e.target.value = '';
    if (file) handleFile(file);
  };

  const handleFile = (file: File) => {
    const checked = checkAttachment(file);
    if ('error' in checked) {
      toast({ title: 'Unsupported file', description: checked.error, variant: 'destructive' });
      return;
    }
    const { kind, contentType } = checked;
    if (kind === 'image' || kind === 'video') {
      setAttachment({ kind, url: URL.createObjectURL(file), name: file.name, file, contentType });
    } else {
      setAttachment({ kind, name: file.name, file, contentType });
    }
  };

  const removeAttachment = () => setAttachment(null);
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (!content.trim() && !attachment) {
      toast({
        title: 'Add something first',
        description: 'Write a post or attach a photo.',
        variant: 'destructive',
      });
      return;
    }

    // Set before any await so a quick double-click can't create two posts.
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({
        title: 'Login required',
        description: 'Please log in to create a post.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    let attachmentUrl: string | null = null;
    let attachmentPath: string | null = null;

    if (attachment?.file) {
      attachmentPath = userFilePath(userData.user.id, attachment.file.name);
      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .upload(attachmentPath, attachment.file, { contentType: attachment.contentType });

      if (uploadError) {
        toast({
          title: 'Upload failed',
          description: uploadError.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const { data } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(attachmentPath);
      attachmentUrl = data.publicUrl;
    } else if (attachment) {
      // Attachment state exists but no file reference; bail instead of creating a dangling record.
      toast({
        title: 'Upload failed',
        description: 'Attachment file is missing. Please re-upload and try again.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('posts').insert({
      user_id: userData.user.id,
      content: content.trim(),
      audience,
      post_type: postType,
      tags,
      hashtags,
      attachment_kind: attachment?.kind ?? null,
      attachment_name: attachment?.name?.slice(0, 300) ?? null,
      attachment_preview: null,
      attachment_url: attachmentUrl,
      attachment_path: attachmentPath,
    });

    if (error) {
      if (attachmentPath) await removeStoredFile(ATTACHMENT_BUCKET, attachmentPath);
      toast({
        title: 'Could not post',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({ title: 'Posted', description: 'Your update is live.' });
    setLoading(false);
    setContent('');
    setAttachment(null);
    setTags([]);
    setTagInput('');
    setHashtags([]);
    setHashtagInput('');
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value) return;
    if (!tags.includes(value)) setTags([...tags, value]);
    setTagInput('');
  };

  const addHashtag = () => {
    const value = hashtagInput.trim().replace(/^#*/, '');
    if (!value) return;
    if (!hashtags.includes(value)) setHashtags([...hashtags, value]);
    setHashtagInput('');
  };

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-semibold">A</div>
          <div className="leading-tight">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Athylift feed</p>
            <p className="text-lg font-light text-base-content">Share an update</p>
          </div>
        </div>
        {role === 'athlete' && (
          <div className="alert mb-4 text-sm">
            <span>
              Need funding for equipment, coaching or fees?{' '}
              <Link to="/requests/new" className="link link-primary">Post a support request</Link> instead, so donors can see your target and progress.
            </span>
          </div>
        )}

        <div className="card bg-base-100 shadow-lg border border-base-300 overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-start gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold">YO</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-base-content/90">You</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-base-200 text-muted-foreground uppercase tracking-[0.15em]">
                  member
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2">
                {(['update', 'achievement'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPostType(type)}
                    aria-pressed={postType === type}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] ${
                      postType === type ? 'border-primary bg-primary text-white' : 'border-base-300 text-muted-foreground'
                    }`}
                  >
                    {type === 'update' ? 'Training update' : 'Achievement'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setAudience('anyone')}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] border-primary text-primary"
                >
                  <Globe2 className="h-3 w-3" />
                  Anyone
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 pb-3">
            <textarea
              rows={5}
              placeholder="Share a training update, an achievement, or what you need support with (equipment, coaching, academy fees)..."
              className="w-full resize-none border-0 focus:ring-0 text-sm placeholder:text-muted-foreground text-base-content bg-transparent"
              maxLength={MAX_CHARS}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Be honest about your needs and how support will be used.</span>
              <span>{content.length} / {MAX_CHARS}</span>
            </div>
          </div>

          <div
            className="px-5 pb-3"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="relative overflow-hidden rounded-lg border border-dashed border-base-300 bg-base-200/40 p-4 text-sm text-muted-foreground">
              {!attachment && (
                <label className="w-full cursor-pointer flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="h-6 w-6 text-primary" />
                  <p>Drag and drop images, videos, or documents, or click to upload</p>
                  <input
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {attachment && (
                <div className="relative">
                  {attachment.kind === 'image' && attachment.url ? (
                    <img src={attachment.url} alt="preview" className="h-56 w-full object-cover rounded-md" />
                  ) : attachment.kind === 'video' && attachment.url ? (
                    <video src={attachment.url} controls className="h-56 w-full rounded-md object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 rounded-md border border-base-300 bg-base-100 px-3 py-2">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span className="text-sm">{attachment.name || 'Attached file'}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeAttachment}
                    className="absolute top-2 right-2 rounded-full bg-base-content/80 text-white text-[10px] px-2 py-0.5"
                  >
                    remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="px-5 pb-3 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-base-content mb-1">Tags</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="@name"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <button className="btn btn-outline" type="button" onClick={addTag}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((t) => (
                    <span key={t} className="badge badge-primary badge-outline gap-1">
                      @{t.replace(/^@/, '')}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((tag) => tag !== t))}
                        className="ml-1 text-xs"
                        aria-label={`Remove tag ${t}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-base-content mb-1">Hashtags</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="#topic"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHashtag())}
                  />
                  <button className="btn btn-outline" type="button" onClick={addHashtag}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {hashtags.map((t) => (
                    <span key={t} className="badge badge-secondary badge-outline gap-1">
                      #{t.replace(/^#/, '')}
                      <button
                        type="button"
                        onClick={() => setHashtags(hashtags.filter((tag) => tag !== t))}
                        className="ml-1 text-xs"
                        aria-label={`Remove hashtag ${t}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-base-200 px-5 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="inline-flex items-center gap-1 cursor-pointer hover:text-primary transition">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <ImageIcon className="h-4 w-4" />
                  <span>photo</span>
                </label>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center justify-center rounded-full bg-primary text-white text-sm font-light px-4 py-1.5 hover:bg-primary/90 transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-1" />
                    Post
                  </>
                )}
              </button>
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Audience: {audience === 'anyone' ? 'Anyone' : 'Connections only'}</span>
              <span>{content.length} / {MAX_CHARS}</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddPost;
