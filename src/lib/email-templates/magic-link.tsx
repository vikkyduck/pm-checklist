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
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="ru" dir="ltr">
    <Head />
    <Preview>Ваша ссылка для входа в {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Привет! 👋</Heading>
        <Text style={text}>
          Рады снова видеть вас в <strong>{siteName}</strong>. Чтобы войти
          в чек-лист, просто нажмите кнопку ниже — никаких паролей не нужно.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Войти в чек-лист
        </Button>
        <Text style={text}>
          Ссылка действует ограниченное время. Если кнопка не работает,
          скопируйте этот адрес в браузер:
        </Text>
        <Text style={linkText}>{confirmationUrl}</Text>
        <Text style={footer}>
          Если вы не запрашивали эту ссылку — просто проигнорируйте письмо,
          ваш аккаунт в безопасности. Хорошего дня! ✨
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#111111',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#444444',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const linkText = {
  fontSize: '13px',
  color: '#666666',
  wordBreak: 'break-all' as const,
  margin: '0 0 24px',
}
const button = {
  backgroundColor: '#111111',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  borderRadius: '10px',
  padding: '14px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '0 0 24px',
}
const footer = {
  fontSize: '13px',
  color: '#999999',
  lineHeight: '1.5',
  margin: '32px 0 0',
}
