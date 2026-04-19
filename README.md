# rhmt Labs (Simple Gemini Chat Workspace)

Aplikasi chat single-page yang sekarang dirombak total jadi lebih sederhana dan terstruktur.

## Halaman Utama

- **Halaman Chat**: tampilan fokus untuk chat teks + upload foto.
- **Halaman Histori**: daftar semua percakapan untuk dibuka ulang.

## Fitur

- UI/UX minimalis, bersih, dan responsif.
- Multi-chat dengan histori tersimpan di `localStorage`.
- Upload beberapa foto sekaligus untuk vision prompt.
- Integrasi Gemini API melalui endpoint `/api/chat`.
- Siap deploy ke Vercel.

## Deploy ke Vercel

1. Import repo ini ke Vercel.
2. Tambahkan Environment Variable:
   - `GEMINI_API_KEY=<api_key_anda>`
3. Deploy.

## Endpoint

- `POST /api/chat`
  - Body:
    - `prompt: string`
    - `images?: string[]` (base64 data URL)
    - `history?: { role: 'user'|'assistant', text?: string, images?: string[] }[]`
    - `mode?: 'chat' | 'image_generate' | 'image_edit'`
    - `model?: string`

## Catatan

Nama produk sekarang menjadi **rhmt Labs**.
