import React, { useState, useEffect } from 'react';
import { api } from './../../../shared/api/';
import { useAuth } from '../../../shared/context/AuthContext';
export interface User {
  id: number;
  username: string;
  role: 'dispatcher' | 'master';
}
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
export const DispatcherPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [masters, setMasters] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsData, mastersData] = await Promise.all([
        api.getRequests(),
        api.getMasters()
      ]);
      setRequests(requestsData);
      setMasters(mastersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = statusFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === statusFilter);

  const handleAssignMaster = async (requestId: number, masterId: number) => {
    try {
      await api.updateRequest(requestId, { 
        status: 'assigned', 
        assignedTo: masterId 
      });
      await fetchData(); // Обновляем список
    } catch (err) {
      alert('Failed to assign master');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!confirm('Вы уверены, что хотите отменить заявку?')) return;
    
    try {
      await api.updateRequest(requestId, { status: 'canceled' });
      await fetchData();
    } catch (err) {
      alert('Failed to cancel request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Панель диспетчера</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Фильтр по статусу:</label>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '5px' }}
        >
          <option value="all">Все</option>
          <option value="new">Новые</option>
          <option value="assigned">Назначенные</option>
          <option value="in_progress">В работе</option>
          <option value="done">Выполненные</option>
          <option value="canceled">Отмененные</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Клиент</th>
            <th style={thStyle}>Телефон</th>
            <th style={thStyle}>Адрес</th>
            <th style={thStyle}>Проблема</th>
            <th style={thStyle}>Статус</th>
            <th style={thStyle}>Мастер</th>
            <th style={thStyle}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map(request => (
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
                {request.status === 'new' && (
                  <select
                    onChange={(e) => handleAssignMaster(request.id, Number(e.target.value))}
                    defaultValue=""
                    style={{ padding: '5px' }}
                  >
                    <option value="" disabled>Назначить мастера</option>
                    {masters.map(master => (
                      <option key={master.id} value={master.id}>
                        {master.username}
                      </option>
                    ))}
                  </select>
                )}
                {request.assigned_to && (
                  <span>{masters.find(m => m.id === request.assigned_to)?.username || 'Неизвестно'}</span>
                )}
              </td>
              <td style={tdStyle}>
                {request.status !== 'canceled' && request.status !== 'done' && (
                  <button
                    onClick={() => handleCancelRequest(request.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Отменить
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Вспомогательные стили
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