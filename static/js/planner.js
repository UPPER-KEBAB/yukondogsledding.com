'use strict';
// Deliberately no storage, analytics, fetch or personal information.
for (const planner of document.querySelectorAll('[data-planner]')) {
  const checks = [...planner.querySelectorAll('[data-check]')];
  const radios = [...planner.querySelectorAll('[name="trip-style"]')];
  const progress = planner.querySelector('progress');
  const status = planner.querySelector('[data-save-status]');
  function update() {
    const count = checks.filter(c => c.checked).length;
    progress.value = count;
    planner.querySelector('[data-progress]').textContent = `${count} of ${checks.length} details confirmed`;
    planner.querySelector('[data-mode-tip]').textContent = radios.find(r => r.checked).dataset.tip;
  }
  for (const control of [...checks, ...radios]) control.addEventListener('change', update);
  planner.querySelector('[data-reset]').addEventListener('click', () => {
    checks.forEach(c => { c.checked = false; });
    radios[0].checked = true; update();
    planner.querySelector('[data-checklist-preview]').hidden = true;
    status.textContent = 'Checklist reset. Nothing has been stored or sent.';
  });
  planner.querySelector('[data-download]').addEventListener('click', () => {
    const mode = radios.find(r => r.checked);
    const lines = [planner.dataset.site, `Trip style: ${mode.value}`, `Focus: ${mode.dataset.tip}`, '', 'CONFIRMED', ...checks.filter(c => c.checked).map(c => '[x] ' + c.parentElement.innerText.trim()), '', 'STILL TO ASK', ...checks.filter(c => !c.checked).map(c => '[ ] ' + c.parentElement.innerText.trim()), '', 'Planning only. Confirm arrangements directly with your chosen provider.', 'WH-MICRO / Nicholas Huchet / upperkebab@gmail.com'];
    const preview = planner.querySelector('[data-checklist-preview]');
    planner.querySelector('[data-checklist-text]').textContent = lines.join('\n');
    preview.hidden = false; preview.open = true;
    const url = URL.createObjectURL(new Blob([lines.join('\n') + '\n'], {type:'text/plain;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'trip-checklist.txt'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.textContent = 'Your checklist is ready below and prepared for download. No enquiry was sent.';
  });
  update();
}
