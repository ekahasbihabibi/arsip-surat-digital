const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const {newDb}=require('pg-mem');const request=require('supertest');const {createApp,Database}=require('../dist/main');
test('agenda, attendance, documents, search, download and cascade',async()=>{
 const app=await createApp();const db=app.get(Database);await db.pool.end();const mem=newDb();mem.public.none(fs.readFileSync('schema.sql','utf8'));db.pool=new(mem.adapters.createPg().Pool)();await app.init();const api=request(app.getHttpServer());
 try{
  const payload={nomor_surat:'001',perihal:'Rapat IT',periode:'November 2026',zoom_url:''};
  await api.post('/api/agendas').send({...payload,perihal:''}).expect(400);
  await api.post('/api/agendas').send({...payload,zoom_url:'javascript:alert(1)'}).expect(400);
  const a=await api.post('/api/agendas').send(payload).expect(201);const id=a.body.id;
  await api.post(`/api/agendas/${id}/kehadiran`).send({nama:'Contoh',status:'Salah'}).expect(400);
  await api.post(`/api/agendas/${id}/kehadiran`).send({nama:'Contoh',status:'Hadir'}).expect(201);
  await api.post('/api/agendas/999/kehadiran').send({nama:'Contoh',status:'Hadir'}).expect(404);
  const f=Buffer.from('%PDF-1.4\ncontoh latihan');
  const d=await api.post(`/api/agendas/${id}/dokumen`).field('nama_pengirim','Contoh').field('judul_dokumen','Materi').attach('file_dokumen',f,'contoh.pdf').expect(201);
  const downloaded=await api.get(`/api/dokumen/${d.body.id}/download`).expect(200);assert.deepEqual(downloaded.body,f);
  await api.post(`/api/agendas/${id}/dokumen`).field('nama_pengirim','Contoh').field('judul_dokumen','Materi').attach('file_dokumen',f,'bad.exe').expect(400);
  await api.post(`/api/agendas/${id}/dokumen`).field('nama_pengirim','Contoh').field('judul_dokumen','Materi').attach('file_dokumen',Buffer.alloc(5*1024*1024+1),'besar.pdf').expect(413);
  const found=await api.get('/api/surat?q=rapat&periode=November%202026').expect(200);assert.equal(found.body.total,1);assert.equal(found.body.data[0].attendance_count,1);assert.equal(found.body.data[0].document_count,1);
  const summary=await api.get('/api/summary').expect(200);assert.equal(summary.body.totalDokumen,1);
  await api.patch(`/api/agendas/${id}`).send({perihal:null}).expect(400);
  await api.patch(`/api/agendas/${id}`).send({perihal:'Revisi'}).expect(200);
  await api.delete(`/api/agendas/${id}`).expect(204);
  await api.get(`/api/agendas/${id}`).expect(404);
  await api.get(`/api/dokumen/${d.body.id}/download`).expect(404);
  assert.equal((await api.get('/api/summary')).body.totalKehadiran,0);
 }finally{await app.close();}
});
