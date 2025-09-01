
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export const uploadFile = async (
  file: File,
  bucket: string,
  folder: string = '',
  existingFileUrl?: string | null
) => {
  try {
    // If there's an existing file, delete it first
    if (existingFileUrl) {
      const previousFilePath = existingFileUrl.split('/').pop();
      if (previousFilePath) {
        const folderPath = folder ? `${folder}/` : '';
        await supabase.storage.from(bucket).remove([`${folderPath}${previousFilePath}`]);
      }
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const folderPath = folder ? `${folder}/` : '';
    const filePath = `${folderPath}${fileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error: any) {
    toast({
      title: 'Upload Error',
      description: error.message || 'Failed to upload file',
      variant: 'destructive',
    });
    return null;
  }
};

export const deleteFile = async (fileUrl: string, bucket: string) => {
  try {
    const filePath = fileUrl.split('/').pop();
    if (!filePath) throw new Error('Invalid file URL');

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;

    return true;
  } catch (error: any) {
    toast({
      title: 'Deletion Error',
      description: error.message || 'Failed to delete file',
      variant: 'destructive',
    });
    return false;
  }
};
