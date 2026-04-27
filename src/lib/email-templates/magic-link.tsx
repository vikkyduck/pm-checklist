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
  const greeting = recipientName ? `${recipientName}, вход почти готов` : 'Вход почти готов'
  return (
    <Html lang="ru" dir="ltr">
      <Head />
      <Preview>
        {recipientName ? `${recipientName}, ваша ссылка для входа в ${siteName}` : `Ваша ссылка для входа в ${siteName}`}
      </Preview>
      <Body style={main}>
        <Container style={shell}>
          <Text style={eyebrow}>PM ЧЕК-ЛИСТ</Text>
          <Heading style={h1}>{greeting}</Heading>
          <Text style={text}>
            Нажмите кнопку ниже, чтобы безопасно войти в платформу <strong>{siteName}</strong> без пароля.
          </Text>

          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button style={button} href={confirmationUrl}>
              Войти в платформу
            </Button>
          </Section>

          <Text style={note}>
            Кнопка не открывается? Перейдите по ссылке вручную:
          </Text>
          <Text style={linkWrap}>
            <Link href={confirmationUrl} style={linkStyle}>
              {confirmationUrl}
            </Link>
          </Text>

          <Hr style={hr} />

          <Text style={meta}>
            Ссылка одноразовая и действует ограниченное время. Если вы не запрашивали вход, просто проигнорируйте это письмо — ваш аккаунт останется в безопасности.
          </Text>

          <Text style={footer}>
            С уважением, команда {siteName}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '32px 16px',
}
const shell = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '40px 32px',
  border: '1px solid #e7ecf3',
  borderRadius: '24px',
  backgroundColor: '#f8fafc',
}
const eyebrow = {
  margin: '0 0 16px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.12em',
  color: '#5b6b83',
}
const h1 = {
  fontSize: '28px',
  fontWeight: 700,
  color: '#101828',
  margin: '0 0 16px',
  lineHeight: '1.2',
}
const text = {
  fontSize: '16px',
  color: '#475467',
  lineHeight: '1.65',
  margin: '0 0 8px',
}
const button = {
  backgroundColor: '#111827',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700,
  borderRadius: '14px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const note = { fontSize: '13px', color: '#667085', margin: '0 0 6px' }
const linkWrap = { fontSize: '13px', margin: '0 0 8px', wordBreak: 'break-all' as const }
const linkStyle = { color: '#2563eb', textDecoration: 'underline' }
const hr = { borderColor: '#e4e7ec', margin: '28px 0' }
const meta = { fontSize: '13px', color: '#667085', lineHeight: '1.6', margin: '0 0 16px' }
const footer = { fontSize: '12px', color: '#98a2b3', margin: '0' }
