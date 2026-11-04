# Arsip Surat — NestJS 

Aplikasi web dengan frontend Bootstrap serta REST API berbasis NestJS, TypeScript dan PostgreSQL, dibuat ulang berdasarkan https://github.com/ekahasbihabibi/arsip-surat pada commit `5e6d4f556a87fe2916569041c87544884d2aa7e1`.

Versi asli menggunakan CodeIgniter. Layout, CSS, dan alur agenda, surat, kehadiran, serta dokumen diadaptasi dari versi tersebut. Halaman web memakai REST API NestJS pada server yang sama. Bootstrap dan Bootstrap Icons disertakan di dalam proyek agar tampilan dapat dimuat tanpa CDN.

## Menjalankan di Windows
Prasyarat: Node.js 22 atau lebih baru, npm, Docker Desktop.

1. Ekstrak ZIP. Buka terminal di folder yang berisi package.json.
2. Salin `.env.example` menjadi `.env`: `copy .env.example .env` (PowerShell: `Copy-Item .env.example .env`).
3. Jalankan `docker compose up -d` dan tunggu PostgreSQL siap.
4. Jalankan `npm ci`.
5. Jalankan `npm run build` lalu `npm start`.
6. Buka http://localhost:3000 untuk dashboard. Dokumentasi REST API tersedia di http://localhost:3000/docs.

Untuk macOS/Linux, gunakan `cp .env.example .env`. Tanpa Docker, buat database PostgreSQL, isi DATABASE_URL, dan jalankan schema.sql dengan psql atau pgAdmin.

Database dimulai kosong. Skrip schema.sql dipasang otomatis saat volume baru dibuat. Volume proyek ini terpisah dari proyek latihan sebelumnya karena nama folder Compose berbeda. Jika port 5432 sudah terpakai, ubah port host di compose.yaml dan DATABASE_URL secara bersamaan. Jangan menghapus volume berisi data penting.

## Pemetaan fitur
| Fitur asli | REST API baru |
|---|---|
| Daftar dan pencarian agenda | GET /api/agendas?q=rapat&periode=November%202026 |
| Tambah agenda | POST /api/agendas |
| Edit agenda | PATCH /api/agendas/:id |
| Hapus agenda | DELETE /api/agendas/:id |
| Daftar/detail surat | GET /api/surat dan /api/surat/:id |
| Statistik empat kartu | GET /api/summary |
| Pilihan periode | GET /api/periods |
| Form dan daftar kehadiran | POST dan GET /api/agendas/:id/kehadiran |
| Unggah dan daftar dokumen | POST dan GET /api/agendas/:id/dokumen |
| Unduh dokumen | GET /api/dokumen/:id/download |

Parameter page dan limit tersedia pada daftar agenda/surat (limit maksimum 100).

### Contoh agenda
```json
{"nomor_surat":"001/IT/2026","perihal":"Rapat koordinasi","periode":"November 2026","zoom_url":"https://zoom.us/j/123456"}
```
### Contoh kehadiran
```json
{"nama":"Peserta Contoh","instansi":"Tim IT","status":"Hadir","catatan":""}
```
Status yang diterima: Hadir, Izin, Tidak Hadir. Unggah menggunakan multipart/form-data dengan nama_pengirim, judul_dokumen, catatan opsional, dan file_dokumen. Maksimal 5 MB; ekstensi PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG.

## Struktur kode
- src/main.ts: bootstrap, dependency injection, validasi global, Swagger.
- public/: layout, template, dan JavaScript frontend.
- src/frontend.ts: penyajian halaman dan aset frontend.
- src/dto.ts: tipe request dan aturan validasi.
- src/archive.controller.ts: endpoint HTTP dan validasi unggahan.
- src/archive.service.ts: logika aplikasi, query PostgreSQL, dan unduhan.
- schema.sql: tiga tabel dan relasi.
- test/api.test.cjs: tes integrasi HTTP dengan emulator pg-mem.

Relasi: satu agenda mempunyai banyak attendances dan documents. Query memakai parameter SQL. Nomor surat tidak dipaksa unik, mengikuti validasi aplikasi asli. PATCH parsial, pencarian, dan pagination tersedia.

## Perbedaan penyimpanan
Asli memakai file_path pada filesystem. Versi latihan ini menyimpan isi berkas sebagai BYTEA dalam tabel documents, sehingga penghapusan agenda dengan cascade menghapus metadata dan isi berkas bersama-sama. Tidak ada file_path. Data lama dan lampiran asli belum dimigrasikan. Jangan mengimpor dump MySQL langsung ke PostgreSQL.

## Pengujian dan batasan
Build TypeScript dan tes HTTP lulus di lingkungan pembuat menggunakan pg-mem. Tes mencakup CRUD, pencarian, filter periode, relasi, statistik, validasi URL/status/null, upload/download dengan kesamaan byte, ekstensi terlarang, batas 5 MB, dan cascade delete. Alur dashboard, CRUD agenda, pencarian, filter, detail surat, kehadiran, serta unggah dan unduh dokumen juga diuji di Chromium dengan pg-mem. PostgreSQL asli belum diuji karena Docker/PostgreSQL tidak tersedia di lingkungan pembuat. Jalankan `npm run build` dan `npm test`, lalu coba kembali dengan PostgreSQL asli.

Ini proyek latihan lokal tanpa autentikasi/otorisasi. Unggahan diperiksa berdasarkan ekstensi dan ukuran, belum dipindai malware atau diverifikasi format biner. Gunakan data contoh. Pengembangan berikutnya: login, hak akses, storage terpisah, dan pemeriksaan format berkas. Server hanya mendengarkan localhost. Kredensial compose adalah contoh lokal.

Instalasi memakai ignore-scripts dalam .npmrc. `npm run start:dev` hanya mengawasi kompilasi; restart server setelah kode berubah.

## Referensi
- Sumber proyek: https://github.com/ekahasbihabibi/arsip-surat
- NestJS: https://docs.nestjs.com/
- Validasi: https://docs.nestjs.com/techniques/validation
- Upload: https://docs.nestjs.com/techniques/file-upload
- SQL parameter: https://node-postgres.com/features/queries

Lisensi sumber disertakan di LICENSE-ORIGINAL. Implementasi remake disusun dengan bantuan AI untuk dipelajari dan dikembangkan lebih lanjut.
