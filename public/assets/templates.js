const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) =>
    ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[char]);

const kb = (bytes) => new Intl.NumberFormat('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1}).format(bytes / 1024);
const date = (value) => new Intl.DateTimeFormat('id-ID', {dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Jakarta'}).format(new Date(value));
const safeUrl = (value) => /^https?:\/\//i.test(value ?? '');

export const dashboard = ({totalAgenda,totalPeriode,totalKehadiran,totalDokumen,agendas,keyword,periodeFilter,periodeOptions,pager}) => `
<section class="hero-panel mb-4 mb-lg-5">
    <div class="row align-items-center g-4">
        <div class="col-lg-8">
            <span class="eyebrow"><i class="bi bi-grid-1x2-fill"></i> Dashboard Administrasi</span>
            <h1 class="display-6 fw-bold mt-3 mb-2">Arsip, kehadiran, dan dokumen.</h1>
            <p class="text-secondary mb-0">Buat agenda, catat kehadiran, terima unggahan dokumen, dan bagikan satu tautan Zoom.</p>
        </div>
        <div class="col-lg-4 text-lg-end">
            <button class="btn btn-primary btn-lg px-4" data-bs-toggle="modal" data-bs-target="#agendaModal" id="addAgendaButton">
                <i class="bi bi-plus-lg me-2"></i>Tambah agenda
            </button>
        </div>
    </div>
</section>



<div class="row g-3 mb-4">
    <div class="col-md-3 col-6">
        <div class="stat-card h-100">
            <span class="stat-icon bg-primary-subtle text-primary"><i class="bi bi-envelope-paper-fill"></i></span>
            <div><span class="stat-label">Agenda</span><strong>${esc(totalAgenda)}</strong></div>
        </div>
    </div>
    <div class="col-md-3 col-6">
        <div class="stat-card h-100">
            <span class="stat-icon bg-info-subtle text-info-emphasis"><i class="bi bi-calendar2-week-fill"></i></span>
            <div><span class="stat-label">Periode</span><strong>${esc(totalPeriode)}</strong></div>
        </div>
    </div>
    <div class="col-md-3 col-6">
        <div class="stat-card h-100">
            <span class="stat-icon bg-success-subtle text-success"><i class="bi bi-person-check-fill"></i></span>
            <div><span class="stat-label">Kehadiran</span><strong>${esc(totalKehadiran)}</strong></div>
        </div>
    </div>
    <div class="col-md-3 col-6">
        <div class="stat-card h-100">
            <span class="stat-icon bg-warning-subtle text-warning-emphasis"><i class="bi bi-file-earmark-arrow-up-fill"></i></span>
            <div><span class="stat-label">Dokumen</span><strong>${esc(totalDokumen)}</strong></div>
        </div>
    </div>
</div>

<section class="content-card">
    <div class="p-3 p-lg-4 border-bottom">
        <form action="/" method="get" class="row g-2">
            <div class="col-lg-7">
                <label for="search" class="visually-hidden">Cari agenda</label>
                <div class="input-group">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-secondary"></i></span>
                    <input id="search" type="search" name="q" maxlength="100" value="${esc(keyword)}" class="form-control border-start-0 ps-0" placeholder="Cari nomor surat atau perihal...">
                </div>
            </div>
            <div class="col-sm-8 col-lg-3">
                <label for="periodeFilter" class="visually-hidden">Filter periode</label>
                <select id="periodeFilter" name="periode" class="form-select">
                    <option value="">Semua periode</option>
                    ${periodeOptions.map(option => `
                        <option value="${esc(option)}" ${periodeFilter === option ? 'selected' : ''}>${esc(option)}</option>
                    `).join("")}
                </select>
            </div>
            <div class="col-sm-4 col-lg-2 d-grid"><button class="btn btn-outline-primary" type="submit">Terapkan</button></div>
        </form>
    </div>

    <div class="table-responsive" role="region" aria-label="Tabel agenda" tabindex="0">
        <table class="table align-middle mb-0 agenda-table">
            <thead>
                <tr>
                    <th>No. Surat</th>
                    <th>Perihal</th>
                    <th>Periode</th>
                    <th>Akses Agenda</th>
                    <th class="text-end">Aksi</th>
                </tr>
            </thead>
            <tbody>
            ${agendas.length === 0 ? `
                <tr><td colspan="5">
                    <div class="empty-state">
                        <span><i class="bi bi-inbox"></i></span>
                        <h2 class="h5 mt-3">Belum ada agenda</h2>
                        <p class="text-secondary mb-3">${(keyword !== '' || periodeFilter !== '') ? 'Tidak ada data yang sesuai dengan pencarian.' : 'Tambahkan agenda pertama untuk mulai.'}</p>
                        ${keyword !== '' || periodeFilter !== '' ? `
                            <a href="/" class="btn btn-sm btn-outline-secondary">Reset pencarian</a>
                        ` : `
                            <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#agendaModal">Tambah agenda</button>
                        `}
                    </div>
                </td></tr>
            ` : `
                ${agendas.map(agenda => `
                    <tr>
                        <td>
                            <a class="mail-number" href="/surat/${agenda.id}" title="Buka halaman surat">
                                ${esc(agenda.nomor_surat)}<i class="bi bi-arrow-up-right-square ms-1 small"></i>
                            </a>
                        </td>
                        <td>
                            <div class="fw-semibold text-dark">${esc(agenda.perihal)}</div>
                            <small class="text-secondary">${esc(agenda.attendance_count)} kehadiran &middot; ${esc(agenda.document_count)} dokumen</small>
                        </td>
                        <td><span class="badge text-bg-light border fw-medium">${esc(agenda.periode)}</span></td>
                        <td>
                            <div class="agenda-action-panel">
                                <div class="agenda-action-row">
                                    <span class="agenda-action-title"><i class="bi bi-person-check"></i>Kehadiran</span>
                                    <div class="agenda-action-links">
                                        <a href="/agenda/${agenda.id}/kehadiran/isi" title="Isi form kehadiran"><i class="bi bi-pencil-square"></i>Form</a>
                                        <a href="/agenda/${agenda.id}/kehadiran" title="Lihat daftar kehadiran"><i class="bi bi-list-check"></i>Daftar</a>
                                    </div>
                                </div>
                                <div class="agenda-action-row">
                                    <span class="agenda-action-title"><i class="bi bi-file-earmark-text"></i>Dokumen</span>
                                    <div class="agenda-action-links">
                                        <a href="/agenda/${agenda.id}/dokumen/kirim" title="Kirim dokumen"><i class="bi bi-cloud-arrow-up"></i>Form</a>
                                        <a href="/agenda/${agenda.id}/dokumen" title="Lihat daftar dokumen"><i class="bi bi-folder2-open"></i>Daftar</a>
                                    </div>
                                </div>
                                ${safeUrl(agenda.zoom_url) ? `
                                    <div class="agenda-action-row">
                                        <span class="agenda-action-title"><i class="bi bi-camera-video"></i>Pertemuan</span>
                                        <div class="agenda-action-links agenda-action-links-single">
                                            <a class="agenda-zoom-link" href="${esc(agenda.zoom_url)}" target="_blank" rel="noopener noreferrer" title="Buka Zoom"><i class="bi bi-box-arrow-up-right"></i>Buka Zoom</a>
                                        </div>
                                    </div>
                                ` : ""}
                            </div>
                        </td>
                        <td>
                            <div class="d-flex justify-content-end gap-1">
                                <button type="button" class="btn btn-sm btn-light border edit-agenda" data-bs-toggle="modal" data-bs-target="#agendaModal"
                                    data-id="${esc(agenda.id)}"
                                    data-nomor-surat="${esc(agenda.nomor_surat)}"
                                    data-perihal="${esc(agenda.perihal)}"
                                    data-periode="${esc(agenda.periode)}"
                                    data-zoom-url="${esc(agenda.zoom_url)}" title="Edit agenda">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-light border text-danger delete-agenda" data-bs-toggle="modal" data-bs-target="#deleteModal" data-id="${esc(agenda.id)}" data-title="${esc(agenda.nomor_surat)}" title="Hapus agenda">
                                    <i class="bi bi-trash3"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join("")}
            `}
            </tbody>
        </table>
    </div>
    ${pager}
</section>

<div class="modal fade" id="agendaModal" tabindex="-1" aria-labelledby="agendaModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">
            <form id="agendaForm" method="post">
                <div class="modal-header">
                    <div>
                        <h2 class="modal-title fs-5" id="agendaModalLabel">Tambah agenda</h2>
                        <p class="text-secondary small mb-0">Link eksternal hanya digunakan untuk Zoom.</p>
                    </div>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Tutup"></button>
                </div>
                <div class="modal-body p-4">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label for="nomor_surat" class="form-label">Nomor surat <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="nomor_surat" name="nomor_surat" maxlength="100" required placeholder="001/UND/VIII/2026">
                        </div>
                        <div class="col-md-6">
                            <label for="periode" class="form-label">Periode <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="periode" name="periode" maxlength="100" required placeholder="Agustus 2026">
                        </div>
                        <div class="col-12">
                            <label for="perihal" class="form-label">Perihal <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="perihal" name="perihal" maxlength="255" required placeholder="Rapat Koordinasi Bulanan">
                        </div>
                        <div class="col-12">
                            <label for="zoom_url" class="form-label">Link Zoom</label>
                            <input type="url" class="form-control" id="zoom_url" name="zoom_url" maxlength="500" placeholder="https://zoom.us/...">
                            <div class="form-text">Halaman isi, daftar kehadiran, pengiriman, dan daftar dokumen dibuat otomatis setelah agenda disimpan.</div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-primary px-4"><i class="bi bi-check2 me-2"></i><span id="submitLabel">Simpan agenda</span></button>
                </div>
            </form>
        </div>
    </div>
</div>

<div class="modal fade" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <form id="deleteForm" method="post">
                
                <div class="modal-body p-4 text-center">
                    <span class="delete-icon"><i class="bi bi-trash3-fill"></i></span>
                    <h2 class="h5 mt-3" id="deleteModalLabel">Hapus agenda?</h2>
                    <p class="text-secondary mb-0">Agenda <strong id="deleteTitle"></strong> beserta data kehadiran dan dokumennya akan dihapus.</p>
                </div>
                <div class="modal-footer border-0 justify-content-center pt-0 pb-4">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Batal</button>
                    <button type="submit" class="btn btn-danger px-4">Ya, hapus</button>
                </div>
            </form>
        </div>
    </div>
</div>
`;

export const letters = ({suratList,keyword,selected,pager,total}) => `
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <a href="/" class="btn btn-sm btn-light border mb-3"><i class="bi bi-arrow-left me-2"></i>Dashboard</a>
        <span class="eyebrow d-block"><i class="bi bi-envelope-paper-fill"></i> Arsip Surat</span>
        <h1 class="display-6 fw-bold mt-2 mb-1">Daftar Nomor Surat</h1>
        <p class="text-secondary mb-0">Pilih nomor surat untuk melihat detail, formulir, dan daftar data.</p>
    </div>
    <span class="badge rounded-pill text-bg-primary px-3 py-2">${total} surat ditemukan</span>
</div>

<div class="row g-4 align-items-start">
    <div class="col-lg-5">
        <section class="content-card overflow-hidden">
            <div class="p-3 border-bottom">
                <form method="get" action="/surat">
                    <label for="searchSurat" class="visually-hidden">Cari nomor surat</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-secondary"></i></span>
                        <input id="searchSurat" type="search" name="q" maxlength="100" value="${esc(keyword)}" class="form-control border-start-0 ps-0" placeholder="Cari nomor atau perihal...">
                        <button class="btn btn-outline-primary" type="submit">Cari</button>
                    </div>
                </form>
            </div>

            <div class="surat-list">
                ${suratList.length === 0 ? `
                    <div class="text-center text-secondary p-5">
                        <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                        Nomor surat tidak ditemukan.
                    </div>
                ` : `
                    ${suratList.map(surat => `
                        <a href="/surat/${surat.id}" class="surat-list-item ${selected && selected.id === surat.id ? 'active' : ''}">
                            <span class="surat-list-icon"><i class="bi bi-envelope-paper"></i></span>
                            <span class="flex-grow-1 min-width-0">
                                <strong class="d-block text-break">${esc(surat.nomor_surat)}</strong>
                                <small class="d-block text-truncate">${esc(surat.perihal)}</small>
                                <small class="d-block mt-1 opacity-75">${esc(surat.periode)}</small>
                            </span>
                            <i class="bi bi-chevron-right"></i>
                        </a>
                    `).join("")}
                `}
            </div>
            ${pager}
        </section>
    </div>

    <div class="col-lg-7">
        ${selected === null ? `
            <section class="content-card surat-placeholder">
                <span><i class="bi bi-envelope-open"></i></span>
                <h2 class="h4 mt-3">Pilih salah satu nomor surat</h2>
                <p class="text-secondary mb-0">Detail surat akan muncul di bagian ini.</p>
            </section>
        ` : `
            <section class="content-card overflow-hidden">
                <div class="surat-detail-header p-4 p-lg-5">
                    <span class="badge rounded-pill bg-white text-primary mb-3">Detail Surat</span>
                    <h2 class="h3 fw-bold mb-2 text-break">${esc(selected.nomor_surat)}</h2>
                    <p class="mb-0 opacity-75">${esc(selected.periode)}</p>
                </div>

                <div class="p-4 p-lg-5">
                    <div class="mb-4">
                        <span class="detail-label">Perihal</span>
                        <div class="fs-5 fw-semibold mt-1">${esc(selected.perihal)}</div>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-sm-6">
                            <div class="mini-stat">
                                <span><i class="bi bi-person-check-fill"></i></span>
                                <div><small>Kehadiran masuk</small><strong>${esc(selected.attendance_count)}</strong></div>
                            </div>
                        </div>
                        <div class="col-sm-6">
                            <div class="mini-stat">
                                <span><i class="bi bi-file-earmark-arrow-up-fill"></i></span>
                                <div><small>Dokumen masuk</small><strong>${esc(selected.document_count)}</strong></div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-action-grid">
                        <div class="detail-action-card">
                            <div class="detail-action-heading"><span><i class="bi bi-person-check-fill"></i></span><div><strong>Kehadiran</strong><small>Form dan data peserta</small></div></div>
                            <div class="btn-group w-100" role="group" aria-label="Akses kehadiran">
                                <a class="btn btn-primary" href="/agenda/${selected.id}/kehadiran/isi"><i class="bi bi-pencil-square me-1"></i>Isi Form</a>
                                <a class="btn btn-outline-primary" href="/agenda/${selected.id}/kehadiran"><i class="bi bi-list-check me-1"></i>Daftar</a>
                            </div>
                        </div>
                        <div class="detail-action-card">
                            <div class="detail-action-heading"><span><i class="bi bi-file-earmark-text-fill"></i></span><div><strong>Dokumen</strong><small>Pengiriman dan arsip file</small></div></div>
                            <div class="btn-group w-100" role="group" aria-label="Akses dokumen">
                                <a class="btn btn-primary" href="/agenda/${selected.id}/dokumen/kirim"><i class="bi bi-cloud-arrow-up me-1"></i>Kirim Form</a>
                                <a class="btn btn-outline-primary" href="/agenda/${selected.id}/dokumen"><i class="bi bi-folder2-open me-1"></i>Daftar</a>
                            </div>
                        </div>
                    </div>
                    ${safeUrl(selected.zoom_url) ? `
                        <a class="btn btn-outline-secondary mt-3" href="${esc(selected.zoom_url)}" target="_blank" rel="noopener noreferrer"><i class="bi bi-camera-video me-2"></i>Buka Zoom</a>
                    ` : ""}
                </div>
            </section>
        `}
    </div>
</div>
`;

export const attendanceForm = (agenda) => `
<div class="mb-4">
    <div class="d-flex flex-wrap gap-2 mb-3">
        <a href="/" class="btn btn-sm btn-light border"><i class="bi bi-arrow-left me-2"></i>Dashboard</a>
        <a href="/agenda/${agenda.id}/kehadiran" class="btn btn-sm btn-outline-primary"><i class="bi bi-list-check me-2"></i>Daftar Kehadiran</a>
    </div>
    <div class="hero-panel py-4">
        <span class="eyebrow"><i class="bi bi-person-check-fill"></i> Isi Kehadiran</span>
        <h1 class="h3 fw-bold mt-2 mb-1">${esc(agenda.perihal)}</h1>
        <p class="text-secondary mb-0">${esc(agenda.nomor_surat)} &middot; ${esc(agenda.periode)}</p>
    </div>
</div>


<div class="row justify-content-center">
    <div class="col-lg-7 col-xl-6">
        <section class="content-card p-4 p-lg-5">
            <h2 class="h5 mb-1">Form kehadiran</h2>
            <p class="text-secondary small mb-4">Isi data di bawah. Data akan langsung tersimpan pada agenda ini.</p>
            <form method="post" action="/agenda/${agenda.id}/kehadiran/isi">
                
                <div class="mb-3">
                    <label for="nama" class="form-label">Nama lengkap <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="nama" name="nama" maxlength="150" required>
                </div>
                <div class="mb-3">
                    <label for="instansi" class="form-label">Instansi/Jabatan</label>
                    <input type="text" class="form-control" id="instansi" name="instansi" maxlength="150">
                </div>
                <div class="mb-3">
                    <label for="status" class="form-label">Status <span class="text-danger">*</span></label>
                    <select class="form-select" id="status" name="status" required>
                        <option value="">Pilih status</option>
                        ${['Hadir', 'Izin', 'Tidak Hadir'].map(status => `
                            <option value="${esc(status)}">${esc(status)}</option>
                        `).join("")}
                    </select>
                </div>
                <div class="mb-4">
                    <label for="catatan" class="form-label">Catatan</label>
                    <textarea class="form-control" id="catatan" name="catatan" rows="3" maxlength="500"></textarea>
                </div>
                <button class="btn btn-primary w-100" type="submit"><i class="bi bi-check2-circle me-2"></i>Simpan Kehadiran</button>
            </form>
        </section>
    </div>
</div>
`;

export const documentForm = (agenda) => `
<div class="mb-4">
    <div class="d-flex flex-wrap gap-2 mb-3">
        <a href="/" class="btn btn-sm btn-light border"><i class="bi bi-arrow-left me-2"></i>Dashboard</a>
        <a href="/agenda/${agenda.id}/dokumen" class="btn btn-sm btn-outline-primary"><i class="bi bi-folder2-open me-2"></i>Daftar Dokumen</a>
    </div>
    <div class="hero-panel py-4">
        <span class="eyebrow"><i class="bi bi-file-earmark-arrow-up-fill"></i> Kirim Dokumen</span>
        <h1 class="h3 fw-bold mt-2 mb-1">${esc(agenda.perihal)}</h1>
        <p class="text-secondary mb-0">${esc(agenda.nomor_surat)} &middot; ${esc(agenda.periode)}</p>
    </div>
</div>


<div class="row justify-content-center">
    <div class="col-lg-7 col-xl-6">
        <section class="content-card p-4 p-lg-5">
            <h2 class="h5 mb-1">Form pengiriman dokumen</h2>
            <p class="text-secondary small mb-4">PDF, Word, Excel, JPG, atau PNG; maksimal 5 MB.</p>
            <form method="post" enctype="multipart/form-data" action="/agenda/${agenda.id}/dokumen/kirim">
                
                <div class="mb-3">
                    <label for="nama_pengirim" class="form-label">Nama pengirim <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="nama_pengirim" name="nama_pengirim" maxlength="150" required>
                </div>
                <div class="mb-3">
                    <label for="judul_dokumen" class="form-label">Judul dokumen <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="judul_dokumen" name="judul_dokumen" maxlength="200" required>
                </div>
                <div class="mb-3">
                    <label for="file_dokumen" class="form-label">Pilih file <span class="text-danger">*</span></label>
                    <input type="file" class="form-control" id="file_dokumen" name="file_dokumen" required accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png">
                </div>
                <div class="mb-4">
                    <label for="catatan" class="form-label">Catatan</label>
                    <textarea class="form-control" id="catatan" name="catatan" rows="3" maxlength="500"></textarea>
                </div>
                <button class="btn btn-primary w-100" type="submit"><i class="bi bi-cloud-arrow-up-fill me-2"></i>Unggah Dokumen</button>
            </form>
        </section>
    </div>
</div>
`;

export const attendanceList = ({agenda,attendances}) => `
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <a href="/" class="btn btn-sm btn-light border mb-3"><i class="bi bi-arrow-left me-2"></i>Dashboard</a>
        <span class="eyebrow d-block"><i class="bi bi-list-check"></i> Daftar Kehadiran</span>
        <h1 class="h3 fw-bold mt-2 mb-1">${esc(agenda.perihal)}</h1>
        <p class="text-secondary mb-0">${esc(agenda.nomor_surat)} &middot; ${esc(agenda.periode)}</p>
    </div>
    <a class="btn btn-primary" href="/agenda/${agenda.id}/kehadiran/isi"><i class="bi bi-person-plus-fill me-2"></i>Isi Kehadiran</a>
</div>

<section class="content-card">
    <div class="p-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div><h2 class="h5 mb-1">Data kehadiran masuk</h2><p class="text-secondary small mb-0">Data terbaru ditampilkan paling atas.</p></div>
        <span class="badge rounded-pill text-bg-primary">${attendances.length} data</span>
    </div>
    <div class="table-responsive">
        <table class="table align-middle mb-0">
            <thead><tr><th>Nama</th><th>Status</th><th>Waktu</th></tr></thead>
            <tbody>
            ${attendances.length === 0 ? `
                <tr><td colspan="3" class="text-center text-secondary py-5">Belum ada data kehadiran.</td></tr>
            ` : `
                ${attendances.map(item => `
                    <tr>
                        <td>
                            <div class="fw-semibold">${esc(item.nama)}</div>
                            <small class="text-secondary">${esc(item.instansi || '—')}</small>
                            ${item.catatan ? `<div class="small mt-1">${esc(item.catatan)}</div>` : ""}
                        </td>
                        <td><span class="badge ${item.status === 'Hadir' ? 'text-bg-success' : (item.status === 'Izin' ? 'text-bg-warning' : 'text-bg-secondary')}">${esc(item.status)}</span></td>
                        <td class="small text-secondary text-nowrap">${date(item.created_at)}</td>
                    </tr>
                `).join("")}
            `}
            </tbody>
        </table>
    </div>
</section>
`;

export const documentList = ({agenda,documents}) => `
<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
    <div>
        <a href="/" class="btn btn-sm btn-light border mb-3"><i class="bi bi-arrow-left me-2"></i>Dashboard</a>
        <span class="eyebrow d-block"><i class="bi bi-folder2-open"></i> Daftar Dokumen</span>
        <h1 class="h3 fw-bold mt-2 mb-1">${esc(agenda.perihal)}</h1>
        <p class="text-secondary mb-0">${esc(agenda.nomor_surat)} &middot; ${esc(agenda.periode)}</p>
    </div>
    <a class="btn btn-primary" href="/agenda/${agenda.id}/dokumen/kirim"><i class="bi bi-file-earmark-arrow-up-fill me-2"></i>Kirim Dokumen</a>
</div>

<section class="content-card">
    <div class="p-4 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div><h2 class="h5 mb-1">Dokumen masuk</h2><p class="text-secondary small mb-0">Dokumen yang sudah dikirim dapat diunduh dari halaman ini.</p></div>
        <span class="badge rounded-pill text-bg-primary">${documents.length} file</span>
    </div>
    <div class="list-group list-group-flush">
        ${documents.length === 0 ? `
            <div class="text-center text-secondary py-5">Belum ada dokumen yang diunggah.</div>
        ` : `
            ${documents.map(item => `
                <div class="list-group-item p-3 p-lg-4">
                    <div class="d-flex flex-wrap flex-sm-nowrap gap-3 align-items-start">
                        <span class="file-icon"><i class="bi bi-file-earmark-text-fill"></i></span>
                        <div class="flex-grow-1 min-width-0">
                            <div class="fw-semibold text-break">${esc(item.judul_dokumen)}</div>
                            <div class="small text-secondary text-break">${esc(item.nama_file)}</div>
                            <div class="small text-secondary mt-1">Oleh ${esc(item.nama_pengirim)} &middot; ${kb(item.ukuran)} KB &middot; ${date(item.created_at)}</div>
                            ${item.catatan ? `<div class="small mt-2">${esc(item.catatan)}</div>` : ""}
                        </div>
                        <a class="btn btn-sm btn-outline-primary" href="/api/dokumen/${item.id}/download"><i class="bi bi-download me-1"></i>Unduh</a>
                    </div>
                </div>
            `).join("")}
        `}
    </div>
</section>
`;
