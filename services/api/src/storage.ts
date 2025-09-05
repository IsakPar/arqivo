import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';
import { env } from './env.js';

type RegionCode = 'us' | 'eu';

function bucketForRegion(region: RegionCode): string {
  return region === 'eu' ? env.S3_BUCKET_EU : env.S3_BUCKET_US;
}

export class StorageService {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({ region: env.AWS_REGION });
  }

  async putObject(params: { region: RegionCode; key: string; body: Uint8Array; contentType?: string }) {
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    await this.client.send(new PutObjectCommand({
      Bucket,
      Key,
      Body: Buffer.from(params.body),
      ContentType: params.contentType ?? 'application/octet-stream',
    }));
  }

  async headObject(params: { region: RegionCode; key: string }) {
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    return this.client.send(new HeadObjectCommand({ Bucket, Key }));
  }

  async getObject(params: { region: RegionCode; key: string }): Promise<Uint8Array> {
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    const res = await this.client.send(new GetObjectCommand({ Bucket, Key }));
    const arrayBuf = await (res.Body as any).transformToByteArray();
    return new Uint8Array(arrayBuf);
  }

  async createMultipartUpload(params: { region: RegionCode; key: string; contentType?: string }) {
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    const res = await this.client.send(new CreateMultipartUploadCommand({ Bucket, Key, ContentType: params.contentType ?? 'application/octet-stream' }));
    return res.UploadId as string;
  }

  async uploadPart(params: { region: RegionCode; key: string; uploadId: string; partNumber: number; body: Uint8Array }) {
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    const res = await this.client.send(new UploadPartCommand({ Bucket, Key, UploadId: params.uploadId, PartNumber: params.partNumber, Body: Buffer.from(params.body) }));
    return res.ETag as string;
  }

  async completeMultipart(params: { region: RegionCode; key: string; uploadId: string; parts: { ETag: string; PartNumber: number }[] }) {
    const Bucket = bucketForRegion(params.region);
    const Key = params.key;
    await this.client.send(new CompleteMultipartUploadCommand({ Bucket, Key, UploadId: params.uploadId, MultipartUpload: { Parts: params.parts } }));
  }
}


