# CampusMatch frontend

Ứng dụng Next.js cho CampusMatch. Chạy các lệnh sau trong thư mục `frontend`:

```bash
npm install
npm run dev
```

Mở http://localhost:3000. Backend mặc định ở http://localhost:8080/api;
có thể cấu hình lại qua `NEXT_PUBLIC_API_BASE_URL` trong `.env.local`.

Kiểm tra và build:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

### Group content translation (SSU FactChat)

Configure these **server-only** variables in `.env.local` (or your hosting environment):

```dotenv
FACTCHAT_API_KEY=your_school_key
FACTCHAT_MODEL=gpt-5.4-mini
```

Restart Next.js after changing environment variables. Only `FACTCHAT_API_KEY` is
used for authentication. Never prefix this key with `NEXT_PUBLIC_`.

`POST /api/translate` accepts `{ content: { title, description }, targetLang }`.
It translates only these creator-entered fields into `en`, `ko`, or `vi` through
SSU FactChat Chat Completions. Source content is never overwritten. UI labels use
local dictionaries; identities, student IDs, and other group fields are not sent.

Successful translations are cached by model, source text and target language for
one hour, up to 128 entries per server process. Cache is temporary and not shared
between instances. Quota, insufficient credits, access denial and overload have
separate localized messages; there is no simulated translation fallback.

Reference: https://docs.mindlogic.ai/docs/ssu/api-gateway/reference/chat-completions
