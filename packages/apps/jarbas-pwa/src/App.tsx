import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';

export default function App() {
  const { isAuthenticated, initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, []);

  return isAuthenticated ? <ChatPage /> : <LoginPage />;
}
