# Demo dan bahan wawancara

1. Jalankan aplikasi, lalu buka http://localhost:3000.
2. Klik **Tambah agenda** dan buat dua agenda dengan periode berbeda.
3. Cari perihal dan terapkan filter periode.
4. Klik nomor surat untuk membuka detailnya. Buka **Isi Form** pada bagian Kehadiran, catat satu peserta, lalu lihat daftar.
5. Buka **Kirim Form** pada bagian Dokumen, unggah PDF contoh, lalu unduh dari daftar dokumen.
6. Kembali ke dashboard untuk melihat perubahan pada kartu statistik. Coba edit dan hapus satu agenda contoh.
7. Buka http://localhost:3000/docs untuk mendemonstrasikan endpoint REST API.

## Narasi setelah dipelajari dan diuji sendiri
“Proyek awal saya menggunakan CodeIgniter untuk mengelola agenda surat, kehadiran, dan dokumen. Untuk mempelajari kebutuhan posisi ini, saya membuat versi backend NestJS dan TypeScript dengan PostgreSQL, dibantu AI. Saya mempertahankan alur utama proyek dan mempelajari pemisahan controller, service, serta validasi DTO. Perubahan penyimpanannya adalah dokumen kini disimpan sebagai BYTEA di PostgreSQL. Bagian yang saya modifikasi sendiri adalah [isi perubahan nyata].”

## Hal yang perlu bisa dijelaskan
- TypeScript memeriksa tipe saat pengembangan; DTO memvalidasi JSON saat runtime.
- Controller menerima request; service menjalankan logika dan query.
- Dependency injection menyediakan ArchiveService dan Database melalui constructor.
- Foreign key menghubungkan kehadiran/dokumen dengan agenda.
- ON DELETE CASCADE menghapus child ketika agenda dihapus.
- Parameter SQL memisahkan nilai pengguna dari struktur query.
- Penyimpanan BYTEA memudahkan konsistensi proyek kecil, tetapi menambah beban database untuk berkas besar.
- Versi ini belum memiliki login dan belum memigrasikan data lama.

Latihan mandiri: tambahkan filter status pada daftar kehadiran, uji tiga status, lalu buat commit sendiri. Jangan mengklaim seluruh kode ditulis mandiri atau sudah dipakai klien.

## Teks portofolio setelah demo berhasil
Arsip Surat — NestJS Backend Remake. Pengembangan ulang backend proyek CodeIgniter menjadi REST API menggunakan NestJS, TypeScript, dan PostgreSQL. Fitur: CRUD agenda, pencarian/filter periode, pencatatan kehadiran, unggah/unduh dokumen, serta statistik. Proyek belajar dengan bantuan AI; kontribusi pribadi lanjutan: [isi sesuai kenyataan].
