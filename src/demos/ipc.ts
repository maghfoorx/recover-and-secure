// ipcRenderer is only injected by the Electron preload script; guard so the
// renderer can also load in a plain browser during development.
window.ipcRenderer?.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})
