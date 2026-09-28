/* Shared behaviour for the twelve-page static project.
   This is a clearly labelled classroom demo, not real authentication or payment. */
'use strict';
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const ITEMS = window.NEXT_LEVEL_ITEMS;
  const KEYS = { profile: 'nextlevel.profile', draft: 'nextlevel.draft', bookings: 'nextlevel.bookings', last: 'nextlevel.last', next: 'nextlevel.next' };
  const money = (cents) => 'R' + (cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  function read(key, fallback = null) { try { return JSON.parse(sessionStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
  function write(key, value) { try { sessionStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
  function storageError(target) { const node = $(target); if (node) node.textContent = 'Browser storage is unavailable. Allow session storage and open the project through a local web server or GitHub Pages.'; }
  function today() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
  function markError(id, message) {
    const input = $('#' + id); const error = $('#' + id + '-error');
    if (input) { input.setAttribute('aria-invalid', String(Boolean(message))); input.setAttribute('aria-describedby', id + '-error'); }
    if (error) error.textContent = message;
    return !message;
  }
  function validName(id) { return markError(id, $('#' + id).value.trim() ? '' : 'Please enter your name.'); }
  function validEmail(id) { const input = $('#' + id); return markError(id, input.value.trim() && input.validity.valid ? '' : 'Enter a valid email address.'); }
  function validPhone(id) {
    const value = $('#' + id).value.trim(); const digits = value.replace(/\D/g, '');
    return markError(id, /^\+?[\d\s()-]+$/.test(value) && digits.length >= 7 && digits.length <= 15 ? '' : 'Enter a valid phone number with 7–15 digits.');
  }
  function validPassword(id) { return markError(id, $('#' + id).value.length >= 6 ? '' : 'Use at least 6 characters for the demo password.'); }
  function focusError() { $('[aria-invalid="true"]')?.focus(); }

  // Use integer cents, so discounts and VAT are rounded to the nearest cent.
  function calculate(ids) {
    const selected = ITEMS.filter((item) => new Set(ids).has(item.id));
    const count = selected.length;
    const rate = count > 3 ? 15 : count === 3 ? 10 : count === 2 ? 5 : 0;
    const subtotal = selected.reduce((sum, item) => sum + item.price * 100, 0);
    const discount = Math.round(subtotal * rate / 100);
    const discounted = subtotal - discount;
    const vat = Math.round(discounted * 15 / 100);
    return { selected, rate, subtotal, discount, discounted, vat, total: discounted + vat };
  }
  // A small public calculator helper also makes the calculation easy to test.
  window.NextLevel = { calculate };
  const page = document.body.dataset.page;
  const profile = read(KEYS.profile);
  if (document.body.dataset.protected === 'true' && !profile) {
    write(KEYS.next, location.pathname.split('/').pop() + location.search);
    location.replace('account.html#signin');
    return;
  }
  if (profile) {
    $('#account-nav').innerHTML = '<a class="btn small" href="my-bookings.html">My bookings</a><button class="btn small" id="signout" type="button">Sign out</button>';
    $('#signout').addEventListener('click', () => {
      Object.values(KEYS).forEach((key) => { try { sessionStorage.removeItem(key); } catch {} });
      location.href = 'index.html';
    });
    if ($('#welcome')) $('#welcome').textContent = `Welcome, ${profile.name}. Your next session starts here.`;
  }

  if (page === 'account') {
    const showTab = (name) => {
      ['signin', 'signup'].forEach((tab) => {
        const active = name === tab;
        $('#' + tab + '-tab').setAttribute('aria-selected', String(active));
        $('#' + tab + '-tab').tabIndex = active ? 0 : -1;
        $('#' + tab + '-panel').hidden = !active;
      });
    };
    showTab(location.hash === '#signup' ? 'signup' : 'signin');
    window.addEventListener('hashchange', () => showTab(location.hash === '#signup' ? 'signup' : 'signin'));
    ['signin', 'signup'].forEach((name) => {
      $('#' + name + '-tab').addEventListener('click', () => { location.hash = name; showTab(name); });
      $('#' + name + '-tab').addEventListener('keydown', (event) => {
        if (['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); const next = name === 'signin' ? 'signup' : 'signin'; showTab(next); $('#' + next + '-tab').focus(); }
      });
    });
    function finishLogin(person) {
      if (!write(KEYS.profile, person)) { storageError('#storage-error'); return; }
      const next = read(KEYS.next, 'home.html');
      // Only allow local project pages as a return destination.
      const safe = /^(home|booking|fees|confirmation|my-bookings)\.html(?:\?[^#]*)?$/.test(next) ? next : 'home.html';
      try { sessionStorage.removeItem(KEYS.next); } catch {}
      location.href = safe;
    }
    $('#signin-form').addEventListener('submit', (event) => {
      event.preventDefault(); const valid = [validEmail('signin-email'), validPassword('signin-password')].every(Boolean);
      if (!valid) { focusError(); return; }
      finishLogin({ name: 'Player', email: $('#signin-email').value.trim(), phone: '' });
    });
    $('#signup-form').addEventListener('submit', (event) => {
      event.preventDefault(); const valid = [validName('first-name'), validName('surname'), validEmail('signup-email'), validPhone('signup-phone'), validPassword('signup-password'), markError('confirm-password', $('#confirm-password').value === $('#signup-password').value ? '' : 'Passwords do not match.')].every(Boolean);
      if (!valid) { focusError(); return; }
      finishLogin({ name: $('#first-name').value.trim() + ' ' + $('#surname').value.trim(), email: $('#signup-email').value.trim(), phone: $('#signup-phone').value.trim() });
    });
  }

  if (page === 'booking') {
    const form = $('#booking-form');
    const draft = read(KEYS.draft, { ids: [], attendees: '1', area: '0', date: '' });
    const query = new URLSearchParams(location.search);
    const item = ITEMS.find((entry) => entry.id === query.get('item'));
    if (item && !draft.ids.includes(item.id)) draft.ids.push(item.id);
    const area = query.get('area');
    $('#booking-area').value = ['0', '1', '2', '3'].includes(area) ? area : draft.area || '0';
    $('#gamer-pass').value = draft.ids.includes('ultimate') ? 'ultimate' : '';
    $('#vip').value = draft.ids.includes('vip') ? 'yes' : 'no';
    $('#package').value = draft.ids.find((id) => !['ultimate', 'vip'].includes(id)) || '';
    $('#attendees').value = draft.attendees || '1';
    $('#booking-date').min = today(); $('#booking-date').value = draft.date || '';
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const date = $('#booking-date').value;
      if (!markError('booking-date', date && date >= today() ? '' : 'Choose today or a future date.')) { focusError(); return; }
      // These five controls build an initial selection. More checkboxes are available on Fees.
      const ids = [$('#gamer-pass').value, $('#vip').value === 'yes' ? 'vip' : '', $('#package').value].filter(Boolean);
      const next = { ids: [...new Set(ids)], area: $('#booking-area').value, attendees: $('#attendees').value, date };
      if (!write(KEYS.draft, next)) { storageError('#booking-error'); return; }
      location.href = 'fees.html';
    });
    $('.center a[href="fees.html"]').addEventListener('click', (event) => { event.preventDefault(); form.requestSubmit(); });
  }

  if (page === 'fees') {
    let quote = null;
    let submitting = false;
    const draft = read(KEYS.draft, { ids: [], attendees: '1', area: '0', date: '' });
    $('#customer-name').value = profile.name;
    $('#customer-email').value = profile.email;
    $('#customer-phone').value = profile.phone || '';
    $$('input[name="items"]').forEach((input) => { input.checked = draft.ids.includes(input.value); });
    function invalidate() {
      quote = null; $('#quote-section').hidden = true; $('#quote-status').textContent = '';
      $$('[data-tier]').forEach((element) => element.classList.remove('selected'));
    }
    $('#fees-form').addEventListener('input', invalidate);
    $('#fees-form').addEventListener('change', invalidate);
    $('#fees-form').addEventListener('submit', (event) => {
      event.preventDefault(); invalidate();
      const ids = $$('input[name="items"]:checked').map((input) => input.value);
      $('#selection-error').textContent = ids.length ? '' : 'Select at least one package or experience.';
      const valid = [validName('customer-name'), validPhone('customer-phone'), validEmail('customer-email')].every(Boolean);
      if (!valid || !ids.length) { if (!valid) focusError(); else $('input[name="items"]').focus(); return; }
      quote = calculate(ids);
      draft.ids = ids;
      write(KEYS.draft, draft);
      $('#quote-items').innerHTML = quote.selected.map((item) => `<tr><td>${escapeHTML(item.name)}</td><td>${money(item.price * 100)}</td></tr>`).join('');
      const rows = [['Subtotal', quote.subtotal], [`Discount (${quote.rate}%)`, -quote.discount], ['After discount', quote.discounted], ['VAT (15%)', quote.vat], ['TOTAL QUOTED FEE', quote.total]];
      $('#quote-totals').innerHTML = rows.map(([label, value], index) => `<tr class="${index === 4 ? 'total' : ''}"><th scope="row">${label}</th><td>${value < 0 ? '− ' : ''}${money(Math.abs(value))}</td></tr>`).join('');
      $(`[data-tier="${quote.rate}"]`).classList.add('selected');
      $('#quote-section').hidden = false;
      $('#quote-status').textContent = 'Quotation calculated. Please review your total.';
      $('#quote-heading').focus();
    });
    function submitBooking(status) {
      if (!quote || submitting) return;
      submitting = true;
      const id = 'NL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 5).toUpperCase();
      const record = { id, status, name: $('#customer-name').value.trim(), email: $('#customer-email').value.trim(), phone: $('#customer-phone').value.trim(), contactMethod: $('#contact-method').value, date: draft.date || 'To be confirmed', attendees: draft.attendees || '1', area: draft.area || '0', quote, created: new Date().toISOString() };
      const bookings = read(KEYS.bookings, []);
      bookings.push(record);
      if (!write(KEYS.bookings, bookings)) { submitting = false; storageError('#quote-status'); return; }
      write(KEYS.last, id);
      write(KEYS.draft, { ids: [], attendees: '1', area: '0', date: '' });
      location.href = 'confirmation.html';
    }
    $('#request-booking').addEventListener('click', () => submitBooking('Requested'));
    $('#demo-payment').addEventListener('click', () => submitBooking('Demo paid'));
  }

  if (page === 'confirmation') {
    const last = read(KEYS.last);
    const record = read(KEYS.bookings, []).find((entry) => entry.id === last);
    if (record) {
      const paid = record.status === 'Demo paid';
      $('#confirmation-title').textContent = paid ? 'PAYMENT CONFIRMED — DEMO' : 'BOOKING REQUEST SAVED — DEMO';
      $('#confirmation-message').textContent = paid ? 'Your simulated payment is complete. No money was charged and no venue was reserved.' : 'Your demo request has been saved in this browser tab. In the real service, a consultant would contact you to confirm availability and complete registration. No request was sent.';
      $('#confirmation-details').textContent = `${record.id} · ${money(record.quote.total)} including VAT · ${record.date}`;
    }
  }

  if (page === 'my-bookings') {
    const records = read(KEYS.bookings, []);
    if (records.length) {
      $('#booking-history').className = 'booking-list';
      $('#booking-history').innerHTML = records.slice().reverse().map((record) => `<article class="record"><p class="status">${escapeHTML(record.status)}</p><h2>${escapeHTML(record.id)}</h2><dl>${[['Name', record.name], ['Packages', record.quote.selected.map((item) => item.name).join(', ')], ['Date', record.date], ['Attendees', record.attendees], ['Venue', 'Johannesburg'], ['Total including VAT', money(record.quote.total)]].map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl></article>`).join('');
    }
  }

  if (page === 'contact') {
    const contact = window.NEXT_LEVEL_CONTACT;
    function contactLink(target, href, text) { const link = document.createElement('a'); link.className = 'text-link'; link.href = href; link.textContent = text; $(target).replaceChildren(link); }
    if (contact.phone) contactLink('#arena-phone', 'tel:' + contact.phone.replace(/[^+\d]/g, ''), contact.phone);
    if (contact.email) contactLink('#arena-email', 'mailto:' + contact.email, contact.email);
    if (Array.isArray(contact.social) && contact.social.length) {
      $('#arena-social').textContent = '';
      contact.social.forEach((entry) => {
        if (!/^https:\/\//.test(entry.url)) return;
        const a = document.createElement('a'); a.href = entry.url; a.textContent = entry.name; a.className = 'btn small'; a.target = '_blank'; a.rel = 'noopener noreferrer'; $('#arena-social').append(a, ' ');
      });
    }
    if (contact.address) {
      $('#arena-address').textContent = contact.address;
      const frame = document.createElement('iframe'); frame.title = 'Map and directions to Next Level Gaming & Esports Arena'; frame.width = '100%'; frame.height = '360'; frame.style.border = '0'; frame.loading = 'lazy'; frame.referrerPolicy = 'no-referrer-when-downgrade'; frame.src = 'https://maps.google.com/maps?q=' + encodeURIComponent(contact.address) + '&output=embed';
      const link = document.createElement('a'); link.className = 'btn'; link.textContent = 'Open directions'; link.href = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(contact.address); link.target = '_blank'; link.rel = 'noopener noreferrer'; $('#arena-map').replaceChildren(frame, link);
    }
  }
})();
