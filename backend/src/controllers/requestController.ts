import { Request, Response } from 'express';
import { RequestRepository } from '../repositories/requestRepository';
import { CreateRequestDto, RequestStatus, UpdateRequestDto } from '../types';
import { z } from 'zod';

const repo = new RequestRepository();

// Схемы валидации
const createRequestSchema = z.object({
  clientName: z.string().min(1, 'Имя клиента обязательно'),
  phone: z.string().min(1, 'Телефон обязателен'),
  address: z.string().min(1, 'Адрес обязателен'),
  problemText: z.string().min(1, 'Описание проблемы обязательно'),
});

const updateRequestSchema = z.object({
  status: z.enum(['new', 'assigned', 'in_progress', 'done', 'canceled']).optional(),
  assignedTo: z.number().int().positive().nullable().optional(),
});

export class RequestController {
  // Создание заявки
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const validated = createRequestSchema.parse(req.body);
      const newRequest = await repo.create(validated);
      return res.status(201).json(newRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.format() });
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Получение списка заявок
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { status, assignedTo } = req.query;
      const filters: {
        status?: RequestStatus;
        assignedTo?: number | null;
      } = {};
      
      if (status && typeof status === 'string' && ['new', 'assigned', 'in_progress', 'done', 'canceled'].includes(status)) {
        filters.status = status as RequestStatus;
      }
      
      if (assignedTo !== undefined && assignedTo !== null) {
        if (assignedTo === 'null') {
          filters.assignedTo = null;
        } else if (typeof assignedTo === 'string') {
          const id = parseInt(assignedTo);
          if (!isNaN(id)) {
            filters.assignedTo = id;
          }
        }
      }
      
      const requests = await repo.findAll(filters);
      return res.json(requests);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Получение заявки по ID
  async getOne(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const request = await repo.findById(id);
      if (!request) {
        return res.status(404).json({ message: 'Request not found' });
      }

      return res.json(request);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Обновление заявки
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID' });
      }

      const validated = updateRequestSchema.parse(req.body);
      
      // Создаем объект с правильными типами для UpdateRequestDto
      const updateData: UpdateRequestDto = {};
      
      if (validated.status !== undefined) {
        updateData.status = validated.status;
      }
      
      if (validated.assignedTo !== undefined) {
        updateData.assignedTo = validated.assignedTo;
      }
      
      const updated = await repo.update(id, updateData);
      if (!updated) {
        return res.status(404).json({ message: 'Request not found' });
      }

      return res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.format() });
      }
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Специальный эндпоинт для взятия в работу
  async takeInProgress(req: Request, res: Response): Promise<Response> {
    try {
      const requestId = parseInt(req.params.id as string);
      const { masterId } = req.body;

      if (isNaN(requestId)) {
        return res.status(400).json({ message: 'Invalid request ID' });
      }
      
      if (!masterId || typeof masterId !== 'number') {
        return res.status(400).json({ message: 'masterId is required and must be a number' });
      }

      const updated = await repo.takeInProgress(requestId, masterId);
      if (!updated) {
        return res.status(409).json({ 
          message: 'Cannot take request: it may be already taken or not assigned to you' 
        });
      }

      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}