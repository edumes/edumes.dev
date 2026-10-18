'use client';

import { useState } from 'react';
import { play } from 'cuelume';
import { useTranslations } from 'next-intl';
import { profile } from '@/content/site';
import { Icon } from './icon';

export function CopyEmail({ className }: { className: string }) {
  const t = useTranslations('ui');
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      aria-live="polite"
      onClick={async () => {
        await navigator.clipboard.writeText(profile.email);
        play('success', { emphasis: 'subtle' });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Icon key="check" name="check" size={16} play /> : <Icon key="copy" name="copy" size={16} />}
      {copied ? t('copied') : t('copyEmail')}
    </button>
  );
}
