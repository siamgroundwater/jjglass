'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { brands, contact, products, stores } from '@/lib/catalog';
import { catalogs, brandImages, stories, pageIntro, storePreviewGalleries, type ContentPage } from '@/lib/content';
import { storeMapEmbeds } from '@/lib/store-map-embeds';
import { storeGalleryScenes } from '@/lib/store-art';
import { type Locale, copy, t, storefrontPrefix } from '@/lib/i18n';
import Icon from './Icon';
import styles from './ContentPages.module.css';
function ArrowLink({
  href,
  children
}: {
  href: string;
  children: ReactNode;
}) {
  return <Link href={href} className={styles.arrowLink}>
    {children}
  </Link>;
}
function StoreGallery({
  storeId,
  storeName,
  locale
}: {
  storeId: string;
  storeName: string;
  locale: Locale;
}) {
  const images = storePreviewGalleries[storeId] ?? ['stores/head-office-exterior.webp'];
  const [active, setActive] = useState(0);
  const move = (direction: number) => setActive(current => (current + direction + images.length) % images.length);

  return <div className={styles.storeGallery} role="group" aria-label={`${storeName} — ${t(locale, "Illustrated store views")}`}>
    <div className={styles.storeGalleryFrame}>
      <Image
        src={`/images/${images[active]}`}
        alt={`${storeName} — ${(storeGalleryScenes[active] ?? storeGalleryScenes[0])[locale]}`}
        fill
        sizes="(max-width: 800px) 100vw, (max-width: 1100px) 50vw, 33vw"
        className={styles.storeGalleryImage}
      />
      <div className={styles.storeGalleryControls}>
        <button className={styles.storeGalleryArrow} type="button" onClick={() => move(-1)} aria-label={`${t(locale, "Previous image")} — ${storeName}`}>
          <Icon name="chevron" size={19} />
        </button>
        <div className={styles.storeGalleryIndicators}>
          {images.map((image, index) => <button
            key={image}
            type="button"
            className={`${styles.storeGalleryIndicator} ${index === active ? styles.storeGalleryIndicatorActive : ''}`}
            onClick={() => setActive(index)}
            aria-label={`${t(locale, "View image")} ${index + 1} — ${storeName}`}
            aria-current={index === active ? 'true' : undefined}
          />)}
          <span className={styles.storeGalleryStatus} aria-live="polite">{active + 1} / {images.length}</span>
        </div>
        <button className={styles.storeGalleryArrow} type="button" onClick={() => move(1)} aria-label={`${t(locale, "Next image")} — ${storeName}`}>
          <Icon name="chevron" size={19} />
        </button>
      </div>
    </div>
  </div>;
}
function googleFrameHasLoaded(frame: HTMLIFrameElement) {
  if (!frame.contentWindow) return false;
  try {
    return frame.contentWindow.location.href !== 'about:blank';
  } catch {
    return true;
  }
}
function StoreMap({ storeId, storeName, mapUrl, locale }: { storeId: string; storeName: string; mapUrl: string; locale: Locale }) {
  const [ready, setReady] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const embedUrl = storeMapEmbeds[storeId];
  useEffect(() => {
    if (frameRef.current && googleFrameHasLoaded(frameRef.current)) setReady(true);
  }, [embedUrl]);
  if (!embedUrl) return null;
  return <div className={styles.storeMap}>
    <div className={styles.storeMapHeader}>
      <span><Icon name="pin" size={18} />{t(locale, "Location")}</span>
      <a href={mapUrl} target="_blank" rel="noopener noreferrer">{t(locale, "Open in Maps")} <Icon name="arrow" size={16} /></a>
    </div>
    <div className={styles.storeMapFrame}>
      <iframe ref={frameRef} src={embedUrl} title={`${storeName} — Google Maps`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen onLoad={event => {
        if (googleFrameHasLoaded(event.currentTarget)) setReady(true);
      }} />
      {!ready && <div className={styles.storeMapCover}>
        <Icon name="pin" size={29} />
        <strong>{storeName}</strong>
        <span>{t(locale, "Google Maps preview")}</span>
      </div>}
    </div>
  </div>;
}
function ContactForm({
  locale
}: {
  locale: Locale;
}) {
  const [preview, setPreview] = useState<{
    name: string;
    topic: string;
    detail: string;
  } | null>(null);
  function previewInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const detail = String(data.get('detail') || '').trim();
    const phone = String(data.get('phone') || '');
    if (!name || !detail) {
      const field = form.elements.namedItem(!name ? 'name' : 'detail') as HTMLInputElement;
      field.setCustomValidity(t(locale, "Please enter a value, not only spaces."));
      field.reportValidity();
      return;
    }
    if (phone.replace(/\D/g, '').length < 7) {
      const field = form.elements.namedItem('phone') as HTMLInputElement;
      field.setCustomValidity(t(locale, "Please enter a phone number with at least 7 digits."));
      field.reportValidity();
      return;
    }
    setPreview({
      name,
      topic: String(data.get('topic')),
      detail
    });
  }
  return <div className={styles.formCard}>
    <span className={styles.smallTag}>{t(locale, "FORM PREVIEW")}</span>
    <h2>{t(locale, "Tell us a little more.")}</h2>
    <p className={styles.formNote}>{t(locale, "Try the form to preview your inquiry. This demo does not send or store your information.")}</p>
    <form onSubmit={previewInquiry} onInput={event => {
      const input = event.target as HTMLInputElement;
      input.setCustomValidity?.('');
      setPreview(null);
    }}>
      <div className={styles.formRow}>
        <label>
          {t(locale, "Your name")}
          <input name="name" autoComplete="name" required maxLength={100} placeholder={t(locale, "Full name")} />
        </label>
        <label>
          {t(locale, "Phone number")}
          <input name="phone" type="tel" autoComplete="tel" required maxLength={25} pattern={'[+0-9\\s\\(\\)\\-]{7,25}'} placeholder="081 234 5678" />
        </label>
      </div>
      <label>
        {t(locale, "Email address")}
        <input name="email" type="email" autoComplete="email" required maxLength={150} placeholder="you@example.com" />
      </label>
      <label>
        {t(locale, "What can we help with?")}
        <select name="topic" required defaultValue="">
          <option value="" disabled>{t(locale, "Choose a topic")}</option>
          {[t(locale, "Product inquiry"), t(locale, "Delivery inquiry"), t(locale, "Something else")].map(topic => <option key={topic}>{topic}</option>)}
        </select>
      </label>
      <label>
        {t(locale, "Your message")}
        <textarea name="detail" rows={4} required maxLength={2000} placeholder={t(locale, "Tell us what you have in mind…")} />
      </label>
      <button className={styles.primaryButton} type="submit">
        {t(locale, "Preview inquiry")}
        <Icon name="arrow" size={18} />
      </button>
    </form>
    {preview && <div className={styles.formPreview} role="status">
      <strong>
        <Icon name="check" size={18} />
        {t(locale, "Your inquiry preview is ready.")}
      </strong>
      <p>{preview.name} · {preview.topic}</p>
      <p>{preview.detail}</p>
      <small>{t(locale, "No message has been sent. To contact us, use the phone, LINE or email details on this page.")}</small>
    </div>}
  </div>;
}
export function ContentPages({
  locale,
  page
}: {
  locale: Locale;
  page: ContentPage;
}) {
  const [query, setQuery] = useState('');
  const intro = pageIntro[page];
  const filteredCatalogs = catalogs.filter(item => `${item.title} ${Object.values(item.description).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div className={styles.page}>
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label={t(locale, "Breadcrumb")}>
        <Link href={storefrontPrefix(locale) || '/'}>{copy[locale].home}</Link>
        <span>/</span>
        <span aria-current="page">{copy[locale][page]}</span>
      </nav>
      <header className={`${styles.intro} ${page === 'about' ? styles.aboutIntro : ''}`}>
        <p className={styles.eyebrow}>{intro.eyebrow[locale]}</p>
        <h1>{intro.title[locale]}</h1>
        <p className={styles.description}>{intro.description[locale]}</p>
      </header>
      {page === 'brands' && <>
        <div className={styles.brandGrid}>{brands.map((brand, index) => {
            const count = products.filter(product => product.brand === brand).length;
            return <Link href={count ? `${storefrontPrefix(locale)}/products?brand=${encodeURIComponent(brand)}` : `${storefrontPrefix(locale)}/contact`} className={styles.brandCard} key={brand} aria-label={`${brand} — ${count ? copy[locale].browse : copy[locale].contactTeam}`}>
              <div className={`${styles.brandWordmark} ${index % 2 === 0 ? styles.serifBrand : ''}`}>{brandImages[brand] ? <img src={`/images/${brandImages[brand]}`} alt={brand} width={300} height={130} loading="lazy" /> : brand}</div>
              <div className={styles.brandFooter}>
                <span>{count ? `${count} ${copy[locale].results}` : t(locale, "Ask about the collection")}</span>
                <span>
                  {count ? t(locale, "Explore") : t(locale, "Inquire")}
                  <Icon name="arrow" size={19} />
                </span>
              </div>
            </Link>;
          })}</div>
        <div className={styles.callout}>
          <div>
            <p className={styles.eyebrow}>{t(locale, "LOOKING FOR SOMETHING SPECIFIC?")}</p>
            <h2>{t(locale, "Let’s find your perfect fit.")}</h2>
          </div>
          <ArrowLink href={`${storefrontPrefix(locale)}/contact`}>{copy[locale].contactTeam}</ArrowLink>
        </div>
      </>}
      {page === 'catalog' && <>
        <div className={styles.catalogToolbar}>
          <p>
            {t(locale, "The online library")}
            <span>({catalogs.length})</span>
          </p>
          <label className={styles.search}>
            <Icon name="search" size={18} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder={t(locale, "Find a catalog…")} aria-label={t(locale, "Search catalogs")} />
          </label>
        </div>
        <div className={styles.catalogGrid}>{filteredCatalogs.map(catalog => <article key={catalog.url} className={styles.catalogCard}>
            <a href={catalog.url} target="_blank" rel="noopener noreferrer" className={styles.catalogCover} aria-label={`${catalog.title} — ${t(locale, "opens in a new tab")}`}>
              <img src={catalog.image} alt={catalog.title} loading="lazy" width={600} height={900} />
              <span className={styles.coverHover}>
                <Icon name="book" size={22} />
                {t(locale, "Open catalog")}
              </span>
            </a>
            <p className={styles.catalogType}>{t(locale, "ONLINE CATALOG")}</p>
            <h2>{catalog.title}</h2>
            <p className={styles.catalogDescription}>{catalog.description[locale]}</p>
            <a className={styles.arrowLink} href={catalog.url} target="_blank" rel="noopener noreferrer">
              {t(locale, "View catalog")}
            </a>
          </article>)}</div>
        {!filteredCatalogs.length && <div className={styles.empty}>
          <Icon name="book" size={30} />
          <h2>{t(locale, "No catalogs found")}</h2>
          <p>{t(locale, "Try another name to find your collection.")}</p>
          <button onClick={() => setQuery('')}>{copy[locale].clear}</button>
        </div>}
        <p className={styles.footnote}>{t(locale, "Catalogs open on Flipbooklets in a new tab. These are the catalogs linked from the previous website; contact our team to confirm current product details.")}</p>
      </>}
      {page === 'about' && <>
        <div className={styles.aboutHero}>
          <img src="/images/lifestyle-cafe.jpg" alt={t(locale, "Glassware for a café")} width={1400} height={740} />
          <div>
            <span>JJGLASS</span>
            <p>{t(locale, "A glass for every part of life.")}</p>
          </div>
        </div>
        <section className={styles.storySection}>
          <p className={styles.eyebrow}>{t(locale, "SIMPLE THINGS, WELL CHOSEN")}</p>
          <div>
            <h2>{t(locale, "It’s the little things that bring a space together.")}</h2>
            <p>{t(locale, "JJGLASS brings together glassware for everyday life and business, from drinking glasses and stemware to vases, storage jars and decorative pieces. Find a shape, a size and an idea that works for you.")}</p>
            <p>{t(locale, "A glass can be more than a vessel. Change the way you serve a drink, arrange flowers in a new silhouette, or start a small garden in a jar. A thoughtful detail gives a space its personality.")}</p>
            <ArrowLink href={`${storefrontPrefix(locale)}/products`}>{copy[locale].explore}</ArrowLink>
          </div>
        </section>
        <div className={styles.values}>{[{
            icon: 'grid' as const,
            title: t(locale, "Find your everyday fit"),
            text: t(locale, "Explore shapes and sizes for homes, cafés, restaurants and decoration.")
          }, {
            icon: 'leaf' as const,
            title: t(locale, "Make it your own"),
            text: t(locale, "Discover ways to bring a little creativity to your glassware and your space.")
          }, {
            icon: 'pin' as const,
            title: t(locale, "See it for yourself"),
            text: t(locale, "Visit a Bangkok location and take a closer look at the pieces you love.")
          }].map(value => <article key={value.title}>
            <Icon name={value.icon} size={27} />
            <h3>{value.title}</h3>
            <p>{value.text}</p>
          </article>)}</div>
        <div className={styles.callout}>
          <div>
            <p className={styles.eyebrow}>{t(locale, "MAKE SOMETHING YOURS")}</p>
            <h2>{t(locale, "Find the pieces for your story.")}</h2>
          </div>
          <ArrowLink href={`${storefrontPrefix(locale)}/inspiration`}>{copy[locale].inspiration}</ArrowLink>
        </div>
      </>}
      {page === 'stores' && <>
        <div className={styles.storeIntro}>
          <Icon name="pin" size={26} />
          <div>
            <strong>{t(locale, "Find us in Bangkok")}</strong>
            <p>{t(locale, "Bangbon · Samphanthawong · Chatuchak")}</p>
          </div>
          <Link href={`${storefrontPrefix(locale)}/contact`}>
            {t(locale, "Contact our team")}
            <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className={styles.storesGrid}>{stores.map(store => <article key={store.id} className={styles.storeCard}>
            <StoreGallery storeId={store.id} storeName={store.name[locale]} locale={locale} />
            <div className={styles.storeCardBody}>
              <h2>{store.name[locale]}</h2>
              <address>{store.address[locale]}</address>
              <dl className={styles.storeDetails}>
                <div><dt>{t(locale, "Opening hours")}</dt><dd>{store.hours[locale]}</dd></div>
                <div><dt>{t(locale, "Phone")}</dt><dd><a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`}>{store.phone}</a></dd></div>
                <div><dt>LINE</dt><dd><a href={contact.lineUrl} target="_blank" rel="noopener noreferrer">{store.lineId}</a></dd></div>
              </dl>
            </div>
            <StoreMap storeId={store.id} storeName={store.name[locale]} mapUrl={store.mapUrl} locale={locale} />
          </article>)}</div>
        <p className={styles.footnote}>{t(locale, "Locations and hours are based on the supplied previous website. Gallery illustrations are imagined store concepts, not photographs of the actual branches. Please confirm details before travelling.")}</p>
      </>}
      {page === 'contact' && <div className={styles.contactLayout}>
        <aside className={styles.contactInfo}>
          <h2>{t(locale, "We’re here to help.")}</h2>
          <p>{t(locale, "Whether you are finding something for home or planning a new business, get in touch to talk about the pieces you need.")}</p>
          <div className={styles.contactDetails}>
            <a href="tel:+66871841844">
              <Icon name="phone" size={21} />
              <span><small>{t(locale, "GIVE US A CALL")}</small>087 184 1844</span>
              <Icon name="arrow" size={17} />
            </a>
            <a href="mailto:info@jjglass.com">
              <Icon name="mail" size={21} />
              <span><small>{t(locale, "DROP US AN EMAIL")}</small>info@jjglass.com</span>
              <Icon name="arrow" size={17} />
            </a>
            <a href="https://line.me/R/ti/p/@jjglass" target="_blank" rel="noopener noreferrer">
              <span className={styles.lineIcon}>L</span>
              <span><small>{t(locale, "LET’S CHAT ON LINE")}</small>@jjglass</span>
              <Icon name="arrow" size={17} />
            </a>
          </div>
          <div className={styles.contactAddress}>
            <Icon name="pin" size={22} />
            <div>
              <h3>{t(locale, "Head office")}</h3>
              <p>{t(locale, "101, 103 Bangbon 1 (Soi 7), Khlong Bang Phran, Bangbon, Bangkok 10150")}</p>
              <ArrowLink href={`${storefrontPrefix(locale)}/stores`}>{t(locale, "Find all our stores")}</ArrowLink>
            </div>
          </div>
        </aside>
        <ContactForm locale={locale} />
      </div>}
      {page === 'inspiration' && <div className={styles.stories}>{stories.map((story, index) => <article id={story.id} key={story.id} className={`${styles.story} ${index % 2 ? styles.reverse : ''}`}>
          <div className={styles.storyImage}>
            <img src={story.image} alt={story.label[locale]} width={780} height={680} loading="lazy" />
            <span>{String(index + 1).padStart(2, '0')}</span>
          </div>
          <div className={styles.storyCopy}>
            <p className={styles.eyebrow}>{story.label[locale]}</p>
            <h2>{story.title[locale]}</h2>
            <p>{story.text[locale]}</p>
            <ArrowLink href={`${storefrontPrefix(locale)}/products?category=${story.category}`}>{t(locale, "Find your pieces")}</ArrowLink>
          </div>
        </article>)}</div>}
    </div>
  </div>;
}
