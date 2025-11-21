import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Camera, Save, Plus, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { toast } = useToast();
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200');
  const [profileImage, setProfileImage] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=athlete');
  const [name, setName] = useState('John Athlete');
  const [bio, setBio] = useState('Professional athlete | Marathon runner | Fitness enthusiast');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  const [gallery] = useState([
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
  ]);

  const [videos] = useState([
    'dQw4w9WgXcQ',
  ]);

  const handleSave = (field: string) => {
    toast({
      title: 'Saved!',
      description: `Your ${field} has been updated`,
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleAddVideo = () => {
    const videoId = extractYouTubeId(youtubeUrl);
    if (videoId) {
      toast({
        title: 'Video added!',
        description: 'YouTube video has been added to your profile',
      });
      setYoutubeUrl('');
    } else {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid YouTube URL',
        variant: 'destructive',
      });
    }
  };

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
                <div className="text-white text-center">
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
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={() => handleSave('name')}
                  className="btn btn-primary"
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
                  onClick={() => handleSave('bio')}
                  className="btn btn-primary"
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-lg overflow-hidden">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-base-200 transition-colors">
                <input type="file" accept="image/*" className="hidden" />
                <div className="text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Add Image</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Videos</h2>
            <div className="space-y-4">
              {videos.map((videoId, idx) => (
                <div key={idx} className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter YouTube URL"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="input input-bordered flex-1"
                />
                <button
                  onClick={handleAddVideo}
                  className="btn btn-primary"
                >
                  <Youtube className="h-4 w-4 mr-2" />
                  Add Video
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Contact Information</h2>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  className="input input-bordered"
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <input
                  type="email"
                  value="john.athlete@example.com"
                  className="input input-bordered"
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
                    className="input input-bordered flex-1"
                  />
                  <button
                    onClick={() => handleSave('phone')}
                    className="btn btn-primary"
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
