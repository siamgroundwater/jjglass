'use client';

import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/lib/i18n';
import { socialSectionCopy, type SocialPlatform } from '@/lib/social';
import styles from './SocialEmbed.module.css';

type EmbedPlatform = Exclude<SocialPlatform, 'shopee'>;
type EmbedProps = { platform: EmbedPlatform; url: string; locale: Locale };

function EmbedWindow({ platform, url, locale, width }: EmbedProps & { width: number }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'slow'>('loading');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setStatus(current => current === 'loaded' ? current : 'slow');
    }, 15000);
    return () => window.clearTimeout(timeout);
  }, []);

  const facebookSrc = 'https://www.facebook.com/plugins/page.php?' + new URLSearchParams({
    href: url, tabs: 'timeline', width: String(width), height: '560',
    small_header: 'false', adapt_container_width: 'true', hide_cover: 'false', show_facepile: 'false',
    locale: locale === 'th' ? 'th_TH' : 'en_US',
  });
  const src = platform === 'facebook' ? facebookSrc : url + 'embed/';
  const name = platform === 'facebook' ? 'Facebook' : 'Instagram';

  return <div className={styles.window}>
    <iframe
      src={src}
      title={'JJGLASS ' + name}
      width={platform === 'facebook' ? width : '100%'}
      height="560"
      className={styles.frame}
      onLoad={() => setStatus('loaded')}
      onError={() => setStatus('slow')}
      allow="encrypted-media; picture-in-picture; web-share"
      allowFullScreen
    />
    {status !== 'loaded' && <p className={styles.loadNotice} role="status">
      {socialSectionCopy[status === 'loading' ? 'loading' : 'unavailable'][locale]}
    </p>}
  </div>;
}

function TikTokWindow({ url, locale }: Pick<EmbedProps, 'url' | 'locale'>) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (failed) return;
    const element = windowRef.current;
    if (!element) return;

    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    const markFailed = () => setFailed(true);
    script.addEventListener('error', markFailed, { once: true });
    script.addEventListener('load', () => script.remove(), { once: true });
    document.body.appendChild(script);

    let detectionEnabled = false;
    const inspectEmbed = () => {
      if (!detectionEnabled) return;
      const processed = element.querySelector('blockquote[data-embed-type="creator"][id]');
      if (!processed || element.getBoundingClientRect().height < 320) markFailed();
    };
    const resizeObserver = new ResizeObserver(inspectEmbed);
    resizeObserver.observe(element);
    const initializationTimer = window.setTimeout(() => {
      detectionEnabled = true;
      inspectEmbed();
    }, 6000);

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(initializationTimer);
      script.removeEventListener('error', markFailed);
      script.remove();
    };
  }, [failed, attempt]);

  return <div ref={windowRef} className={`${styles.window} ${styles.tiktokWindow}`}>
    {failed ? <div className={styles.tiktokFallback} role="status">
      <svg className={styles.tiktokIcon} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M16.4 2h-3.5v13.4a2.8 2.8 0 1 1-2.4-2.8V9.1a6.3 6.3 0 1 0 5.9 6.3V8.6a8.2 8.2 0 0 0 4.7 1.5V6.7A4.8 4.8 0 0 1 16.4 2Z" />
      </svg>
      <strong>@jjglass_thailand</strong>
      <p>{socialSectionCopy.tiktokUnavailable[locale]}</p>
      <button type="button" className={styles.retry} onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M20 6v5h-5M4 18v-5h5M5.7 9a7 7 0 0 1 12-2L20 11M4 13l2.3 4a7 7 0 0 0 12-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {socialSectionCopy.retry[locale]}
      </button>
    </div> : <blockquote
      cite={url}
      className={`tiktok-embed ${styles.tiktokEmbed}`}
      data-embed-from="oembed"
      data-embed-type="creator"
      data-unique-id="jjglass_thailand"
    >
      <section><a href={`${url}?refer=creator_embed`} target="_blank" rel="noopener noreferrer">@jjglass_thailand</a></section>
    </blockquote>}
  </div>;
}

export default function SocialEmbed(props: EmbedProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(340);

  useEffect(() => {
    const root = rootRef.current!;
    const measure = () => setWidth(Math.max(180, Math.min(500, Math.floor(root.clientWidth))));
    let resizeTimer: number;
    measure();
    const resize = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(measure, 150);
    });
    resize.observe(root);
    if (typeof IntersectionObserver === 'undefined') setActive(true);
    const intersection = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      setActive(true);
      intersection?.disconnect();
    }, { rootMargin: '300px 0px' });
    intersection?.observe(root);
    return () => { resize.disconnect(); intersection?.disconnect(); window.clearTimeout(resizeTimer); };
  }, []);

  return <div className={styles.root} ref={rootRef}>
    {active ? props.platform === 'tiktok'
      ? <TikTokWindow key={props.locale} url={props.url} locale={props.locale} />
      : <EmbedWindow key={`${props.platform}-${props.locale}-${props.platform === 'facebook' ? width : ''}`} {...props} width={width} />
      : <div className={styles.window}>
        <div className={styles.placeholder}><span className={styles.placeholderMark} aria-hidden="true">JJGLASS</span><p>{socialSectionCopy.loading[props.locale]}</p></div>
      </div>}
  </div>;
}
