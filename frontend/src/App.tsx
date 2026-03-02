import { AuthProvider } from './shared/context/AuthContext';
import { AppRouter } from './app/router/AppRouter';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
