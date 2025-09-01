
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VenueFormSchema, VenueFormValues, AVAILABILITY_OPTIONS } from './VenueFormSchema';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { InputField, SelectField, TextareaField } from '@/components/Common/FormFields';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { X, Upload, ImageIcon, Trash, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface VenueFormProps {
  onSubmit: (values: VenueFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  defaultValues?: Partial<VenueFormValues>;
}

const VenueForm: React.FC<VenueFormProps> = ({
  onSubmit,
  isSubmitting,
  onCancel,
  defaultValues = {
    name: '',
    capacity: 1,
    square_footage: 1,
    total_amount: 0,
    deposit_amount: 0,
    full_day_amount: 0,
    half_day_amount: 0,
    description: '',
    location: '',
    availability: 'available',
    images: [],
    features: [],
  },
}) => {
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(VenueFormSchema),
    defaultValues: defaultValues as VenueFormValues,
  });
  
  const [imageUrls, setImageUrls] = useState<string[]>(defaultValues.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      const updatedImages = [...imageUrls, newImageUrl];
      setImageUrls(updatedImages);
      form.setValue('images', updatedImages);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedImages);
    form.setValue('images', updatedImages);
  };

  const handleLocalFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result.toString();
          setImageUrls(prev => {
            const updated = [...prev, dataUrl];
            form.setValue('images', updated);
            return updated;
          });
        }
      };

      reader.readAsDataURL(file);
    }
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Form {...form}>
      <div className="flex justify-between items-center mb-4">
        <DialogClose className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center">
          <X className="h-4 w-4" />
        </DialogClose>
      </div>
      <ScrollArea className="h-[70vh] pr-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <InputField
            form={form}
            name="name"
            label="Venue Name"
            placeholder="Enter venue name"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <InputField
              form={form}
              name="capacity"
              label="Capacity"
              type="number"
              placeholder="Enter capacity"
            />
            
            <InputField
              form={form}
              name="square_footage"
              label="Square Footage"
              type="number"
              placeholder="Enter square footage"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <InputField
              form={form}
              name="total_amount"
              label="Total Amount"
              type="number"
              placeholder="Enter total amount"
            />
            
            <InputField
              form={form}
              name="deposit_amount"
              label="Deposit Amount"
              type="number"
              placeholder="Enter deposit amount"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <InputField
              form={form}
              name="full_day_amount"
              label="Full Day Amount"
              type="number"
              placeholder="Enter full day amount"
            />
            
            <InputField
              form={form}
              name="half_day_amount"
              label="Half Day Amount"
              type="number"
              placeholder="Enter half day amount"
            />
          </div>
          
          <InputField
            form={form}
            name="location"
            label="Location"
            placeholder="Enter venue location"
          />
          
          <TextareaField
            form={form}
            name="description"
            label="Description (Optional)"
            placeholder="Enter venue description"
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Venue Images</label>
            <div className="flex flex-col space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-1 rounded-md border border-input px-3 py-2 text-sm"
                  placeholder="Enter image URL"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleAddImage}
                  className="flex items-center gap-1"
                >
                  <Upload size={16} />
                  Add
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Upload Local Images
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleLocalFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {imageUrls.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {imageUrls.map((url, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <img 
                        src={url} 
                        alt={`Venue image ${index+1}`} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150?text=Image%20Error';
                        }}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="border rounded-md p-8 text-center text-muted-foreground">
                <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                <p>No images added yet</p>
              </div>
            )}
          </div>
          
          <SelectField
            form={form}
            name="availability"
            label="Availability"
            options={AVAILABILITY_OPTIONS}
          />
        </form>
      </ScrollArea>
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
          {isSubmitting ? 'Saving...' : 'Save Venue'}
        </Button>
      </DialogFooter>
    </Form>
  );
};

export default VenueForm;
