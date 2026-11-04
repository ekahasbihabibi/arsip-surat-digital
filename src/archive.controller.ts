import {Controller,Get,Post,Patch,Delete,Param,Body,Query,ParseIntPipe,HttpCode,UseInterceptors,UploadedFile,BadRequestException,StreamableFile} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiConsumes,ApiBody} from '@nestjs/swagger';
import {extname} from 'node:path';
import {ArchiveService,Upload} from './archive.service';
import {AgendaDto,UpdateAgendaDto,AttendanceDto,DocumentDto,SearchDto} from './dto';
@Controller()
export class ArchiveController {
 constructor(private readonly service:ArchiveService){}
 @Get('summary') summary(){return this.service.summary();}
 @Get('periods') periods(){return this.service.periods();}
 @Get(['agendas','surat']) list(@Query() q:SearchDto){return this.service.list(q);}
 @Get(['agendas/:id','surat/:id']) one(@Param('id',ParseIntPipe) id:number){return this.service.one(id);}
 @Post('agendas') create(@Body() d:AgendaDto){return this.service.create(d);}
 @Patch('agendas/:id') update(@Param('id',ParseIntPipe) id:number,@Body() d:UpdateAgendaDto){return this.service.update(id,d);}
 @Delete('agendas/:id') @HttpCode(204) remove(@Param('id',ParseIntPipe) id:number){return this.service.remove(id);}
 @Get('agendas/:id/kehadiran') attendances(@Param('id',ParseIntPipe) id:number){return this.service.attendances(id);}
 @Post('agendas/:id/kehadiran') attendance(@Param('id',ParseIntPipe) id:number,@Body() d:AttendanceDto){return this.service.attendance(id,d);}
 @Get('agendas/:id/dokumen') documents(@Param('id',ParseIntPipe) id:number){return this.service.documents(id);}
 @Post('agendas/:id/dokumen')
 @UseInterceptors(FileInterceptor('file_dokumen',{limits:{fileSize:5*1024*1024,files:1}}))
 @ApiConsumes('multipart/form-data')
 @ApiBody({schema:{type:'object',required:['nama_pengirim','judul_dokumen','file_dokumen'],properties:{nama_pengirim:{type:'string'},judul_dokumen:{type:'string'},catatan:{type:'string'},file_dokumen:{type:'string',format:'binary'}}}})
 document(@Param('id',ParseIntPipe) id:number,@Body() d:DocumentDto,@UploadedFile() f:Upload){
  if(!f||!f.size)throw new BadRequestException('File wajib diunggah');
  if(!['.pdf','.doc','.docx','.xls','.xlsx','.jpg','.jpeg','.png'].includes(extname(f.originalname).toLowerCase()))throw new BadRequestException('Ekstensi file tidak didukung');
  return this.service.document(id,d,f);
 }
 @Get('dokumen/:id/download') async download(@Param('id',ParseIntPipe) id:number){const f=await this.service.download(id);return new StreamableFile(f.content,{type:'application/octet-stream',disposition:`attachment; filename*=UTF-8''${encodeURIComponent(f.nama_file)}`});}
}
