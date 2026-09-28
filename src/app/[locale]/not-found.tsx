'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { copy, isLocale, t, languageConfig, storefrontPrefix } from '@/lib/i18n';
import s from './not-found.module.css';
export default function NotFound() {
  const params = useParams();
  const locale = typeof params.locale === 'string' && isLocale(params.locale) ? params.locale : languageConfig.default;
  return <section className={s.page}>
    <p>404 / JJGLASS</p>
    <h1>{copy[locale].notFound}</h1>
    <p>{t(locale, "Let’s help you find something beautiful instead.")}</p>
    <Link href={storefrontPrefix(locale) || '/'}>{copy[locale].homeLink} →</Link>
  </section>;
}
