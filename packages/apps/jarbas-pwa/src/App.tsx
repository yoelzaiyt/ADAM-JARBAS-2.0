import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useChatStore } from './store/chatStore';
import { useAgentsStore } from './store/agentsStore';
import { LoginPage } from './pages/LoginPage';
import { ChatPage } from './pages/ChatPage';

export default function App() {
  const { isAuthenticated, initFromStorage } = useAuthStore();
  const hydrateChat = useChatStore(s => s.hydrate);
  const hydrateAgents = useAgentsStore(s => s.hydrate);

  useEffect(() => {
    initFromStorage();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      hydrateChat();
      hydrateAgents();
    }
  }, [isAuthenticated]);

  return isAuthenticated ? <ChatPage /> : <LoginPage />;
}
