import 'reflect-metadata';
import 'dotenv/config';
import {Module,ValidationPipe} from '@nestjs/common';
import {NestExpressApplication} from '@nestjs/platform-express';
import {mountFrontend} from './frontend';
import {NestFactory} from '@nestjs/core';
import {SwaggerModule,DocumentBuilder} from '@nestjs/swagger';
import {Database,ArchiveService} from './archive.service';
import {ArchiveController} from './archive.controller';
@Module({controllers:[ArchiveController],providers:[Database,ArchiveService]})
export class AppModule{}
export {Database};
export async function createApp(){const app=await NestFactory.create<NestExpressApplication>(AppModule,{logger:false});
 mountFrontend(app);
 app.setGlobalPrefix('api');
 app.useGlobalPipes(new ValidationPipe({transform:true,whitelist:true,forbidNonWhitelisted:true}));SwaggerModule.setup('docs',app,SwaggerModule.createDocument(app,new DocumentBuilder().setTitle('Arsip Surat — NestJS Remake').setVersion('2.0').build()));app.enableShutdownHooks();return app;}
if(require.main===module){if(!process.env.DATABASE_URL)throw new Error('Isi DATABASE_URL dalam .env');createApp().then(app=>app.listen(Number(process.env.PORT??3000),'127.0.0.1')).catch(e=>{console.error(e);process.exitCode=1;});}
