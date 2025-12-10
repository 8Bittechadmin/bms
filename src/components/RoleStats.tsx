import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getPermissionCount, getAccessiblePagesCount } from '@/utils/roleHelpers';

interface RoleStatsProps {
  permissions?: any;
  accessible_pages?: any;
}

export const RoleStats: React.FC<RoleStatsProps> = ({ permissions, accessible_pages }) => {
  return (
    <>
      <Badge variant="outline">
        {getPermissionCount(permissions)} permissions
      </Badge>
      <Badge variant="outline">
        {getAccessiblePagesCount(accessible_pages)} pages
      </Badge>
    </>
  );
};
