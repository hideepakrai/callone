import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/connection';
import { User } from '@/lib/db/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    status: 'pending',
    database: {
      connected: false,
      error: null as string | null,
      uri_defined: !!process.env.MONGODB_URI,
    },
    environment: {
      node_version: process.version,
      nextauth_url: process.env.NEXTAUTH_URL || 'not defined',
      nextauth_secret: !!process.env.NEXTAUTH_SECRET,
    }
  };

  try {
    console.log('Diagnostic: Attempting DB connect...');
    await dbConnect();
    diagnostics.database.connected = true;

    // Try a simple query
    const userCount = await User.countDocuments();
    diagnostics.status = 'ok';
    (diagnostics as any).data = { userCount };
  } catch (err: any) {
    console.error('Diagnostic Error:', err);
    diagnostics.status = 'error';
    diagnostics.database.error = err.message || String(err);
  }

  return NextResponse.json(diagnostics);
}
