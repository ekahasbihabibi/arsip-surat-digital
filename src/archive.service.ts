import {Injectable,NotFoundException,OnModuleDestroy} from '@nestjs/common';
import {Pool} from 'pg';
import {AgendaDto,UpdateAgendaDto,SearchDto,AttendanceDto,DocumentDto} from './dto';
export interface Upload {originalname:string;mimetype:string;size:number;buffer:Buffer;}
@Injectable()
export class Database implements OnModuleDestroy {
 pool=new Pool({connectionString:process.env.DATABASE_URL});
 async onModuleDestroy(){await this.pool.end();}
}
@Injectable()
export class ArchiveService {
 constructor(private readonly db:Database){}
 async summary(){
  const [a,p,t,d]=await Promise.all(['SELECT COUNT(*) AS n FROM agendas','SELECT COUNT(DISTINCT periode) AS n FROM agendas','SELECT COUNT(*) AS n FROM attendances','SELECT COUNT(*) AS n FROM documents'].map(s=>this.db.pool.query(s)));
  return {totalAgenda:Number(a.rows[0].n),totalPeriode:Number(p.rows[0].n),totalKehadiran:Number(t.rows[0].n),totalDokumen:Number(d.rows[0].n)};
 }
 async periods(){return (await this.db.pool.query('SELECT DISTINCT periode FROM agendas ORDER BY periode')).rows.map(r=>r.periode);}
 async one(id:number){
  const r=await this.db.pool.query('SELECT * FROM agendas WHERE id=$1',[id]);
  if(!r.rows.length)throw new NotFoundException('Agenda tidak ditemukan');
  const [a,d]=await Promise.all([this.db.pool.query('SELECT COUNT(*) AS n FROM attendances WHERE agenda_id=$1',[id]),this.db.pool.query('SELECT COUNT(*) AS n FROM documents WHERE agenda_id=$1',[id])]);
  return {...r.rows[0],attendance_count:Number(a.rows[0].n),document_count:Number(d.rows[0].n)};
 }
 async list(q:SearchDto){
  const v:unknown[]=[];const c:string[]=[];
  if(q.q){v.push('%'+q.q+'%');c.push(`(nomor_surat ILIKE $${v.length} OR perihal ILIKE $${v.length})`);}
  if(q.periode){v.push(q.periode);c.push(`periode=$${v.length}`);}
  const where=c.length?' WHERE '+c.join(' AND '):'';
  const total=await this.db.pool.query('SELECT COUNT(*) AS n FROM agendas'+where,v);
  const rows=await this.db.pool.query('SELECT id FROM agendas'+where+` ORDER BY id DESC LIMIT $${v.length+1} OFFSET $${v.length+2}`,[...v,q.limit,(q.page-1)*q.limit]);
  return {data:await Promise.all(rows.rows.map(r=>this.one(r.id))),total:Number(total.rows[0].n),page:q.page,limit:q.limit};
 }
 async create(d:AgendaDto){const r=await this.db.pool.query('INSERT INTO agendas(nomor_surat,perihal,periode,zoom_url) VALUES($1,$2,$3,$4) RETURNING id',[d.nomor_surat,d.perihal,d.periode,d.zoom_url??'']);return this.one(r.rows[0].id);}
 async update(id:number,d:UpdateAgendaDto){
  await this.one(id);const fields=['nomor_surat','perihal','periode','zoom_url'] as const;const keys=fields.filter(k=>d[k]!==undefined);
  if(keys.length)await this.db.pool.query('UPDATE agendas SET '+keys.map((k,i)=>`${k}=$${i+1}`).join(',')+`,updated_at=CURRENT_TIMESTAMP WHERE id=$${keys.length+1}`,[...keys.map(k=>d[k]),id]);return this.one(id);
 }
 async remove(id:number){const r=await this.db.pool.query('DELETE FROM agendas WHERE id=$1 RETURNING id',[id]);if(!r.rows.length)throw new NotFoundException('Agenda tidak ditemukan');}
 async attendances(id:number){await this.one(id);return (await this.db.pool.query('SELECT * FROM attendances WHERE agenda_id=$1 ORDER BY id DESC',[id])).rows;}
 async attendance(id:number,d:AttendanceDto){await this.one(id);return (await this.db.pool.query('INSERT INTO attendances(agenda_id,nama,instansi,status,catatan) VALUES($1,$2,$3,$4,$5) RETURNING *',[id,d.nama,d.instansi??'',d.status,d.catatan??''])).rows[0];}
 async documents(id:number){await this.one(id);return (await this.db.pool.query('SELECT id,agenda_id,nama_pengirim,judul_dokumen,nama_file,mime_type,ukuran,catatan,created_at FROM documents WHERE agenda_id=$1 ORDER BY id DESC',[id])).rows;}
 async document(id:number,d:DocumentDto,f:Upload){await this.one(id);return (await this.db.pool.query('INSERT INTO documents(agenda_id,nama_pengirim,judul_dokumen,nama_file,mime_type,ukuran,content,catatan) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,nama_file,judul_dokumen,ukuran',[id,d.nama_pengirim,d.judul_dokumen,f.originalname.slice(0,255),f.mimetype.slice(0,150),f.size,f.buffer,d.catatan??''])).rows[0];}
 async download(id:number){const r=await this.db.pool.query('SELECT nama_file,content FROM documents WHERE id=$1',[id]);if(!r.rows.length)throw new NotFoundException('Dokumen tidak ditemukan');return r.rows[0];}
}
