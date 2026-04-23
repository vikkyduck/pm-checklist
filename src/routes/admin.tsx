import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useIsAdmin } from '@/hooks/use-is-admin'
import { callServerFn } from '@/lib/call-server-fn'
import {
  getEmailStats,
  getEmailLog,
  getUsers,
  inviteUser,
  setUserAdmin,
} from '@/lib/admin/server'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
  head: () => ({
    meta: [{ title: 'Админ-панель · PM Чек-лист' }, { name: 'robots', content: 'noindex' }],
  }),
})

type Tab = 'stats' | 'log' | 'users'

function AdminPage() {
  const navigate = useNavigate()
  const { user, ready, logout } = useAuth()
  const { isAdmin, ready: roleReady } = useIsAdmin(user?.id)
  const [tab, setTab] = useState<Tab>('stats')

  useEffect(() => {
    if (ready && !user) navigate({ to: '/login', replace: true })
  }, [ready, user, navigate])

  if (!ready || !roleReady) {
    return <CenterMsg>Загружаем…</CenterMsg>
  }

  if (!user) return null

  if (!isAdmin) {
    return (
      <CenterMsg>
        <div className="space-y-3 text-center">
          <h1 className="text-xl font-semibold text-foreground">Доступ закрыт</h1>
          <p className="text-sm text-muted-foreground">У вас нет прав администратора.</p>
          <Link to="/" className="inline-block rounded-xl bg-accent px-4 py-2 text-sm font-medium text-[oklch(0.18_0.03_255)]">
            На главную
          </Link>
        </div>
      </CenterMsg>
    )
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-40 animate-float-slow" style={{ background: 'var(--stage-3)' }} />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full blur-3xl opacity-30 animate-float-slow" style={{ background: 'var(--stage-5)', animationDelay: '-6s' }} />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:px-10 lg:py-14">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="glass-pill mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] tracking-wide text-foreground/80">
              <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
              Админ-панель
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Управление чек-листом
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.email} · роль admin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
              К чек-листу
            </Link>
            <button onClick={logout} className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground">
              Выйти
            </button>
          </div>
        </header>

        <nav className="glass mb-6 flex gap-1 rounded-2xl p-1.5">
          {(['stats', 'log', 'users'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                tab === t
                  ? 'bg-white/10 text-foreground shadow-[0_4px_12px_-4px_rgba(0,0,0,0.4)]'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
              ].join(' ')}
            >
              {t === 'stats' && 'Статистика email'}
              {t === 'log' && 'Журнал писем'}
              {t === 'users' && 'Пользователи'}
            </button>
          ))}
        </nav>

        {tab === 'stats' && <StatsTab />}
        {tab === 'log' && <LogTab />}
        {tab === 'users' && <UsersTab currentUserId={user.id} />}
      </div>
    </main>
  )
}

/* ─── Stats ─────────────────────────────────────────────────── */

