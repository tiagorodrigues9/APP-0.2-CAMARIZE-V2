import Link from 'next/link';

export default function Custom500() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>500 - Erro interno do servidor</h1>
      <p>Algo deu errado no servidor. Tente novamente mais tarde.</p>
      <Link href="/" style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        marginTop: '20px'
      }}>
        Voltar ao início
      </Link>
    </div>
  );
}
