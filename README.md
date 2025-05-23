# MIDI to Buttplug

This script allows you to convert *multiple* MIDI notes (velocity sensitive) to messages sent to [Buttplug.io](https://buttplug.io/) devices, through [Intiface](https://intiface.com/central/) using the `buttplug` client package.

1. Get [loopmidi](https://www.tobias-erichsen.de/software/loopmidi.html) and install it.
2. After install, create a new port and call it loopMIDI (or whatever the default is)
3. Copy `.env.example` to `.env` and fill it out accordingly
4. In your DAW, enable the loopback MIDI port created by loopmidi, and allow MIDI to be sent to it.
5. Install the script with `pnpm install`
6. Run the script with `pnpm dev`
7. Send midi to the loopback device
8. question why you did this

## Notes

- This script supports note-per-device (untested), based off of what devices are free. In theory, you can have multiple devices connected, and whatever devices are free and not taken up by a note, will get assigned that note and vibrate.
- Killing Midi-to-Buttplug will force all devices in Intiface to disconnect, and you'll have to reconnect them


## License

The code for this project is licensed under [MIT](LICENSE) but the libraries used may have differing license.
