Базовый URL: http://localhost:3000

Authorization: Bearer <JWT_TOKEN>

Стандартные HTTP-коды:

200 OK — Успешное выполнение запроса.

201 Created — Ресурс успешно создан.

400 Bad Request — Ошибка валидации или переданы неверные параметры.

401 Unauthorized — Токен авторизации отсутствует или недействителен.

403 Forbidden — Недостаточно прав для совершения операции.

404 Not Found — Запрашиваемый ресурс не найден.

500 Internal Server Error — Внутренняя ошибка сервера или БД.

1. Подкасты (/podcasts)
1.1 Получить список всех подкастов
Метод: GET
URL: /podcasts
Параметры: Нет
Доступ: Публичный
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

[
  {
    "id": 1,
    "title": "DevTalk",
    "description": "Разговоры о веб-разработке и IT",
    "author": "DevTalk Team",
    "coverUrl": "https://example.com/cover.jpg",
    "createdAt": "2026-10-07T10:00:00.000Z",
    "updatedAt": "2026-10-07T10:00:00.000Z"
  }
]
Возможные ошибки:

500 Internal Server Error

JSON
{ "error": "Ошибка сервера при получении списка подкастов" }

1.2 Создать новый подкаст
Метод: POST
URL: /podcasts
Параметры: Нет
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса (application/json):

{
  "title": "DevTalk",
  "description": "Разговоры о веб-разработке и IT",
  "author": "DevTalk Team",
  "coverUrl": "https://example.com/cover.jpg"
}

Пример ответа (201 Created):

{
  "id": 1,
  "title": "DevTalk",
  "description": "Разговоры о веб-разработке и IT",
  "author": "DevTalk Team",
  "coverUrl": "https://example.com/cover.jpg",
  "createdAt": "2026-10-07T10:00:00.000Z",
  "updatedAt": "2026-10-07T10:00:00.000Z"
}

Возможные ошибки:

400 Bad Request

