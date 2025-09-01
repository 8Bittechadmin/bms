
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  backButton?: boolean;
  className?: string;
  hideBackButton?: boolean; // Option to explicitly hide back button
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  backButton = false,
  className,
  hideBackButton = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Show back button by default unless on dashboard or explicitly hidden
  const shouldShowBackButton = !hideBackButton && (backButton || location.pathname !== '/dashboard');
  
  return (
    <div className={cn("flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4", className)}>
      <div className="flex items-center">
        {shouldShowBackButton && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      
      {action && (
        <Button onClick={action.onClick}>
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default PageHeader;
