'use strict';
// Deliberately no analytics, fetch or saved visitor data.
for (const planner of document.querySelectorAll('[data-planner]')) {
  const checks = [...planner.querySelectorAll('[data-check]')];
  const radios = [...planner.querySelectorAll('[name="trip-style"]')];
  const progress = planner.querySelector('progress');
  const status = planner.querySelector('[data-save-status]');
  const send = planner.querySelector('[data-send-details]');
  function key(label) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
  function fieldValue(names) {
    for (const name of names) {
      const field = document.querySelector(`[name="${name}"], [data-payload-field="${name}"]`);
      if (field && field.value) return field.value;
      const param = new URLSearchParams(window.location.search).get(name);
      if (param) return param;
    }
    return '';
  }
  function payload() {
    const mode = radios.find(r => r.checked);
    const checklist = checks.map(c => {
      const label = c.parentElement.innerText.trim();
      return {key: key(label), label, confirmed: c.checked};
    });
    const details = {
      schema: 'wh_micro_inquiry_details_v1',
      vertical_key: planner.dataset.domain,
      service_key: planner.dataset.serviceKey,
      site_name: planner.dataset.site,
      upsell_variant: mode.value,
      quote_focus: mode.dataset.tip,
      checklist,
      checklist_flags: Object.fromEntries(checklist.map(item => [item.key, item.confirmed]))
    };
    const flightNumber = fieldValue(['flight_number', 'flightNumber', 'flight']);
    const destination = fieldValue(['destination', 'dropoff', 'dropoff_destination']);
    if (flightNumber) details.flight_number = flightNumber;
    if (destination) details.destination = destination;
    return details;
  }
  function lines() {
    const details = payload();
    return [details.site_name, `Request variant: ${details.upsell_variant}`, `Quote focus: ${details.quote_focus}`, '', 'Selected details', ...details.checklist.filter(c => c.confirmed).map(c => '- ' + c.label), '', 'Details still open', ...details.checklist.filter(c => !c.confirmed).map(c => '- ' + c.label), '', 'Structured payload', JSON.stringify(details), '', 'WH-MICRO handles received inquiries the same day.'];
  }
  function update() {
    const count = checks.filter(c => c.checked).length;
    progress.value = count;
    planner.querySelector('[data-progress]').textContent = `${count} of ${checks.length} details come with your inquiry`;
    planner.querySelector('[data-mode-tip]').textContent = radios.find(r => r.checked).dataset.tip;
    if (send && send.dataset.detailsEntry) {
      const url = new URL(send.getAttribute('href'), window.location.href);
      url.searchParams.set(`entry.${send.dataset.detailsEntry}`, JSON.stringify(payload()));
      send.href = url.pathname + url.search + '#inquiry-details';
    }
  }
  for (const control of [...checks, ...radios]) control.addEventListener('change', update);
  planner.querySelector('[data-reset]').addEventListener('click', () => {
    checks.forEach(c => { c.checked = false; });
    radios[0].checked = true; update();
    planner.querySelector('[data-checklist-preview]').hidden = true;
    status.textContent = 'Checklist reset. Nothing has been stored or sent.';
  });
  planner.querySelector('[data-download]').addEventListener('click', () => {
    const preview = planner.querySelector('[data-checklist-preview]');
    const text = lines().join('\n');
    planner.querySelector('[data-checklist-text]').textContent = text;
    preview.hidden = false; preview.open = true;
    const url = URL.createObjectURL(new Blob([text + '\n'], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'quote-details.txt'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Your details are ready below and saved as a text file.';
  });
  update();
}
for (const frame of document.querySelectorAll('iframe[src*="docs.google.com/forms/"]')) {
  const params = new URLSearchParams(window.location.search);
  const entries = [...params].filter(([key]) => key.startsWith('entry.'));
  if (!entries.length) continue;
  const src = new URL(frame.src);
  for (const [key, value] of entries) src.searchParams.set(key, value);
  frame.src = src.href;
}
