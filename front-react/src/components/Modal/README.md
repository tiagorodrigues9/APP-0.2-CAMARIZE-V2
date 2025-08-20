# 🎭 Componente Modal com Animações

Este é um componente Modal reutilizável com animações suaves para abrir e fechar.

## ✨ Características

- **Animações suaves** - Fade in/out com escala e movimento
- **Backdrop blur** - Efeito de desfoque no fundo
- **Responsivo** - Adapta-se a diferentes tamanhos de tela
- **Acessível** - Suporte a teclado e leitores de tela
- **Customizável** - Múltiplas opções de configuração

## 🚀 Como usar

### Importação básica
```jsx
import Modal from '../Modal';

function MeuComponente() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Abrir Modal
      </button>

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Título do Modal"
      >
        <p>Conteúdo do modal aqui...</p>
      </Modal>
    </>
  );
}
```

### Opções disponíveis

```jsx
<Modal 
  isOpen={boolean}                    // Controla se o modal está aberto
  onClose={function}                  // Função chamada ao fechar
  title={string|JSX}                 // Título do modal (opcional)
  showCloseButton={boolean}          // Mostra botão X (padrão: true)
  closeOnBackdropClick={boolean}     // Fecha ao clicar no fundo (padrão: true)
>
  {/* Conteúdo do modal */}
</Modal>
```

## 🎨 Animações

### Entrada
- **Overlay**: Fade in com blur progressivo
- **Modal**: Scale + translateY com bounce suave
- **Conteúdo**: Slide up com delay escalonado

### Saída
- **Overlay**: Fade out
- **Modal**: Scale down + translateY
- **Conteúdo**: Fade out

## 📱 Responsividade

- **Desktop**: Modal centralizado com margens
- **Mobile**: Modal ocupa quase toda a tela com margens pequenas
- **Scroll**: Automático quando conteúdo excede altura

## ♿ Acessibilidade

- **Teclado**: ESC fecha o modal
- **Focus**: Trap dentro do modal
- **ARIA**: Labels apropriados
- **Screen readers**: Anúncio de abertura/fechamento

## 🎯 Exemplos de uso

### Modal simples
```jsx
<Modal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Confirmação"
>
  <p>Tem certeza que deseja continuar?</p>
  <button onClick={handleConfirm}>Confirmar</button>
</Modal>
```

### Modal sem título
```jsx
<Modal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  showCloseButton={false}
>
  <div>Conteúdo customizado...</div>
</Modal>
```

### Modal com título customizado
```jsx
<Modal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title={
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>🎉</span>
      <span>Sucesso!</span>
    </div>
  }
>
  <p>Operação realizada com sucesso!</p>
</Modal>
```

## 🔧 Customização CSS

O componente usa CSS Modules. Para customizar, edite `Modal.module.css`:

```css
/* Overlay */
.modalOverlay {
  /* Estilos do fundo */
}

/* Conteúdo do modal */
.modalContent {
  /* Estilos do container */
}

/* Animações */
@keyframes slideInUp {
  /* Animação de entrada */
}
```

## 🐛 Troubleshooting

### Modal não fecha
- Verifique se `onClose` está sendo passado
- Confirme se `closeOnBackdropClick` está true

### Animações não funcionam
- Verifique se o CSS está sendo importado
- Confirme se não há conflitos de CSS

### Problemas de z-index
- O modal usa `z-index: 1000`
- Ajuste se necessário no CSS 