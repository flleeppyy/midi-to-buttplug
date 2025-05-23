import midi from "midi";
import bp from "buttplug";
import { getNoteKey, isNoteOff, scaleVelocity } from "./utils";
import dotenv from "dotenv";

const env = dotenv.config();
const bpServerPort = env.parsed.WS_PORT || 12345
const midiDevice = env.parsed.MIDI_DEVICE || "loopMIDI";

const input = new midi.Input();

const portCount = input.getPortCount();
let found = false;

for (let i = 0; i < portCount; i++) {
	const name = input.getPortName(i);
	if (name.startsWith(midiDevice)) {
		console.log(`Opening port ${i}: ${name}`);
		input.openPort(i);
		found = true;
		break;
	}
}

if (!found) {
	console.error("No port starting with 'loopMIDI' found.");
	process.exit(1);
}

const bpClient = new bp.ButtplugClient("ableton");

const reconnectBp = async () => {
  try {
    await bpClient.connect(
      new bp.ButtplugNodeWebsocketClientConnector(
        `ws://127.0.0.1:${bpServerPort}/buttplug`
      )
    );
    console.log("Connected to Buttplug Server.");
  } catch (e) {
    console.error("Buttplug Connection Failed:", e);
  }
};
reconnectBp();

const activeNotes = new Map();

input.on("message", async (deltaTime, message) => {
  if (!Array.isArray(message) || message.length < 3) {
    console.warn("Invalid MIDI message received:", message);
    return;
  }

  const [status, note, velocity] = message;
  const command = status >> 4;
  const channel = status & 0xf;

  try {
    const noteKey = getNoteKey(channel, note);
    const scaledVelocity = scaleVelocity(velocity);

    if (!bpClient?.devices || bpClient.devices.length === 0) {
      console.warn("No connected devices.");
      return;
    }

    if (isNoteOff(command, velocity)) {
      const device = activeNotes.get(noteKey);
      if (device) {
        await device.stop();
        activeNotes.delete(noteKey);
      }
    } else if (command === 9 && velocity > 0) {
      if (!activeNotes.has(noteKey)) {
        const usedDevices = new Set(activeNotes.values());
        const freeDevice = bpClient.devices.find(d => !usedDevices.has(d));

        if (freeDevice) {
          await freeDevice.vibrate(scaledVelocity);
          activeNotes.set(noteKey, freeDevice);
          console.log(`Note ${noteKey} assigned to device ${freeDevice.displayName}.`);
        } else {
          console.warn("All devices in use.");
        }
      }
    }
  } catch (error) {
    console.error("Error handling MIDI message:", error);
  }
});

let isShuttingDown = false;

process.on('SIGINT', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log('Caught SIGINT. Disconnecting bpClient...');
  
  try {
    await bpClient.disconnect();
    console.log('bpClient disconnected. Exiting process.');
  } catch (err) {
    console.error('Error during disconnect:', err);
  }

  process.exit(0);
});
