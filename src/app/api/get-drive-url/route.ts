import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const photo = req.nextUrl.searchParams.get('photo') as string
  try {
    const signedUrl = `https://lh4.googleusercontent.com/d/${photo}`
    return NextResponse.json(
      { signedUrl, message: 'GET realizado com sucesso!' },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 403 })
  }
}
