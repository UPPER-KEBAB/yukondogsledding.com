'use strict';
for (const form of document.querySelectorAll('[data-enquiry-form]')) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = form.querySelector('[data-enquiry-status]');
    const button = form.querySelector('button[type=submit]');
    button.disabled = true;
    status.textContent = 'Storing your enquiry…';
    try {
      const response = await fetch(form.action, {
        method: 'POST', body: new URLSearchParams(new FormData(form)),
        credentials: 'omit', signal: AbortSignal.timeout(15000)
      });
      const result = await response.json();
      if (response.status !== 202 || !/^[a-f0-9-]{36}$/.test(result.receipt || '')) {
        status.textContent = response.status === 429 ? 'Too many attempts. Please try again later.' : 'Your enquiry was not accepted. Check your details and try again.';
        return;
      }
      status.textContent = `Enquiry stored. Receipt: ${result.receipt}. Operator notification is pending or already delivered. This is not a booking confirmation.`;
      form.reset();
    } catch {
      status.textContent = 'We could not confirm storage. You may retry the same enquiry; duplicates are detected.';
    } finally { button.disabled = false; }
  });
}
