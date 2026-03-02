# Сервис заявок в ремонтную службу

## Описание
Веб-приложение для приема и обработки заявок в ремонтную службу с разделением ролей  и защитой от гонок.

## Функционал
- Создание заявки (доступно всем)
- Панель диспетчера: просмотр всех заявок, фильтрация, назначение мастера, отмена
- Панель мастера: просмотр назначенных заявок, взятие в работу, завершение
- Защита от параллельных запросов при взятии в работу

## Технологии
- **Frontend**: React, TypeScript, Vite, FSD архитектура
- **Backend**: Node.js, Express, TypeScript, PostgreSQL
- **База данных**: PostgreSQL
- **Документация**: DECISIONS.md, PROMPTS.md

## Запуск проекта

### Способ 1: Локальный запуск

#### Требования
- Node.js 18+
- PostgreSQL 15+

#### Бэкенд
bash

cd backend
npm install
npm run dev

#### Фронтенд
cd frontend
npm install
npm run dev

#### База данных
# Создайте базу данных и пользователя
CREATE USER "user" WITH PASSWORD 'password';
CREATE DATABASE repair_db OWNER "user";

# Запустите миграции (файл database/init.sql)

### Способ 2: Docker Compose

### Требования
- Docker Desktop (для Mac/Windows) или Docker Engine (для Linux)
- Docker Compose (входит в состав Docker Desktop)
### Быстрый старт

 **Клонируйте репозиторий**

   git clone <url-репозитория>
   cd repair-requests
   docker-compose up -d

   Дождитесь инициализации 

    Откройте приложение

    Фронтенд: http://localhost:5173

    Бэкенд API: http://localhost:3001/api

# Проверка защиты от гонок
Скрипт отправляет 10 параллельных запросов на взятие заявки. Ожидаемый результат: 1 успех, 9 конфликтов.

bash
./race_test.sh

# 1. http://localhost:5173/ - страница создания заявки
# 2. http://localhost:5173/dispatcher - панель диспетчера (войдите как dispatcher1)
# 3. http://localhost:5173/master - панель мастера (войдите как master1)


# Структура проекта
repair-requests/
├── frontend/          # React приложение (FSD архитектура)
├── backend/           # Node.js сервер
├── database/          # SQL миграции и сиды
└── infra/            # Docker конфигурация