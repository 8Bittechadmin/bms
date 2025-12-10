/**
 * Get the count of permissions from role data
 * Handles both object and string formats
 */
export const getPermissionCount = (permissions: any): number => {
  if (!permissions) return 0;
  
  try {
    if (typeof permissions === 'string') {
      const parsed = JSON.parse(permissions);
      return Object.keys(parsed).length;
    } else if (typeof permissions === 'object') {
      return Object.keys(permissions).length;
    }
  } catch {
    return 0;
  }
  return 0;
};

/**
 * Get accessible pages array from role data
 * Handles array and comma-separated string formats
 */
export const getAccessiblePages = (pages: any): string[] => {
  if (!pages) return [];
  
  try {
    if (Array.isArray(pages)) {
      return pages;
    } else if (typeof pages === 'string') {
      return pages.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } catch {
    return [];
  }
  return [];
};

/**
 * Get the count of accessible pages
 */
export const getAccessiblePagesCount = (pages: any): number => {
  return getAccessiblePages(pages).length;
};
