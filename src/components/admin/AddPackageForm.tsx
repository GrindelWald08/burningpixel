import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCreatePricingPackage } from '@/hooks/usePricingPackages';

interface AddPackageFormProps {
  onClose: () => void;
}

const AddPackageForm = ({ onClose }: AddPackageFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    period: '/project',
    description: '',
    features: [] as string[],
    is_popular: false,
    discount_percentage: 0,
    discount_label: '',
    sort_order: 10,
  });
  const [newFeature, setNewFeature] = useState('');

  const { toast } = useToast();
  const createMutation = useCreatePricingPackage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Package name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      toast({
        title: 'Created!',
        description: `${formData.name} package has been added`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create package',
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

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-primary rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Add New Package</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-name">Package Name *</Label>
          <Input
            id="new-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Professional"
            required
          />
        </div>
        <div>
          <Label htmlFor="new-price">Price (Rp)</Label>
          <Input
            id="new-price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="new-period">Period</Label>
          <Input
            id="new-period"
            value={formData.period}
            onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))}
            placeholder="/project"
          />
        </div>
        <div>
          <Label htmlFor="new-sort">Sort Order</Label>
          <Input
            id="new-sort"
            type="number"
            value={formData.sort_order}
            onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
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
          placeholder="Package description..."
        />
      </div>

      {/* Features */}
      <div>
        <Label>Features</Label>
        <div className="space-y-2 mt-2">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input value={feature} readOnly />
              <Button
                type="button"
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
              placeholder="Add feature..."
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button type="button" variant="outline" size="icon" onClick={addFeature} className="shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Toggle */}
      <div className="flex items-center justify-between">
        <Label>Mark as Popular</Label>
        <Switch
          checked={formData.is_popular}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popular: checked }))}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          {createMutation.isPending ? 'Creating...' : 'Create Package'}
        </Button>
      </div>
    </form>
  );
};

export default AddPackageForm;