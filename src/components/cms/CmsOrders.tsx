'use client';

import { useState, type FormEvent } from 'react';
import Icon from '../Icon';
import { money, type Locale } from '@/lib/i18n';
import { cmsCopy } from '@/lib/cms-copy';
import { cmsId, orderTotal, type CmsCustomer, type CmsOrder, type CmsPanelProps, type OrderStatus, type PaymentStatus } from '@/lib/cms-types';
import { cmsOrdersCopy, orderStatusCopy, paymentStatusCopy } from '@/lib/cms-orders-copy';
import { CmsActionPage, CmsBadge, CmsDialog, CmsEmpty, CmsPagination } from './CmsUI';
import ui from './CmsUI.module.css';
import styles from './CmsOrders.module.css';

const orderStatuses = Object.keys(orderStatusCopy) as OrderStatus[];
const paymentStatuses = Object.keys(paymentStatusCopy) as PaymentStatus[];
const pageSize = 8;
const formatDate = (date: string, locale: Locale) => new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));
const customerPaidTotal = (customerId: string, orders: CmsOrder[]) => orders.filter(order => order.customerId === customerId && order.payment === 'paid' && order.status !== 'cancelled').reduce((sum, order) => sum + orderTotal(order), 0);

export function CmsOrders({ locale, data, save, routeAction, routeItemId, actionPath, closeAction }: CmsPanelProps) {
  const c = cmsOrdersCopy[locale];
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [payment, setPayment] = useState<PaymentStatus | ''>('');
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<CmsOrder | null>(() => routeAction === 'edit' ? data.orders.find(order => order.id === routeItemId) || null : null);
  const [detail, setDetail] = useState<CmsOrder | null>(null);
  const [error, setError] = useState('');
  const query = search.trim().toLocaleLowerCase();
  const filtered = data.orders.filter(order => {
    const customer = data.customers.find(entry => entry.id === order.customerId);
    const matchesSearch = [order.id, order.tracking, customer?.name, customer?.company, customer?.email].filter(Boolean).join(' ').toLocaleLowerCase().includes(query);
    return matchesSearch && (!status || order.status === status) && (!payment || order.payment === payment);
  }).sort((a, b) => b.date.localeCompare(a.date));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedCustomer = draft ? data.customers.find(customer => customer.id === draft.customerId) : null;
  const detailCustomer = detail ? data.customers.find(customer => customer.id === detail.customerId) : null;

  function clearFilters() {
    setSearch(''); setStatus(''); setPayment(''); setPage(1);
  }

  function saveOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    if (draft.tracking.trim().length > 80) { setError(c.trackingInvalid); return; }
    if (draft.note.trim().length > 2000) { setError(c.noteInvalid); return; }
    const next = { ...draft, tracking: draft.tracking.trim(), note: draft.note.trim() };
    if (save({ ...data, orders: data.orders.map(order => order.id === draft.id ? next : order) }, { th: cmsOrdersCopy.th.savedOrder, en: cmsOrdersCopy.en.savedOrder })) {
      setError('');
      closeAction();
    } else setError(c.saveFailed);
  }

  return <>
    {!routeAction && <>
    <div className={styles.heading}>
      <p>{c.ordersDescription}</p>
      <span className={styles.count}>{filtered.length} {c.records}</span>
    </div>
    <section className={ui.panel} aria-label={c.orders}>
      <div className={ui.toolbar}>
        <label className={ui.search}><Icon name="search" size={20} /><input type="search" aria-label={c.orderSearch} placeholder={c.orderSearch} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
        <select className={ui.select} aria-label={c.fulfilment} value={status} onChange={event => { setStatus(event.target.value as OrderStatus | ''); setPage(1); }}>
          <option value="">{c.allStatuses}</option>{orderStatuses.map(value => <option key={value} value={value}>{orderStatusCopy[value][locale]}</option>)}
        </select>
        <select className={ui.select} aria-label={c.payment} value={payment} onChange={event => { setPayment(event.target.value as PaymentStatus | ''); setPage(1); }}>
          <option value="">{c.allPayments}</option>{paymentStatuses.map(value => <option key={value} value={value}>{paymentStatusCopy[value][locale]}</option>)}
        </select>
      </div>
      {visible.length ? <div className={ui.recordGrid}>{visible.map(order => {
          const customer = data.customers.find(entry => entry.id === order.customerId);
          const openOrder = () => setDetail({ ...order });
          return <article className={ui.recordCard} key={order.id}>
            <header className={ui.recordCardHeader}><div className={ui.recordField}><span className={ui.recordLabel}>{c.order}</span><button className={styles.orderButton} onClick={openOrder} aria-label={`${c.view}: ${order.id}`}>{order.id}</button></div><strong className={styles.amount}>{money(orderTotal(order))}</strong></header>
            <div className={ui.recordCardBody}>
              <div className={ui.recordField}><span className={ui.recordLabel}>{c.customer}</span><div className={`${ui.recordValue} ${styles.customerCell}`}><span>{customer?.name || c.unknownCustomer}</span><small>{customer?.company || (customer ? c.noCompany : '')}</small></div></div>
              <div className={ui.recordField}><span className={ui.recordLabel}>{c.date}</span><span className={`${ui.recordValue} ${styles.date}`}>{formatDate(order.date, locale)}</span></div>
              <div className={ui.recordField}><span className={ui.recordLabel}>{c.fulfilment}</span><CmsBadge status={order.status}>{orderStatusCopy[order.status][locale]}</CmsBadge></div>
              <div className={ui.recordField}><span className={ui.recordLabel}>{c.payment}</span><CmsBadge status={order.payment}>{paymentStatusCopy[order.payment][locale]}</CmsBadge></div>
            </div>
            <footer className={ui.recordCardFooter}><span className={ui.recordCardAccent} aria-hidden="true" /><div className={ui.inline}><button className={ui.secondary} onClick={openOrder}>{c.view}</button><a className={ui.secondary} href={actionPath('edit', order.id)} target="_blank" rel="noopener noreferrer">{cmsCopy[locale].edit}</a></div></footer>
          </article>;
        })}</div> : <CmsEmpty title={c.noOrders} description={c.noOrdersDescription} action={<button className={ui.secondary} onClick={clearFilters}>{c.clearFilters}</button>} />}
      <CmsPagination page={currentPage} pages={pages} onChange={setPage} locale={locale} />
    </section>
    </>}
    {draft && <CmsActionPage title={`${c.updateOrder} · ${draft.id}`} description={c.sampleNotice} backLabel={cmsCopy[locale].back} onBack={closeAction}>
      <form onSubmit={saveOrder} className={ui.formStack} noValidate>
        <p className={styles.notice}>{c.sampleNotice}</p>
        <div className={styles.detailHeading}><div><p className={ui.eyebrow}>{c.sampleOrder}</p><h3>{draft.id}</h3></div><span className={ui.muted}>{formatDate(draft.date, locale)}</span></div>
        <div className={styles.detailColumns}>
          <section className={styles.section} aria-label={c.orderItems}>
            <h3>{c.orderItems}</h3><p className={ui.muted}>{c.frozenItems}</p>
            <div className={styles.lineItems}>{draft.items.map((item, index) => <div className={styles.lineItem} key={`${item.productId}-${index}`}>
              {/* Existing local product assets keep the sample order self-contained. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" width={64} height={64} />
              <div><strong>{item.name[locale]}</strong><p>{c.quantity}: {item.quantity} · {money(item.price)} / {c.item}</p></div>
              <strong className={styles.amount}>{money(item.price * item.quantity)}</strong>
            </div>)}</div>
            <dl className={styles.totals}>
              <div><dt>{c.subtotal}</dt><dd className={styles.amount}>{money(draft.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</dd></div>
              <div><dt>{c.delivery}</dt><dd className={styles.amount}>{money(draft.delivery)}</dd></div>
              <div className={styles.grandTotal}><dt>{c.total}</dt><dd className={styles.amount}>{money(orderTotal(draft))}</dd></div>
            </dl>
          </section>
          <section className={styles.card} aria-label={c.contactDetails}>
            <h3>{c.contactDetails}</h3>
            {selectedCustomer ? <div className={styles.contactInfo}>
              <strong>{selectedCustomer.name}</strong>{selectedCustomer.company && <span>{selectedCustomer.company}</span>}
              <span>{selectedCustomer.email}</span><span>{selectedCustomer.phone}</span><address>{selectedCustomer.address[locale]}</address>
            </div> : <p className={ui.muted}>{c.unknownCustomer}</p>}
          </section>
        </div>
        <section className={styles.card} aria-label={c.updateOrder}>
          <h3>{c.updateOrder}</h3>
          <div className={ui.formGrid}>
            <label className={ui.field}>{c.fulfilment}<select className={ui.select} value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as OrderStatus })}>{orderStatuses.map(value => <option key={value} value={value}>{orderStatusCopy[value][locale]}</option>)}</select></label>
            <label className={ui.field}>{c.payment}<select className={ui.select} value={draft.payment} onChange={event => setDraft({ ...draft, payment: event.target.value as PaymentStatus })}>{paymentStatuses.map(value => <option key={value} value={value}>{paymentStatusCopy[value][locale]}</option>)}</select></label>
            <label className={`${ui.field} ${styles.fullField}`}>{c.tracking}<input className={ui.input} maxLength={80} placeholder={c.trackingPlaceholder} value={draft.tracking} onChange={event => setDraft({ ...draft, tracking: event.target.value })} /></label>
            <label className={`${ui.field} ${styles.fullField}`}>{c.internalNote}<textarea className={ui.textarea} rows={3} maxLength={2000} placeholder={c.notePlaceholder} value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} /></label>
          </div>
        </section>
        {error && <p className={ui.error} role="alert">{error}</p>}
        <div className={`${ui.actions} ${styles.saveBar}`}><button type="button" className={ui.secondary} onClick={closeAction}>{c.cancel}</button><button type="submit" className={ui.primary}><Icon name="check" size={18} />{c.saveOrder}</button></div>
      </form>
    </CmsActionPage>}
    {routeAction && !draft && <CmsActionPage title={cmsCopy[locale].noResults} backLabel={cmsCopy[locale].back} onBack={closeAction}><p className={ui.muted}>{c.noOrdersDescription}</p></CmsActionPage>}
    {detail && <CmsDialog title={`${c.orderDetails} · ${detail.id}`} locale={locale} onClose={() => setDetail(null)} wide closeOnBackdrop>
      <div className={ui.formStack}>
        <div className={styles.detailHeading}><div><p className={ui.eyebrow}>{c.sampleOrder}</p><h3>{detail.id}</h3></div><span className={ui.muted}>{formatDate(detail.date, locale)}</span></div>
        <div className={styles.detailColumns}>
          <section className={styles.section}><h3>{c.orderItems}</h3><div className={styles.lineItems}>{detail.items.map((item, index) => <div className={styles.lineItem} key={`${item.productId}-${index}`}><img src={item.image} alt="" width={64} height={64} /><div><strong>{item.name[locale]}</strong><p>{c.quantity}: {item.quantity} · {money(item.price)} / {c.item}</p></div><strong className={styles.amount}>{money(item.price * item.quantity)}</strong></div>)}</div><dl className={styles.totals}><div><dt>{c.subtotal}</dt><dd>{money(detail.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</dd></div><div><dt>{c.delivery}</dt><dd>{money(detail.delivery)}</dd></div><div className={styles.grandTotal}><dt>{c.total}</dt><dd>{money(orderTotal(detail))}</dd></div></dl></section>
          <section className={styles.card}><h3>{c.contactDetails}</h3>{detailCustomer ? <div className={styles.contactInfo}><strong>{detailCustomer.name}</strong>{detailCustomer.company && <span>{detailCustomer.company}</span>}<span>{detailCustomer.email}</span><span>{detailCustomer.phone}</span><address>{detailCustomer.address[locale]}</address></div> : <p className={ui.muted}>{c.unknownCustomer}</p>}<div className={ui.formGrid}><div className={ui.recordField}><span className={ui.recordLabel}>{c.fulfilment}</span><CmsBadge status={detail.status}>{orderStatusCopy[detail.status][locale]}</CmsBadge></div><div className={ui.recordField}><span className={ui.recordLabel}>{c.payment}</span><CmsBadge status={detail.payment}>{paymentStatusCopy[detail.payment][locale]}</CmsBadge></div></div>{detail.tracking && <p>{c.tracking}: {detail.tracking}</p>}{detail.note && <p>{c.internalNote}: {detail.note}</p>}</section>
        </div>
      </div>
    </CmsDialog>}
  </>;
}

export function CmsCustomers({ locale, data, save, routeAction, routeItemId, openAction, actionPath, closeAction }: CmsPanelProps) {
  const c = cmsOrdersCopy[locale];
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<CmsCustomer | null>(() => {
    if (routeAction === 'new') return { id: '', name: '', company: '', email: '', phone: '', address: { th: '', en: '' }, note: '', joined: new Date().toISOString() };
    const customer = routeAction === 'edit' ? data.customers.find(item => item.id === routeItemId) : undefined;
    return customer ? { ...customer, address: { ...customer.address } } : null;
  });
  const [detail, setDetail] = useState<CmsCustomer | null>(null);
  const [error, setError] = useState('');
  const query = search.trim().toLocaleLowerCase();
  const filtered = data.customers.filter(customer => [customer.name, customer.company, customer.email, customer.phone].join(' ').toLocaleLowerCase().includes(query));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const history = draft?.id ? data.orders.filter(order => order.customerId === draft.id).sort((a, b) => b.date.localeCompare(a.date)) : [];
  const detailHistory = detail ? data.orders.filter(order => order.customerId === detail.id).sort((a, b) => b.date.localeCompare(a.date)) : [];

  function saveCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const next: CmsCustomer = { id: draft.id, name: draft.name.trim(), company: draft.company.trim(), email: draft.email.trim().toLowerCase(), phone: draft.phone.trim(), address: { th: draft.address.th.trim(), en: draft.address.en.trim() }, note: draft.note.trim(), joined: draft.joined };
    if (!next.name || next.name.length > 120) { setError(c.nameRequired); return; }
    if (next.company.length > 160) { setError(c.companyInvalid); return; }
    if (next.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) { setError(c.emailInvalid); return; }
    if (data.customers.some(customer => customer.id !== draft.id && customer.email.toLowerCase() === next.email)) { setError(c.emailDuplicate); return; }
    const phoneDigits = next.phone.replace(/\D/g, '');
    if (!/^[+\d\s().-]+$/.test(next.phone) || phoneDigits.length < 7 || phoneDigits.length > 15) { setError(c.phoneInvalid); return; }
    if (!next.address.th || !next.address.en || next.address.th.length > 500 || next.address.en.length > 500) { setError(c.addressRequired); return; }
    if (next.note.length > 2000) { setError(c.noteInvalid); return; }
    const customer = { ...next, id: next.id || cmsId('customer') };
    const customers = draft.id ? data.customers.map(entry => entry.id === draft.id ? customer : entry) : [customer, ...data.customers];
    if (save({ ...data, customers }, { th: cmsOrdersCopy.th.savedCustomer, en: cmsOrdersCopy.en.savedCustomer })) {
      setError(''); closeAction();
    } else setError(c.saveFailed);
  }

  return <>
    {!routeAction && <>
    <div className={styles.heading}>
      <p>{c.customersDescription}</p>
      <button className={ui.primary} onClick={() => openAction('new')}><Icon name="plus" size={18} />{c.addCustomer}</button>
    </div>
    <section className={ui.panel} aria-label={c.customers}>
      <div className={ui.toolbar}>
        <label className={ui.search}><Icon name="search" size={20} /><input type="search" aria-label={c.customerSearch} placeholder={c.customerSearch} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
        <span className={styles.count}>{filtered.length} {c.records}</span>
      </div>
      {visible.length ? <div className={ui.recordGrid}>{visible.map(customer => {
        const openCustomer = () => setDetail({ ...customer, address: { ...customer.address } });
        return <article className={ui.recordCard} key={customer.id}>
          <header className={ui.recordCardHeader}><div className={styles.customerName}><span className={styles.avatar} aria-hidden="true">{Array.from(customer.name)[0]}</span><div className={styles.customerCell}><button className={styles.orderButton} onClick={openCustomer}>{customer.name}</button><small>{customer.company || c.noCompany}</small></div></div></header>
          <div className={ui.recordCardBody}>
            <div className={ui.recordField}><span className={ui.recordLabel}>{c.email}</span><span className={ui.recordValue}>{customer.email}</span></div>
            <div className={ui.recordField}><span className={ui.recordLabel}>{c.orderCount}</span><strong className={ui.recordValue}>{data.orders.filter(order => order.customerId === customer.id).length}</strong></div>
            <div className={ui.recordField}><span className={ui.recordLabel}>{c.paidTotal}</span><strong className={`${ui.recordValue} ${styles.amount}`}>{money(customerPaidTotal(customer.id, data.orders))}</strong></div>
          </div>
          <footer className={ui.recordCardFooter}><span className={ui.recordCardAccent} aria-hidden="true" /><div className={ui.inline}><button className={ui.secondary} onClick={openCustomer}>{c.view}</button><a className={ui.secondary} href={actionPath('edit', customer.id)} target="_blank" rel="noopener noreferrer">{cmsCopy[locale].edit}</a></div></footer>
        </article>;
      })}</div> : <CmsEmpty title={c.noCustomers} description={c.noCustomersDescription} action={<button className={ui.secondary} onClick={() => { setSearch(''); setPage(1); }}>{c.clearFilters}</button>} />}
      <CmsPagination page={currentPage} pages={pages} onChange={setPage} locale={locale} />
    </section>
    </>}
    {draft && <CmsActionPage title={draft.id ? c.customerDetails : c.newCustomer} description={c.customerNotice} backLabel={cmsCopy[locale].back} onBack={closeAction}>
      <form className={ui.formStack} onSubmit={saveCustomer} noValidate>
        <p className={styles.notice}>{c.customerNotice}</p>
        <div className={styles.detailColumns}>
          <section className={styles.section} aria-label={c.customerDetails}>
            <p className={styles.inputHint}>{c.requiredHint}</p>
            <div className={ui.formGrid}>
              <label className={ui.field}>{c.name} *<input className={ui.input} required maxLength={120} autoComplete="off" value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></label>
              <label className={ui.field}>{c.company}<input className={ui.input} maxLength={160} placeholder={c.companyPlaceholder} autoComplete="off" value={draft.company} onChange={event => setDraft({ ...draft, company: event.target.value })} /></label>
              <label className={ui.field}>{c.email} *<input className={ui.input} type="email" required maxLength={254} placeholder="client@example.com" autoComplete="off" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} /></label>
              <label className={ui.field}>{c.phone} *<input className={ui.input} type="tel" required maxLength={30} autoComplete="off" value={draft.phone} onChange={event => setDraft({ ...draft, phone: event.target.value })} /></label>
              <label className={`${ui.field} ${styles.fullField}`}>{c.addressTh} *<textarea className={ui.textarea} required rows={2} maxLength={500} lang="th" value={draft.address.th} onChange={event => setDraft({ ...draft, address: { ...draft.address, th: event.target.value } })} /></label>
              <label className={`${ui.field} ${styles.fullField}`}>{c.addressEn} *<textarea className={ui.textarea} required rows={2} maxLength={500} lang="en" value={draft.address.en} onChange={event => setDraft({ ...draft, address: { ...draft.address, en: event.target.value } })} /></label>
              <label className={`${ui.field} ${styles.fullField}`}>{c.internalNote}<textarea className={ui.textarea} rows={3} maxLength={2000} placeholder={c.notePlaceholder} value={draft.note} onChange={event => setDraft({ ...draft, note: event.target.value })} /></label>
            </div>
          </section>
          <section className={styles.section} aria-label={c.customerSummary}>
            <div className={styles.card}>
              <h3>{c.customerSummary}</h3>
              <div className={styles.stats}><div><span>{c.orderCount}</span><strong>{history.length}</strong></div><div><span>{c.paidTotal}</span><strong>{money(customerPaidTotal(draft.id, data.orders))}</strong></div></div>
              <p className={ui.muted}>{c.paidTotalHint}</p>
              {draft.id && <p className={ui.muted}>{c.joined}: {formatDate(draft.joined, locale)}</p>}
            </div>
            <div className={styles.card}>
              <h3>{c.history}</h3>
              {history.length ? <div className={styles.history}>{history.map(order => <div className={styles.historyRow} key={order.id}>
                <div><strong>{order.id}</strong><p>{formatDate(order.date, locale)}</p><CmsBadge status={order.status}>{orderStatusCopy[order.status][locale]}</CmsBadge></div>
                <div><strong className={styles.amount}>{money(orderTotal(order))}</strong><CmsBadge status={order.payment}>{paymentStatusCopy[order.payment][locale]}</CmsBadge></div>
              </div>)}</div> : <p className={ui.muted}>{c.noHistory}</p>}
            </div>
          </section>
        </div>
        {error && <p className={ui.error} role="alert">{error}</p>}
        <div className={`${ui.actions} ${styles.saveBar}`}><button type="button" className={ui.secondary} onClick={closeAction}>{c.cancel}</button><button type="submit" className={ui.primary}><Icon name="check" size={18} />{c.saveCustomer}</button></div>
      </form>
    </CmsActionPage>}
    {routeAction && !draft && <CmsActionPage title={cmsCopy[locale].noResults} backLabel={cmsCopy[locale].back} onBack={closeAction}><p className={ui.muted}>{c.noCustomersDescription}</p></CmsActionPage>}
    {detail && <CmsDialog title={c.customerDetails} locale={locale} onClose={() => setDetail(null)} wide><div className={styles.detailColumns}><section className={styles.card}><div className={styles.customerName}><span className={styles.avatar} aria-hidden="true">{Array.from(detail.name)[0]}</span><div><strong>{detail.name}</strong><p className={ui.muted}>{detail.company || c.noCompany}</p></div></div><div className={styles.contactInfo}><span>{detail.email}</span><span>{detail.phone}</span><address>{detail.address[locale]}</address></div>{detail.note && <p>{detail.note}</p>}<p className={ui.muted}>{c.joined}: {formatDate(detail.joined, locale)}</p></section><section className={styles.card}><h3>{c.history}</h3><div className={styles.stats}><div><span>{c.orderCount}</span><strong>{detailHistory.length}</strong></div><div><span>{c.paidTotal}</span><strong>{money(customerPaidTotal(detail.id, data.orders))}</strong></div></div>{detailHistory.length ? <div className={styles.history}>{detailHistory.map(order => <div className={styles.historyRow} key={order.id}><div><strong>{order.id}</strong><p>{formatDate(order.date, locale)}</p></div><strong>{money(orderTotal(order))}</strong></div>)}</div> : <p className={ui.muted}>{c.noHistory}</p>}</section></div></CmsDialog>}
  </>;
}
