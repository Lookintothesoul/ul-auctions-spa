# UL Auctions SPA

Frontend SPA для работы с грузовыми аукционами по OpenAPI-схеме `openapi.auctions.v0.json`.

## Стек

- React 19 + TypeScript + Vite
- TanStack Router (file-based routing, prefetch по intent)
- TanStack Query (кеш, invalidation после mutations)
- React Hook Form + Zod
- MSW (моки с изменяемым in-memory store)
- Feature-Sliced Design
- Zustand (UI-state: мобильная панель фильтров)
- Tailwind CSS 4
- ESLint + Prettier
- a11y: семантическая разметка, ARIA, focus trap, skip link

## Быстрый старт

```bash
npm install
npm run dev
```

Приложение: http://localhost:5173

MSW автоматически перехватывает запросы к `/api/v1/*` в dev-режиме.

## Скрипты

| Команда                | Описание                       |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Dev-сервер                     |
| `npm run build`        | Production-сборка              |
| `npm run preview`      | Превью сборки                  |
| `npm run test`         | Vitest + RTL                   |
| `npm run test:watch`   | Тесты в watch-режиме           |
| `npm run lint`         | ESLint                         |
| `npm run lint:fix`     | ESLint с автоисправлением      |
| `npm run format`       | Prettier — форматирование      |
| `npm run format:check` | Prettier — проверка без записи |

## Архитектура (FSD)

```
src/
├── app/          # providers, layout, styles, entry
├── pages/        # (routes через TanStack Router file-based)
├── widgets/      # auction-list, auction-detail, bets-list
├── features/     # auction-filters, set-bet
├── entities/     # auction (api, ui, lib)
├── shared/       # api, ui-kit, mocks, config, lib
└── routes/       # TanStack Router pages
```

## Маршруты

| URL                    | Описание                                       |
| ---------------------- | ---------------------------------------------- |
| `/`                    | Список аукционов с фильтрами и пагинацией      |
| `/auctions/:uuid`      | Детальная карточка аукциона                    |
| `/auctions/:uuid/bets` | История ставок                                 |
| `/auctions/:uuid/bet`  | Форма установки ставки (открывается по ссылке) |

## Фильтры

Синхронизируются с URL search params. Zod-схема `auctionSearchParamsSchema` валидирует параметры с безопасными fallback-значениями.

Поддерживаемые фильтры: `cargo_num`, `status`, `statuses`, `auc_type`, `load_city`, `unload_city`, `load_date_from/to`, `is_available`, `is_bidder`, `current_price_from/to`.

## MSW

In-memory store (`shared/mocks/store.ts`) обновляется при POST `/auctions/:uuid/bets`:

- добавляется новая ставка текущего пользователя
- пересчитывается текущая цена и торговый статус
- синхронизируются list/detail DTO

Seed-данные покрывают edge cases:

- активный аукцион Down с возможностью ставки
- аукцион Up где пользователь лидирует
- завершённый аукцион (can_set_bet=false)
- скрытая история ставок (`hide_bets_history`)
- скрытые адреса/контакты
- `no_view_cargo_price`

## Проверка (ручные сценарии)

1. **Список**: открыть `/`, убедиться в skeleton → данные, пагинация работает
2. **Фильтры**: выбрать город погрузки «Пермь», проверить URL и результат
3. **Prefetch**: навести на карточку → детальная страница открывается быстро
4. **Деталь**: открыть аукцион, проверить маршрут, организатора, торги
5. **Ставки**: `/auctions/:uuid/bets` — список, победитель, отменённые
6. **Скрытая история**: аукцион `00000001062` — сообщение о скрытии
7. **Ставка**: `/auctions/:uuid/bet` — форма, валидация min/max/step, success toast
8. **422**: ввести цену ниже min — ошибка валидации от MSW
9. **Mobile**: фильтры через drawer на ширине < 1024px

## Тесты

Стек: **Vitest** (Jest-совместимый API) + **React Testing Library** + **@testing-library/user-event**.  
Vitest выбран вместо чистого Jest, потому что проект на Vite — так проще и быстрее без отдельного babel/jest-рантайма.

```bash
npm run test
npm run test:watch
```

Покрыто:

- search params: Zod-парсинг, merge/serialize, request builder
- ViewModel-маппер карточки и `resolveAuctionCardAction`
- validation schema ставки (min/max/step)
- UI: Button, Input, Alert (a11y-роли, disabled/loading)
- SetBetForm: unavailable state, submit валидной ставки, клиентская валидация min

## Доступность (a11y)

- Skip link «Перейти к основному содержимому»
- Landmarks: `header` + `nav`, `main`, `footer`, `aside`, `section`, `article`
- Иерархия заголовков: `h1` на странице, `h2` в карточках и секциях
- Формы: `label` + `htmlFor`, `aria-describedby`, `aria-invalid`, `fieldset`/`legend`
- Фильтры: `role="search"`, mobile drawer — `role="dialog"`, focus trap, Escape, `aria-expanded`
- Списки: `ul`/`ol`/`li`, пагинация — `nav` + `aria-label`
- Данные: `dl`/`dt`/`dd` для пар ключ-значение
- Live regions: `aria-live` для счётчика результатов и toast-уведомлений
- Декоративные иконки: `aria-hidden="true"`
- `prefers-reduced-motion` — отключение анимаций
- Телефоны — кликабельные `tel:` ссылки

## Ограничения

- Нет e2e-тестов (Playwright) — есть unit + RTL
- UI-kit минимальный, без Radix/Shadcn (на усмотрение кандидата по ТЗ)
- OpenAPI-типы написаны вручную (openapi-typescript несовместим с текущим TS)
- Нет auth flow (Bearer-токен не требуется для MSW)

## AI Usage

См. [AI_USAGE.md](./AI_USAGE.md)
