import { useState } from 'react';
import { Save, Trash2, Plus, X, GripVertical, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PricingPackage, useUpdatePricingPackage, useDeletePricingPackage } from '@/hooks/usePricingPackages';

interface PricingEditorProps {
  pkg: PricingPackage;
}

const PricingEditor = ({ pkg }: PricingEditorProps) => {
  const [formData, setFormData] = useState({
    name: pkg.name,
    price: pkg.price,
    period: pkg.period,
    description: pkg.description || '',
    features: pkg.features,
    is_popular: pkg.is_popular,
    discount_percentage: pkg.discount_percentage || 0,
    discount_label: pkg.discount_label || '',
    sort_order: pkg.sort_order,
  });
  const [newFeature, setNewFeature] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const { toast } = useToast();
  const updateMutation = useUpdatePricingPackage();
  const deleteMutation = useDeletePricingPackage();

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: pkg.id,
        ...formData,
      });
      toast({
        title: 'Saved!',
        description: `${formData.name} package updated successfully`,
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
    if (!confirm(`Are you sure you want to delete "${pkg.name}"?`)) return;
    
    try {
      await deleteMutation.mutateAsync(pkg.id);
      toast({
        title: 'Deleted',
        description: `${pkg.name} package has been removed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete package',
        variant: 'destructive',
      });
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const discountedPrice = formData.discount_percentage > 0
    ? formData.price * (1 - formData.discount_percentage / 100)
    : formData.price;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{formData.name}</h3>
              {formData.is_popular && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">Popular</span>
              )}
              {formData.discount_percentage > 0 && (
                <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  {formData.discount_percentage}% off
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Rp {formatPrice(discountedPrice)}
              {formData.discount_percentage > 0 && (
                <span className="line-through ml-2 text-xs">Rp {formatPrice(formData.price)}</span>
              )}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? 'Collapse' : 'Edit'}
        </Button>
      </div>

      {/* Expanded Editor */}
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`name-${pkg.id}`}>Package Name</Label>
              <Input
                id={`name-${pkg.id}`}
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor={`price-${pkg.id}`}>Price (Rp)</Label>
              <Input
                id={`price-${pkg.id}`}
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`period-${pkg.id}`}>Period</Label>
              <Input
                id={`period-${pkg.id}`}
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
                placeholder="/project, /month, etc."
              />
            </div>
            <div>
              <Label htmlFor={`sort-${pkg.id}`}>Sort Order</Label>
              <Input
                id={`sort-${pkg.id}`}
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor={`desc-${pkg.id}`}>Description</Label>
            <Textarea
              id={`desc-${pkg.id}`}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Discount Settings */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Discount Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`discount-${pkg.id}`}>Discount Percentage</Label>
                <Input
                  id={`discount-${pkg.id}`}
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_percentage: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor={`discount-label-${pkg.id}`}>Discount Label</Label>
                <Input
                  id={`discount-label-${pkg.id}`}
                  value={formData.discount_label}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_label: e.target.value }))}
                  placeholder="e.g., Holiday Sale!"
                />
              </div>
            </div>
            {formData.discount_percentage > 0 && (
              <p className="text-sm text-muted-foreground">
                Final price: <span className="text-primary font-semibold">Rp {formatPrice(discountedPrice)}</span>
              </p>
            )}
          </div>

          {/* Features */}
          <div>
            <Label>Features</Label>
            <div className="space-y-2 mt-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features];
                      newFeatures[index] = e.target.value;
                      setFormData(prev => ({ ...prev, features: newFeatures }));
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                    className="shrink-0 text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add new feature..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button variant="outline" size="icon" onClick={addFeature} className="shrink-0">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Popular Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Mark as Popular</Label>
              <p className="text-xs text-muted-foreground">Highlight this package as "Best Seller"</p>
            </div>
            <Switch
              checked={formData.is_popular}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
            />
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

export default PricingEditor;