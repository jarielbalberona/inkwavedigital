import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { injectable } from "tsyringe";
import sharp from "sharp";
import { createLogger } from "@inkwave/utils";

@injectable()
export class R2StorageService {
  private client: S3Client;
  private logger = createLogger("r2-storage");
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || "inkwave-images";
    this.publicUrl = process.env.R2_PUBLIC_URL || "http://localhost:9000";
    
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadImage(
    file: Buffer,
    filename: string,
    mimeType: string,
    tenantId: string
  ): Promise<{ url: string; thumbnailUrl: string; width: number; height: number }> {
    this.logger.info({ filename, tenantId }, "Uploading image to R2");

    // Optimize and resize main image (max 1200px width)
    const optimized = await sharp(file)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    const metadata = await sharp(optimized).metadata();

    // Create thumbnail (300px width)
    const thumbnail = await sharp(file)
      .resize(300, 300, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Upload main image
    const mainKey = `${tenantId}/${filename}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: mainKey,
        Body: optimized,
        ContentType: "image/jpeg",
      })
    );

    // Upload thumbnail
    const thumbKey = `${tenantId}/thumbnails/${filename}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: thumbKey,
        Body: thumbnail,
        ContentType: "image/jpeg",
      })
    );

    this.logger.info({ filename, tenantId }, "Image uploaded successfully");

    return {
      url: `${this.publicUrl}/${mainKey}`,
      thumbnailUrl: `${this.publicUrl}/${thumbKey}`,
      width: metadata.width || 0,
      height: metadata.height || 0,
    };
  }

  async deleteImage(filename: string, tenantId: string): Promise<void> {
    this.logger.info({ filename, tenantId }, "Deleting image from R2");

    const mainKey = `${tenantId}/${filename}`;
    const thumbKey = `${tenantId}/thumbnails/${filename}`;

    await Promise.all([
      this.client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: mainKey })),
      this.client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: thumbKey })),
    ]);

    this.logger.info({ filename, tenantId }, "Image deleted successfully");
  }
}

