import * as React from 'react'

import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Row,
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
  const greeting = name ? `${name}, добро пожаловать` : 'Добро пожаловать'

  return (
    <Html lang="ru" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>
        {name
          ? `${name}, ваша персональная ссылка для входа в ${siteName}`
          : `Ваша персональная ссылка для входа в ${siteName}`}
      </Preview>
      <Body style={main}>
        <Container style={shell}>
          {/* Brand header strip */}
          <Section style={brandStrip}>
            <Row>
              <Column>
                <Text style={brandMark}>
                  <span style={brandDot} />
                  {siteName}
                </Text>
              </Column>
              <Column align="right">
                <Text style={brandMeta}>Безопасный вход</Text>
              </Column>
            </Row>
          </Section>

          {/* Hero card */}
          <Section style={card}>
            <Section style={glow} />

            <Text style={eyebrow}>Вход без пароля</Text>
            <Heading as="h1" style={title}>
              {greeting} в чек-лист PM
            </Heading>

            <Text style={lead}>
              Вы запросили вход в {siteName} — личный чек-лист продакт-менеджера в Авито.
              Нажмите кнопку ниже, и мы откроем вашу панель ровно там, где вы остановились.
            </Text>

            <Section style={ctaWrap}>
              <Button href={confirmationUrl} style={button}>
                Войти в чек-лист →
              </Button>
              <Text style={ctaCaption}>
                Один клик. Без пароля. Прогресс сохранится за вами.
              </Text>
            </Section>

            <Hr style={divider} />

            {/* Info grid */}
            <Section style={infoGrid}>
              <Row>
                <Column style={infoCol}>
                  <Text style={infoIcon}>⏱</Text>
                  <Text style={infoTitle}>1 час</Text>
                  <Text style={infoText}>срок действия ссылки</Text>
                </Column>
                <Column style={infoCol}>
                  <Text style={infoIcon}>🔒</Text>
                  <Text style={infoTitle}>Только для вас</Text>
                  <Text style={infoText}>одноразовый безопасный токен</Text>
                </Column>
                <Column style={infoCol}>
                  <Text style={infoIcon}>✦</Text>
                  <Text style={infoTitle}>Без пароля</Text>
                  <Text style={infoText}>вход по email-ссылке</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            <Text style={fallbackLabel}>
              Кнопка не открывается? Скопируйте ссылку в браузер:
            </Text>
            <Link href={confirmationUrl} style={fallbackLink}>
              {confirmationUrl}
            </Link>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Если вы не запрашивали вход — просто закройте это письмо.
              Без вашего клика по ссылке никто не сможет войти в ваш аккаунт.
            </Text>
            <Text style={footerBrand}>
              {siteName} · с заботой о продактах
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

/* ----------------------------- Design tokens ---------------------------- */

const palette = {
  pageBg: '#ffffff',
  ink: '#0b1020',
  inkSoft: '#11172b',
  inkPanel: '#161d36',
  line: 'rgba(255,255,255,0.10)',
  lineSoft: 'rgba(255,255,255,0.06)',
  text: '#eef2ff',
  textSoft: '#c8d0e6',
  muted: '#8e99b8',
  accent: '#7cf3e1',
  accentDeep: '#22c2ad',
  accentInk: '#06121f',
  violet: '#9b8cff',
}

const main = {
  backgroundColor: palette.pageBg,
  margin: 0,
  padding: '40px 16px',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Helvetica, Arial, sans-serif',
}

const shell = {
  maxWidth: '600px',
  margin: '0 auto',
}

const brandStrip = {
  padding: '0 4px 14px',
}

const brandMark = {
  margin: 0,
  color: palette.ink,
  fontSize: '13px',
  fontWeight: 700 as const,
  letterSpacing: '0.2px',
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  gap: '8px',
}

const brandDot = {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '999px',
  background: `linear-gradient(135deg, ${palette.accent}, ${palette.violet})`,
  boxShadow: `0 0 0 3px rgba(124,243,225,0.18)`,
  marginRight: '4px',
  verticalAlign: 'middle' as const,
}

const brandMeta = {
  margin: 0,
  color: '#6b7793',
  fontSize: '11px',
  fontWeight: 600 as const,
  letterSpacing: '1.2px',
  textTransform: 'uppercase' as const,
}

const card = {
  position: 'relative' as const,
  backgroundColor: palette.ink,
  backgroundImage: `
    radial-gradient(circle at 12% 0%, rgba(124,243,225,0.22), transparent 42%),
    radial-gradient(circle at 95% 100%, rgba(155,140,255,0.20), transparent 45%)
  `,
  border: `1px solid ${palette.line}`,
  borderRadius: '24px',
  padding: '40px 36px 32px',
  overflow: 'hidden' as const,
}

const glow = {
  // decorative spacer; actual glow comes from background-image above
  height: '0px',
  margin: 0,
}

const eyebrow = {
  margin: '0 0 14px',
  color: palette.accent,
  fontSize: '11px',
  fontWeight: 700 as const,
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
}

const title = {
  margin: '0 0 18px',
  color: palette.text,
  fontSize: '30px',
  lineHeight: '1.18',
  fontWeight: 700 as const,
  letterSpacing: '-0.5px',
}

const lead = {
  margin: '0 0 28px',
  color: palette.textSoft,
  fontSize: '15px',
  lineHeight: '1.7',
}

const ctaWrap = {
  textAlign: 'center' as const,
  margin: '0 0 30px',
}

const button = {
  background: `linear-gradient(135deg, ${palette.accent} 0%, ${palette.accentDeep} 100%)`,
  color: palette.accentInk,
  fontSize: '15px',
  fontWeight: 700 as const,
  borderRadius: '14px',
  padding: '16px 32px',
  textDecoration: 'none',
  display: 'inline-block' as const,
  boxShadow:
    '0 12px 28px -10px rgba(124,243,225,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
  letterSpacing: '0.2px',
}

const ctaCaption = {
  margin: '14px 0 0',
  color: palette.muted,
  fontSize: '12px',
  lineHeight: '1.5',
}

const divider = {
  borderColor: palette.lineSoft,
  borderTopWidth: '1px',
  margin: '24px 0',
}

const infoGrid = {
  margin: '0 0 8px',
}

const infoCol = {
  width: '33.33%',
  padding: '0 6px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
}

const infoIcon = {
  margin: '0 0 6px',
  fontSize: '20px',
  lineHeight: '1',
  color: palette.accent,
}

const infoTitle = {
  margin: '0 0 4px',
  color: palette.text,
  fontSize: '13px',
  fontWeight: 700 as const,
}

const infoText = {
  margin: 0,
  color: palette.muted,
  fontSize: '11px',
  lineHeight: '1.5',
}

const fallbackLabel = {
  margin: '0 0 10px',
  color: palette.muted,
  fontSize: '12px',
  lineHeight: '1.5',
}

const fallbackLink = {
  display: 'block',
  color: palette.accent,
  fontSize: '12px',
  lineHeight: '1.6',
  wordBreak: 'break-all' as const,
  backgroundColor: palette.inkPanel,
  border: `1px solid ${palette.line}`,
  borderRadius: '12px',
  padding: '12px 14px',
  textDecoration: 'none',
}

const footer = {
  padding: '22px 8px 4px',
}

const footerText = {
  margin: '0 0 10px',
  color: '#7c8499',
  fontSize: '12px',
  lineHeight: '1.6',
  textAlign: 'center' as const,
}

const footerBrand = {
  margin: 0,
  color: '#9aa3bb',
  fontSize: '11px',
  fontWeight: 600 as const,
  letterSpacing: '0.5px',
  textAlign: 'center' as const,
}
