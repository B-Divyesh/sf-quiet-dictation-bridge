import { decodeSignal, encodeSignal } from './core';

type PeerHandlers = {
  onState: (state: RTCPeerConnectionState) => void;
  onMessage: (text: string) => void;
};

async function waitForIce(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return;
  await new Promise<void>((resolve) => {
    const timeout = window.setTimeout(done, 4500);
    function done() {
      window.clearTimeout(timeout);
      pc.removeEventListener('icegatheringstatechange', check);
      resolve();
    }
    function check() { if (pc.iceGatheringState === 'complete') done(); }
    pc.addEventListener('icegatheringstatechange', check);
  });
}

export class LocalPeer {
  private pc = new RTCPeerConnection({ iceServers: [], bundlePolicy: 'max-bundle' });
  private channel?: RTCDataChannel;
  private handlers: PeerHandlers;

  constructor(handlers: PeerHandlers) {
    this.handlers = handlers;
    this.pc.addEventListener('connectionstatechange', () => this.handlers.onState(this.pc.connectionState));
    this.pc.addEventListener('datachannel', (event) => this.bindChannel(event.channel));
  }

  private bindChannel(channel: RTCDataChannel) {
    this.channel = channel;
    channel.addEventListener('open', () => this.handlers.onState('connected'));
    channel.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { type?: string; text?: string };
        if (data.type === 'transcript' && typeof data.text === 'string') this.handlers.onMessage(data.text);
      } catch { /* Invalid peer messages are ignored. */ }
    });
  }

  async createInvitation(): Promise<string> {
    this.bindChannel(this.pc.createDataChannel('quiet-words', { ordered: true }));
    await this.pc.setLocalDescription(await this.pc.createOffer());
    await waitForIce(this.pc);
    if (!this.pc.localDescription) throw new Error('Could not create connection details.');
    return encodeSignal(this.pc.localDescription);
  }

  async answerInvitation(code: string): Promise<string> {
    await this.pc.setRemoteDescription(decodeSignal(code, 'offer'));
    await this.pc.setLocalDescription(await this.pc.createAnswer());
    await waitForIce(this.pc);
    if (!this.pc.localDescription) throw new Error('Could not create an answer.');
    return encodeSignal(this.pc.localDescription);
  }

  async acceptAnswer(code: string): Promise<void> {
    await this.pc.setRemoteDescription(decodeSignal(code, 'answer'));
  }

  sendTranscript(text: string): void {
    if (!this.channel || this.channel.readyState !== 'open') throw new Error('The computer is not connected. Pair again and retry.');
    this.channel.send(JSON.stringify({ type: 'transcript', text, sentAt: new Date().toISOString() }));
  }

  close(): void {
    this.channel?.close();
    this.pc.close();
  }
}