{ "error": "Заполните обязательные поля: title и author" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен. Требуются права администратора" }

500 Internal Server Error

{ "error": "Ошибка сервера при создании подкаста" }

1.3 Получить подкаст по ID
Метод: GET
URL: /podcasts/:id
Параметры: id (integer, URL-параметр, обязательный)
Доступ: Публичный
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "id": 1,
  "title": "DevTalk",
  "description": "Разговоры о веб-разработке и IT",
  "author": "DevTalk Team",
  "coverUrl": "https://example.com/cover.jpg",
  "episodes": [
    {
      "id": 1,
      "title": "Выпуск #1",
      "durationMinutes": 30,
      "audioUrl": "https://example.com/audio1.mp3"
    }
  ]
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID подкаста" }

404 Not Found

{ "error": "Подкаст не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при получении подкаста" }

1.4 Полное обновление подкаста (PUT)
Метод: PUT
URL: /podcasts/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса:

{
  "title": "DevTalk Pro",
  "description": "Обновленный подкаст",
  "author": "DevTalk Team",
  "coverUrl": "https://example.com/new-cover.jpg"
}

Пример ответа (200 OK):

{
  "id": 1,
  "title": "DevTalk Pro",
  "description": "Обновленный подкаст",
  "author": "DevTalk Team",
  "coverUrl": "https://example.com/new-cover.jpg",
  "updatedAt": "2026-10-07T10:15:00.000Z"
}

Возможные ошибки:

400 Bad Request

{ "error": "Заполните все обязательные поля для обновления" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подкаст не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при обновлении подкаста" }

1.5 Частичное обновление подкаста (PATCH)
Метод: PATCH
URL: /podcasts/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса:

{
  "coverUrl": "https://example.com/patch-cover.jpg"
}

Пример ответа (200 OK):

{
  "id": 1,
  "title": "DevTalk Pro",
  "description": "Обновленный подкаст",
  "author": "DevTalk Team",
  "coverUrl": "https://example.com/patch-cover.jpg",
  "updatedAt": "2026-10-07T10:20:00.000Z"
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID подкаста" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подкаст не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при изменении подкаста" }

1.6 Удалить подкаст
Метод: DELETE
URL: /podcasts/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "message": "Подкаст успешно удален"
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID подкаста" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подкаст не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при удалении подкаста" }

2. Эпизоды (/episodes)
2.1 Получить список всех эпизодов
Метод: GET
URL: /episodes
Параметры: Нет
Доступ: Публичный
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

[
  {
    "id": 1,
    "title": "Выпуск #1",
    "podcastName": "DevTalk",
    "podcastId": 1,
    "durationMinutes": 35,
    "audioUrl": "https://example.com/audio/test.mp3",
    "playsCount": 12,
    "description": "Тестирование API",
    "isExplicit": false
  }
]

Возможные ошибки:

500 Internal Server Error

{ "error": "Ошибка сервера при получении эпизодов" }

2.2 Создать новый эпизод
Метод: POST
URL: /episodes
Параметры: Нет
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса:

{
  "title": "Выпуск #1",
  "podcastName": "DevTalk",
  "durationMinutes": 35,
  "audioUrl": "https://example.com/audio/test.mp3",
  "description": "Тестирование API",
  "isExplicit": false
}

Пример ответа (201 Created):

{
  "id": 1,
  "title": "Выпуск #1",
  "podcastName": "DevTalk",
  "podcastId": 1,
  "durationMinutes": 35,
  "audioUrl": "https://example.com/audio/test.mp3",
  "playsCount": 0,
  "description": "Тестирование API",
  "isExplicit": false,
  "createdAt": "2026-10-07T10:30:00.000Z"
}

Возможные ошибки:

400 Bad Request

{ "error": "Укажите название, аудио-ссылку и длительность" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подкаст с указанным названием не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при создании эпизода" }

2.3 Получить эпизод по ID
Метод: GET
URL: /episodes/:id
Параметры: id (integer, URL-параметр, обязательный)
Доступ: Публичный
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "id": 1,
  "title": "Выпуск #1",
  "podcastName": "DevTalk",
  "podcastId": 1,
  "durationMinutes": 35,
  "audioUrl": "https://example.com/audio/test.mp3",
  "playsCount": 12,
  "description": "Тестирование API",
  "isExplicit": false,
  "podcast": {
    "id": 1,
    "title": "DevTalk",
    "author": "DevTalk Team"
  }
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID эпизода" }

404 Not Found

{ "error": "Эпизод не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при получении эпизода" }

2.4 Зафиксировать прослушивание эпизода
Метод: POST
URL: /episodes/:id/listen
Параметры: id (integer, URL-параметр, обязательный)
Доступ: Публичный
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "message": "Воспроизведение начато",
  "playsCount": 13
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID эпизода" }

404 Not Found

{ "error": "Эпизод не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при обновлении счетчика" }

2.5 Частичное обновление эпизода (PATCH)
Метод: PATCH
URL: /episodes/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса:

{
  "title": "Обновленное название выпуска",
  "durationMinutes": 40
}

Пример ответа (200 OK):

{
  "id": 1,
  "title": "Обновленное название выпуска",
  "durationMinutes": 40,
  "audioUrl": "https://example.com/audio/test.mp3"
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID эпизода" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Эпизод не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при изменении эпизода" }

2.6 Удалить эпизод
Метод: DELETE
URL: /episodes/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "message": "Эпизод успешно удален",
  "episode": { "id": 1, "title": "Обновленное название выпуска" }
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID эпизода" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Эпизод не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при удалении эпизода" }

3. Подписки (/subscriptions)
3.1 Получить список всех подписок
Метод: GET
URL: /subscriptions
Параметры: Нет
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Авторизованные пользователи (Пользователь видит свои подписки, Admin — все)
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

[
  {
    "id": 1,
    "userId": 1,
    "podcastId": 1,
    "subscribedAt": "2026-10-07T10:40:00.000Z",
    "podcast": {
      "id": 1,
      "title": "DevTalk",
      "coverUrl": "https://example.com/cover.jpg"
    }
  }
]

Возможные ошибки:

401 Unauthorized

{ "error": "Необходима авторизация" }

500 Internal Server Error

{ "error": "Ошибка сервера при получении подписок" }

3.2 Получить подписку по ID
Метод: GET
URL: /subscriptions/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Авторизованные пользователи (Владелец подписки или Admin)
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "id": 1,
  "userId": 1,
  "podcastId": 1,
  "subscribedAt": "2026-10-07T10:40:00.000Z",
  "podcast": {
    "id": 1,
    "title": "DevTalk"
  }
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID подписки" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подписка не найдена" }

500 Internal Server Error

{ "error": "Ошибка сервера при получении подписки" }

