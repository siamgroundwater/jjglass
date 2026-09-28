'use client';

import { cmsCopy } from '@/lib/cms-copy';
import { orderTotal, type CmsData, type CmsView } from '@/lib/cms-types';
import { cmsPath, money, type Locale } from '@/lib/i18n';
import Icon from '../Icon';
import { CmsBadge } from './CmsUI';
import u from './CmsUI.module.css';
import s from './CmsDashboard.module.css';

export default function CmsDashboard({ locale, data, navigate }: { locale: Locale; data: CmsData; navigate: (view: CmsView) => void }) {
  const c = cmsCopy[locale];
  const paid = data.orders.filter(order => order.payment === 'paid' && order.status !== 'cancelled');
  const lowStock = data.products.filter(product => product.status === 'published' && product.stock <= data.settings.lowStockThreshold).sort((a, b) => a.stock - b.stock);
  const recent = [...data.orders].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const days = Array.from({ length: 7 }, (_, i) => 19 + i);
  const values = days.map(day => paid.filter(order => order.date.startsWith(`2026-09-${day}`)).reduce((sum, order) => sum + orderTotal(order), 0));
  const chartMax = Math.max(1000, Math.ceil(Math.max(...values) / 1000) * 1000);
  const revenue = paid.reduce((sum, order) => sum + orderTotal(order), 0);
  const stats = [
    { label: c.sales, value: money(revenue), icon: 'bag' as const, note: `${paid.length} ${c.orderCount}`, view: 'orders' as const },
    { label: c.totalOrders, value: data.orders.length, icon: 'book' as const, note: `${data.orders.filter(order => order.status === 'pending').length} ${c.pending}`, view: 'orders' as const },
    { label: c.liveProducts, value: data.products.filter(product => product.status === 'published').length, icon: 'grid' as const, note: `${data.categories.length} ${c.collections}`, view: 'products' as const },
    { label: c.lowStock, value: lowStock.length, icon: 'filter' as const, note: c.stockTitle, view: 'inventory' as const }
  ];
  return <div className={s.dashboard}>
    <div className={s.welcome}><div><p className={u.eyebrow}>{c.goodMorning}</p><h1>{c.dashboardTitle}</h1><p>{c.dashboardIntro}</p></div><span className={s.period}><Icon name="book" size={17} />{c.samplePeriod}</span></div>
    <div className={s.stats}>{stats.map(stat => <button className={s.stat} key={stat.label} onClick={() => navigate(stat.view)}><div><span>{stat.label}</span><Icon name={stat.icon} size={20} /></div><strong>{stat.value}</strong><p>{stat.note}<Icon name="arrow" size={16} /></p></button>)}</div>
    <div className={s.topGrid}>
      <section className={u.panel}><div className={u.panelHead}><div><h2>{c.revenue}</h2><p className={u.muted}>{c.revenueNote}</p></div><span className={s.sampleBadge}>{c.demoData}</span></div><div className={s.chart}>
        <div className={s.chartScale} aria-hidden="true">{[0, 1, 2, 3].map(i => <span key={i}>{new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-GB', { notation: 'compact', maximumFractionDigits: 1 }).format(chartMax * (1 - i / 3))}</span>)}</div>
        <div className={s.chartPlot} role="img" aria-label={`${c.revenue}: ${values.map((value, i) => `${days[i]}: ${money(value)}`).join('; ')}`}>
          <div className={s.chartLines} aria-hidden="true">{[0, 1, 2, 3].map(i => <span key={i} />)}</div>
          {values.map((value, i) => <div key={days[i]} className={s.chartColumn} title={`${days[i]}: ${money(value)}`}><div className={s.barTrack}><span className={s.bar} style={{ height: `${Math.max(.6, value / chartMax * 100)}%` }} data-latest={i === values.length - 1} /></div><span className={s.chartDay}>{days[i]}</span></div>)}
        </div>
      </div></section>
      <section className={s.quickPanel}><span className={s.quickIcon}><Icon name="leaf" size={28} /></span><h2>{c.quickActions}</h2><p>{c.quickIntro}</p><div>{[{ label: c.addProduct, icon: 'bag' as const, view: 'products' as const }, { label: c.editWebsite, icon: 'book' as const, view: 'content' as const }, { label: c.inventory, icon: 'filter' as const, view: 'inventory' as const }].map(action => <button key={action.view} onClick={() => navigate(action.view)}><Icon name={action.icon} size={20} /><span>{action.label}</span><Icon name="arrow" size={18} /></button>)}</div></section>
    </div>
    <div className={s.bottomGrid}>
      <section className={u.panel}><div className={u.panelHead}><h2>{c.orderActivity}</h2><button className={u.textButton} onClick={() => navigate('orders')}>{c.seeAll} ↗</button></div><div className={`${u.recordGrid} ${u.recordGridCompact}`}>{recent.map(order => <article className={u.recordCard} key={order.id}><header className={u.recordCardHeader}><div className={u.recordField}><span className={u.recordLabel}>{new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short' }).format(new Date(order.date))}</span><button className={s.orderLink} onClick={() => navigate('orders')}>{order.id}</button></div><strong className={s.amount}>{money(orderTotal(order))}</strong></header><div className={u.recordCardBody}><div className={u.recordField}><span className={u.recordLabel}>{c.customer}</span><span className={u.recordValue}>{data.customers.find(customer => customer.id === order.customerId)?.name || '—'}</span></div><div className={u.recordField}><span className={u.recordLabel}>{c.status}</span><CmsBadge status={order.status}>{c[order.status]}</CmsBadge></div></div></article>)}</div></section>
      <section className={u.panel}><div className={u.panelHead}><div><h2>{c.stockTitle}</h2><p className={u.muted}>{c.stockNote}</p></div></div><div className={s.stockList}>{lowStock.slice(0, 4).map(product => <a key={product.id} href={`${cmsPath(locale, 'inventory')}?q=${encodeURIComponent(product.sku)}`}><img src={product.image || '/images/hero.webp'} alt="" width={48} height={55} /><span><strong>{product.name[locale]}</strong><small>{product.sku}</small></span><em>{product.stock}</em></a>)}{!lowStock.length && <p className={u.muted}>{c.allStockGood}</p>}</div><button className={s.stockMore} onClick={() => navigate('inventory')}>{c.seeAll}<Icon name="arrow" size={17} /></button></section>
    </div>
    <div className={s.footerGrid}><section className={s.presentationTip}><span><Icon name="shield" size={25} /></span><div><h2>{c.overviewTip}</h2><p>{c.overviewTipText}</p></div></section><section className={s.activity}><h2>{c.activityTitle}</h2>{data.activity.slice(0, 3).map(item => <div key={item.id}><span /><p>{item.text[locale]}<small>{new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(item.date))}</small></p></div>)}</section></div>
  </div>;
}
