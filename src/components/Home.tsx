import Link from 'next/link';
import { categories, products } from '@/lib/catalog';
import { homeJournalArticles } from '@/lib/content';
import { Locale, copy, t, storefrontPrefix } from '@/lib/i18n';
import Icon from './Icon';
import HomeHero from './HomeHero';
import ProductCard from './ProductCard';
import SocialMediaSection from './SocialMediaSection';
import s from './Home.module.css';
export default function Home({
  locale
}: {
  locale: Locale;
}) {
  const c = copy[locale];
  const chosen = ['13156', '13157', '19833', '15276'].map(id => products.find(p => p.id === id)).filter(p => !!p);
  return <>
    <HomeHero locale={locale} />
    <section className={s.promises} aria-label={t(locale, "Discover JJGLASS")}>
      <div>
        <Icon name="leaf" size={26} />
        <p>
          {t(locale, "Considered design")}
          <span>{t(locale, "Glassware for everyday living")}</span>
        </p>
      </div>
      <div>
        <Icon name="grid" size={25} />
        <p>
          {t(locale, "Find your own style")}
          <span>{t(locale, "Brands and collections to explore")}</span>
        </p>
      </div>
      <div>
        <Icon name="bag" size={25} />
        <p>
          {t(locale, "At home. In business.")}
          <span>{t(locale, "For every table, every space, every day.")}</span>
        </p>
      </div>
      <div>
        <Icon name="pin" size={25} />
        <p>
          {t(locale, "See it for yourself [7c33b998]")}
          <span>{t(locale, "Visit our stores in Bangkok")}</span>
        </p>
      </div>
    </section>
    <section className={s.categories} id="collections">
      <div className={s.sectionHead}>
        <div>
          <p className={s.eyebrow}>{t(locale, "FIND YOUR EVERYDAY")}</p>
          <h2>{t(locale, "Good design. In every form.")}</h2>
        </div>
        <Link href={`${storefrontPrefix(locale)}/products`} className={s.textLink}>
          {c.viewAll}
          <Icon name="arrow" size={19} />
        </Link>
      </div>
      <div className={s.categoryGrid}>{categories.slice(0, 5).map(cat => <Link key={cat.id} href={`${storefrontPrefix(locale)}/products?category=${cat.id}`} className={s.categoryCard}>
          <div className={s.categoryImage}>
            <img src={cat.image} alt={cat.name[locale]} loading="lazy" width="400" height="500" />
          </div>
          <h3>{cat.name[locale]}</h3>
          <p>{t(locale, "EXPLORE THE COLLECTION")}</p>
        </Link>)}</div>
      <div className={s.moreCategories}>
        <span>{t(locale, "ALSO EXPLORE")}</span>
        {categories.slice(5).map(cat => <Link key={cat.id} href={`${storefrontPrefix(locale)}/products?category=${cat.id}`}>
          {cat.name[locale]}
        </Link>)}
      </div>
    </section>
    <section className={s.collection}>
      <div className={s.collectionImage}>
        <img src="/images/collection-glassware.jpg" alt={t(locale, "Coffee and drinks in a collection of clear glass cups")} width="1200" height="1000" loading="lazy" />
        <span>{t(locale, "THE EVERYDAY EDIT")} / 01</span>
      </div>
      <div className={s.collectionCopy}>
        <p className={s.eyebrow}>{t(locale, "SIMPLE THINGS, BEAUTIFULLY MADE")}</p>
        <h2>
          {t(locale, "Your favourite glass.")}
          <br />
          {t(locale, "A better kind of everyday.")}
        </h2>
        <p>{t(locale, "From that first coffee of the morning to something chilled on a slow afternoon. Make room for the little details that make every day feel special.")}</p>
        <Link href={`${storefrontPrefix(locale)}/products?category=drinkware`} className={s.textLink}>
          {t(locale, "Discover drinkware")}
          <Icon name="arrow" size={19} />
        </Link>
        <div className={s.collectionNote}>
          <span>01 /</span>
          <span>{t(locale, "Thoughtful shapes. Everyday possibilities.")}</span>
        </div>
      </div>
    </section>
    <section className={s.featured}>
      <div className={s.sectionHead}>
        <div>
          <p className={s.eyebrow}>{t(locale, "THE CURATED SELECTION")}</p>
          <h2>{t(locale, "Meet your new favourites.")}</h2>
        </div>
        <Link href={`${storefrontPrefix(locale)}/products`} className={s.textLink}>
          {c.viewAll}
          <Icon name="arrow" size={19} />
        </Link>
      </div>
      <div className={s.productGrid}>{chosen.map(p => <ProductCard key={p.id} product={p} locale={locale} />)}</div>
      <p className={s.priceNote}>{c.demoPrices}</p>
    </section>
    <section className={s.brandStrip}>
      <span>{t(locale, "FAMILIAR BRANDS. BEAUTIFUL POSSIBILITIES.")}</span>
      <div>{['LYNX', 'AMORN', 'NUK', 'Luce', 'Ocean', 'KING CRYSTAL'].map((b, i) => <Link href={products.some(p => p.brand.toLowerCase() === b.toLowerCase()) ? `${storefrontPrefix(locale)}/products?brand=${encodeURIComponent(b)}` : `${storefrontPrefix(locale)}/brands`} key={b} className={i === 3 ? s.scriptBrand : undefined}>
          {b}
          <small>{i === 0 ? 'GLASSWARE' : i === 5 ? 'COLLECTION' : ''}</small>
        </Link>)}</div>
    </section>
    <section className={s.journal} id="ideas">
      <div className={s.sectionHead}>
        <div>
          <p className={s.eyebrow}>{t(locale, "FROM THE JJGLASS JOURNAL")}</p>
          <h2>{t(locale, "Ideas for every space.")}</h2>
        </div>
        <Link href={`${storefrontPrefix(locale)}/inspiration`} className={s.textLink}>
          {t(locale, "Explore all ideas")}
          <Icon name="arrow" size={19} />
        </Link>
      </div>
      <div className={s.journalGrid}>{homeJournalArticles.map((article, index) => <Link key={article.id} href={`${storefrontPrefix(locale)}/inspiration#${article.id}`} className={`${s.journalCard} ${index === 0 ? s.journalLead : ''}`}>
        <div className={s.journalVisual}>
          <img src={article.image} alt="" width="900" height="600" loading="lazy" />
        </div>
        <div className={s.journalCopy}>
          <h3>{article.title[locale]}</h3>
          <p>{article.summary[locale]}</p>
          <span>{t(locale, "Read the story")}<Icon name="arrow" size={18} /></span>
        </div>
      </Link>)}</div>
    </section>
    <SocialMediaSection locale={locale} />
    <section className={s.business}>
      <div>
        <p className={s.eyebrow}>{t(locale, "LET’S CREATE SOMETHING BEAUTIFUL")}</p>
        <h2>{t(locale, "Your vision. Our glassware.")}</h2>
        <p>{t(locale, "For restaurants, cafés, hotels, and events. Let’s find the right glassware for your business.")}</p>
      </div>
      <Link href={`${storefrontPrefix(locale)}/contact`}>
        {c.contactTeam}
        <Icon name="arrow" size={20} />
      </Link>
    </section>
  </>;
}
