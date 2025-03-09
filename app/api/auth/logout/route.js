import { NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST() {
  try {
    // Remove token cookie
    await removeTokenCookie();
    
    // Note: sessionStorage is cleared on the client side in the Header component
    // when the logout button is clicked
    
    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 