function StatsTab() {
  const [data, setData] = useState<Awaited<ReturnType<typeof getEmailStats>> | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    callServerFn(getEmailStats).then(setData).catch((e) => setErr(e.message))
  }, [])

  if (err) return <ErrorBox msg={err} />
  if (!data) return <Skeleton />

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {(['24h', '7d', '30d'] as const).map((k) => {
        const b = data.buckets[k]
        const labels = { '24h': 'Последние 24 часа', '7d': 'Последние 7 дней', '30d': 'Последние 30 дней' }
        return (
          <div key={k} className="glass specular rounded-2xl p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{labels[k]}</div>
            <div className="mt-2 text-3xl font-semibold tabular-nums text-foreground">{b.total}</div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <Stat label="Доставлено" value={b.sent} color="oklch(0.78 0.18 145)" />
              <Stat label="В очереди" value={b.pending} color="oklch(0.82 0.16 85)" />
              <Stat label="Ошибки" value={b.failed} color="oklch(0.72 0.22 25)" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-2 text-center">
      <div className="text-base font-semibold tabular-nums" style={{ color }}>{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  )
}

/* ─── Log ───────────────────────────────────────────────────── */

function LogTab() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof getEmailLog>>['rows']>([])
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    callServerFn(getEmailLog, { limit: 100, status: status || undefined })
      .then((r) => setRows(r.rows))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="glass rounded-xl border-0 bg-white/[0.04] px-3 py-2 text-sm text-foreground focus:outline-none"
        >
          <option value="">Все статусы</option>
          <option value="sent">Доставлено</option>
          <option value="pending">В очереди</option>
          <option value="failed">Ошибка</option>
          <option value="dlq">DLQ</option>
          <option value="bounced">Bounce</option>
        </select>
        <button onClick={load} className="rounded-xl bg-white/[0.06] px-3 py-2 text-sm text-foreground hover:bg-white/[0.1]">
          Обновить
        </button>
      </div>

      {err && <ErrorBox msg={err} />}

      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left">Шаблон</th>
              <th className="px-4 py-2.5 text-left">Получатель</th>
              <th className="px-4 py-2.5 text-left">Статус</th>
              <th className="px-4 py-2.5 text-left">Когда</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Загружаем…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Нет записей</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-foreground/90">{r.template_name}</td>
                <td className="px-4 py-2.5 text-foreground/90">{r.recipient_email}</td>
                <td className="px-4 py-2.5"><StatusBadge status={r.status} error={r.error_message} /></td>
                <td className="px-4 py-2.5 text-muted-foreground">{formatDate(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatusBadge({ status, error }: { status: string; error?: string | null }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    sent: { bg: 'oklch(0.78 0.18 145 / 0.18)', fg: 'oklch(0.85 0.18 145)', label: 'Доставлено' },
    pending: { bg: 'oklch(0.82 0.16 85 / 0.18)', fg: 'oklch(0.88 0.16 85)', label: 'В очереди' },
    failed: { bg: 'oklch(0.72 0.22 25 / 0.18)', fg: 'oklch(0.82 0.22 25)', label: 'Ошибка' },
    dlq: { bg: 'oklch(0.72 0.22 25 / 0.18)', fg: 'oklch(0.82 0.22 25)', label: 'DLQ' },
    bounced: { bg: 'oklch(0.72 0.22 25 / 0.18)', fg: 'oklch(0.82 0.22 25)', label: 'Bounce' },
    suppressed: { bg: 'oklch(0.7 0.05 255 / 0.18)', fg: 'oklch(0.8 0.05 255)', label: 'Подавлено' },
  }
  const s = map[status] ?? { bg: 'oklch(0.7 0.05 255 / 0.18)', fg: 'oklch(0.8 0.05 255)', label: status }
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: s.bg, color: s.fg }}
      title={error ?? undefined}
    >
      {s.label}
    </span>
  )
}

/* ─── Users + invites ───────────────────────────────────────── */

function UsersTab({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof getUsers>>['users']>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    callServerFn(getUsers)
      .then((r) => setUsers(r.users))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteMsg(null)
    try {
      const res = await callServerFn(inviteUser, {
        email: inviteEmail.trim(),
        display_name: inviteName.trim() || undefined,
      })
      setInviteMsg(
        res.mode === 'invited'
          ? `Приглашение отправлено на ${inviteEmail}`
          : `Пользователь уже существует — отправили ссылку для входа на ${inviteEmail}`,
      )
      setInviteEmail('')
      setInviteName('')
      load()
    } catch (e) {
      setInviteMsg(`Ошибка: ${e instanceof Error ? e.message : 'не удалось отправить'}`)
    } finally {
      setInviting(false)
    }
  }

  async function toggleAdmin(userId: string, makeAdmin: boolean) {
    try {
      await callServerFn(setUserAdmin, { user_id: userId, make_admin: makeAdmin })
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось изменить роль')
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="glass specular rounded-2xl p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-foreground/80">
          Пригласить участника
        </h2>
        <form onSubmit={handleInvite} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="email@company.ru"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-white/20"
          />
          <input
            type="text"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="Имя (необязательно)"
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-white/20"
          />
          <button
            type="submit"
            disabled={inviting || !inviteEmail}
            className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[oklch(0.18_0.03_255)] shadow-[0_8px_24px_-8px_var(--accent)] transition hover:brightness-110 disabled:opacity-50"
          >
            {inviting ? 'Отправляем…' : 'Пригласить'}
          </button>
        </form>
        {inviteMsg && (
          <p className="mt-3 text-xs text-foreground/80">{inviteMsg}</p>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Приглашение придёт письмом со ссылкой для входа без пароля.
        </p>
      </div>

      {err && <ErrorBox msg={err} />}

      {/* Users table */}
      <div className="glass overflow-hidden rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 text-left">Имя</th>
              <th className="px-4 py-2.5 text-left">Email</th>
              <th className="px-4 py-2.5 text-left">Роль</th>
              <th className="px-4 py-2.5 text-left">Зарегистрирован</th>
              <th className="px-4 py-2.5 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Загружаем…</td></tr>}
            {!loading && users.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Нет пользователей</td></tr>
            )}
            {users.map((u) => {
              const isAdmin = u.roles.includes('admin')
              return (
                <tr key={u.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-foreground/90">{u.display_name ?? '—'}</td>
                  <td className="px-4 py-2.5 text-foreground/90">{u.email}</td>
                  <td className="px-4 py-2.5">
                    {isAdmin ? (
                      <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-medium text-accent">admin</span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">user</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-2.5 text-right">
                    {u.id !== currentUserId && (
                      <button
                        onClick={() => toggleAdmin(u.id, !isAdmin)}
                        className="rounded-lg bg-white/[0.06] px-3 py-1 text-xs text-foreground/90 hover:bg-white/[0.12]"
                      >
                        {isAdmin ? 'Снять admin' : 'Сделать admin'}
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ─── Helpers ───────────────────────────────────────────────── */

function CenterMsg({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass rounded-3xl px-8 py-10 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
      {msg}
    </div>
  )
}

function Skeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass h-32 animate-pulse rounded-2xl" />
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
}
