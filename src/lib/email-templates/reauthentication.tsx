import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({
  token,
}: ReauthenticationEmailProps) => (
  <Html lang="ru" dir="ltr">
    <Head />
    <Preview>Ваш код подтверждения</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Подтверждение входа 🔑</Heading>
        <Text style={text}>
          Используйте этот код, чтобы подтвердить, что это действительно вы:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Код действует ограниченное время. Если вы не запрашивали его —
          просто проигнорируйте это письмо.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#111111',
  letterSpacing: '4px',
  margin: '0 0 30px',
}
const footer = {
  fontSize: '13px',
  color: '#999999',
  lineHeight: '1.5',
  margin: '32px 0 0',
}
