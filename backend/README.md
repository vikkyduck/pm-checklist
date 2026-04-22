# PM Checklist Backend

Готовый Node.js + Express + PostgreSQL бэкенд для чек-листа PM Авито.
Поддерживает вход по магической ссылке (email) и хранит прогресс галочек.

---

## Что внутри

- `server.js` — Express-приложение (auth, checklist, email)
- `schema.sql` — схема PostgreSQL
- `package.json` — зависимости
- `.env.example` — шаблон переменных окружения

---

## Развёртывание на Beget

### 1. Создайте PostgreSQL-базу
Панель Beget → **Базы данных** → **Создать базу** → PostgreSQL.
Сохраните: имя БД, пользователь, пароль, хост.

### 2. Создайте Node.js-приложение
Панель Beget → **Сайты** → **Управление сайтом** → **Node.js**.
- Версия Node.js: **18+**
- Корневая папка: `/pm-checklist-backend`
- Файл запуска: `server.js`
- Стартовая команда: `npm start`

### 3. Загрузите файлы
Через FTP (FileZilla) или SSH загрузите всё содержимое папки `backend/` в корень приложения.

### 4. Настройте `.env`
Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
nano .env
```

Сгенерируйте `JWT_SECRET`:
```bash
openssl rand -hex 64
```

SMTP Beget:
- `SMTP_HOST=smtp.beget.com`
- `SMTP_PORT=465`
- `SMTP_SECURE=true`
- `SMTP_USER=` ваш email на домене (создаётся в разделе **Почта**)
- `SMTP_PASSWORD=` пароль этого ящика

### 5. Установите зависимости и схему
В веб-консоли Beget или по SSH:
```bash
cd ~/pm-checklist-backend
npm install
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f schema.sql
```

### 6. Запустите приложение
В панели Beget нажмите **Запустить** для Node.js-приложения.

### 7. Получите URL
Beget даст URL вида `https://your-app.beget.tech` или ваш домен.
Передайте его агенту Lovable — он впишет его в `VITE_API_URL` фронта.

---

## Развёртывание на Timeweb

Аналогично Beget. Отличия:
- SMTP: `smtp.timeweb.ru:465` (SSL)
- Раздел Node.js-приложений в панели Timeweb Cloud Apps

---

## Эндпоинты API

| Метод | Путь | Назначение | Auth |
|---|---|---|---|
| `POST` | `/auth/magic-link` | Отправить ссылку на email. Body: `{email, name}` | — |
| `GET` | `/auth/verify?token=...` | Проверить токен из письма → JWT | — |
| `GET` | `/me` | Профиль PM | JWT |
| `GET` | `/checklist` | Прогресс PM | JWT |
| `PUT` | `/checklist` | Сохранить прогресс. Body: `{progress: {itemId: bool}}` | JWT |

---

## Локальная разработка

```bash
npm install
cp .env.example .env       # заполнить значения
psql ... -f schema.sql
npm start                  # http://localhost:3000
```
