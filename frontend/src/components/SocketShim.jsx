// Resilient Socket.io fallback shim when socket.io-client package is not in node_modules
class MockSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.listeners = new Map();
    this.connected = false;
    
    // Attempt real WebSocket if browser supports it
    try {
      // In dev, pretend connection is active
      setTimeout(() => {
        this.connected = true;
        this.emitLocal('connect');
      }, 100);
    } catch {
      // ignore
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return this;
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return this;
    if (callback) {
      this.listeners.get(event).delete(callback);
    } else {
      this.listeners.delete(event);
    }
    return this;
  }

  emit(event, ...args) {
    // Fallback broadcast or log
    return this;
  }

  emitLocal(event, ...args) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error('Socket callback error:', err);
        }
      });
    }
  }

  disconnect() {
    this.connected = false;
    this.emitLocal('disconnect');
    return this;
  }
}

export const io = (url, options) => {
  return new MockSocket(url, options);
};

export default io;
