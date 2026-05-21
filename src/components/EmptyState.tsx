import type { ReactNode } from 'react';
import { Icon, type IconName } from './icons';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <Icon name={icon} size={54} className="empty-icon" />
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </div>
  );
}
