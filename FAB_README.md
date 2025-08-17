# Floating Action Button (FAB) - Componente Moderno

## Visão Geral

O `FloatingActionButton` é um componente moderno e responsivo que substitui o botão de adicionar transação no layout mobile. Ele oferece uma experiência de usuário superior com animações suaves, efeitos visuais e comportamento inteligente de transparência.

## Características

### 🎨 Design Moderno
- **Glassmorphism**: Efeito de vidro com backdrop blur
- **Animações suaves**: Transições de 300ms com easing
- **Efeito Ripple**: Animação de onda ao clicar
- **Hover effects**: Escala e sombra ao passar o mouse

### 📱 Responsivo
- **Posicionamento flexível**: 6 posições predefinidas
- **Tamanhos variados**: sm, md, lg, xl
- **Mobile-first**: Otimizado para dispositivos móveis

### 🎯 Comportamento Inteligente
- **Auto-fade**: Desaparece automaticamente após inatividade
- **Detecção de atividade**: Reaparece com interação do usuário
- **Tooltip dinâmico**: Label aparece no hover
- **Acessibilidade**: Suporte completo a teclado e screen readers

## Uso Básico

```tsx
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useFabVisibility } from "@/hooks/use-fab-visibility";
import { Plus } from "lucide-react";

const MyComponent = () => {
  const { opacity, handlers } = useFabVisibility({
    fadeDelay: 3000,
    fadeOpacity: 'faded',
    enableAutoFade: true
  });

  return (
    <FloatingActionButton
      variant="default"
      size="md"
      position="bottom-right"
      opacity={opacity}
      glass={true}
      ripple={true}
      icon={<Plus className="h-6 w-6" />}
      label="Nova Transação"
      showLabel={true}
      className="sm:hidden"
      {...handlers}
    />
  );
};
```

## Props

### Variants
- `default`: Botão primário com cor de fundo
- `secondary`: Botão secundário
- `outline`: Botão com borda
- `ghost`: Botão transparente

### Sizes
- `sm`: 48x48px
- `md`: 56x56px (padrão)
- `lg`: 64x64px
- `xl`: 80x80px

### Positions
- `bottom-right`: Canto inferior direito
- `bottom-left`: Canto inferior esquerdo
- `top-right`: Canto superior direito
- `top-left`: Canto superior esquerdo
- `center-right`: Centro direito
- `center-left`: Centro esquerdo

### Opacity Levels
- `full`: 100% de opacidade
- `faded`: 60% de opacidade
- `subtle`: 40% de opacidade

## Hook: useFabVisibility

O hook gerencia automaticamente a visibilidade do FAB baseado na atividade do usuário.

### Opções
```tsx
const options = {
  fadeDelay: 2000,        // Tempo antes de desaparecer (ms)
  fadeOpacity: 'faded',   // Nível de transparência quando inativo
  fullOpacity: 'full',    // Nível de opacidade quando ativo
  enableAutoFade: true    // Habilita auto-fade
};
```

### Retorno
```tsx
const {
  opacity,           // Nível atual de opacidade
  showFab,          // Função para mostrar o FAB
  hideFab,          // Função para esconder o FAB
  handlers          // Event handlers para o botão
} = useFabVisibility(options);
```

## Animações CSS

### Ripple Effect
```css
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}
```

### Transições
- **Hover**: `scale(1.05)` + `shadow-xl`
- **Active**: `scale(0.95)`
- **Opacity**: Transição suave entre níveis

## Implementação no Projeto

O FAB foi integrado no `FinanceDashboard` para substituir o botão de adicionar transação:

1. **Importação**: Componente e hook adicionados
2. **Configuração**: Hook configurado com fade de 3 segundos
3. **Substituição**: Botão antigo substituído pelo novo FAB
4. **Responsividade**: Visível apenas em mobile (`sm:hidden`)

## Benefícios

### Para o Usuário
- ✅ Experiência mais fluida e moderna
- ✅ Feedback visual imediato
- ✅ Não interfere com o conteúdo
- ✅ Acessível e intuitivo

### Para o Desenvolvedor
- ✅ Componente reutilizável
- ✅ API flexível e extensível
- ✅ TypeScript completo
- ✅ Fácil customização

## Customização

### Cores Personalizadas
```tsx
<FloatingActionButton
  className="bg-gradient-to-r from-purple-500 to-pink-500"
  // ... outras props
/>
```

### Animações Customizadas
```tsx
<FloatingActionButton
  className="animate-bounce"
  pulse={true}
  // ... outras props
/>
```

## Compatibilidade

- ✅ React 18+
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Lucide React Icons
- ✅ Todos os navegadores modernos
- ✅ Dispositivos móveis e desktop
