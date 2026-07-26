import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UrlHelperService {
  constructor(private readonly configService: ConfigService) {}

  getBaseUrl(): string {
    const appUrl = this.configService.get<string>('APP_URL');
    if (appUrl) {
      return appUrl;
    }
    const port = this.configService.get<number>('PORT') || 3000;
    return `http://localhost:${port}`;
  }

  asset(filePath?: string | null): string | null {
    if (!filePath) {
      return null;
    }
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    const baseUrl = this.getBaseUrl();
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const cleanPath = filePath.replace(/^\/+/, '');

    return `${cleanBaseUrl}/${cleanPath}`;
  }
}
