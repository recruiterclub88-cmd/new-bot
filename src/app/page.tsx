import Link from 'next/link';

export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ color: '#075e54' }}>WhatsApp Bot Web Server</h1>
      <p>Сервер для работы бота в режиме 24/7 успешно запущен.</p>
      <Link href="/admin" style={{
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#25d366',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: 'bold'
      }}>
        Перейти в админ-панель
      </Link>
    </main>
  );
}
