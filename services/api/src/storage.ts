import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { env } from './env.js';

type RegionCode = 'us' | 'eu';

function bucketForRegion(region: RegionCode): string {
  return region === 'eu' ? env.S3_BUCKET_EU : env.S3_BUCKET_US;
}

export class StorageService {
  private client: S3Client;
  private useLocal: boolean;
  private baseDir: string;
  private breaker: Map<string, { failures: number; openUntil: number }> = new Map();

  constructor() {
    this.useLocal = process.env.NODE_ENV === 'test' || process.env.STORAGE_MODE === 'local';
    this.baseDir = process.env.DATA_DIR || path.join(process.cwd(), '.data', 'storage');
    const endpoint = process.env.AWS_S3_ENDPOINT;
    const forcePathStyle = (process.env.AWS_S3_FORCE_PATH_STYLE || '').toLowerCase() === 'true';
    this.client = new S3Client({
      region: env.AWS_REGION,
      endpoint: endpoint || undefined,
      forcePathStyle,
    });
  }

  private async withTimeoutAndBreaker<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.useLocal) return fn();
    const now = Date.now();
    const state = this.breaker.get(key) || { failures: 0, openUntil: 0 };
    if (state.openUntil > now) {
      throw new Error(`circuit_open:${key}`);
    }
    const timeoutMs = Number(process.env.S3_REQUEST_TIMEOUT_MS ?? 8000);
    const failThreshold = Number(process.env.CB_FAIL_THRESHOLD ?? 5);
    const cooldown = Number(process.env.CB_COOLDOWN_MS ?? 15000);
    try {
      const res = await Promise.race<T>([
        fn(),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('s3_timeout')), timeoutMs)),
      ]);
      // success -> reset
      this.breaker.set(key, { failures: 0, openUntil: 0 });
      return res;
    } catch (e) {
      const f = state.failures + 1;
      const openUntil = f >= failThreshold ? now + cooldown : 0;
      this.breaker.set(key, { failures: f, openUntil });
      throw e;
    }
  }

  async putObject(params: { region: RegionCode; key: string; body: Uint8Array; contentType?: string }) {
    if (this.useLocal) {
      const file = path.join(this.baseDir, params.key);
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, Buffer.from(params.body));
      return;
    }
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    await this.withTimeoutAndBreaker('putObject', async () => {
      await this.client.send(new PutObjectCommand({ Bucket, Key, Body: Buffer.from(params.body), ContentType: params.contentType ?? 'application/octet-stream' }));
    });
  }

  async headObject(params: { region: RegionCode; key: string }) {
    if (this.useLocal) {
      const file = path.join(this.baseDir, params.key);
      const st = await fs.stat(file);
      return { ContentLength: st.size } as any;
    }
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    return this.withTimeoutAndBreaker('headObject', async () => this.client.send(new HeadObjectCommand({ Bucket, Key })) as any);
  }

  async getObject(params: { region: RegionCode; key: string }): Promise<Uint8Array> {
    if (this.useLocal) {
      const file = path.join(this.baseDir, params.key);
      const data = await fs.readFile(file);
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    const res = await this.withTimeoutAndBreaker('getObject', async () => this.client.send(new GetObjectCommand({ Bucket, Key })) as any);
    const arrayBuf = await (res as any).Body.transformToByteArray();
    return new Uint8Array(arrayBuf);
  }

  async createMultipartUpload(params: { region: RegionCode; key: string; contentType?: string }) {
    if (this.useLocal) {
      // Local stub: create upload folder and return id
      return 'local-upload-' + Date.now();
    }
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    const res = await this.withTimeoutAndBreaker('createMultipart', async () => this.client.send(new CreateMultipartUploadCommand({ Bucket, Key, ContentType: params.contentType ?? 'application/octet-stream' })) as any);
    return (res as any).UploadId as string;
  }

  async uploadPart(params: { region: RegionCode; key: string; uploadId: string; partNumber: number; body: Uint8Array }) {
    if (this.useLocal) {
      // Local stub: ignore parts
      return 'etag-local';
    }
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    const res = await this.withTimeoutAndBreaker('uploadPart', async () => this.client.send(new UploadPartCommand({ Bucket, Key, UploadId: params.uploadId, PartNumber: params.partNumber, Body: Buffer.from(params.body) })) as any);
    return (res as any).ETag as string;
  }

  async completeMultipart(params: { region: RegionCode; key: string; uploadId: string; parts: { ETag: string; PartNumber: number }[] }) {
    if (this.useLocal) return;
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    await this.withTimeoutAndBreaker('completeMultipart', async () => {
      await this.client.send(new CompleteMultipartUploadCommand({ Bucket, Key, UploadId: params.uploadId, MultipartUpload: { Parts: params.parts } }));
    });
  }

  async abortMultipart(params: { region: RegionCode; key: string; uploadId: string }) {
    if (this.useLocal) return;
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    // AWS SDK v3 does not require explicit Abort command import here; using DeleteObject is insufficient.
    // We choose to ignore at runtime if not supported in local stub.
    const { AbortMultipartUploadCommand } = await import('@aws-sdk/client-s3');
    await this.client.send(new AbortMultipartUploadCommand({ Bucket, Key, UploadId: params.uploadId } as any));
  }

  async deleteObject(params: { region: RegionCode; key: string }): Promise<void> {
    if (this.useLocal) {
      const file = path.join(this.baseDir, params.key);
      try { await fs.rm(file, { force: true }); } catch {}
      return;
    }
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    await this.withTimeoutAndBreaker('deleteObject', async () => {
      await this.client.send(new DeleteObjectCommand({ Bucket, Key }));
    });
  }
}


