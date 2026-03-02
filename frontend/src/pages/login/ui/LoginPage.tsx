import React from 'react';
import { useAuth, AVAILABLE_USERS } from './../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectUser = (user: typeof AVAILABLE_USERS[0]) => {
    login(user);
    if (user.role === 'dispatcher') {
      navigate('/dispatcher');
    } else {
      navigate('/master');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h1>Вход в систему</h1>
      <p>Выберите пользователя:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {AVAILABLE_USERS.map(user => (
          <button
            key={user.id}
            onClick={() => handleSelectUser(user)}
            style={{
              padding: '15px',
              fontSize: '16px',
              cursor: 'pointer',
              backgroundColor: user.role === 'dispatcher' ? '#007bff' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            {user.username} ({user.role === 'dispatcher' ? 'Диспетчер' : 'Мастер'})
          </button>
        ))}
      </div>
    </div>
  );
};