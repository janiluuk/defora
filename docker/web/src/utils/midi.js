export async function initMidi(onMessage) {
  if (!navigator.requestMIDIAccess) {
    throw new Error("WebMIDI not supported");
  }
  const access = await navigator.requestMIDIAccess({ sysex: false });
  access.inputs.forEach((input) => {
    input.onmidimessage = (msg) => onMessage && onMessage(input, msg);
  });
  access.onstatechange = () => {
    access.inputs.forEach((input) => {
      input.onmidimessage = (msg) => onMessage && onMessage(input, msg);
    });
  };
  return access;
}
