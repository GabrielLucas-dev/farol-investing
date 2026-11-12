# Mini-spec: Home ("o que estudar hoje")

> **Status:** rascunho para aprovação do Gabriel
> **Data:** 2026-11-10
> **Quem implementa:** misto (proposta: Claude faz o layout, o menu e os estilos; Gabriel faz o serviço de dados mock e a lógica dos blocos, com orientação)

## 1. Objetivo

Ser a primeira tela após o login e responder, em poucos segundos: **"o que vale a pena eu estudar hoje?"**. Reúne as ações mais descontadas, o resumo semanal de notícias com ideias para estudar e um atalho de busca de ativo.

## 2. Decisões da entrevista

| Tema | Decisão |
|---|---|
| Papel da home | Painel "o que estudar hoje" |
| Blocos da v1 | Ações mais descontadas, Notícias e ideias para estudar, Busca de ativo |
| Fora da v1 | Resumo da carteira (volta quando a fase 5 existir) |
| Usuário novo | Vê só o mercado, sem blocos de carteira |
| Dados | **Mock**, atrás de um serviço trocável, para ligar à API depois sem refazer o layout |
| Navegação | Menu lateral fixo; topo com busca, tema claro/escuro e menu do usuário |
| Ranking | Abas por setor, top 5 por aba |
| Notícias | Resumo curto dos temas + cartões de ideias (ticker, justificativa, fonte) |
| Busca | Campo no topo, em todas as telas, com autocomplete |

## 3. Estrutura da tela

```
┌─────────┬──────────────────────────────────────────────┐
│ Logo    │  [ Buscar ativo (ex.: PETR4)      ]  ☾  Gabriel ▾ │
│         ├──────────────────────────────────────────────┤
│ Home    │  Bom dia, Gabriel                            │
│ Ações*  │  Mercado: fechado · cotações de 17:15        │
│ Carteira*│                                             │
│ Notícias*│  ┌ Ações mais descontadas ─────────────────┐ │
│         │  │ [Bancos] [Energia] [Mineração] ...       │ │
│ (*futuro)│  │ Ticker  Preço  Teto  Margem  Selo        │ │
│         │  │ ... 5 linhas                             │ │
│         │  └──────────────────────────────────────────┘ │
│         │  ┌ Notícias e ideias para estudar ──────────┐ │
│         │  │ Resumo dos temas da semana               │ │
│         │  │ [ticker · justificativa · fonte] x N     │ │
│         │  │ Aviso fixo: conteúdo de estudo           │ │
│         │  └──────────────────────────────────────────┘ │
└─────────┴──────────────────────────────────────────────┘
```

Itens do menu ainda sem tela aparecem desabilitados ("em breve") ou ficam ocultos. 🔶 Decidir qual dos dois.

## 4. Regras de negócio

1. **Ranking determinístico.** A ordem vem da margem de segurança calculada pelos métodos, nunca da IA (princípio da seção 8 do `PROJECT.md`).
2. **Selo** do ativo: descontada, justa ou cara. Nunca depende só de cor: leva ícone e texto (seção 10.2).
3. **Método não aplicável:** se nenhum método se aplica ao ativo, ele não entra no ranking; se só alguns se aplicam, a linha mostra quais métodos concordam.
4. **Dourado** só no preço teto. Verde e vermelho só nos selos (seção 10.2).
5. **Notícias:** cada ideia exige ticker do universo (Ibovespa), justificativa e link da fonte. Sem fonte, não aparece.
6. **Aviso fixo** visível no bloco de notícias: conteúdo de estudo, não recomendação de investimento.
7. **Busca:** sugere por ticker e por nome, apenas ativos do universo. Enter ou clique abre a tela do ativo (fase 4). Até lá, o destino é uma rota provisória.
8. **Status do mercado:** mostra se o pregão está aberto, fechado ou em pré-abertura e o horário da última cotação, deixando claro o delay de ~15 min.
9. Textos de tela em PT-BR, centralizados (sem strings soltas no código).

## 5. Estados de cada bloco

| Estado | Comportamento |
|---|---|
| Carregando | Esqueleto (skeleton) com a mesma altura do conteúdo, para evitar saltos de layout |
| Vazio | Mensagem explicando o motivo (ex.: "Ainda não há relatório desta semana") |
| Erro | Mensagem clara com botão "Tentar de novo"; falha em um bloco não derruba os outros |
| Dados desatualizados | Mostra a data do último dado e um aviso discreto |

## 6. Critérios de aceite

- [ ] A home aparece em `/home` depois do login, e a raiz redireciona para ela quando há sessão.
- [ ] Menu lateral, busca no topo, alternância de tema e menu do usuário funcionam em telas largas.
- [ ] Em telas estreitas (celular) o menu lateral vira menu recolhível, sem rolagem horizontal.
- [ ] O ranking troca de setor pelas abas e mostra 5 linhas, com números alinhados à direita e fonte com algarismos tabulares.
- [ ] A busca sugere ativos conforme a digitação e navega ao selecionar.
- [ ] Os três blocos têm os 4 estados da seção 5.
- [ ] Os dados vêm de um serviço com interface própria; trocar o mock pela API não exige mexer nos componentes.
- [ ] Navegável só por teclado e contraste mínimo WCAG AA nos dois temas.
- [ ] Testes (Vitest) cobrem a lógica de dados e os estados dos blocos; passa em lint, testes e build no CI.

## 7. Casos de borda

- Setor com menos de 5 ativos aplicáveis: mostra os que houver.
- Busca sem resultado: "Nenhum ativo encontrado".
- Relatório semanal ausente ou com mais de 7 dias: aviso de desatualizado.
- Ticker citado pela IA fora do universo: o item é descartado na validação, não chega à tela.
- Nome muito longo de empresa: truncar com reticências e mostrar completo no `title`.

## 8. Fora de escopo desta mini-spec

Resumo da carteira, tela do ativo, tela de notícias completa, notificações, tooltips didáticos e a lógica real de cálculo (fases 1 a 7).

## 9. Perguntas em aberto

- 🔶 Itens de menu sem tela: desabilitados ou ocultos?
- 🔶 O rótulo "Ideias para estudar" é adequado do ponto de vista jurídico? (seção 12, item 2)
- 🔶 A tipografia da interface hoje usa JetBrains Mono, mas o `PROJECT.md` define **Inter** (D22). Qual vale?
