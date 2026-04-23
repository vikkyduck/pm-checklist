import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'

export function useIsAdmin(userId: string | undefined | null) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!userId) {
      setIsAdmin(false)
      setReady(true)
      return
    }
    let cancelled = false
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setIsAdmin(!!data)
        setReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  return { isAdmin, ready }
}
