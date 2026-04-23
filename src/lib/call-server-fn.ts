// Helper для вызова server functions с auth-токеном.
// TanStack Start server functions вызываются через fetch — мы оборачиваем
// их, чтобы автоматически прикрепить Bearer-токен из supabase сессии.
import { supabase } from '@/integrations/supabase/client'

type ServerFn<TInput, TOutput> = ((opts: { data?: TInput; headers?: HeadersInit }) => Promise<TOutput>) & {
  url?: string
}

export async function callServerFn<TInput, TOutput>(
  fn: ServerFn<TInput, TOutput>,
  data?: TInput,
): Promise<TOutput> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) throw new Error('Нет активной сессии')
  return fn({
    data,
    headers: { Authorization: `Bearer ${token}` },
  } as { data?: TInput; headers?: HeadersInit })
}
