'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type Locale, copy, t, storefrontPrefix } from '@/lib/i18n';
import Icon from './Icon';
import s from './Home.module.css';

const slideSources = [
  {
    src: '/images/hero.webp',
    alt: 'Elegant wine glass and glassware on a sunlit linen dining table' as const
  },
  {
    src: '/images/collection-glassware.jpg',
    alt: 'Coffee and drinks in a collection of clear glass cups' as const
  },
  {
    src: '/images/lifestyle-cafe.jpg',
    alt: 'Glassware for a café' as const
  }
];

export default function HomeHero({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(preference.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    preference.addEventListener('change', handleChange);
    return () => preference.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setActive(current => (current + 1) % slideSources.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const move = (direction: number) => {
    setActive(current => (current + direction + slideSources.length) % slideSources.length);
  };

  return <section
    className={s.hero}
    aria-label={t(locale, 'Discover JJGLASS')}
  >
    <div className={s.heroSlides}>
      {slideSources.map((slide, index) => <div
        className={`${s.heroSlide} ${index === active ? s.heroSlideActive : ''}`}
        aria-hidden={index !== active}
        key={slide.src}
      >
        <div className={s.heroSlideCanvas}>
          <Image
            src={slide.src}
            alt={index === active ? t(locale, slide.alt) : ''}
            fill
            priority={index === 0}
            loading={index === 0 ? undefined : 'eager'}
            sizes="(max-width: 800px) 169vw, 100vw"
            className={s.heroImage}
          />
        </div>
      </div>)}
    </div>
    <div className={s.heroShade} />
    <div className={s.heroContent}>
      <p className={s.eyebrow}>
        <span />
        {t(locale, 'THE ART OF EVERYDAY LIVING')}
      </p>
      <h1>
        {t(locale, 'More than glass.')}
        <br />
        <span>{t(locale, 'More beautiful moments.')}</span>
      </h1>
      <p className={s.heroDescription}>
        {t(locale, 'Thoughtfully selected glassware that brings design to life.')}
        <br />
        {t(locale, 'For every table, every space, every day.')}
      </p>
      <div className={s.heroButtons}>
        <Link href={`${storefrontPrefix(locale)}/products`} className={s.primary}>
          {c.explore}
          <Icon name="arrow" size={19} />
        </Link>
        <Link href={`${storefrontPrefix(locale)}/catalog`} className={s.heroSecondary}>
          <Icon name="book" size={19} />
          {c.catalog}
        </Link>
      </div>
    </div>
    <div className={s.heroControls}>
      <button type="button" className={`${s.heroControlButton} ${s.heroPrevious}`} onClick={() => move(-1)} aria-label={t(locale, 'Previous slide')}>
        <Icon name="chevron" size={18} />
      </button>
      <div className={s.heroDots}>
        {slideSources.map((slide, index) => <button
          type="button"
          className={`${s.heroDot} ${index === active ? s.heroDotActive : ''}`}
          onClick={() => setActive(index)}
          aria-label={`${t(locale, 'View slide')} ${index + 1}`}
          aria-current={index === active ? 'true' : undefined}
          key={slide.src}
        />)}
      </div>
      <button type="button" className={s.heroControlButton} onClick={() => move(1)} aria-label={t(locale, 'Next slide')}>
        <Icon name="chevron" size={18} />
      </button>
      <span className={s.srOnly}>
        {t(locale, 'Slide {current} of {total}', { current: active + 1, total: slideSources.length })}
      </span>
    </div>
  </section>;
}
