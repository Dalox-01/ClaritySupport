import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import React from 'react';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2pt solid #1E6F5C',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    color: '#1E6F5C',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#6B4F3A',
  },
  content: {
    marginBottom: 20,
    lineHeight: 1.6,
  },
  paragraph: {
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1pt solid #E8E2D0',
    paddingTop: 10,
  },
  watermark: {
    position: 'absolute',
    bottom: 50,
    right: 50,
    fontSize: 10,
    color: '#ccc',
    transform: 'rotate(-45deg)',
  },
});

type EmailPDFProps = {
  title: string;
  content: string;
  showWatermark?: boolean;
};

export const EmailPDFDocument: React.FC<EmailPDFProps> = ({ title, content, showWatermark = false }) => {
  const paragraphs = content
    .replace(/<[^>]*>/g, '')
    .split('\n\n')
    .filter((p) => p.trim());

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      React.createElement(
        View,
        { style: styles.header },
        React.createElement(Text, { style: styles.title }, title),
        React.createElement(
          Text,
          { style: styles.subtitle },
          `Généré avec MailWizard - ${new Date().toLocaleDateString('fr-FR')}`
        )
      ),
      React.createElement(
        View,
        { style: styles.content },
        ...paragraphs.map((para, idx) =>
          React.createElement(Text, { key: idx, style: styles.paragraph }, para)
        )
      ),
      showWatermark &&
        React.createElement(Text, { style: styles.watermark }, 'MailWizard FREE'),
      React.createElement(
        View,
        { style: styles.footer },
        React.createElement(Text, null, 'Créé avec MailWizard - mailwizard.app')
      )
    )
  );
};

export function generatePDFContent(title: string, content: string, isPro: boolean): any {
  return EmailPDFDocument({ title, content, showWatermark: !isPro });
}
