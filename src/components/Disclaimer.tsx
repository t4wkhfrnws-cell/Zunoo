import { MEDICAL_DISCLAIMER } from '../types';
import { Icon } from './icons';

export function Disclaimer({ text }: { text?: string }) {
  return (
    <div className="disclaimer-bar" role="note">
      <Icon name="info" size={16} />
      <span>{text ?? MEDICAL_DISCLAIMER}</span>
    </div>
  );
}
