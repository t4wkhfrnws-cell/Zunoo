import { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Onboarding } from './components/Onboarding';
import { PremiumModal } from './components/PremiumModal';
import { SettingsPanel } from './components/SettingsPanel';
import { TabBar } from './components/TabBar';
import { ChatbotTab } from './tabs/ChatbotTab';
import { PharmacyTab } from './tabs/PharmacyTab';
import { ProvidersTab } from './tabs/ProvidersTab';
import { ResearchTab } from './tabs/ResearchTab';
import { TrialsTab } from './tabs/TrialsTab';

type ModalView = 'settings' | 'premium' | null;

export function App() {
  const { onboarded, activeTab } = useApp();
  const [modal, setModal] = useState<ModalView>(null);

  if (!onboarded) {
    return <Onboarding />;
  }

  const openPremium = () => setModal('premium');

  return (
    <div className="app">
      <Header
        onOpenSettings={() => setModal('settings')}
        onOpenPremium={openPremium}
      />
      <main className="app-main" id="main-content">
        {activeTab === 'chatbot' && <ChatbotTab onUpgrade={openPremium} />}
        {activeTab === 'providers' && <ProvidersTab onUpgrade={openPremium} />}
        {activeTab === 'pharmacy' && <PharmacyTab />}
        {activeTab === 'trials' && <TrialsTab onUpgrade={openPremium} />}
        {activeTab === 'research' && <ResearchTab />}
      </main>
      <TabBar />

      {modal === 'settings' && (
        <SettingsPanel
          onClose={() => setModal(null)}
          onOpenPremium={() => setModal('premium')}
        />
      )}
      {modal === 'premium' && <PremiumModal onClose={() => setModal(null)} />}
    </div>
  );
}
