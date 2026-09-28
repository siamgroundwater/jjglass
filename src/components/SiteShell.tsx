'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cmsPath, copy, Locale, t, languageConfig, nextLocale, localizedPath, storefrontPrefix } from '@/lib/i18n';
import { useShop } from './ShopProvider';
import Icon from './Icon';
import s from './SiteShell.module.css';
export default function SiteShell({
  locale,
  children
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const c = copy[locale],
    path = usePathname(),
    shop = useShop();
  const [menu, setMenu] = useState(false),
    [search, setSearch] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchTrigger = useRef<HTMLButtonElement>(null);
  const nav = [['', c.home], ['products', c.products], ['brands', c.brands], ['inspiration', c.inspiration], ['catalog', c.catalog], ['stores', c.stores]];
  useEffect(() => {
    setMenu(false);
    setSearch(false);
    if (!window.location.hash) window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [path]);
  useEffect(() => {
    if (search) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [search]);
  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    if (!menu) return;
    const media = window.matchMedia('(min-width: 1001px)');
    const closeOnDesktop = () => {
      if (media.matches) setMenu(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false);
        document.querySelector<HTMLButtonElement>('[aria-controls="mobile-menu"]')?.focus();
      }
    };
    media.addEventListener('change', closeOnDesktop);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      media.removeEventListener('change', closeOnDesktop);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menu]);
  const switchLanguage = () => {
    const target = nextLocale(locale);
    window.location.assign(localizedPath(path, target) + window.location.search + window.location.hash);
  };
  return <>
    <a href="#main" className={s.skip}>{t(locale, "Skip to content")}</a>
    <header className={s.header}>
      <div className={s.headerInner}>
        <Link href={storefrontPrefix(locale) || '/'} aria-label="JJGLASS" className={s.logo}>
          <img src="/images/logo.png" alt="JJGLASS" width="500" height="151" />
        </Link>
        <nav className={s.nav} aria-label={c.menu}>{nav.map(([href, label]) => <Link key={href} href={localizedPath(href ? `/${href}` : '/', locale)} aria-current={path === localizedPath(href ? `/${href}` : '/', locale) ? 'page' : undefined}>{label}</Link>)}</nav>
        <div className={s.actions}>
          <button className={s.language} onClick={switchLanguage} aria-label={languageConfig.switchLabels[nextLocale(locale)]}>
            {languageConfig.shortLabels[locale]}
          </button>
          <button ref={searchTrigger} onClick={() => setSearch(true)} aria-label={c.search}>
            <Icon name="search" />
          </button>
          <Link className={s.saved} href={`${storefrontPrefix(locale)}/wishlist`} aria-label={c.saved}>
            <Icon name="heart" />
            {shop.saved.length > 0 && <span className={s.badge}>{shop.saved.length}</span>}
          </Link>
          <Link href={`${storefrontPrefix(locale)}/cart`} aria-label={`${c.cart} (${shop.count})`}>
            <Icon name="bag" />
            <span className={s.badge}>{shop.count}</span>
          </Link>
          <button className={s.menuButton} onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="mobile-menu" aria-label={menu ? c.close : c.menu}>
            <Icon name={menu ? 'close' : 'menu'} />
          </button>
        </div>
      </div>
    </header>
    {menu && <div className={s.mobileMenu} id="mobile-menu">
      <nav>
        {nav.map(([href, label]) => <Link key={href} href={localizedPath(href ? `/${href}` : '/', locale)} onClick={() => setMenu(false)}>
          {label}
          <Icon name="arrow" />
        </Link>)}
        <Link href={`${storefrontPrefix(locale)}/about`}>
          {c.about}
          <Icon name="arrow" />
        </Link>
        <Link href={`${storefrontPrefix(locale)}/contact`}>
          {c.contact}
          <Icon name="arrow" />
        </Link>
        <Link href={`${storefrontPrefix(locale)}/wishlist`}>
          {c.saved}
          <Icon name="heart" />
        </Link>
      </nav>
      <p>
        {t(locale, "MORE THAN GLASS.")}
        <br />
        {t(locale, "A BRIGHTER EVERYDAY.")}
      </p>
    </div>}
    <main id="main" inert={menu}>{children}</main>
    <footer className={s.footer} inert={menu}>
      <div className={s.footerTop}>
        <div className={s.footerBrand}>
          <img src="/images/logo.png" width="500" height="151" alt="JJGLASS" />
          <h2>{t(locale, "Beautiful things. Everyday moments.")}</h2>
          <p>{t(locale, "Discover glassware for your everyday, your home, and your business.")}</p>
        </div>
        <div>
          <h3>{t(locale, "Discover JJGLASS")}</h3>
          <Link href={`${storefrontPrefix(locale)}/products`}>{c.products}</Link>
          <Link href={`${storefrontPrefix(locale)}/brands`}>{c.brands}</Link>
          <Link href={`${storefrontPrefix(locale)}/catalog`}>{c.catalog}</Link>
          <Link href={`${storefrontPrefix(locale)}/inspiration`}>{c.inspiration}</Link>
        </div>
        <div>
          <h3>{t(locale, "Here to help")}</h3>
          <Link href={`${storefrontPrefix(locale)}/about`}>{c.about}</Link>
          <Link href={`${storefrontPrefix(locale)}/stores`}>{c.stores}</Link>
          <Link href={`${storefrontPrefix(locale)}/contact`}>{c.contact}</Link>
          <Link href={`${storefrontPrefix(locale)}/contact`}>{t(locale, "For your business")}</Link>
        </div>
        <div className={s.footerVisit}>
          <h3>{t(locale, "Find your next favourite")}</h3>
          <p>{t(locale, "See the details. Feel the difference. Visit us in store.")}</p>
          <Link href={`${storefrontPrefix(locale)}/stores`} className={s.visitLink}>
            <Icon name="pin" size={18} />
            {t(locale, "Find a store")}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
      </div>
      <div className={s.footerBottom}>
        <span>© {new Date().getFullYear()} JJGLASS</span>
        <span>{c.demo}</span>
        <Link href={cmsPath(locale)}>{t(locale, "Management preview")} ↗</Link>
      </div>
    </footer>
    {shop.toast && <div role="status" className={s.toast}>
      <Icon name="check" />
      {shop.toast}
      <Link href={`${storefrontPrefix(locale)}/cart`}>
        {c.cart}
        <Icon name="arrow" size={17} />
      </Link>
    </div>}
    <dialog ref={dialog} aria-label={c.search} className={s.searchDialog} onCancel={() => setSearch(false)} onClose={() => {
      setSearch(false);
      searchTrigger.current?.focus();
    }} onClick={e => {
      if (e.target === e.currentTarget) setSearch(false);
    }}>
      <div>
        <div className={s.searchHead}>
          <h2>{c.search}</h2>
          <button aria-label={c.close} onClick={() => setSearch(false)}>
            <Icon name="close" />
          </button>
        </div>
        <form action={`${storefrontPrefix(locale)}/products`}>
          <Icon name="search" />
          <input name="q" placeholder={c.searchHint} aria-label={c.search} autoFocus required />
          <button type="submit" aria-label={c.search}>
            <Icon name="arrow" />
          </button>
        </form>
        <p>{t(locale, "Try wine glasses, vases, or storage jars.")}</p>
      </div>
    </dialog>
  </>;
}
