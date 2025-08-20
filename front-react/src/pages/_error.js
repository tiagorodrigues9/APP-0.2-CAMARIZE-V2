function Error({ statusCode }) {

  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1>
        {statusCode
          ? `Erro ${statusCode} no servidor`
          : 'Erro no cliente'}
      </h1>
      <p>Se o problema persistir, tente acessar novamente.</p>
      <button 
        onClick={() => window.location.reload()} 
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Recarregar Página
      </button>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
