// Server functions для админ-дашборда.
// Все функции защищены middleware requireSupabaseAuth + проверкой роли admin.
import { createServerFn } from '@tanstack/react-start'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'
import { supabaseAdmin } from '@/integrations/supabase/client.server'
import { z } from 'zod'

// Проверка, что текущий пользователь — админ
async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle()
  if (error) throw new Error('Не удалось проверить роль')
  if (!data) throw new Error('Доступ запрещён: требуется роль admin')
}

// ─── Статистика email ──────────────────────────────────────────
export const getEmailStats = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId)

    // Берём свежие 30 дней с дедупом по message_id
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data, error } = await supabaseAdmin
      .from('email_send_log')
      .select('message_id, status, created_at, template_name')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000)
    if (error) throw new Error(error.message)

    // Дедуп по message_id (берём последний статус)
    const latest = new Map<string, { status: string; created_at: string; template_name: string }>()
    for (const row of data ?? []) {
      const key = row.message_id ?? `${row.template_name}-${row.created_at}`
      if (!latest.has(key)) {
        latest.set(key, {
          status: row.status,
          created_at: row.created_at,
          template_name: row.template_name,
        })
      }
    }

    const now = Date.now()
    const ranges = {
      '24h': now - 24 * 60 * 60 * 1000,
      '7d': now - 7 * 24 * 60 * 60 * 1000,
      '30d': now - 30 * 24 * 60 * 60 * 1000,
    }

    const buckets: Record<string, { sent: number; failed: number; pending: number; total: number }> = {
      '24h': { sent: 0, failed: 0, pending: 0, total: 0 },
      '7d': { sent: 0, failed: 0, pending: 0, total: 0 },
      '30d': { sent: 0, failed: 0, pending: 0, total: 0 },
    }

    for (const item of latest.values()) {
      const ts = new Date(item.created_at).getTime()
      for (const [k, threshold] of Object.entries(ranges)) {
        if (ts >= threshold) {
          buckets[k].total++
          if (item.status === 'sent') buckets[k].sent++
          else if (item.status === 'pending') buckets[k].pending++
          else buckets[k].failed++
        }
      }
    }

    return { buckets }
  })

// ─── Журнал писем ──────────────────────────────────────────────
const LogQuerySchema = z.object({
  limit: z.number().int().min(1).max(200).default(100),
  status: z.string().min(1).max(32).optional(),
})

export const getEmailLog = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => LogQuerySchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId)

    let q = supabaseAdmin
      .from('email_send_log')
      .select('id, message_id, template_name, recipient_email, status, error_message, created_at')
      .order('created_at', { ascending: false })
      .limit(Math.min(data.limit * 2, 400)) // запас под дедуп

    if (data.status) q = q.eq('status', data.status)
    const { data: rows, error } = await q
    if (error) throw new Error(error.message)

    // Дедуп: оставляем последнюю запись по message_id
    const seen = new Set<string>()
    const out: typeof rows = []
    for (const r of rows ?? []) {
      const key = r.message_id ?? r.id
      if (seen.has(key)) continue
      seen.add(key)
      out.push(r)
      if (out.length >= data.limit) break
    }
    return { rows: out }
  })

// ─── Список пользователей ──────────────────────────────────────
export const getUsers = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId)

    const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('id, email, display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(500),
      supabaseAdmin.from('user_roles').select('user_id, role'),
    ])
    if (pErr) throw new Error(pErr.message)
    if (rErr) throw new Error(rErr.message)

    const roleMap = new Map<string, string[]>()
    for (const r of roles ?? []) {
      const arr = roleMap.get(r.user_id) ?? []
      arr.push(r.role)
      roleMap.set(r.user_id, arr)
    }

    return {
      users: (profiles ?? []).map((p) => ({
        id: p.id,
        email: p.email,
        display_name: p.display_name,
        created_at: p.created_at,
        roles: roleMap.get(p.id) ?? [],
      })),
    }
  })

// ─── Отправить приглашение ─────────────────────────────────────
const InviteSchema = z.object({
  email: z.string().email().max(255),
  display_name: z.string().min(1).max(100).optional(),
})

export const inviteUser = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InviteSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId)

    const redirectTo = `${process.env.SITE_URL || 'https://pm-checklist.lovable.app'}/auth/callback`

    const { data: result, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        redirectTo,
        data: data.display_name ? { display_name: data.display_name } : undefined,
      },
    )

    if (error) {
      // Если пользователь уже существует — отправим magic link вместо инвайта
      if (error.message?.toLowerCase().includes('already')) {
        const { error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: data.email,
          options: { redirectTo },
        })
        if (linkErr) throw new Error(linkErr.message)
        return { ok: true, mode: 'resent' as const }
      }
      throw new Error(error.message)
    }

    return { ok: true, mode: 'invited' as const, userId: result.user?.id }
  })

// ─── Назначить/снять роль admin ────────────────────────────────
const RoleSchema = z.object({
  user_id: z.string().uuid(),
  make_admin: z.boolean(),
})

export const setUserAdmin = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RoleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId)

    if (data.make_admin) {
      const { error } = await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: data.user_id, role: 'admin' }, { onConflict: 'user_id,role' })
      if (error) throw new Error(error.message)
    } else {
      // Не позволяем снять с себя последнюю роль
      if (data.user_id === context.userId) {
        throw new Error('Нельзя снять роль admin с самого себя')
      }
      const { error } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', data.user_id)
        .eq('role', 'admin')
      if (error) throw new Error(error.message)
    }
    return { ok: true }
  })
