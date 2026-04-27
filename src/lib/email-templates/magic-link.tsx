import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
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
}: MagicLinkEmailProps) => (
  <Html lang="ru" dir="ltr">
    <Head />
    <Preview>{recipientName ? `${recipientName}, ` : ''}ваша ссылка для входа в {siteName}</Preview>
    <Body style={main}>
      <Container style={shell}>
        <Text style={eyebrow}>PM ЧЕК-ЛИСТ</Text>
        <Heading style={h1}>{recipientName ? `${recipientName}, вход почти готов` : 'Вход почти готов'}</Heading>
        <Text style={text}>
          Нажмите на кнопку ниже, чтобы безопасно войти в <strong>{siteName}</strong> без пароля.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Войти в платформу
        </Button>
        <Text style={note}>Ссылка одноразовая и действует ограниченное время.</Text>
        <Text style={footer}>
          Если вы не запрашивали вход, просто проигнорируйте это письмо.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', padding: '24px 12px' }
const shell = {
  padding: '32px 28px',
  border: '1px solid #e7ecf3',
  borderRadius: '24px',
  backgroundColor: '#f8fafc',
}
const eyebrow = {
  margin: '0 0 12px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  color: '#5b6b83',
}
const h1 = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#101828',
  margin: '0 0 16px',
}
const text = {
  fontSize: '16px',
  color: '#475467',
  lineHeight: '1.65',
  margin: '0 0 24px',
}
const button = {
  backgroundColor: '#111827',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700,
  borderRadius: '14px',
  padding: '14px 22px',
  textDecoration: 'none',
}
const note = { fontSize: '13px', color: '#667085', margin: '18px 0 0' }
const footer = { fontSize: '12px', color: '#98a2b3', margin: '28px 0 0' }
