#!/bin/bash

# Скрипт для тестирования регистрации и входа в DILFwallet

echo "🔐 Тестирование регистрации DILFwallet"
echo "========================================"
echo ""

# Генерируем уникальный email
TIMESTAMP=$(date +%s)
EMAIL="testuser${TIMESTAMP}@example.com"
PASSWORD="password123"

echo "📧 Email: $EMAIL"
echo "🔑 Пароль: $PASSWORD"
echo ""

# Регистрация
echo "1️⃣ Регистрация нового пользователя..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\"}")

echo "Ответ от сервера:"
echo "$REGISTER_RESPONSE" | jq . 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Проверяем успешность
if echo "$REGISTER_RESPONSE" | grep -q "id"; then
    echo "✅ Регистрация успешна!"
    echo ""
    
    # Вход в систему
    echo "2️⃣ Вход в систему с новым аккаунтом..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/login \
      -H "Content-Type: application/x-www-form-urlencoded" \
      -d "username=${EMAIL}&password=${PASSWORD}")
    
    echo "Ответ от сервера:"
    echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
    echo ""
    
    # Извлекаем токен
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token' 2>/dev/null)
    
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        echo "✅ Вход успешен! Получен токен."
        echo ""
        
        # Проверяем профиль
        echo "3️⃣ Проверка профиля пользователя..."
        PROFILE_RESPONSE=$(curl -s http://localhost:8000/me \
          -H "Authorization: Bearer ${TOKEN}")
        
        echo "Ответ от сервера:"
        echo "$PROFILE_RESPONSE" | jq . 2>/dev/null || echo "$PROFILE_RESPONSE"
        echo ""
        
        echo "✅ Проверка профиля успешна!"
        echo ""
        echo "======================================"
        echo "🎉 Все тесты пройдены успешно!"
        echo ""
        echo "Вы можете использовать эти данные для входа:"
        echo "Email: $EMAIL"
        echo "Пароль: $PASSWORD"
        echo "Токен: ${TOKEN:0:50}..."
    else
        echo "❌ Ошибка при входе"
    fi
else
    echo "❌ Ошибка при регистрации"
fi
