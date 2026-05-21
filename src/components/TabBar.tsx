import { useApp } from '../context/AppContext';
import type { TabId } from '../types';
import { Icon, type IconName } from './icons';

const TABS: { id: TabId; label: string; icon: IconName }[] = [
  { id: 'chatbot', label: 'Assistant', icon: 'chat' },
  { id: 'providers', label: 'Providers', icon: 'providers' },
  { id: 'pharmacy', label: 'Pharmacy', icon: 'pill' },
  { id: 'trials', label: 'Trials', icon: 'flask' },
  { id: 'research', label: 'Resources', icon: 'book' },
];

export function TabBar() {
  const { activeTab, setActiveTab, savedTrials } = useApp();
  const watching = savedTrials.length;

  return (
    <nav className="tabbar" aria-label="Primary navigation">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`tab ${active ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-current={active ? 'page' : undefined}
          >
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
            {tab.id === 'trials' && watching > 0 && (
              <span className="tab-badge" aria-label={`${watching} watched trials`}>
                {watching}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
