import { useApp } from '../context/AppContext';
import { Modal } from './Modal';
import { Icon } from './icons';

const PERKS: { title: string; desc: string }[] = [
  {
    title: 'In-depth clinical answers',
    desc: 'Unlock the Physical Findings section and the interactive pathophysiology diagram.',
  },
  {
    title: 'PDF & shareable reports',
    desc: 'Download clinician-style condition reports for your records or your care team.',
  },
  {
    title: 'Clinical trial alerts',
    desc: 'Get notified when a watched trial changes recruitment status.',
  },
  {
    title: 'Advanced map filters',
    desc: 'Filter providers and pharmacies by insurance, language, telehealth, and more.',
  },
];

export function PremiumModal({ onClose }: { onClose: () => void }) {
  const { premium, setPremium } = useApp();

  if (premium) {
    return (
      <Modal
        title="Zuuno Premium"
        onClose={onClose}
        footer={
          <>
            <button className="btn btn-secondary btn-block" onClick={() => setPremium(false)}>
              Cancel subscription
            </button>
            <button className="btn btn-primary btn-block" onClick={onClose}>
              Done
            </button>
          </>
        }
      >
        <div className="premium-hero">
          <span className="premium-badge">
            <Icon name="crown" size={13} /> Premium active
          </span>
          <h2 style={{ marginTop: 12, fontSize: '1.3rem' }}>You have full access</h2>
          <p className="muted" style={{ fontSize: '0.86rem', marginTop: 4 }}>
            Every Zuuno feature is unlocked. Thank you for supporting clinician-grade care.
          </p>
        </div>
        <div className="perk-list">
          {PERKS.map((p) => (
            <div className="perk" key={p.title}>
              <Icon name="check" size={20} />
              <div>
                <b>{p.title}</b>
                <div className="muted" style={{ fontSize: '0.8rem' }}>
                  {p.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="Zuuno Premium"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary btn-block" onClick={onClose}>
            Maybe later
          </button>
          <button className="btn btn-primary btn-block" onClick={() => setPremium(true)}>
            <Icon name="crown" size={16} /> Start Premium
          </button>
        </>
      }
    >
      <div className="premium-hero">
        <span className="premium-badge">
          <Icon name="sparkle" size={13} /> Unlock everything
        </span>
        <div className="price-tag">
          $6.99 <span>/ month</span>
        </div>
        <p className="muted" style={{ fontSize: '0.84rem' }}>
          Manage or cancel anytime in Settings. The free tier — chatbot basics, maps, trials,
          and resources — always stays available.
        </p>
      </div>
      <div className="perk-list">
        {PERKS.map((p) => (
          <div className="perk" key={p.title}>
            <Icon name="check" size={20} />
            <div>
              <b>{p.title}</b>
              <div className="muted" style={{ fontSize: '0.8rem' }}>
                {p.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