3.3 Создать подписку
Метод: POST
URL: /subscriptions
Параметры: Нет
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Авторизованные пользователи
Пример тела запроса:

{
  "podcastId": 1
}

Пример ответа (201 Created / 200 OK):

{
  "id": 1,
  "userId": 1,
  "podcastId": 1,
  "subscribedAt": "2026-10-07T10:40:00.000Z",
  "podcast": {
    "id": 1,
    "title": "DevTalk"
  }
}

Возможные ошибки:

400 Bad Request

{ "error": "Укажите корректный podcastId" }

401 Unauthorized

{ "error": "Необходима авторизация" }

404 Not Found

{ "error": "Подкаст с указанным ID не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при создании подписки" }

3.4 Полное обновление подписки (PUT)
Метод: PUT
URL: /subscriptions/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Владелец подписки или Admin
Пример тела запроса:

{
  "podcastId": 2
}

Пример ответа (200 OK):

{
  "id": 1,
  "userId": 1,
  "podcastId": 2,
  "podcast": {
    "id": 2,
    "title": "Новый подкаст"
  }
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID подкаста" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подкаст не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при обновлении подписки" }

3.5 Частичное обновление подписки (PATCH)
Метод: PATCH
URL: /subscriptions/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Владелец подписки или Admin
Пример тела запроса:

{
  "podcastId": 2
}

Пример ответа (200 OK):

{
  "id": 1,
  "userId": 1,
  "podcastId": 2,
  "podcast": {
    "id": 2,
    "title": "Новый подкаст"
  }
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID подкаста" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подписка не найдена" }

500 Internal Server Error

{ "error": "Ошибка сервера при изменении подписки" }

3.6 Удалить подписку
Метод: DELETE
URL: /subscriptions/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Владелец подписки или Admin
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "message": "Подписка успешно удалена",
  "subscription": {
    "id": 1,
    "userId": 1,
    "podcastId": 1
  }
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID подписки" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Подписка не найдена" }

500 Internal Server Error

{ "error": "Ошибка сервера при удалении подписки" }

4. Пользователи (/users)
4.1 Получить список всех пользователей
Метод: GET
URL: /users
Параметры: Нет
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

[
  {
    "id": 1,
    "email": "listener@podcast.com",
    "role": "user",
    "createdAt": "2026-10-01T08:00:00.000Z"
  },
  {
    "id": 2,
    "email": "admin@podcast.com",
    "role": "admin",
    "createdAt": "2026-10-01T08:00:00.000Z"
  }
]

Возможные ошибки:

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен. Требуются права администратора" }

500 Internal Server Error

{ "error": "Ошибка сервера при получении списка пользователей" }

4.2 Создать пользователя
Метод: POST
URL: /users
Параметры: Нет
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса:

{
  "email": "test_user@example.com",
  "password": "password123",
  "role": "user"
}

Пример ответа (201 Created):

{
  "id": 3,
  "email": "test_user@example.com",
  "role": "user",
  "createdAt": "2026-10-07T10:50:00.000Z"
}

Возможные ошибки:

400 Bad Request

{ "error": "Укажите корректный email и пароль" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

409 Conflict

{ "error": "Пользователь с таким email уже существует" }

500 Internal Server Error

{ "error": "Ошибка сервера при создании пользователя" }

4.3 Изменить роль пользователя (PATCH)
Метод: PATCH
URL: /users/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса:

{
  "role": "admin"
}

Пример ответа (200 OK):

{
  "id": 3,
  "email": "test_user@example.com",
  "role": "admin",
  "updatedAt": "2026-10-07T10:55:00.000Z"
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректная роль пользователя" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Пользователь не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при изменении роли" }

4.4 Удалить пользователя
Метод: DELETE
URL: /users/:id
Параметры: id (integer, URL-параметр, обязательный)
Заголовки: Authorization: Bearer <JWT_TOKEN>
Доступ: Только Admin
Пример тела запроса: Отсутствует
Пример ответа (200 OK):

{
  "message": "Пользователь успешно удален"
}

Возможные ошибки:

400 Bad Request

{ "error": "Некорректный ID пользователя" }

401 Unauthorized

{ "error": "Необходима авторизация" }

403 Forbidden

{ "error": "Доступ запрещен" }

404 Not Found

{ "error": "Пользователь не найден" }

500 Internal Server Error

{ "error": "Ошибка сервера при удалении пользователя" }