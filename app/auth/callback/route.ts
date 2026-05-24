import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  // 1. Agarramos la URL y buscamos el parámetro "code"
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // 2. Si hay código, llamamos a Supabase en el backend
    const supabase = await createClient()
    
    // 3. Canjeamos el código por una sesión segura (las Cookies se guardan acá)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 4. Si todo salió bien, te mandamos a la pantalla principal
      return NextResponse.redirect(`${origin}/`)
    }
  }

  // Si algo falló, te mandamos al login de vuelta
  return NextResponse.redirect(`${origin}/login?error=true`)
}