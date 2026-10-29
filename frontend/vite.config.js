import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Check if package is installed in node_modules
const isInstalled = (pkgName) => {
  try {
    const pkgPath = path.resolve(__dirname, 'node_modules', pkgName);
    return fs.existsSync(pkgPath);
  } catch {
    return false;
  }
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ...(!isInstalled('lucide-react')
        ? { 'lucide-react': path.resolve(__dirname, 'src/components/Icons.jsx') }
        : {}),
      ...(!isInstalled('recharts')
        ? { 'recharts': path.resolve(__dirname, 'src/components/RechartsShim.jsx') }
        : {}),
      ...(!isInstalled('socket.io-client')
        ? { 'socket.io-client': path.resolve(__dirname, 'src/components/SocketShim.jsx') }
        : {}),
    },
  },
});
