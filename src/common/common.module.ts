import { Global, Module } from '@nestjs/common';
import { UrlHelperService } from './services/url-helper.service';

@Global()
@Module({
  providers: [UrlHelperService],
  exports: [UrlHelperService],
})
export class CommonModule {}
