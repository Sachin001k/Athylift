import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Camera, Save, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

const PROFILE_BUCKET = 'profile-media';
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (!error && data) {
        const record = data as ProfileRecord;
        setName(record.full_name || '');
        setBio(record.bio || '');
        setPhone(record.phone || '');
        setYoutubeUrl(record.youtube_url || '');
        setCoverImage(record.cover_url || DEFAULT_COVER);
        setProfileImage(record.avatar_url || DEFAULT_AVATAR);
      }
      const { data: postImages } = await supabase
        .from('posts')
        .select('attachment_url, attachment_kind')
        .eq('user_id', userData.user.id)
        .eq('attachment_kind', 'image')
        .not('attachment_url', 'is', null)
        .limit(30);
      if (postImages) {
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

  const persistProfile = async (updates: Partial<ProfileRecord>) => {
    if (!requireUser()) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user!.id,
      full_name: name,
      bio,
      phone,
      youtube_url: youtubeUrl,
      avatar_url: profileImage,
      cover_url: coverImage,
      email: user!.email,
      ...updates,
    });

    if (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive',
      });
      setSaving(false);
      return;
    }

    toast({
      title: 'Saved!',
      description: 'Your profile has been updated',
    });
    setSaving(false);
  };

  const uploadAndSave = async (file: File, keyPrefix: 'cover' | 'avatar') => {
    if (!requireUser()) return;
    setSaving(true);
    const path = `${user!.id}/${keyPrefix}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(PROFILE_BUCKET)
      .upload(path, file, { upsert: true });

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

    if (keyPrefix === 'cover') {
      setCoverImage(publicUrl);
      await persistProfile({ cover_url: publicUrl });
    } else {
      setProfileImage(publicUrl);
      await persistProfile({ avatar_url: publicUrl });
    }
    setSaving(false);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndSave(file, 'cover');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndSave(file, 'avatar');
    }
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddVideo = () => {
    const videoId = extractYouTubeId(youtubeInput);
    if (videoId) {
      setYoutubeUrl(youtubeInput);
      persistProfile({ youtube_url: youtubeInput });
      toast({
        title: 'Video added!',
        description: 'YouTube link saved to your profile',
      });
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
            <p className="text-sm text-muted-foreground">Navigate to Login and sign in with your Supabase credentials.</p>
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
                />
                <div className="text-base-900 p-2 text-center">
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
                  />
                  <Camera className="h-8 w-8 text-base-900 p-2" />
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
                <p className="text-sm text-muted-foreground">Add a YouTube link to showcase a video.</p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter YouTube URL"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={handleAddVideo}
                  className="btn btn-primary text-base-900 p-2"
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
