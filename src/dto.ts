import {ApiProperty,ApiPropertyOptional,PartialType} from '@nestjs/swagger';
import {IsString,Length,Matches,IsOptional,IsIn,IsUrl,ValidateIf,IsInt,Min,Max} from 'class-validator';
import {Type} from 'class-transformer';
export class AgendaDto {
 @ApiProperty({example:'001/IT/2026'}) @IsString() @Length(1,100) @Matches(/\S/) nomor_surat!:string;
 @ApiProperty({example:'Rapat koordinasi'}) @IsString() @Length(1,255) @Matches(/\S/) perihal!:string;
 @ApiProperty({example:'November 2026'}) @IsString() @Length(1,100) @Matches(/\S/) periode!:string;
 @ApiPropertyOptional({example:'https://zoom.us/j/123456'}) @ValidateIf((_,v)=>v!==undefined&&v!=='') @IsUrl({protocols:['http','https'],require_protocol:true}) @Length(1,500) zoom_url?:string;
}
export class UpdateAgendaDto extends PartialType(AgendaDto,{skipNullProperties:false}){}
export class DocumentDto {
 @ApiProperty({example:'Peserta Contoh'}) @IsString() @Length(1,150) @Matches(/\S/) nama_pengirim!:string;
 @ApiProperty({example:'Materi rapat'}) @IsString() @Length(1,200) @Matches(/\S/) judul_dokumen!:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @Length(0,500) catatan?:string;
}
export class AttendanceDto {
 @ApiProperty({example:'Peserta Contoh'}) @IsString() @Length(1,150) @Matches(/\S/) nama!:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @Length(0,150) instansi?:string;
 @ApiProperty({enum:['Hadir','Izin','Tidak Hadir']}) @IsIn(['Hadir','Izin','Tidak Hadir']) status!:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @Length(0,500) catatan?:string;
}
export class SearchDto {
 @ApiPropertyOptional() @IsOptional() @IsString() @Length(0,100) q?:string;
 @ApiPropertyOptional() @IsOptional() @IsString() @Length(0,100) periode?:string;
 @ApiPropertyOptional({default:1}) @Type(()=>Number) @IsInt() @Min(1) page:number=1;
 @ApiPropertyOptional({default:10}) @Type(()=>Number) @IsInt() @Min(1) @Max(100) limit:number=10;
}
