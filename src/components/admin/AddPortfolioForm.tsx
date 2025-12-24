import { useState, useRef } from 'react';
import { Plus, X, Upload, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreatePortfolioItem, uploadPortfolioImage } from '@/hooks/usePortfolioItems';

interface AddPortfolioFormProps {
  onClose: () => void;
}

const AddPortfolioForm = ({ onClose }: AddPortfolioFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    image_url: '',
    link_url: '',
    sort_order: 10,
    is_visible: true,
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const createMutation = useCreatePortfolioItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category.trim()) {
      toast({
        title: 'Error',
        description: 'Title and category are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast({
        title: 'Created!',
        description: `${formData.title} has been added`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create portfolio item',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadPortfolioImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
      toast({
        title: 'Uploaded!',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-primary rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Add New Portfolio Item</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Image Upload */}
      <div>
        <Label>Portfolio Image</Label>
        <div className="mt-2 flex items-start gap-4">
          <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
            {formData.image_url ? (
              <img 
                src={formData.image_url} 
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            <p className="text-xs text-muted-foreground">Or enter image URL:</p>
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-title">Title *</Label>
          <Input
            id="new-title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Tech Startup Website"
            required
          />
        </div>
        <div>
          <Label htmlFor="new-category">Category *</Label>
          <Input
            id="new-category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Landing Page"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="new-desc">Description</Label>
        <Textarea
          id="new-desc"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={2}
          placeholder="Brief project description..."
        />
      </div>

      <div>
        <Label htmlFor="new-link">Project Link (optional)</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="new-link"
            value={formData.link_url}
            onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
            placeholder="https://example.com"
          />
          {formData.link_url && (
            <a href={formData.link_url} target="_blank" rel="noopener noreferrer">
              <Button type="button" variant="outline" size="icon">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-sort">Sort Order</Label>
          <Input
            id="new-sort"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label>Visible on website</Label>
          <Switch
            checked={formData.is_visible}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          {createMutation.isPending ? 'Creating...' : 'Add Portfolio'}
        </Button>
      </div>
    </form>
  );
};

export default AddPortfolioForm;