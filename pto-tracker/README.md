# PTO Tracker

Учёт отпусков и больничных для малого бизнеса. Владелец/менеджер видит всех сотрудников и одобряет заявки, сотрудник подаёт заявки и следит за своим балансом. Вход без паролей — magic link на почту.

## Стек

- **Next.js 16 (App Router)** — фронтенд + бэкенд (Route Handlers) в одном проекте
- **Supabase** — Postgres + auth (magic link)
- **Resend** — email-уведомления
- **Tailwind CSS 4**
- **react-day-picker** — календари

## Настройка

### 1. Supabase

1. Создайте проект на [supabase.com](https://supabase.com).
2. В SQL Editor выполните миграцию из `supabase/migrations/0001_init.sql` — она создаёт таблицы `companies`, `users`, `requests`, `company_settings` и политики RLS.
3. В **Authentication → Providers** включите Email (magic link/OTP уже включён по умолчанию для нового проекта). Отключите подтверждение пароля — используется только magic link.
4. В **Authentication → URL Configuration** добавьте `http://localhost:3000/auth/callback` и продовый домен (`https://yourapp.vercel.app/auth/callback`) в Redirect URLs.
5. Скопируйте из **Project Settings → API**: `Project URL`, `anon public key`, `service_role key`.

### 2. Resend

1. Зарегистрируйтесь на [resend.com](https://resend.com), создайте API key.
2. Подтвердите домен отправки (или используйте тестовый `onboarding@resend.dev` на старте).

### 3. Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните:

```bash
cp .env.example .env.local
```

| Переменная | Назначение |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL проекта Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Публичный anon key (используется в браузере и SSR) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (только сервер — используется в Route Handlers для privileged-записей) |
| `RESEND_API_KEY` | Ключ Resend для отправки писем |
| `RESEND_FROM_EMAIL` | Адрес отправителя, напр. `PTO Tracker <notifications@yourdomain.com>` |
| `NEXT_PUBLIC_SITE_URL` | Публичный URL приложения (для ссылок в письмах и magic-link redirect) |

### 4. Запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000). Первый вход по email становится владельцем — онбординг создаёт компанию, дефолтные дни и (опционально) список сотрудников. Сотрудники, добавленные владельцем, входят по тому же email через magic link и попадают сразу в свой дашборд.

## Архитектура доступа

- Все чтения идут через Supabase-клиент с RLS: сотрудник видит только свои заявки, владелец — всё в своей компании (см. `auth_user_row()` и политики в миграции — сопоставление идёт по email из JWT, а не по `auth.uid()`, так как профиль сотрудника создаётся до его первого входа).
- Все записи (создание заявки, одобрение/отклонение, добавление сотрудника, изменение баланса) идут через Route Handlers (`app/api/**`) с `service_role` клиентом (`lib/supabase/admin.ts`), после ручной проверки сессии и роли внутри каждого хендлера.

## Логика начисления дней

- `days_count` = количество будних дней (Пн–Пт) между `start_date` и `end_date` включительно (`lib/business-days.ts`).
- При одобрении заявки `pto_balance_days`/`sick_balance_days` сотрудника уменьшается на `days_count`; при отклонении баланс не меняется.

## Деплой на Vercel

1. Запушьте репозиторий в GitHub, импортируйте в Vercel.
2. Добавьте те же переменные окружения из `.env.local` в настройках проекта Vercel.
3. Обновите `NEXT_PUBLIC_SITE_URL` на продовый домен и добавьте `<домен>/auth/callback` в Supabase Redirect URLs.
