import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
  recipientName?: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
  recipientName,
}: InviteEmailProps) => {
  const greetingName = recipientName?.trim() || 'привет'
  const isNamed = Boolean(recipientName?.trim())

  return (
    <Html lang="ru" dir="ltr">
      <Head />
      <Preview>
        Приглашение в PM Чек-лист — ваш помощник для запуска проектов
      </Preview>
      <Body style={main}>
        <Container style={outer}>
          <Section style={card}>
            <Text style={brand}>PM Чек-лист</Text>

            <Heading style={h1}>
              {isNamed ? `${greetingName}, рады вас видеть 👋` : 'Рады вас видеть 👋'}
            </Heading>

            <Text style={text}>
              Вас приглашают присоединиться к{' '}
              <Link href={siteUrl} style={link}>
                {siteName}
              </Link>{' '}
              — это интерактивный чек-лист для&nbsp;продакт-менеджеров,
              который ведёт вас по&nbsp;этапам запуска продукта: от&nbsp;идеи
              до&nbsp;первых пользователей.
            </Text>

            <Section style={featuresWrap}>
              <Text style={featureItem}>
                <span style={dot}>•</span> Пошаговые задачи по&nbsp;6&nbsp;этапам
                продуктового цикла
              </Text>
              <Text style={featureItem}>
                <span style={dot}>•</span> Прогресс сохраняется автоматически
                в&nbsp;вашем аккаунте
              </Text>
              <Text style={featureItem}>
                <span style={dot}>•</span> Доступ с&nbsp;любого устройства
              </Text>
            </Section>

            <Text style={text}>
              Чтобы начать, подтвердите аккаунт по&nbsp;кнопке ниже&nbsp;—
              это&nbsp;займёт меньше минуты:
            </Text>

            <Section style={buttonWrap}>
              <Button style={button} href={confirmationUrl}>
                Принять приглашение
              </Button>
            </Section>

            <Text style={hint}>
              Если кнопка не&nbsp;работает, скопируйте эту ссылку
              в&nbsp;браузер:
            </Text>
            <Text style={linkFallback}>{confirmationUrl}</Text>

            <Hr style={divider} />

            <Text style={footer}>
              Если приглашение пришло вам по&nbsp;ошибке&nbsp;— просто
              проигнорируйте письмо, ничего не&nbsp;произойдёт.
            </Text>
            <Text style={footerSmall}>
              С&nbsp;уважением, команда {siteName}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default InviteEmail

// ─── Brand-aligned styles (PM Чек-лист: deep ocean + aqua accent) ───
// Email clients require hex/rgb — these are sRGB approximations of the
// app's oklch tokens (--background, --primary, --accent, glass surfaces).

const COLORS = {
  bg: '#ffffff', // email body must stay white per platform guidelines
  surface: '#0f1729', // deep oceanic dusk — approx oklch(0.18 0.03 255)
  surfaceSoft: '#1a2440',
  border: 'rgba(255,255,255,0.14)',
  text: '#e8edf5',
  textMuted: '#9aa6bf',
  accent: '#5ed3e8', // aqua — approx oklch(0.78 0.16 195)
  accentDeep: '#2bb8d1',
  primaryFg: '#0f1729',
}

const main = {
  backgroundColor: COLORS.bg,
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  margin: 0,
  padding: '32px 16px',
}

const outer = {
  maxWidth: '560px',
  margin: '0 auto',
}

const card = {
  background: COLORS.surface,
  backgroundImage: `radial-gradient(ellipse 80% 60% at 20% 0%, rgba(94,211,232,0.18), transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(168,120,255,0.14), transparent 60%)`,
  borderRadius: '20px',
  padding: '36px 32px',
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
}

const brand = {
  fontSize: '13px',
  fontWeight: 600 as const,
  color: COLORS.accent,
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0 0 24px',
}

const h1 = {
  fontSize: '26px',
  lineHeight: '1.25',
  fontWeight: 700 as const,
  color: COLORS.text,
  margin: '0 0 20px',
  letterSpacing: '-0.01em',
}

const text = {
  fontSize: '15px',
  color: COLORS.text,
  lineHeight: '1.65',
  margin: '0 0 18px',
}

const link = {
  color: COLORS.accent,
  textDecoration: 'none',
  fontWeight: 600 as const,
}

const featuresWrap = {
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${COLORS.border}`,
  borderRadius: '14px',
  padding: '16px 18px',
  margin: '8px 0 24px',
}

const featureItem = {
  fontSize: '14px',
  color: COLORS.text,
  lineHeight: '1.6',
  margin: '6px 0',
}

const dot = {
  color: COLORS.accent,
  fontWeight: 700 as const,
  marginRight: '8px',
}

const buttonWrap = {
  textAlign: 'center' as const,
  margin: '8px 0 24px',
}

const button = {
  background: COLORS.accent,
  color: COLORS.primaryFg,
  fontSize: '15px',
  fontWeight: 700 as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  letterSpacing: '0.01em',
  boxShadow: '0 8px 24px -8px rgba(94,211,232,0.5)',
}

const hint = {
  fontSize: '13px',
  color: COLORS.textMuted,
  lineHeight: '1.5',
  margin: '0 0 6px',
}

const linkFallback = {
  fontSize: '12px',
  color: COLORS.accentDeep,
  wordBreak: 'break-all' as const,
  margin: '0 0 8px',
  background: 'rgba(255,255,255,0.04)',
  padding: '10px 12px',
  borderRadius: '8px',
  border: `1px solid ${COLORS.border}`,
}

const divider = {
  borderColor: COLORS.border,
  margin: '28px 0 20px',
}

const footer = {
  fontSize: '13px',
  color: COLORS.textMuted,
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const footerSmall = {
  fontSize: '12px',
  color: COLORS.textMuted,
  margin: 0,
}
