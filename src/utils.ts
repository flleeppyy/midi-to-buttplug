export function scaleVelocity(velocity) {
  return Math.min(1, Math.max(0, velocity / 127));
}

export function isNoteOff(command, velocity) {
  return (command === 8) || (command === 9 && velocity === 0);
}

export function getNoteKey(channel, note) {
  return `${channel}:${note}`;
}