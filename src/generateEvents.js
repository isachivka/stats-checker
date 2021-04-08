import random from 'lodash/random';

export default function generateEvent(count, config) {
  const emptyEvents = [...new Array(count)];

  return emptyEvents.map(() => {
    const rand = random(1, 100);
    const events = config.map(chance => rand <= chance);
    return events;
  })
}
