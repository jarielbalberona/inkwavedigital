import { inject, injectable } from "tsyringe";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { imageLibrary } from "@inkwave/db";
import type { IImageLibraryRepository, ImageLibraryItem } from "../../domain/repositories/IImageLibraryRepository.js";

@injectable()
export class DrizzleImageLibraryRepository implements IImageLibraryRepository {
  constructor(@inject("Database") private db: PostgresJsDatabase) {}

  async save(image: Omit<ImageLibraryItem, "id" | "createdAt">): Promise<ImageLibraryItem> {
    const [result] = await this.db
      .insert(imageLibrary)
      .values({
        tenantId: image.tenantId,
        filename: image.filename,
        originalName: image.originalName,
        url: image.url,
        thumbnailUrl: image.thumbnailUrl,
        size: image.size,
        mimeType: image.mimeType,
        width: image.width,
        height: image.height,
        uploadedBy: image.uploadedBy,
      })
      .returning();

    return {
      id: result.id,
      tenantId: result.tenantId,
      filename: result.filename,
      originalName: result.originalName,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      size: result.size,
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      uploadedBy: result.uploadedBy,
      createdAt: result.createdAt,
    };
  }

  async findByTenantId(tenantId: string): Promise<ImageLibraryItem[]> {
    const results = await this.db
      .select()
      .from(imageLibrary)
      .where(eq(imageLibrary.tenantId, tenantId));

    return results.map((result) => ({
      id: result.id,
      tenantId: result.tenantId,
      filename: result.filename,
      originalName: result.originalName,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      size: result.size,
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      uploadedBy: result.uploadedBy,
      createdAt: result.createdAt,
    }));
  }

  async findById(id: string): Promise<ImageLibraryItem | null> {
    const [result] = await this.db
      .select()
      .from(imageLibrary)
      .where(eq(imageLibrary.id, id));

    if (!result) return null;

    return {
      id: result.id,
      tenantId: result.tenantId,
      filename: result.filename,
      originalName: result.originalName,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      size: result.size,
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      uploadedBy: result.uploadedBy,
      createdAt: result.createdAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(imageLibrary).where(eq(imageLibrary.id, id));
  }
}

