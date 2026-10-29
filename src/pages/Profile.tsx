import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Camera, Save, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { PROFILE_BUCKET, removeStoredFile, storagePathFromPublicUrl, userFilePath } from '@/lib/storage';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200';
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=athlete';

type ProfileRecord = {
  full_name: string | null;
  bio: string | null;
  phone: string | null;
  youtube_url: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  email?: string | null;
  role?: string | null;
};

const Profile = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');
  const [coverImage, setCoverImage] = useState(DEFAULT_COVER);
  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [gallery, setGallery] = useState<string[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setLoadingProfile(false);
        return;
      }
      setUser(userData.user);

      // my_profile() returns the full row, including the private phone and email columns.
      const { data, error } = await supabase.rpc('my_profile').maybeSingle();

      if (error) {
        toast({ title: 'Could not load profile', description: error.message, variant: 'destructive' });
      } else if (data) {
        const record = data as ProfileRecord;
        setName(record.full_name || '');
        setBio(record.bio || '');
        setPhone(record.phone || '');
        setYoutubeUrl(record.youtube_url || '');
        setCoverImage(record.cover_url || DEFAULT_COVER);
        setProfileImage(record.avatar_url || DEFAULT_AVATAR);
      }
      const { data: postImages, error: galleryError } = await supabase
        .from('posts')
        .select('attachment_url, attachment_kind')
        .eq('user_id', userData.user.id)
        .eq('attachment_kind', 'image')
        .not('attachment_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(30);
      if (galleryError) {
        console.warn('Could not load gallery:', galleryError.message);
      } else if (postImages) {
        setGallery(postImages.map((p) => p.attachment_url!).filter(Boolean));
      }
      setLoadingProfile(false);
    };

    loadProfile();
  }, []);

  const requireUser = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to edit your profile.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  // Saves only the fields passed in, so untouched fields (e.g. default images) are never written.
  const persistProfile = async (updates: Partial<Omit<ProfileRecord, 'email'>>) => {
    if (!requireUser()) return false;
    setSaving(true);
    let { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user!.id)
      .select('id');

    // The database creates the row at signup; this covers accounts created before that trigger existed.
    if (!error && (!data || data.length === 0)) {
      ({ data, error } = await supabase.from('profiles').insert({ id: user!.id, ...updates }).select('id'));
    }

    setSaving(false);
    if (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Saved!',
      description: 'Your profile has been updated',
    });
    return true;
  };

  const uploadAndSave = async (file: File, keyPrefix: 'cover' | 'avatar') => {
    if (!requireUser()) return;
    if (!file.type.startsWith('image/') || file.size > MAX_IMAGE_BYTES) {
      toast({ title: 'Invalid image', description: 'Please choose an image up to 5 MB.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const path = userFilePath(user!.id, `${keyPrefix}-${file.name}`);
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    const { data } = supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;
    const previousUrl = keyPrefix === 'cover' ? coverImage : profileImage;

    const saved = await persistProfile(keyPrefix === 'cover' ? { cover_url: publicUrl } : { avatar_url: publicUrl });
    if (!saved) {
      await removeStoredFile(PROFILE_BUCKET, path);
      return;
    }
    if (keyPrefix === 'cover') {
      setCoverImage(publicUrl);
    } else {
      setProfileImage(publicUrl);
      window.dispatchEvent(new Event('profile-updated'));
    }
    await removeStoredFile(PROFILE_BUCKET, storagePathFromPublicUrl(PROFILE_BUCKET, previousUrl));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      uploadAndSave(file, 'cover');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      uploadAndSave(file, 'avatar');
    }
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|&v=)([^#&?/]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddVideo = async () => {
    const videoId = extractYouTubeId(youtubeInput);
    if (videoId) {
      const saved = await persistProfile({ youtube_url: youtubeInput });
      if (!saved) return;
      setYoutubeUrl(youtubeInput);
      setYoutubeInput('');
    } else {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid YouTube URL',
        variant: 'destructive',
      });
    }
  };

  if (loadingProfile) {
    return (
      <Layout showStats={false}>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="card bg-base-100 shadow-xl p-6">
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout showStats={false}>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="card bg-base-100 shadow-xl p-6">
            <p className="text-lg font-semibold mb-2">Please log in to view your profile.</p>
            <p className="text-sm text-muted-foreground">Log in to manage your Athylift profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="relative">
            <div className="h-64 rounded-t-2xl overflow-hidden relative group">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                  disabled={saving}
                />
                <div className="text-white p-2 text-center">
                  <Camera className="h-12 w-12 mx-auto mb-2" />
                  <p>Change Cover</p>
                </div>
              </label>
            </div>

            <div className="absolute -bottom-16 left-8">
              <div className="avatar relative group">
                <div className="w-32 rounded-full ring ring-base-100 ring-offset-base-100 ring-offset-2">
                  <img src={profileImage} alt="Profile" />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileChange}
                    disabled={saving}
                  />
                  <Camera className="h-8 w-8 text-white" />
                </label>
              </div>
            </div>
          </div>

          <div className="card-body pt-20">
            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Name</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={() => persistProfile({ full_name: name })}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Bio */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Bio</span>
              </label>
              <div className="flex gap-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={2000}
                  className="textarea textarea-bordered flex-1"
                  rows={3}
                />
                <button
                  onClick={() => persistProfile({ bio })}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Phone (quick edit) */}
            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-semibold">Phone</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={32}
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={() => persistProfile({ phone })}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Gallery</h2>
            {gallery.length === 0 && <p className="text-sm text-muted-foreground">No image posts yet.</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Videos</h2>
            <div className="space-y-4">
              {youtubeUrl ? (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeUrl) || ''}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Add a YouTube link to showcase your training or competition footage.</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter YouTube URL"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  maxLength={500}
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={handleAddVideo}
                  className="btn btn-primary text-white"
                  disabled={saving}
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Add Video
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-base-100 shadow-xl mt-6">
          <div className="card-body">
            <h2 className="card-title">Contact Information</h2>
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  className="input input-bordered pl-2"
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  className="input input-bordered pl-2"
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Phone</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  maxLength={32}
                    className="input input-bordered flex-1 pl-2"
                  />
                  <button
                    onClick={() => persistProfile({ phone })}
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
