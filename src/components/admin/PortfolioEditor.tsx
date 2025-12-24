import { useState, useRef } from 'react';
import { Save, Trash2, Upload, ExternalLink, Eye, EyeOff, GripVertical, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  PortfolioItem, 
  useUpdatePortfolioItem, 
  useDeletePortfolioItem,
  uploadPortfolioImage,
  deletePortfolioImage
} from '@/hooks/usePortfolioItems';

interface PortfolioEditorProps {
  item: PortfolioItem;
}

const PortfolioEditor = ({ item }: PortfolioEditorProps) => {
  const [formData, setFormData] = useState({
    title: item.title,
    category: item.category,
    description: item.description || '',
    image_url: item.image_url || '',
    link_url: item.link_url || '',
    sort_order: item.sort_order,
    is_visible: item.is_visible,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const updateMutation = useUpdatePortfolioItem();
  const deleteMutation = useDeletePortfolioItem();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: item.id,
        ...formData,
      });
      toast({
        title: 'Saved!',
        description: `${formData.title} updated successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) return;
    
    try {
      // Delete image from storage if it's a uploaded image
      if (item.image_url?.includes('portfolio')) {
        await deletePortfolioImage(item.image_url);
      }
      await deleteMutation.mutateAsync(item.id);
      toast({
        title: 'Deleted',
        description: `${item.title} has been removed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
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
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          {/* Thumbnail */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
            {formData.image_url ? (
              <img 
                src={formData.image_url} 
                alt={formData.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{formData.title}</h3>
              {!formData.is_visible && (
                <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  Hidden
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{formData.category}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? 'Collapse' : 'Edit'}
        </Button>
      </div>

      {/* Expanded Editor */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Portfolio Image</Label>
            <div className="mt-2 flex items-start gap-4">
              {/* Preview */}
              <div className="w-40 h-28 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                {formData.image_url ? (
                  <img 
                    src={formData.image_url} 
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
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

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`title-${item.id}`}>Title</Label>
              <Input
                id={`title-${item.id}`}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor={`category-${item.id}`}>Category</Label>
              <Input
                id={`category-${item.id}`}
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Landing Page, Company Profile"
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`desc-${item.id}`}>Description</Label>
            <Textarea
              id={`desc-${item.id}`}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              placeholder="Brief description of the project..."
            />
          </div>

          {/* Link URL with Preview */}
          <div>
            <Label htmlFor={`link-${item.id}`}>Project Link (optional)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                id={`link-${item.id}`}
                value={formData.link_url}
                onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                placeholder="https://example.com"
              />
              {formData.link_url && (
                <a 
                  href={formData.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button variant="outline" size="icon">
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
            {formData.link_url && (
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Link Preview:</p>
                <a 
                  href={formData.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {formData.link_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`sort-${item.id}`}>Sort Order</Label>
              <Input
                id={`sort-${item.id}`}
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label>Visibility</Label>
                <p className="text-xs text-muted-foreground">Show on website</p>
              </div>
              <Switch
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_visible: checked }))}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioEditor;