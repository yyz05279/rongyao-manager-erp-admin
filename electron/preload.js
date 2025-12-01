const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用版本
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // 获取应用路径
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // 获取用户数据路径
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  
  // 平台信息
  platform: process.platform,
  
  // 应用版本
  version: process.versions.electron,
  
  // 发送消息到主进程
  send: (channel, data) => {
    const validChannels = ['app-message'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // 接收来自主进程的消息
  receive: (channel, func) => {
    const validChannels = ['app-message'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  
  // 移除监听器
  removeListener: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

