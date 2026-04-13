import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

type Props = {
  displayName: string;
  verifyUrl: string;
  initialPassword?: string;
};

export function EmployeeVerificationEmail({
  displayName,
  verifyUrl,
  initialPassword,
}: Props) {
  const preview = initialPassword
    ? "Verify your DEVOPS AFRICA account — your sign-in details are inside."
    : "Verify your DEVOPS AFRICA account to get started.";

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>DEVOPS AFRICA</Text>
            <Text style={tagline}>Workplace &amp; welfare portal</Text>
          </Section>

          <Section style={card}>
            <Heading style={h1}>Welcome, {displayName}</Heading>
            <Text style={paragraph}>
              An administrator has created your DEVOPS AFRICA account. Please
              confirm your email address to activate access. This helps us keep
              your account secure.
            </Text>

            {initialPassword ? (
              <Section style={passwordBox}>
                <Text style={passwordLabel}>Your initial sign-in password</Text>
                <Text style={passwordMono}>{initialPassword}</Text>
                <Text style={passwordHint}>
                  For your security, change this password as soon as you sign in.
                  Do not share it with anyone.
                </Text>
              </Section>
            ) : null}

            <Section style={{ textAlign: "center" as const, margin: "28px 0" }}>
              <Button href={verifyUrl} style={button}>
                Verify email &amp; continue
              </Button>
            </Section>

            <Text style={small}>
              If the button doesn&apos;t work, copy and paste this link into your
              browser:
            </Text>
            <Text style={linkFallback}>{verifyUrl}</Text>

            <Hr style={hr} />

            <Text style={footer}>
              If you didn&apos;t expect this invitation, you can ignore this email.
              <br />
              © {new Date().getFullYear()} DEVOPS AFRICA
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main: React.CSSProperties = {
  backgroundColor: "#f4f6f4",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container: React.CSSProperties = {
  margin: "0 auto",
  padding: "32px 16px 48px",
  maxWidth: "560px",
};

const header: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "24px",
};

const brand: React.CSSProperties = {
  margin: "0",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.35em",
  color: "#146C43",
  textTransform: "uppercase",
};

const tagline: React.CSSProperties = {
  margin: "8px 0 0",
  fontSize: "12px",
  color: "#64748b",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  padding: "36px 32px",
  border: "1px solid #e2e8e0",
  boxShadow: "0 12px 40px rgba(15, 23, 42, 0.06)",
};

const h1: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: "22px",
  fontWeight: 700,
  color: "#0f172a",
  lineHeight: 1.35,
};

const paragraph: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: "15px",
  lineHeight: 1.65,
  color: "#334155",
};

const passwordBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "12px",
  border: "1px solid #bbf7d0",
  padding: "20px 18px",
  margin: "0 0 24px",
};

const passwordLabel: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#166534",
};

const passwordMono: React.CSSProperties = {
  margin: "0 0 10px",
  fontSize: "17px",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontWeight: 600,
  color: "#14532d",
  wordBreak: "break-all",
};

const passwordHint: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: 1.5,
  color: "#3f6212",
};

const button: React.CSSProperties = {
  backgroundColor: "#146C43",
  borderRadius: "10px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  textAlign: "center",
  display: "inline-block",
  padding: "14px 28px",
};

const small: React.CSSProperties = {
  margin: "0 0 6px",
  fontSize: "12px",
  color: "#64748b",
  lineHeight: 1.5,
};

const linkFallback: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: "11px",
  lineHeight: 1.5,
  color: "#146C43",
  wordBreak: "break-all",
};

const hr: React.CSSProperties = {
  borderColor: "#e2e8f0",
  margin: "28px 0 20px",
};

const footer: React.CSSProperties = {
  margin: 0,
  fontSize: "12px",
  lineHeight: 1.6,
  color: "#94a3b8",
};

export default EmployeeVerificationEmail;
