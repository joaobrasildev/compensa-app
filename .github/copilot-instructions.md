# Instruções para o Copilot — Compensa App

## Documento de referência obrigatório

Antes de implementar qualquer código, **leia o arquivo `app-plan.md`** na raiz do projeto. Ele é o plano de implementação completo do app e contém:

- Stack e dependências (seção 1)
- Estrutura de pastas (seção 2)
- Design System com todos os tokens (seção 3)
- Componentes base — props e comportamento (seção 4)
- Componentes compostos — props e comportamento (seção 5)
- Schema do banco SQLite (seção 6)
- Zustand stores (seção 7)
- Regras de negócio — funções puras (seção 8)
- Serviços externos (seção 9)
- Navegação (seção 10)
- Telas — layout e fluxo de dados (seção 11)
- Inicialização (seção 12)
- Padrões de código obrigatórios (seção 13)
- Configurações de build (seção 14)
- Textos legais (seção 15)
- **Fases de implementação (seção 16)** — siga a ordem das fases

## Protótipo visual

O arquivo `prototype/index.html` é o protótipo visual validado. **Consulte-o para extrair layout, espaçamentos, hierarquia visual e estilos** antes de implementar qualquer componente.

## Regras críticas

1. **ZERO estilos avulsos** — todo valor visual (cor, fontSize, padding, margin, borderRadius, etc.) DEVE vir de `src/theme/index.ts`. Se um token não existe, crie-o no theme antes de usar.
2. **TypeScript strict** — sem `any`, sem `@ts-ignore`.
3. **React.memo** em todos os componentes base e compostos.
4. **useCallback** em todos os callbacks passados via props.
5. **useMemo** para dados derivados/cálculos.
6. **Seletores granulares** no Zustand — `useStore(s => s.campo)`, nunca `useStore()`.
7. **1 componente por arquivo**, imports com alias `@/`.
8. **Acessibilidade obrigatória** — touch targets ≥ 44pt, `accessibilityLabel`, `accessibilityRole`.

## Ao receber pedido de implementação de fase

1. Leia `app-plan.md` para entender o escopo da fase solicitada.
2. Verifique quais artefatos já existem (não reescreva o que já está pronto).
3. Implemente seguindo fielmente as especificações do plano.
4. Respeite as dependências entre fases (ex: Fase 4.1 deve ser executada antes da Fase 5).
