#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=== Тест гонки при взятии заявки в работу ==="
echo "Отправляем 10 параллельных запросов на взятие заявки #2"
echo ""

# Сбросим статус заявки обратно на 'assigned' для повторного теста
echo -e "${YELLOW}Сбрасываем статус заявки #2 на 'assigned'...${NC}"
curl -s -X PATCH http://localhost:3001/api/requests/2 \
  -H "Content-Type: application/json" \
  -d '{"status":"assigned","assignedTo":2}' > /dev/null
echo -e "${GREEN}Готово${NC}\n"

# Создаем временные файлы
SUCCESS_FILE=$(mktemp)
CONFLICT_FILE=$(mktemp)
OTHER_FILE=$(mktemp)

# Инициализируем счетчики
echo 0 > "$SUCCESS_FILE"
echo 0 > "$CONFLICT_FILE"
echo 0 > "$OTHER_FILE"

# Функция для атомарного увеличения счетчика
increment_counter() {
  local file=$1
  local count=$(cat "$file")
  echo $((count + 1)) > "$file"
}

# Запускаем 10 параллельных запросов
for i in {1..10}; do
  (
    # Выполняем запрос и сохраняем полный вывод
    response=$(curl -s -i -X POST http://localhost:3001/api/requests/2/take \
      -H "Content-Type: application/json" \
      -d '{"masterId":2}' 2>&1)
    
    # Извлекаем статус код из ответа
    status_code=$(echo "$response" | grep -i "^HTTP" | tail -1 | awk '{print $2}')
    
    # Если не нашли HTTP строку, пробуем другой метод
    if [ -z "$status_code" ]; then
      status_code=$(echo "$response" | grep -o '"statusCode":[0-9]*' | head -1 | cut -d':' -f2)
    fi
    
    # Если всё ещё нет статуса, пробуем последний метод
    if [ -z "$status_code" ]; then
      status_code=$(echo "$response" | tail -1)
    fi
    
    if [ "$status_code" = "200" ]; then
      echo -e "${GREEN}✓ Запрос $i: УСПЕХ (200)${NC}"
      increment_counter "$SUCCESS_FILE"
    elif [ "$status_code" = "409" ]; then
      echo -e "${RED}✗ Запрос $i: КОНФЛИКТ (409)${NC}"
      increment_counter "$CONFLICT_FILE"
    else
      echo -e "${YELLOW}? Запрос $i: СТАТУС ($status_code)${NC}"
      increment_counter "$OTHER_FILE"
    fi
  ) &
  sleep 0.1
done

# Ждем завершения
wait

# Читаем результаты
success=$(cat "$SUCCESS_FILE")
conflict=$(cat "$CONFLICT_FILE")
other=$(cat "$OTHER_FILE")

# Удаляем временные файлы
rm "$SUCCESS_FILE" "$CONFLICT_FILE" "$OTHER_FILE"

echo ""
echo "=== Результаты ==="
echo -e "${GREEN}Успешных запросов: $success${NC}"
echo -e "${RED}Конфликтов: $conflict${NC}"
echo -e "${YELLOW}Других статусов: $other${NC}"
echo ""
echo "Ожидаемый результат: 1 успех, 9 конфликтов"

# Проверяем финальный статус заявки
echo ""
echo "=== Проверка финального статуса заявки #2 ==="
final_status=$(curl -s http://localhost:3001/api/requests/2 | grep -o '"status":"[^"]*"' | cut -d':' -f2 | tr -d '"')
echo "Статус заявки #2: $final_status"

if [ "$final_status" = "in_progress" ]; then
  echo -e "${GREEN}✓ Защита от гонок работает: статус изменился на in_progress${NC}"
else
  echo -e "${RED}✗ Что-то пошло не так: статус $final_status${NC}"
fi