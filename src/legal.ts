import './style.css';

if ('serviceWorker' in navigator && window.isSecureContext) void navigator.serviceWorker.register('/sw.js');
