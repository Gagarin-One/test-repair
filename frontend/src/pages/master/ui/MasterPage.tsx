import React, { useState, useEffect } from 'react';
import { api } from './../../../shared/api/';
import { useAuth } from '../../../shared/context/AuthContext';
export interface Request {
  id: number;
  client_name: string;
  phone: string;
  address: string;
  problem_text: string;
  status: 'new' | 'assigned' | 'in_progress' | 'done' | 'canceled';
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
}



export const MasterPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const data = await api.getRequests({ assignedTo: user!.id });
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeInProgress = async (requestId: number) => {
    try {
      await api.takeRequest(requestId, user!.id);
      await fetchMyRequests();
    } catch (err) {
      alert('Не удалось взять заявку в работу. Возможно, её уже взял другой мастер.');
    }
  };

  const handleComplete = async (requestId: number) => {
    try {
      await api.updateRequest(requestId, { status: 'done' });
      await fetchMyRequests();
    } catch (err) {
      alert('Failed to complete request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Панель мастера</h1>
      
      {requests.length === 0 ? (
        <p>Нет назначенных заявок</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Клиент</th>
              <th style={thStyle}>Телефон</th>
              <th style={thStyle}>Адрес</th>
              <th style={thStyle}>Проблема</th>
              <th style={thStyle}>Статус</th>
              <th style={thStyle}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>{request.id}</td>
                <td style={tdStyle}>{request.client_name}</td>
                <td style={tdStyle}>{request.phone}</td>
                <td style={tdStyle}>{request.address}</td>
                <td style={tdStyle}>{request.problem_text}</td>
                <td style={tdStyle}>
                  <span style={getStatusStyle(request.status)}>
                    {getStatusText(request.status)}
                  </span>
                </td>
                <td style={tdStyle}>
                  {request.status === 'assigned' && (
                    <button
                      onClick={() => handleTakeInProgress(request.id)}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginRight: '5px'
                      }}
                    >
                      Взять в работу
                    </button>
                  )}
                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => handleComplete(request.id)}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '5px 10px',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      Завершить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const thStyle = {
  padding: '12px',
  textAlign: 'left' as const,
  borderBottom: '2px solid #ddd'
};

const tdStyle = {
  padding: '12px'
};

const getStatusStyle = (status: string) => {
  const styles = {
    new: { backgroundColor: '#007bff', color: 'white', padding: '3px 8px', borderRadius: '3px' },
    assigned: { backgroundColor: '#ffc107', color: 'black', padding: '3px 8px', borderRadius: '3px' },
    in_progress: { backgroundColor: '#17a2b8', color: 'white', padding: '3px 8px', borderRadius: '3px' },
    done: { backgroundColor: '#28a745', color: 'white', padding: '3px 8px', borderRadius: '3px' },
    canceled: { backgroundColor: '#6c757d', color: 'white', padding: '3px 8px', borderRadius: '3px' },
  };
  return styles[status as keyof typeof styles] || styles.new;
};

const getStatusText = (status: string) => {
  const texts = {
    new: 'Новая',
    assigned: 'Назначена',
    in_progress: 'В работе',
    done: 'Выполнена',
    canceled: 'Отменена',
  };
  return texts[status as keyof typeof texts] || status;
};
