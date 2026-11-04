import { dashboard, letters, attendanceForm, attendanceList, documentForm, documentList } from './templates.js';

const view = document.querySelector('#view');
const notice = document.querySelector('#notice');
const path = location.pathname.replace(/\/$/, '') || '/';
const params = new URLSearchParams(location.search);
const keyword = (params.get('q') ?? '').slice(0, 100);
const periodeFilter = (params.get('periode') ?? '').slice(0, 100);
const requestedPage = Number(params.get('page'));
const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

async function api(path, options) {
    const response = await fetch('/api' + path, options);
    if (response.status === 204) return;
    const data = await response.json();
    if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join('. ') : data.message;
        throw new Error(message || 'Permintaan gagal.');
    }
    return data;
}

function showNotice(message, type, container = notice) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-' + type;
    alert.role = type === 'danger' ? 'alert' : 'status';
    alert.textContent = message;
    container.replaceChildren(alert);
}

function pageUrl(target, number) {
    const query = new URLSearchParams();
    if (keyword) query.set('q', keyword);
    if (target === '/' && periodeFilter) query.set('periode', periodeFilter);
    if (number > 1) query.set('page', number);
    return target + (query.size ? '?' + query.toString() : '');
}

function pagination({ total, limit }, target) {
    const pages = Math.max(1, Math.ceil(total / limit));
    if (page > pages) {
        location.replace(pageUrl(target, pages));
        return '';
    }
    if (pages === 1) return '';

    // Build the links with DOM attributes because the search term is user input.
    const nav = document.createElement('nav');
    nav.className = 'd-flex align-items-center justify-content-between gap-2 p-3 border-top';
    nav.setAttribute('aria-label', 'Navigasi halaman');
    for (const [label, number, enabled] of [
        ['Sebelumnya', page - 1, page > 1],
        ['Halaman ' + page + ' dari ' + pages],
        ['Berikutnya', page + 1, page < pages],
    ]) {
        const item = document.createElement(enabled ? 'a' : 'span');
        item.textContent = label;
        if (number !== undefined) {
            item.className = 'btn btn-sm btn-outline-primary' + (enabled ? '' : ' disabled');
            if (enabled) item.href = pageUrl(target, number);
            else item.setAttribute('aria-disabled', 'true');
        }
        nav.append(item);
    }
    return nav.outerHTML;
}

function jsonBody(form) {
    const fields = Object.fromEntries(new FormData(form));
    for (const key of Object.keys(fields)) fields[key] = fields[key].trim();
    return {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
    };
}

function bindSubmit(form, submit, success) {
    const errors = document.createElement('div');
    const footer = form.querySelector('.modal-footer');
    if (footer) {
        errors.className = 'px-4';
        footer.before(errors);
    } else {
        form.prepend(errors);
    }
    const button = form.querySelector('[type="submit"]');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (button.disabled) return;
        button.disabled = true;
        errors.replaceChildren();
        try {
            await submit();
            success();
        } catch (error) {
            showNotice(error.message, 'danger', errors);
        } finally {
            button.disabled = false;
        }
    });
    return errors;
}

function bindAgendaModals() {
    const form = document.querySelector('#agendaForm');
    let editId;
    const errors = bindSubmit(form, () => api(editId ? '/agendas/' + editId : '/agendas', {
        method: editId ? 'PATCH' : 'POST',
        ...jsonBody(form),
    }), () => redirect(pageUrl('/', page), editId ? 'Perubahan agenda disimpan.' : 'Agenda ditambahkan.'));

    document.querySelector('#agendaModal').addEventListener('show.bs.modal', ({ relatedTarget }) => {
        const data = relatedTarget?.dataset ?? {};
        editId = data.id;
        form.reset();
        errors.replaceChildren();
        for (const [field, key] of Object.entries({
            nomor_surat: 'nomorSurat', perihal: 'perihal', periode: 'periode', zoom_url: 'zoomUrl',
        })) {
            form.elements[field].value = data[key] ?? '';
        }
        document.querySelector('#agendaModalLabel').textContent = editId ? 'Edit agenda' : 'Tambah agenda';
        document.querySelector('#submitLabel').textContent = editId ? 'Simpan perubahan' : 'Simpan agenda';
    });

    let deleteId;
    const deleteErrors = bindSubmit(document.querySelector('#deleteForm'),
        () => api('/agendas/' + deleteId, { method: 'DELETE' }),
        () => redirect(pageUrl('/', page), 'Agenda dihapus.'));
    document.querySelector('#deleteModal').addEventListener('show.bs.modal', ({ relatedTarget }) => {
        deleteId = relatedTarget.dataset.id;
        document.querySelector('#deleteTitle').textContent = relatedTarget.dataset.title;
        deleteErrors.replaceChildren();
    });
}

function redirect(target, message) {
    sessionStorage.setItem('arsip-notice', message);
    location.assign(target);
}

async function render() {
    const query = new URLSearchParams({ q: keyword, page: String(page) });
    if (path === '/') {
        query.set('periode', periodeFilter);
        const [summary, periodeOptions, result] = await Promise.all([
            api('/summary'), api('/periods'), api('/agendas?' + query),
        ]);
        view.innerHTML = dashboard({
            ...summary, periodeOptions, periodeFilter, keyword,
            agendas: result.data, pager: pagination(result, '/'),
        });
        bindAgendaModals();
        return;
    }

    const surat = path.match(/^\/surat(?:\/(\d+))?$/);
    if (surat) {
        const [result, selected] = await Promise.all([
            api('/surat?' + query),
            surat[1] ? api('/surat/' + surat[1]) : null,
        ]);
        view.innerHTML = letters({
            suratList: result.data, keyword, selected, total: result.total,
            pager: pagination(result, path),
        });
        return;
    }

    const submission = path.match(/^\/agenda\/(\d+)\/(kehadiran|dokumen)(?:\/(isi|kirim))?$/);
    if (!submission) throw new Error('Halaman tidak ditemukan.');
    const [, id, type, formPage] = submission;
    const documents = type === 'dokumen';
    const endpoint = '/agendas/' + id + '/' + type;
    const listPage = '/agenda/' + id + '/' + type;

    if (formPage) {
        const agenda = await api('/agendas/' + id);
        view.innerHTML = documents ? documentForm(agenda) : attendanceForm(agenda);
        const form = view.querySelector('form');
        bindSubmit(form, () => {
            if (!documents) return api(endpoint, { method: 'POST', ...jsonBody(form) });
            const body = new FormData(form);
            if (body.get('file_dokumen').size > 5 * 1024 * 1024) {
                throw new Error('Ukuran file maksimal 5 MB.');
            }
            return api(endpoint, { method: 'POST', body });
        }, () => redirect(listPage, documents ? 'Dokumen berhasil diunggah.' : 'Kehadiran berhasil disimpan.'));
    } else {
        const [agenda, items] = await Promise.all([api('/agendas/' + id), api(endpoint)]);
        view.innerHTML = documents ? documentList({ agenda, documents: items })
            : attendanceList({ agenda, attendances: items });
    }
}

try {
    await render();
    const message = sessionStorage.getItem('arsip-notice');
    if (message) {
        sessionStorage.removeItem('arsip-notice');
        showNotice(message, 'success');
    }
} catch (error) {
    view.replaceChildren();
    showNotice(error.message, 'danger');
} finally {
    view.removeAttribute('aria-busy');
}
