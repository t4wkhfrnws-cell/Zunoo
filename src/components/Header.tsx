import { useApp } from '../context/AppContext';
import { getConditionById } from '../data/conditions';
import { Icon } from './icons';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenPremium: () => void;
}

export function Header({ onOpenSettings, onOpenPremium }: HeaderProps) {
  const { focusConditionId, premium } = useApp();
  const condition = focusConditionId ? getConditionById(focusConditionId) : undefined;

  return (
    <header className="app-header">
      <div className="brand">
        <img src="/favicon.svg" alt="" className="brand-mark" width={32} height={32} />
        <span>
          Zuuno
          <br />
          <small>Medical Assistant</small>
        </span>
      </div>
      <div className="header-spacer" />
      {condition && (
        <span className="header-condition" title={`Personalized for ${condition.name}`}>
          <Icon name="sparkle" size={13} />
          {condition.name}
        </span>
      )}
      <button
        className="icon-btn"
        onClick={onOpenPremium}
        aria-label={premium ? 'Manage Zuuno Premium' : 'Upgrade to Zuuno Premium'}
        style={premium ? { color: '#c79100' } : undefined}
      >
        <Icon name="crown" />
      </button>
      <button className="icon-btn" onClick={onOpenSettings} aria-label="Settings">
        <Icon name="settings" />
      </button>
    </header>
  );
}
