import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="ru" dir="ltr">
    <Head />
    <Preview>Подтвердите смену email в {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Подтвердите новый email ✉️</Heading>
        <Text style={text}>
          Вы запросили смену адреса в <strong>{siteName}</strong>:
        </Text>
        <Text style={text}>
          с{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          на{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>
          .
        </Text>
        <Text style={text}>Нажмите кнопку, чтобы подтвердить изменение:</Text>
        <Button style={button} href={confirmationUrl}>
          Подтвердить смену
        </Button>
        <Text style={footer}>
          Если это были не вы — пожалуйста, как можно скорее смените пароль
          и проверьте безопасность аккаунта.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
const link = { color: '#111111', textDecoration: 'underline' }
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
