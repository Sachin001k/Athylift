import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { ATTACHMENT_BUCKET, removeStoredFile, userFilePath } from '@/lib/storage';
import { REQUEST_CATEGORIES, REQUEST_COLUMNS, RequestCategory, RequestStatus, SupportRequest } from '@/lib/athylift';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_TARGET = 10000000;

// Used for both /requests/new and /requests/:id/edit.
const RequestForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState<SupportRequest | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RequestCategory>('equipment');
  const [target, setTarget] = useState('');
  const [description, setDescription] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [deadline, setDeadline] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data, error } = await supabase.from('support_requests').select(REQUEST_COLUMNS).eq('id', id).maybeSingle();
      const row = data as SupportRequest | null;
      if (error || !row) {
        toast({ title: 'Request not found', variant: 'destructive' });
      } else {
        setExisting(row);
        setTitle(row.title);
        setCategory(row.category);
        setTarget(String(row.target_amount));
        setDescription(row.description);
        setIntendedUse(row.intended_use);
        setDeadline(row.deadline ?? '');
        setImagePreview(row.image_url);
      }
      setLoading(false);
    };
    load();
  }, [id, toast]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || /hei[cf]$/i.test(file.type) || file.size > MAX_IMAGE_BYTES) {
      toast({ title: 'Invalid image', description: 'Choose a JPG, PNG or WebP image up to 5 MB.', variant: 'destructive' });
      return;
    }
    setImageFile(file);
    setRemoveImage(false);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const save = async (status: RequestStatus) => {
    if (!user) return;
    const targetAmount = Math.round(parseFloat(target) * 100) / 100;
    if (title.trim().length < 3 || !description.trim() || !intendedUse.trim()) {
      toast({ title: 'Fill in the required fields', description: 'Title, description and how the support will be used.', variant: 'destructive' });
      return;
    }
    if (Number.isNaN(targetAmount) || targetAmount <= 0 || targetAmount > MAX_TARGET) {
      toast({ title: 'Enter a target amount', description: `Between ₹1 and ₹${MAX_TARGET.toLocaleString('en-IN')}.`, variant: 'destructive' });
      return;
    }

    setSaving(true);
    let imageUrl = removeImage ? null : existing?.image_url ?? null;
    let imagePath = removeImage ? null : existing?.image_path ?? null;
    if (imageFile) {
      const path = userFilePath(user.id, imageFile.name);
      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENT_BUCKET)
        .upload(path, imageFile, { contentType: imageFile.type });
      if (uploadError) {
        setSaving(false);
        toast({ title: 'Image upload failed', description: uploadError.message, variant: 'destructive' });
        return;
      }
      imageUrl = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path).data.publicUrl;
      imagePath = path;
    }

    const fields = {
      title: title.trim(),
      category,
      target_amount: targetAmount,
      currency: 'INR',
      description: description.trim(),
      intended_use: intendedUse.trim(),
      deadline: deadline || null,
      image_url: imageUrl,
      image_path: imagePath,
      status,
    };

    const { data, error } = existing
      ? await supabase.from('support_requests').update(fields).eq('id', existing.id).select('id').single()
      : await supabase.from('support_requests').insert({ ...fields, athlete_id: user.id }).select('id').single();
    setSaving(false);

    if (error || !data) {
      if (imageFile && imagePath) removeStoredFile(ATTACHMENT_BUCKET, imagePath);
      toast({ title: 'Could not save request', description: error?.message, variant: 'destructive' });
      return;
    }
    if (existing?.image_path && existing.image_path !== imagePath) removeStoredFile(ATTACHMENT_BUCKET, existing.image_path);
    toast({ title: status === 'draft' ? 'Draft saved' : existing ? 'Request updated' : 'Request published' });
    navigate(`/requests/${data.id}`);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Editing keeps the current status (active/funded/closed); a new request or a draft is published.
    save(existing && existing.status !== 'draft' ? existing.status : 'active');
  };

  if (loading) {
    return (
      <Layout showStats={false}>
        <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary" /></div>
      </Layout>
    );
  }

  if (isEdit && (!existing || existing.athlete_id !== user?.id)) {
    return (
      <Layout showStats={false}>
        <div className="container mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="text-2xl font-semibold">You can only edit your own requests</h1>
          <Link to="/dashboard" className="btn btn-primary text-white">Go to dashboard</Link>
        </div>
      </Layout>
    );
  }

  const isDraftOrNew = !existing || existing.status === 'draft';

  return (
    <Layout showStats={false}>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-1">{existing ? 'Edit support request' : 'Post a support request'}</h1>
        <p className="text-base-content/70 mb-6">Describe what you need, the amount, and exactly how the support will help you.</p>

        <form onSubmit={onSubmit} className="card bg-base-100 shadow-xl">
          <div className="card-body space-y-4">
            <label className="form-control">
              <span className="label-text mb-1">Title</span>
              <input className="input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required placeholder="e.g. Spikes and training kit for state championships" />
              <span className="label-text-alt mt-1 text-right">{title.length}/80</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="form-control">
                <span className="label-text mb-1">Category</span>
                <select className="select select-bordered" value={category} onChange={(e) => setCategory(e.target.value as RequestCategory)}>
                  {REQUEST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </label>
              <label className="form-control">
                <span className="label-text mb-1">Target amount (INR)</span>
                <input type="number" min={1} max={MAX_TARGET} step="1" className="input input-bordered" value={target} onChange={(e) => setTarget(e.target.value)} required />
              </label>
            </div>

            <label className="form-control">
              <span className="label-text mb-1">Description</span>
              <textarea className="textarea textarea-bordered min-h-28" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} required placeholder="Your situation, what you're training for, and why this matters now" />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">How will the support be used?</span>
              <textarea className="textarea textarea-bordered min-h-24" value={intendedUse} onChange={(e) => setIntendedUse(e.target.value)} maxLength={2000} required placeholder="e.g. ₹6,000 for spikes, ₹4,000 for three months of coaching fees" />
            </label>

            <label className="form-control sm:w-1/2">
              <span className="label-text mb-1">Needed by (optional)</span>
              <input type="date" className="input input-bordered" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
            </label>

            <div>
              <span className="label-text block mb-2">Photo (optional)</span>
              {imagePreview ? (
                <div className="relative w-full max-w-sm">
                  <img src={imagePreview} alt="" className="rounded-lg w-full aspect-video object-cover" />
                  <button type="button" onClick={clearImage} className="btn btn-circle btn-sm absolute top-2 right-2" aria-label="Remove photo">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 border-2 border-dashed border-base-300 rounded-lg p-4 cursor-pointer hover:border-primary max-w-sm">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  <span className="text-sm">Add a photo (JPG/PNG, up to 5 MB)</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
                </label>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="btn btn-primary text-white flex-1" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : isDraftOrNew ? 'Publish request' : 'Save changes'}
              </button>
              {isDraftOrNew && (
                <button type="button" className="btn btn-outline flex-1" disabled={saving} onClick={() => save('draft')}>
                  Save as draft
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default RequestForm;
