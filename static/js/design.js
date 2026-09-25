'use strict';
// Local presentation controls. No requests, cookies or saved visitor data.
for (const widget of document.querySelectorAll('[data-choice]')) {
  const buttons = [...widget.querySelectorAll('[data-choice-index]')];
  let selected = 0;
  for (const button of buttons) button.addEventListener('click', () => {
    selected = Number(button.dataset.choiceIndex);
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    widget.querySelector('[data-choice-output]').textContent = button.dataset.choiceTip;
  });
  widget.querySelector('[data-choice-link]').addEventListener('click', () => {
    const radio = document.querySelectorAll('[data-planner] [name="trip-style"]')[selected];
    if (radio) { radio.checked = true; radio.dispatchEvent(new Event('change', {bubbles:true})); }
  });
}
for (const widget of document.querySelectorAll('[data-topics]')) {
  const buttons = [...widget.querySelectorAll('[data-topic]')];
  const panels = [...widget.querySelectorAll('[data-topic-panel]')];
  for (const button of buttons) button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    panels.forEach(panel => { panel.hidden = panel.dataset.topicPanel !== button.dataset.topic; });
  });
}
