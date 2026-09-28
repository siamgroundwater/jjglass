import type { Locale } from '@/lib/i18n';
import { socialChannels, socialSectionCopy, type SocialPlatform } from '@/lib/social';
import SocialEmbed from './SocialEmbed';
import styles from './SocialMediaSection.module.css';

function PlatformIcon({ platform }: { platform: SocialPlatform }) {
  return <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    {platform === 'facebook' && <path fill="currentColor" d="M13.6 22v-9.1h3.1l.5-3.6h-3.6V7c0-1 .3-1.7 1.8-1.7h1.9V2.1c-.9-.1-1.8-.2-2.8-.2-2.8 0-4.7 1.7-4.7 4.8v2.6H6.7v3.6h3.1V22h3.8Z" />}
    {platform === 'tiktok' && <path fill="currentColor" d="M16.4 2h-3.5v13.4a2.8 2.8 0 1 1-2.4-2.8V9.1a6.3 6.3 0 1 0 5.9 6.3V8.6a8.2 8.2 0 0 0 4.7 1.5V6.7A4.8 4.8 0 0 1 16.4 2Z" />}
    {platform === 'instagram' && <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.7" r=".9" fill="currentColor" stroke="none" />
    </g>}
    {platform === 'shopee' && <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16l-1 14H5L4 7Zm4 0V6a4 4 0 0 1 8 0v1" />
      <path d="M14.3 11c-2.8-1.6-5.4.4-3.8 2 .8.8 3.9.8 3.9 2.5 0 1.9-2.9 2.5-5 1.1" />
    </g>}
  </svg>;
}

export default function SocialMediaSection({ locale }: { locale: Locale }) {
  const shop = socialChannels.find(channel => channel.id === 'shopee')!;
  return <section className={styles.section} aria-labelledby="social-heading" id="social">
    <div className={styles.inner}>
      <div className={styles.heading}>
        <p className={styles.eyebrow}>{socialSectionCopy.eyebrow[locale]}</p>
        <h2 id="social-heading">{socialSectionCopy.title[locale]}</h2>
        <p className={styles.intro}>{socialSectionCopy.description[locale]}</p>
      </div>
      <div className={styles.grid}>
        {socialChannels.filter(channel => channel.id !== 'shopee').map(channel => <article className={styles.card} key={channel.id}>
          <div className={styles.cardHeader}>
            <span className={`${styles.platformIcon} ${styles[channel.id]}`}><PlatformIcon platform={channel.id} /></span>
            <div><h3>{channel.name}</h3><p className={styles.handle}>{channel.handle}</p></div>
          </div>
          <p className={styles.description}>{channel.description[locale]}</p>
          <SocialEmbed platform={channel.id as Exclude<SocialPlatform, 'shopee'>} url={channel.url} locale={locale} />
          <div className={styles.actions}>
            <a href={channel.url} target="_blank" rel="noopener noreferrer" className={styles.button}>
              {channel.action[locale]}
              <span className={styles.srOnly}> — {socialSectionCopy.newTab[locale]}</span>
            </a>
          </div>
        </article>)}
      </div>
      <p className={styles.hint}>{socialSectionCopy.previewHint[locale]}</p>
      <div className={styles.shop}>
        <span className={`${styles.platformIcon} ${styles.shopee}`}><PlatformIcon platform="shopee" /></span>
        <div><h3>{socialSectionCopy.shopTitle[locale]}</h3><p>{shop.description[locale]}</p></div>
        <a href={shop.url} target="_blank" rel="noopener noreferrer" className={styles.button}>{shop.action[locale]}<span className={styles.srOnly}> — {socialSectionCopy.newTab[locale]}</span></a>
      </div>
    </div>
  </section>;
}
