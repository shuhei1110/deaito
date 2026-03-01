import "server-only"

import { Storage } from "@google-cloud/storage"

const projectId = process.env.GCS_PROJECT_ID
const clientEmail = process.env.GCS_CLIENT_EMAIL
const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n")
const bucketName = process.env.GCS_BUCKET_NAME

if (!projectId || !clientEmail || !privateKey || !bucketName) {
  throw new Error(
    "GCS environment variables are not set: GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY, GCS_BUCKET_NAME"
  )
}

const storage = new Storage({
  projectId,
  credentials: { client_email: clientEmail, private_key: privateKey },
})

const bucket = storage.bucket(bucketName)

/** 署名付きアップロードURL を生成（PUT、15分有効） */
export async function generateSignedUploadUrl(
  objectPath: string,
  contentType: string
): Promise<string> {
  const [url] = await bucket.file(objectPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  })
  return url
}

/** 署名付き読み取りURL を生成（GET、1時間有効） */
export async function generateSignedReadUrl(objectPath: string): Promise<string> {
  const [url] = await bucket.file(objectPath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000,
  })
  return url
}

/** オブジェクトが存在するか確認 */
export async function objectExists(objectPath: string): Promise<boolean> {
  const [exists] = await bucket.file(objectPath).exists()
  return exists
}

/** オブジェクトのサイズを取得（bytes） */
export async function getObjectSize(objectPath: string): Promise<number> {
  const [metadata] = await bucket.file(objectPath).getMetadata()
  return Number(metadata.size) || 0
}

/** オブジェクトを削除 */
export async function deleteObject(objectPath: string): Promise<void> {
  await bucket.file(objectPath).delete({ ignoreNotFound: true })
}
