# Image Upload Environment Variables

Add these environment variables to `apps/api/.env`:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=inkwave-images
R2_PUBLIC_URL=https://images.yourdomain.com
```

## Setup Instructions

1. Create a Cloudflare R2 bucket named `inkwave-images`
2. Generate API tokens with read/write permissions
3. Configure a custom domain for public access (or use R2's public URL)
4. Add the credentials to your `.env` file

## For Development/Testing

If you don't have R2 set up yet, you can use placeholder values:

```bash
R2_ACCOUNT_ID=test
R2_ACCESS_KEY_ID=test
R2_SECRET_ACCESS_KEY=test
R2_BUCKET_NAME=inkwave-images
R2_PUBLIC_URL=http://localhost:9000
```

Note: The upload functionality will fail without valid R2 credentials, but the rest of the application will work normally.

