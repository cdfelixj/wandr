import { NextRequest, NextResponse } from 'next/server';

// Note: This API route is currently disabled as authentication is handled client-side with Auth0 SPA SDK
// If server-side authentication is needed in the future, implement proper auth middleware

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'This API route is currently disabled. Authentication is handled client-side.' },
    { status: 501 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This API route is currently disabled. Authentication is handled client-side.' },
    { status: 501 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'This API route is currently disabled. Authentication is handled client-side.' },
    { status: 501 }
  );
}
