import { render } from 'lit';

const fixtureContainers = [];

export async function fixture(template) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  if (template instanceof Node) {
    container.appendChild(template);
  } else if (typeof template === 'string') {
    container.innerHTML = template;
  } else {
    render(template, container);
  }

  fixtureContainers.push(container);

  await Promise.resolve();

  return container.firstElementChild ?? container.firstChild;
}

export function fixtureCleanup() {
  while (fixtureContainers.length > 0) {
    const container = fixtureContainers.pop();
    container.remove();
  }
}

export function oneEvent(target, eventName) {
  return new Promise(resolve => {
    target.addEventListener(eventName, resolve, { once: true });
  });
}
