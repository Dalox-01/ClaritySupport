import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { createAuditLog } from '@/lib/db';
import { z } from 'zod';

const sendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1, 'Le sujet est requis'),
  html: z.string().min(1, 'Le contenu HTML est requis'),
  text: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = sendEmailSchema.parse(body);

    const result = await sendEmail(validated);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to send email',
        },
        { status: 500 }
      );
    }

    await createAuditLog(session.user.id, 'email_sent', {
      to: validated.to,
      subject: validated.subject,
      emailId: result.id,
    });

    return NextResponse.json({
      success: true,
      id: result.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
