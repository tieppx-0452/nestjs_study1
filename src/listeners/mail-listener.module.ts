import { Module } from '@nestjs/common';
import { MailListener } from './mail.listener';

@Module({
  providers: [MailListener],
  exports: [MailListener],
})
export class MailListenerModule {}
