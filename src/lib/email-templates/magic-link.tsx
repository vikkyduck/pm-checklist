import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  recipientName?: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
  recipientName,
}: MagicLinkEmailProps) => {
  const name = recipientName?.trim()

  return (
    <Html lang="ru" dir="ltr">
      <Head />
      <Preview>
        {name
          ? `${name}, ваша ссылка для входа в PM Чек-лист`
          : 'Ваша ссылка для входа в PM Чек-лист'}
      </Preview>
      <Body style={main}>
        <Container style={shell}>
          <Section style={card}>
            <Text style={eyebrow}>PM Чек-лист</Text>
            <Heading style={title}>
              {name ? `${name}, вот ваша ссылка для входа` : 'Вот ваша ссылка для входа'}
            </Heading>

            <Text style={lead}>
              По этой ссылке вы войдёте в {siteName} — это безопасный вход без пароля.
              Нажмите кнопку ниже, и платформа откроется сразу в браузере.
            </Text>

            <Section style={panel}>
              <Text style={panelTitle}>Что это за ссылка</Text>
              <Text style={bullet}>• одноразовая и безопасная ссылка для входа</Text>
              <Text style={bullet}>• ведёт прямо в ваш PM Чек-лист</Text>
              <Text style={bullet}>• действует ограниченное время</Text>
            </Section>

            <Section style={ctaWrap}>
              <Button href={confirmationUrl} style={button}>
                Войти в PM Чек-лист
              </Button>
            </Section>

            <Text style={secondaryText}>
              Если кнопка не открывается, скопируйте ссылку в браузер:
            </Text>
            <Text style={fallbackLink}>{confirmationUrl}</Text>

            <Text style={footer}>
              Если вы не запрашивали вход, просто проигнорируйте письмо — доступ без вашего участия не будет завершён.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

const palette = {
  white: '#ffffff',
  ink: '#0f172a',
  inkSoft: '#172033',
  line: 'rgba(255,255,255,0.14)',
  text: '#ecf3ff',
  muted: '#a8b5cb',
  aqua: '#5ed3e8',
  aquaDeep: '#1fb8d4',
}

const main = {
  backgroundColor: palette.white,
  margin: 0,
  padding: '32px 16px',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif',
}

const shell = {
  maxWidth: '560px',
  margin: '0 auto',
}

const card = {
  backgroundColor: palette.ink,
  backgroundImage:
    'radial-gradient(circle at top left, rgba(94,211,232,0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(121,100,255,0.18), transparent 38%)',
  border: `1px solid ${palette.line}`,
  borderRadius: '22px',
  padding: '36px 32px',
}

const eyebrow = {
  margin: '0 0 16px',
  color: palette.aqua,
  fontSize: '12px',
  fontWeight: 700 as const,
  letterSpacing: '1.8px',
  textTransform: 'uppercase' as const,
}

const title = {
  margin: '0 0 16px',
  color: palette.text,
  fontSize: '28px',
  lineHeight: '1.2',
  fontWeight: 700 as const,
}

const lead = {
  margin: '0 0 20px',
  color: palette.text,
  fontSize: '15px',
  lineHeight: '1.7',
}

const panel = {
  margin: '0 0 24px',
  padding: '18px 18px 12px',
  borderRadius: '16px',
  backgroundColor: palette.inkSoft,
  border: `1px solid ${palette.line}`,
}

const panelTitle = {
  margin: '0 0 10px',
  color: palette.text,
  fontSize: '14px',
  fontWeight: 700 as const,
}

const bullet = {
  margin: '0 0 8px',
  color: palette.muted,
  fontSize: '14px',
  lineHeight: '1.6',
}

const ctaWrap = {
  textAlign: 'center' as const,
  margin: '0 0 22px',
}

const button = {
  backgroundColor: palette.aqua,
  color: palette.ink,
  fontSize: '15px',
  fontWeight: 700 as const,
  borderRadius: '14px',
  padding: '14px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}

const secondaryText = {
  margin: '0 0 8px',
  color: palette.muted,
  fontSize: '13px',
  lineHeight: '1.5',
}

const fallbackLink = {
  margin: '0 0 20px',
  color: palette.aquaDeep,
  fontSize: '12px',
  lineHeight: '1.6',
  wordBreak: 'break-all' as const,
  backgroundColor: 'rgba(255,255,255,0.05)',
  border: `1px solid ${palette.line}`,
  borderRadius: '10px',
  padding: '10px 12px',
}

const footer = {
  margin: 0,
  color: palette.muted,
  fontSize: '13px',
  lineHeight: '1.6',
}
