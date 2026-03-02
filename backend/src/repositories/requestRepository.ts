import { pool } from '../config/database';
import { Request, CreateRequestDto, UpdateRequestDto, RequestStatus } from '../types';

export class RequestRepository {
  // Создание новой заявки
  async create(data: CreateRequestDto): Promise<Request> {
    const { clientName, phone, address, problemText } = data;
    const result = await pool.query<Request>(
      `INSERT INTO requests (client_name, phone, address, problem_text, status)
       VALUES ($1, $2, $3, $4, 'new')
       RETURNING *`,
      [clientName, phone, address, problemText]
    );
    
    const request = result.rows[0];
    if (!request) {
      throw new Error('Failed to create request: no data returned');
    }
    
    return request;
  }

  // Получение всех заявок (с фильтром по статусу и мастеру)
  async findAll(filters?: { status?: RequestStatus; assignedTo?: number | null }): Promise<Request[]> {
    let query = 'SELECT * FROM requests WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(filters.status);
    }
    if (filters?.assignedTo !== undefined) {
      if (filters.assignedTo === null) {
        query += ` AND assigned_to IS NULL`;
      } else {
        query += ` AND assigned_to = $${paramIndex++}`;
        values.push(filters.assignedTo);
      }
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query<Request>(query, values);
    return result.rows;
  }

  // Получение заявки по ID
  async findById(id: number): Promise<Request | null> {
    const result = await pool.query<Request>('SELECT * FROM requests WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  // Обновление заявки
// В src/repositories/requestRepository.ts обновите метод update:
async update(id: number, data: UpdateRequestDto): Promise<Request | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  // Обрабатываем status
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }

  // Обрабатываем assignedTo
  if (data.assignedTo !== undefined) {
    fields.push(`assigned_to = $${paramIndex++}`);
    values.push(data.assignedTo);
  }

  // Всегда обновляем updated_at
  fields.push(`updated_at = CURRENT_TIMESTAMP`);

  // Если нет полей для обновления (кроме updated_at), возвращаем текущую запись
  if (fields.length === 1) { // только updated_at
    return this.findById(id);
  }

  const query = `UPDATE requests SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
  values.push(id);

  const result = await pool.query<Request>(query, values);
  return result.rows[0] || null;
}
  // Специальный метод для взятия в работу (с блокировкой строки)
  async takeInProgress(requestId: number, masterId: number): Promise<Request | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Блокируем строку для обновления
      const lockQuery = 'SELECT * FROM requests WHERE id = $1 FOR UPDATE';
      const lockResult = await client.query(lockQuery, [requestId]);
      if (lockResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      const request = lockResult.rows[0] as Request;

      // Проверяем, что заявка в статусе 'assigned' и назначена на этого мастера
      if (request.status !== 'assigned' || request.assigned_to !== masterId) {
        await client.query('ROLLBACK');
        return null; // можно позже вернуть ошибку с конкретной причиной
      }

      // Обновляем статус
      const updateResult = await client.query(
        'UPDATE requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        ['in_progress', requestId]
      );

      await client.query('COMMIT');
      return updateResult.rows[0] || null;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}