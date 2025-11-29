import { randomUUID } from 'crypto';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { simpleParser } from 'mailparser';
import fetch from 'node-fetch';

const REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET;
const MAILCENTER_ENDPOINT = process.env.MAILCENTER_ENDPOINT;
const API_SECRET = process.env.API_SECRET;
const DELETE_AFTER_FORWARD = (process.env.DELETE_AFTER_FORWARD ?? 'true').toLowerCase() !== 'false';

const s3 = new S3Client({ region: REGION });

function mapAddresses(list) {
  if (!list?.length) return [];
  return list.map(({ address, name }) => ({
    email: address ? address.toLowerCase() : null,
    name: name || null,
  }));
}

function headersToObject(headers) {
  if (!headers) return {};
  if (headers instanceof Map) {
    return Object.fromEntries(headers.entries());
  }
  return headers;
}

function buildResendCompatiblePayload(parsedEmail, metadata = {}) {
  const toList = mapAddresses(parsedEmail.to?.value);
  const ccList = mapAddresses(parsedEmail.cc?.value);
  const bccList = mapAddresses(parsedEmail.bcc?.value);
  const primaryFrom = mapAddresses(parsedEmail.from?.value)?.[0] || { email: null, name: null };
  const messageId = parsedEmail.messageId || metadata.sesMessageId || randomUUID();

  return {
    provider: 'aws-ses',
    type: 'email.inbound',
    id: messageId,
    data: {
      id: messageId,
      to: toList,
      cc: ccList,
      bcc: bccList,
      from: primaryFrom,
      subject: parsedEmail.subject || '(Sans objet)',
      text: parsedEmail.text || '',
      html: parsedEmail.html || parsedEmail.textAsHtml || '',
      headers: headersToObject(parsedEmail.headers),
      date: parsedEmail.date?.toISOString?.() || metadata.fallbackDate || new Date().toISOString(),
      attachments: parsedEmail.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content_type: attachment.contentType,
        size: attachment.size,
      })),
      tags: {
        provider: 'aws-ses',
      },
    },
  };
}

async function forwardToMailCenter(payload) {
  if (!MAILCENTER_ENDPOINT) {
    throw new Error('MAILCENTER_ENDPOINT is not configured');
  }

  const response = await fetch(MAILCENTER_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': API_SECRET ?? '',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mail Center webhook failed (${response.status}): ${text}`);
  }
}

export const handler = async (event) => {
  if (!S3_BUCKET) {
    throw new Error('S3_BUCKET is not configured');
  }

  const record = event.Records?.[0];
  if (!record) {
    console.warn('SES event without records', JSON.stringify(event));
    return;
  }

  const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  const objectResponse = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: objectKey }));
  const rawEmail = await objectResponse.Body.transformToString();

  const parsedEmail = await simpleParser(rawEmail);
  const payload = buildResendCompatiblePayload(parsedEmail, {
    sesMessageId: record.ses?.mail?.messageId,
    fallbackDate: record.ses?.mail?.timestamp,
  });

  await forwardToMailCenter(payload);

  if (DELETE_AFTER_FORWARD) {
    await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: objectKey }));
  }
};
