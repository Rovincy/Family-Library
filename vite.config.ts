import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // resolve: {
  //   alias: {
  //     // This fixes the Firebase conditional export issue with Vite
  //     firebase: 'firebase/compat/app',
  //     'firebase/auth': 'firebase/compat/auth',
  //     // Add more if you use other Firebase services later
  //     // 'firebase/firestore': 'firebase/compat/firestore',
  //     // 'firebase/storage': 'firebase/compat/storage',
  //   },
  // },
})
