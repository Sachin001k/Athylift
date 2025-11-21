import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AddPost = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleSave = async () => {
    if (!title || !content) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Post created!',
      description: 'Your post has been shared with the community',
    });

    setLoading(false);
    setTitle('');
    setContent('');
    setImagePreview(null);
  };

  const handleDiscard = () => {
    setTitle('');
    setContent('');
    setImagePreview(null);
    toast({
      title: 'Discarded',
      description: 'Your changes have been discarded',
    });
  };

  return (
    <Layout showStats={false}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Create New Post</h1>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-6">
            {/* Title Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Title</span>
              </label>
              <input
                type="text"
                placeholder="Give your post a catchy title"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Image</span>
              </label>
              
              {!imagePreview ? (
                <label className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-base-200 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full rounded-lg aspect-video object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="btn btn-circle btn-sm absolute top-2 right-2 bg-error text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Content</span>
              </label>
              <textarea
                className="textarea textarea-bordered h-32"
                placeholder="Share your story, achievement, or thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="card-actions justify-end gap-2">
              <button
                onClick={handleDiscard}
                className="btn btn-ghost"
                disabled={loading}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary"
                disabled={loading || !title || !content}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Save Post'
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
