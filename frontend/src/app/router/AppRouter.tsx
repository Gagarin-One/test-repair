import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { LoginPage } from '../../pages/login/ui/LoginPage';
import { CreateRequestPage } from '../../pages/create-request/ui/CreateRequestPage';
import { DispatcherPage } from '../../pages/dispatcher/ui/DispatcherPage';
import { MasterPage } from '../../pages/master/ui/MasterPage';
import { useAuth } from '../../shared/context/AuthContext';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'dispatcher' | 'master';
}> = ({ children, allowedRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      {
        <nav
          style={{
            padding: '10px',
            backgroundColor: '#f8f9fa',
            marginBottom: '20px',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
          }}>
          {user ? (
            // Пользователь авторизован
            <>
              <span>
                👤 {user.username} ({user.role === 'dispatcher' ? 'Диспетчер' : 'Мастер'})
              </span>
              <a href="/" style={{ textDecoration: 'none', color: '#007bff' }}>
                Создать заявку
              </a>
              {user.role === 'dispatcher' && (
                <a href="/dispatcher" style={{ textDecoration: 'none', color: '#007bff' }}>
                  Панель диспетчера
                </a>
              )}
              {user.role === 'master' && (
                <a href="/master" style={{ textDecoration: 'none', color: '#007bff' }}>
                  Панель мастера
                </a>
              )}
              <button
                onClick={logout}
                style={{
                  marginLeft: 'auto',
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}>
                Выйти
              </button>
            </>
          ) : (
            // Пользователь не авторизован
            <>
              <a href="/" style={{ textDecoration: 'none', color: '#007bff' }}>
                Создать заявку
              </a>
              <a href="/login" style={{ textDecoration: 'none', color: '#007bff' }}>
                Войти
              </a>
            </>
          )}
        </nav>
      }

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Страница создания заявки - публичная */}
        <Route path="/" element={<CreateRequestPage />} />

        {/* Защищенные маршруты */}
        <Route
          path="/dispatcher"
          element={
            <ProtectedRoute allowedRole="dispatcher">
              <DispatcherPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master"
          element={
            <ProtectedRoute allowedRole="master">
              <MasterPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
