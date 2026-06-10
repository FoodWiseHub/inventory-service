import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../../common/errors/app.exception.js';
import { ErrorCode } from '../../common/errors/error-codes.js';

@Injectable()
export class SupabaseStorageService {
  assertConfigured() {
    this.getConfig();
  }

  async upload(key: string, content: Buffer, contentType: string) {
    const response = await this.fetchStorage(this.objectUrl(key), {
      method: 'POST',

      headers: this.headers({
        'content-type': contentType,

        'x-upsert': 'false',
      }),

      body: content as unknown as BodyInit,
    });

    if (!response.ok) {
      throw new AppException(
        ErrorCode.STORAGE_UNAVAILABLE,
        'Nao foi possivel enviar a imagem',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async download(key: string): Promise<Buffer> {
    const response = await this.fetchStorage(this.objectUrl(key), {
      method: 'GET',

      headers: this.headers(),
    });

    if (!response.ok) {
      throw new AppException(
        ErrorCode.STORAGE_UNAVAILABLE,
        'Nao foi possivel baixar a imagem',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  async remove(keys: string[]) {
    if (keys.length === 0) {
      return;
    }

    const config = this.getConfig();

    const response = await this.fetchStorage(
      `${config.baseUrl}/storage/v1/object/${config.bucket}/remove`,
      {
        method: 'POST',

        headers: this.headers({
          'content-type': 'application/json',
        }),

        body: JSON.stringify({
          prefixes: keys,
        }),
      },
    );

    if (!response.ok) {
      throw new AppException(
        ErrorCode.STORAGE_UNAVAILABLE,
        'Nao foi possivel remover a imagem',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private objectUrl(key: string) {
    const config = this.getConfig();

    return `${config.baseUrl}/storage/v1/object/${config.bucket}/${key}`;
  }

  private headers(extraHeaders: Record<string, string> = {}) {
    const config = this.getConfig();

    return {
      authorization: `Bearer ${config.serviceKey}`,

      apikey: config.serviceKey,

      ...extraHeaders,
    };
  }

  private async fetchStorage(url: string, init: RequestInit) {
    try {
      return await fetch(url, init);
    } catch {
      throw new AppException(
        ErrorCode.STORAGE_UNAVAILABLE,
        'Storage Supabase indisponivel',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private getConfig() {
    const supabaseUrl = process.env.SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

    const bucket =
      process.env.SUPABASE_STORAGE_BUCKET ??
      process.env.SUPABASE_INVENTORY_PHOTOS_BUCKET;

    if (!supabaseUrl || !serviceKey || !bucket) {
      throw new AppException(
        ErrorCode.STORAGE_UNAVAILABLE,
        'Storage Supabase nao configurado',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return {
      baseUrl: supabaseUrl.replace(/\/$/, ''),

      serviceKey,

      bucket,
    };
  }
}
