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
- openapi-typescript (типы из `openapi.auctions.v0.json`)
- ESLint + Prettier
- GitHub Actions CI (`lint` / `format` / `test` / `build` + drift-check codegen)
- a11y: семантическая разметка, ARIA, focus trap, skip link, Error Boundary

## Быстрый старт

```bash
npm install
npm run dev
```

Приложение: http://localhost:5173

MSW автоматически перехватывает запросы к `/api/v1/*` в dev-режиме.

## Скрипты

| Команда                | Описание                             |
| ---------------------- | ------------------------------------ |
| `npm run generate:api` | Codegen типов из OpenAPI             |
| `npm run check:api`    | Проверка drift сгенерированных типов |
| `npm run dev`          | Dev-сервер                           |
| `npm run build`        | Production-сборка                    |
| `npm run preview`      | Превью сборки                        |
| `npm run test`         | Vitest + RTL + MSW                   |
| `npm run test:watch`   | Тесты в watch-режиме                 |
| `npm run lint`         | ESLint                               |
| `npm run lint:fix`     | ESLint с автоисправлением            |
| `npm run format`       | Prettier — форматирование            |
| `npm run format:check` | Prettier — проверка без записи       |

## OpenAPI codegen

Типы API не пишутся руками. Источник правды — `openapi.auctions.v0.json`.

```bash
npm run generate:api
```

Пайплайн:

1. `scripts/prepare-openapi.mjs` — для response-схем проставляет `required` по всем properties  
   (в исходной схеме почти нет `required`, иначе codegen делает всё optional)
2. `openapi-typescript` → `src/shared/api/schema.generated.ts`
3. `src/shared/api/types.ts` — тонкий фасад: алиасы схем + runtime `ApiError`

Генерация также запускается автоматически в `predev` / `prebuild` / `pretest`.  
CI падает, если `schema.generated.ts` не совпадает с перегенерацией.

## Архитектура (FSD)

```
src/
├── app/          # providers, layout, styles, entry
├── widgets/      # auction-list, auction-detail, bets-list
├── features/     # auction-filters, set-bet
├── entities/     # auction (api, ui, lib)
├── shared/       # api, ui-kit, mocks, config, lib
└── routes/       # TanStack Router pages (+ 404 catch-all)
```

## Маршруты

| URL                    | Описание                                       |
| ---------------------- | ---------------------------------------------- |
| `/`                    | Список аукционов с фильтрами и пагинацией      |
| `/auctions/:uuid`      | Детальная карточка аукциона                    |
| `/auctions/:uuid/bets` | История ставок                                 |
| `/auctions/:uuid/bet`  | Форма установки ставки (открывается по ссылке) |
| `/*`                   | 404                                            |

## Фильтры

Синхронизируются с URL search params. Zod-схема `auctionSearchParamsSchema` валидирует параметры с безопасными fallback-значениями.

Поддерживаемые фильтры: `cargo_num`, `status`, `statuses`, `auc_type`, `load_city`, `unload_city`, `load_date_from/to`, `is_available`, `is_bidder`, `current_price_from/to`.

На mobile drawer остаётся открытым при правках фильтров; закрытие — по «Показать результаты», Escape или backdrop.

## MSW

In-memory store (`shared/mocks/store.ts`) обновляется при POST `/auctions/:uuid/bets`:

- добавляется новая ставка текущего пользователя
- пересчитывается текущая цена и торговый статус
- места в рейтинге считаются по экономике типа аукциона (Down/FixPrice — ниже лучше)
- синхронизируются list/detail DTO (`is_available` не затирается)

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
9. **Mobile**: фильтры через drawer на ширине < 1024px, несколько правок без авто-закрытия
10. **404 / retry**: неизвестный URL → 404; на ошибке запроса — кнопка «Повторить»

## Тесты

Стек: **Vitest** + **React Testing Library** + **MSW node server**.

```bash
npm run test
```

Покрыто:

- search params: Zod-парсинг, merge/serialize, request builder, active filter chips
- ViewModel-маппер карточки и `resolveAuctionCardAction`
- validation schema ставки (min/max/step)
- UI: Button, Input, Alert
- SetBetForm: unavailable state, submit валидной ставки, клиентская валидация min
- MSW handlers: фильтры, пагинация, 404/422, mutation ставки, пересчёт place, edge-case флаги

## Доступность (a11y)

- Skip link «Перейти к основному содержимому»
- Landmarks: `header` + `nav`, `main`, `footer`, `aside`, `section`, `article`
- Иерархия заголовков: `h1` на странице, `h2` в карточках и секциях
- Формы: `label` + `htmlFor`, `aria-describedby`, `aria-invalid`, `fieldset`/`legend`
- Фильтры: `role="search"`, mobile drawer — `role="dialog"`, focus trap, Escape, `aria-expanded`
- Списки: `ul`/`ol`/`li`, пагинация — `nav` + `aria-label`
- Данные: `dl`/`dt`/`dd` для пар ключ-значение
- Live regions: `aria-live` для счётчика результатов и toast-уведомлений
- Error Boundary на уровне root outlet
- `prefers-reduced-motion` — отключение анимаций
- Телефоны — кликабельные `tel:` ссылки

## Соответствие ТЗ

| Требование ТЗ                                                                       | Статус     |
| ----------------------------------------------------------------------------------- | ---------- |
| Обязательный стек (React/TS/Vite/Router/Query/RHF+Zod/MSW/FSD/Zustand)              | ✅         |
| 4 endpoint’а OpenAPI + mutable MSW                                                  | ✅         |
| Список: Query, пагинация, skeleton/empty/error, prefetch, URL+Zod фильтры, adaptive | ✅         |
| Минимальный набор фильтров                                                          | ✅         |
| Карточка: поля + primary action                                                     | ✅         |
| Деталка + ограничения DTO                                                           | ✅         |
| Ставки + hide_bets_history                                                          | ✅         |
| Форма ставки + invalidation + toast + 422                                           | ✅         |
| `*.component.tsx`                                                                   | ✅         |
| AI_USAGE.md + README                                                                | ✅         |
| Минимальные тесты на чистую логику                                                  | ✅ (+ MSW) |

## Ограничения

- Нет e2e-тестов (Playwright) — есть unit + RTL + MSW integration
- UI-kit минимальный, без Radix/Shadcn (на усмотрение кандидата по ТЗ)
- В исходном OpenAPI почти нет `required` — перед codegen их проставляет prepare-скрипт для response-схем
- Нет auth flow (Bearer-токен не требуется для MSW)

## AI Usage

См. [AI_USAGE.md](./AI_USAGE.md)
