import React from 'react';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#0A192F', color: '#FFFFFF', padding: '20px' }}>
      <div style={{ maxWidth: '400px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          {statusCode ? `Error ${statusCode}` : 'An unexpected error occurred'}
        </h1>
        <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '20px' }}>
          Please return to the RESQ KERALA portal or download the mobile app.
        </p>
        <Link href="/" style={{ display: 'inline-block', padding: '10px 20px', background: '#DC2626', color: '#FFFFFF', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
