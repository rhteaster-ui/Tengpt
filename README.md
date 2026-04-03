# Tengpt (Gemini ChatGPT-style UI)

Aplikasi chat single-page yang tampilannya dibuat mirip alur ChatGPT, tetapi memakai **Gemini API**.

## Fitur

- UI chat yang rapi dan responsif (desktop + mobile).
- Multi-chat dengan riwayat tersimpan di `localStorage`.
- Mode normal chat dengan model default **`gemini-2.5-flash`**.
- Upload gambar untuk vision prompt.
- Mode **Image Generate** dan **Image Edit** (menggunakan model image generation Gemini jika tersedia di akun).
- Animasi indikator mengetik.
- Render code block markdown sederhana.
- Siap deploy di Vercel.

## Deploy ke Vercel

1. Import repo ini ke Vercel.
2. Tambahkan Environment Variable:
   - `GEMINI_API_KEY=<api_key_anda>`
3. Deploy.

Selesai. Tidak perlu setup lain.

## Endpoint

- `POST /api/chat`
  - Body:
    - `prompt: string`
    - `images?: string[]` (base64 data URL)
    - `history?: { role: 'user'|'assistant', text?: string, images?: string[] }[]`
    - `mode?: 'chat' | 'image_generate' | 'image_edit'`
    - `model?: string`

## Catatan

Model image generation Gemini bisa berbeda per project/region/allowlist. Jika model image tertentu belum aktif di project Anda, mode tersebut akan mengembalikan error dari Gemini API secara langsung.
