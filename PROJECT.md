# PROJECT.md — Farol Invest

> Documento-base do projeto. É a fonte de verdade para decisões, escopo e convenções.
> Toda mudança de rumo deve ser registrada aqui **antes** de ser implementada.
>
> **Status:** rascunho v0.2 (entrevista inicial + identidade visual).
> **Última atualização:** 2026-11-02
> Itens marcados com 🔶 estão **em aberto** (ver seção 14).

---

## 1. Visão

Sistema web que ajuda o investidor pessoa física a **estudar ações brasileiras**: acompanha cotações atualizadas, calcula o **preço teto** de cada ação por vários métodos de valuation com premissas escolhidas por quem usa, projeta a evolução de uma carteira e entrega, por meio de agentes de IA, um panorama semanal do que está descontado e do que mudou no noticiário.

**Princípio central:** números vêm de código determinístico e testado; a IA só interpreta, resume e contextualiza. A IA nunca inventa preço, indicador ou cálculo.

### Contexto e objetivos

| Tema | Decisão |
|---|---|
| Propósito atual | Estudo e uso pessoal/familiar |
| Visão de longo prazo | **Possivelmente produto pago** (ver seção 12: impacto jurídico e de dados) |
| Objetivo de aprendizado | Desenvolvimento júnior em todo o stack; explicações detalhadas em cada decisão |
| Orçamento | Sem limite fixo; decidir custo a custo (registrar cada custo recorrente na seção 14) |

---

## 2. Forma de trabalho (acordo entre nós)

1. **Nada é implementado antes de estar esclarecido.** Cada funcionalidade começa com uma *mini-spec* (objetivo, regras de negócio, critérios de aceite, casos de borda) que o Gabriel aprova.
2. **Quem implementa é definido por funcionalidade.** A mini-spec registra "Quem implementa: Gabriel | Claude | misto". O padrão sugerido: boilerplate e configuração pela LLM; regras de negócio e cálculos pelo Gabriel, com orientação e revisão.
3. **Toda decisão técnica relevante tem justificativa registrada** (seção 13, log de decisões). Quando houver alternativas, listar as trocas.
4. **Definition of Done** de qualquer funcionalidade:
   - Regra de negócio coberta por testes (Vitest).
   - Passa em lint, testes e build no CI.
   - Textos de tela em PT-BR; código, nomes e comentários em inglês.
   - Documentação atualizada (este arquivo ou docs técnicas).
   - Gabriel consegue explicar o que foi feito (a meta é aprender, não só entregar).
5. **Conhecimento financeiro:** fórmulas e premissas são validadas contra fontes antes de virar código. Quando a LLM não tiver certeza, deve dizer.

---

## 3. Escopo do MVP

O MVP está concluído quando **todos os itens abaixo funcionam de ponta a ponta** (do frontend ao banco), com testes nas regras de negócio.

### 3.1 Dentro do MVP

**Conta**
- Cadastro e login com e-mail e senha (JWT). Dados já multiusuário.

**Mercado**
- Universo: **Ibovespa (~85 ações)**.
- Cotações com delay de ~15 min, sincronizadas por job agendado e lidas do nosso banco.
- Dados fundamentalistas e histórico de dividendos por provedor de API.

**Preço teto**
- Métodos: **Bazin, Graham, Gordon (DDM) e Fluxo de Caixa Descontado (DCF)**.
- Premissas: três perfis prontos (conservador, moderado, otimista) **com ajuste manual** de cada premissa, salvo por usuário e por ativo.
- Margem de segurança por ativo, com selo (descontada, justa ou cara) e comparador lado a lado dos métodos.

**Carteira**
- Entrada de dados: **importação do extrato da B3** (arquivo exportado da Área do Investidor) e **modo simulação** (carteiras hipotéticas).
- Posição e preço médio por ativo.
- Alocação por setor e por ativo.
- Dividendos recebidos.
- Rentabilidade vs benchmarks (Ibovespa e CDI).
- Projeções: **evolução patrimonial** (com aportes mensais e retorno por cenário) e **renda passiva (dividendos)**.

**Agentes de IA**
- **Ranking das ações mais descontadas por setor** (cálculo determinístico; a IA só narra).
- **Resumo semanal de notícias + "ideias para estudar"**, ligando notícias a ações do universo, sempre com justificativa e fontes (ver seção 8).

**Interface**
- Tema claro e escuro com alternância.
- Identidade visual definida (seção 10).

### 3.2 Fora do MVP (backlog v1.1+)

| Item | Observação |
|---|---|
| Agente "classe de ativo mais descontada" | Depende de FIIs, ETFs, BDRs, câmbio e renda fixa |
| Agente de cenário macro global | Locais e classes que mais se beneficiam das notícias |
| Outras classes de ativos (FIIs, ETFs/BDRs, câmbio, Tesouro, cripto) | MVP é só ações |
| Filtros anti-armadilha (dívida, ROE, lucro em queda) | Bazin pode apontar armadilhas de valor; **fortemente recomendado logo na v1.1** |
| Explicações didáticas (tooltips, glossário) | Combina com o foco em estudo |
| Watchlist | |
| Alertas por e-mail | |
| Projeção de meta / independência financeira | |
| Simulação "e se" com troca de ativos | |
| Apoio ao IR (ganho de capital, DARF) | |
| Chat conversacional com o agente | |
| Backtest dos métodos | Validar historicamente se o preço teto "funcionou" |
| Cotação em tempo real | |

---

## 4. Métodos de preço teto

Cada método é uma classe pura (padrão *Strategy*), sem acesso a banco ou rede, recebendo dados e premissas e devolvendo preço teto + insumos usados. Isso permite testar tudo com Vitest sem infraestrutura.

| Método | Ideia | Fórmula base | Cuidados |
|---|---|---|---|
| **Bazin** | Pagar no máximo o preço que rende o yield desejado | `preço teto = dividendo anual médio ÷ yield alvo` (original: média de 5 anos e 6%) | Dividendos irregulares distorcem; risco de armadilha de valor |
| **Graham** | Valor intrínseco por lucro e patrimônio | `√(multiplicador × LPA × VPA)` (clássico: 22,5) | Exige LPA e VPA positivos |
| **Gordon (DDM)** | Dividendos crescendo a taxa constante | `D₁ ÷ (r − g)` | Exige `r > g`; sensível a `g` |
| **DCF** | Valor presente dos fluxos de caixa futuros | Fluxo livre projetado descontado pelo WACC + valor terminal | Mais sensível às premissas; **não se aplica bem a bancos e seguradoras** |

**Regras de aplicabilidade (a detalhar na mini-spec do módulo):**
- Cada método declara quando **não é aplicável** a um ativo (ex.: DCF para instituições financeiras; Graham com prejuízo) e o sistema mostra "não aplicável" em vez de um número enganoso.
- Todo resultado carrega o **snapshot dos insumos e premissas** usados, para auditoria e explicação.

**Perfis de premissa:** conservador, moderado e otimista alteram parâmetros como yield alvo (Bazin), multiplicador (Graham), taxa de desconto e crescimento (Gordon e DCF). 🔶 Os valores numéricos de cada perfil serão definidos na mini-spec, validados contra fontes.

---

## 5. Arquitetura

### 5.1 Visão geral

```
Angular (web) → NestJS API: Controller → DTO → Service → Repository → PostgreSQL
                                  │
                                  ├─ Domínio de cálculo (funções/classes puras: valuation, projeções)
                                  ├─ Ports & Adapters (MarketData, Fundamentals, News, LLM)
                                  └─ Jobs agendados (sync de cotações, relatórios dos agentes)
```

Tudo roda em containers (Docker Compose em desenvolvimento: `db`, `api`, `web`).

### 5.2 Camadas e responsabilidades

- **Controller:** HTTP, validação via DTO, sem regra de negócio.
- **DTO:** contrato de entrada/saída, validado (`class-validator`) e documentado (Swagger/OpenAPI).
- **Service:** orquestra casos de uso.
- **Domínio de cálculo:** matemática financeira **pura**, sem dependência de Nest, Prisma ou rede. É onde mais se escreve teste.
- **Repository:** único lugar que fala com o Prisma (o ORM não vaza para os Services).
- **Adapters externos:** interfaces (ports) com implementações trocáveis; testes usam adapters falsos.

### 5.3 Arquitetura de dados externos (resposta à dúvida inicial)

O frontend **nunca** chama o provedor externo. Fluxo:

```
Agendador (cron) → SyncService → MarketDataProvider (interface)
                                        ↑
                             BrapiAdapter (hoje) / outro (amanhã)
                      ↓ grava
                   PostgreSQL → API NestJS → Angular
```

Benefícios: protege a chave da API; respeita limites de requisição; permite trocar de provedor mexendo em um arquivo; guarda histórico próprio; testes sem rede.

- Cotações: job a cada ~15 min no horário do pregão e um job no fechamento (fuso `America/Sao_Paulo`).
- Fundamentos e dividendos: job diário/semanal (mudam pouco).
- 🔶 Provedor inicial: **brapi.dev** como candidato. **Validar planos, limites e termos atuais antes de fechar** (ver seção 12 sobre uso comercial).
- Fonte oficial gratuita para fundamentos no futuro: dados abertos da CVM; macro (Selic, IPCA, câmbio): API do Banco Central.

### 5.4 Importação do extrato da B3

A Área do Investidor **não tem API pública** para terceiros. O usuário baixa o extrato (Excel) e faz upload. O parser fica atrás de uma interface, pois o formato pode mudar. 🔶 Preciso de um **arquivo real (com dados anonimizados)** para especificar o parser.

### 5.5 Regras técnicas transversais

- **Dinheiro e cálculos financeiros:** nunca usar `float`; usar `Decimal` (tipo `Decimal` do Prisma e `decimal.js` no cálculo).
- **Multiusuário desde o dia 1:** toda entidade de usuário tem `user_id`.
- **Segredos:** em variáveis de ambiente; `.env` nunca vai para o Git; fornecer `.env.example`.
- **Segurança básica da API:** hash de senha com argon2, rate limit (`@nestjs/throttler`), Helmet, CORS restrito, validação de entrada em todos os DTOs.
- **Jobs:** começar com `@nestjs/schedule`; avaliar fila (BullMQ + Redis) só quando houver necessidade real.
- **Contrato da API:** Swagger/OpenAPI como fonte; avaliar gerar o cliente HTTP do Angular a partir dele.
- **Observabilidade mínima:** logs estruturados e registro de custo/tokens de cada execução de agente.

### 5.6 Modelo de dados (rascunho inicial)

`User`, `Portfolio`, `Transaction` (compra/venda, origem: manual, B3 ou simulação), `Asset` (ticker, nome, setor, subsetor), `Quote`, `FundamentalSnapshot`, `Dividend`, `ValuationProfile` (preset + ajustes por usuário/ativo), `ValuationResult` (método, perfil, preço teto, snapshot de insumos, data), `NewsItem`, `AgentReport` (tipo, período, conteúdo estruturado, fontes, modelo, tokens), `ImportJob`.

Será detalhado em ERD antes da primeira migration.

---

## 6. Stack tecnológica

| Camada | Escolha | Motivo |
|---|---|---|
| Frontend | **Angular** | Mesmo modelo mental do NestJS (módulos, DI, decorators); estrutura opinativa |
| Backend | **Node.js + NestJS** | |
| ORM | **Prisma**, encapsulado em classes Repository | Melhor experiência para iniciante: schema declarativo, tipagem, migrations |
| Banco | **PostgreSQL** (Docker em dev; gerenciado em produção) | Interoperável entre provedores via connection string |
| Autenticação | **Própria, com JWT** (`AuthModule` isolado) | Aprendizado; reavaliar um provedor antes de abrir ao público |
| Containers | **Docker + Docker Compose** | |
| Deploy | **PaaS** (Railway, Render ou Fly.io 🔶), evoluindo para nuvem | Containers facilitam a migração |
| Testes | **Vitest** no front e no back | Uma ferramenta só; no NestJS exige plugin SWC por causa dos decorators |
| Repositório | **GitHub**, **monorepo simples** (`apps/api`, `apps/web`, pnpm workspaces) | Um PR altera os dois lados; sem a complexidade do Nx |
| CI/CD | **GitHub Actions** | Lint, testes e build a cada PR |
| API manual | **Postman** (coleção versionada no repositório) | |
| Agendamento | `@nestjs/schedule` | |
| LLM | 🔶 a decidir, atrás de uma interface | |
| Notícias | **Feeds RSS** | Gratuito; fontes a definir |

🔶 Ainda a decidir: biblioteca de UI/componentes do Angular, biblioteca de gráficos, gerenciador de pacotes (sugestão: pnpm), serviço de e-mail, lint/format e hooks de commit.

### Estrutura inicial prevista

```
calculadora-b3/
├── apps/
│   ├── api/                  # NestJS
│   └── web/                  # Angular
├── docker-compose.yml
├── .github/workflows/
├── docs/                     # ERD, decisões, mini-specs
├── PROJECT.md
└── README.md
```

---

## 7. Convenções

| Tema | Convenção |
|---|---|
| Código (nomes, comentários, variáveis) | **Inglês** |
| Interface do usuário | **PT-BR**, com todos os textos centralizados (sem strings soltas no código) para facilitar manutenção |
| Documentação (inclui este arquivo e READMEs) | **PT-BR** |
| Mensagens de commit | **PT-BR**, com prefixo Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`). 🔶 Confirmar se o prefixo em inglês é aceitável |
| Branches | Uma por funcionalidade (`feat/...`, `fix/...`), integradas por Pull Request **mesmo trabalhando sozinho** |
| Tarefas | GitHub Issues/Projects (assumido; 🔶 confirmar) |
| Testes | Cálculo financeiro com cobertura alta (é o coração do produto); demais camadas com testes proporcionais ao risco |

---

## 8. Agentes de IA

### 8.1 Princípios

1. **Cálculo em código, interpretação na IA.** Rankings, descontos e números são calculados por código; a IA recebe os números prontos e os explica.
2. **Execução agendada com cache.** Jobs geram relatórios, que ficam no banco e são só lidos pelo frontend. Barato, previsível e testável. Chat e execução sob demanda ficam para depois.
3. **Saída estruturada** (JSON validado por schema) para o frontend renderizar com confiança.
4. **Toda afirmação cita a fonte** (notícia ou dado). Sem fonte, a afirmação não entra.
5. **A IA só pode citar tickers do universo** e números fornecidos no contexto. Pós-validação rejeita o que fugir disso.
6. **Provedor de LLM isolado atrás de uma interface**, com prompts versionados e registro de modelo, tokens e custo por execução.
7. **Rastreabilidade:** cada relatório guarda as notícias e dados que o originaram.

### 8.2 Agente A — Ações mais descontadas por setor (MVP)

- **Entrada:** margem de segurança calculada pelos métodos, por ativo, agrupada por setor.
- **Saída:** ranking por setor + breve explicação por ativo (por que parece descontada, quais métodos concordam, com avisos de aplicabilidade).
- **Nota:** o ranking é determinístico; a IA entra apenas no texto.

### 8.3 Agente B — Notícias da semana e "ideias para estudar" (MVP)

- **Entrada:** itens de feeds RSS (título, link, resumo, data, fonte).
- **Saída:** resumo dos temas da semana + ações do universo possivelmente afetadas, cada uma com justificativa e fonte.
- **Enquadramento obrigatório:** linguagem de **estudo**, nunca "compre". Aviso fixo na tela. Não persistir o texto integral das matérias.

### 8.4 Agentes da v1.1

- **Classe de ativo mais descontada** (ações BR, FIIs, ETFs/BDRs, câmbio etc.): exige métricas de "desconto" comparáveis entre classes.
- **Cenário macro global:** regiões e classes que mais podem se beneficiar, com base nas notícias e em indicadores (Banco Central e outros).

### 8.5 Riscos conhecidos

- Alucinação e viés de notícias; mitigação pelos princípios 3, 4 e 5.
- Custo de tokens; mitigação por jobs agendados, cache e registro de consumo.
- Qualidade variável dos feeds RSS; mitigação com lista curada de fontes.

---

## 9. Roadmap sugerido (incremental)

Ordem pensada para você aprender construindo e para o risco cair cedo. Cada fase vira um conjunto de mini-specs.

| Fase | Foco | Entrega |
|---|---|---|
| 0 | Fundação | Monorepo, Docker Compose (db/api/web), CI com lint + testes + build, Vitest nos dois apps |
| 1 | Núcleo de cálculo | Bazin, Graham, Gordon e DCF como funções puras com testes (**sem banco, sem rede**) |
| 2 | Dados de mercado | Adapter do provedor, sync de cotações/fundamentos/dividendos, modelo de dados e migrations |
| 3 | Conta e perfis | Auth com JWT, perfis de premissa (presets + ajuste manual) |
| 4 | Preço teto na tela | Telas de ativo: comparador dos métodos, margem de segurança e selos |
| 5 | Carteira | Transações, preço médio, alocação, dividendos, rentabilidade vs benchmark, import da B3, modo simulação |
| 6 | Projeções | Evolução patrimonial e renda passiva por cenário |
| 7 | Agentes | Ranking por setor (A) e notícias + ideias para estudar (B), com jobs agendados |
| 8 | Acabamento e deploy | Identidade visual aplicada, tema claro/escuro, acessibilidade, deploy no PaaS |

---

## 10. Identidade visual

### 10.1 Decisões

| Item | Decisão |
|---|---|
| Nome | **Farol Invest** (conceito: orienta no escuro, aponta o que olhar). O sufixo reduz a colisão com fundos chamados Farol (ver 10.4) |
| Tom | **Sério e confiável**: visual sóbrio, clareza antes de ornamento |
| Tema | **Claro e escuro**, com alternância e respeito à preferência do sistema |
| Cor da marca | **Marinho e dourado** (o dourado é a luz do farol) |
| Logo | **Símbolo + nome**, direção "Torre e luz": silhueta de farol em marinho, lanterna e feixes em dourado. 🔶 Falta redesenhar em SVG final com variações (horizontal, ícone, favicon, monocromático) |
| Tipografia | **Inter**, com algarismos tabulares (`font-variant-numeric: tabular-nums`) em tabelas e valores |

### 10.2 Diretrizes

- **Cores semânticas** (alta/baixa, descontada/cara) usam verde e vermelho **separadas da cor da marca** para não confundir.
- **Acessibilidade:** não depender só de cor (usar ícone, texto e forma, por conta de daltonismo); contraste mínimo WCAG AA em ambos os temas.
- **Números** em fonte com algarismos tabulares, alinhados à direita nas tabelas.
- Tokens de design (cores, espaçamento, tipografia) centralizados e reaproveitados nos dois temas.
- **O dourado tem papel restrito:** marca e **preço teto**. Nunca indica "atenção" nem alta/baixa, para não competir com as cores semânticas.

### 10.3 Paleta (valores iniciais, a refinar na implementação)

| Token | Tema claro | Tema escuro |
|---|---|---|
| Fundo da página | `#F6F7F9` | `#0B1424` |
| Superfície (cartões) | `#FFFFFF` | `#14213A` |
| Texto principal | `#12233F` | `#E8EDF5` |
| Texto secundário | `#55637A` | `#9AA8BF` |
| Marca (marinho) | `#14284B` | `#7FA1D6` |
| Marca suave (fundos) | `#E3E8F1` | `#1E3157` |
| Dourado (teto e destaque) | `#9A6A12` em texto; `#B8821F` em logo e gráficos | `#E0A63A` |
| Borda | `#D9DFE8` | `#25395C` |
| Descontada (sucesso) | texto `#1F7A4D` / fundo `#E3F3EA` | texto `#5FD08F` / fundo `#17382A` |
| Cara (perigo) | texto `#B3322F` / fundo `#FBE6E5` | texto `#FF8A87` / fundo `#3F1D1D` |
| Justa (neutro) | marca suave com texto secundário | idem |
| Atenção (proposta) | `#B4501A` (laranja-queimado, distinto do dourado) | `#F2985F` |

🔶 Validar contraste WCAG AA de cada par texto/fundo nos dois temas antes de congelar os tokens.

### 10.4 Nome e marca: cuidados

- **Colisão de nome:** não encontrei plataforma de análise de ações chamada Farol, mas existem fundos com o nome (por exemplo, Farol FIA e Leme Farol Ações) e uma gestora de nome parecido (Faros). Por isso o nome é **Farol Invest**, com sufixo.
- **Evitar "B3" no nome comercial.** B3 é marca da B3 S.A.; usá-la no nome pode sugerir vínculo com a bolsa. Por isso o sufixo escolhido foi **Invest**. Citar "B3" apenas descritivamente (por exemplo, "ações da B3").
- **Domínios (consulta pública ao Registro.br em 2026-11-02):** `farol.com.br`, `farol.app.br`, `farol.net.br`, `farolinvest.com.br` e `usefarol.com.br` já estão registrados. Aparecem livres `farolb3.com.br` e `farolinvestimentos.com.br`, mas é preciso confirmar no Registro.br. Outros domínios (.com, .app) não foram checados.
- **Farol Invest especificamente (checagem de 2026-11-02):** `farolinvest.com.br` e `farolinvest.com` já estão registrados (não consegui identificar o dono). Na consulta ao Registro.br, `farolinvest.app.br`, `farolinvest.net.br` e `farolinvest.inf.br` aparecem livres; `.app`, `.io` e `.finance` pareceram livres numa consulta menos confiável, a confirmar num registrador. Existem a **Farol Capital Agente Autônomo de Investimentos** e a **Farol Asset Management**, que são o conflito de marca mais próximo.
- **INPI:** a busca de marca (classe 36, serviços financeiros) é manual e ainda não foi feita. Obrigatória antes de qualquer lançamento público ou pago.

---

## 11. Segurança e privacidade

- Dados da carteira são sensíveis financeiramente: acesso sempre filtrado por `user_id`, com testes cobrindo isso.
- Senhas com argon2; tokens com expiração; refresh token em fase posterior se necessário.
- Upload de arquivos (extrato B3): validar tipo e tamanho; nunca executar conteúdo; descartar após o processamento ou armazenar de forma controlada.
- Nunca registrar senhas, tokens ou chaves em logs.

---

## 12. Riscos jurídicos e de dados (importante pela possibilidade de produto pago)

> Não substitui orientação de um advogado. Antes de cobrar ou abrir ao público, consultar um profissional.

1. **Licença dos dados de mercado:** planos gratuitos de APIs geralmente **não permitem uso comercial nem redistribuição**. Ao monetizar, será preciso plano comercial do provedor ou fonte licenciada.
2. **Recomendação de investimento:** no Brasil, a atividade de analista e a recomendação de valores mobiliários são reguladas pela CVM. Mesmo com "ideias para estudar", um produto público e pago precisa de avisos claros e de revisão jurídica do enquadramento.
3. **LGPD:** ao ter usuários externos, é necessário base legal, política de privacidade, termos de uso e mecanismos de exclusão de dados.
4. **Conteúdo de notícias:** guardar apenas título, link e resumo; verificar os termos de cada feed antes de uso comercial.
5. **Responsabilidade:** exibir avisos de que preço teto é estimativa baseada em premissas, não promessa de retorno.
6. **Marca:** o nome "Farol" tem uso prévio por fundos de investimento; fazer busca no INPI e consultar advogado de marcas antes de lançar (ver seção 10.4). Evitar "B3" no nome comercial.

---

## 13. Log de decisões

| # | Decisão | Alternativas consideradas | Motivo |
|---|---|---|---|
| D1 | MVP só com ações brasileiras | Incluir FIIs, ETFs, câmbio | Reduzir escopo; agentes de classe e macro ficam para v1.1 |
| D2 | Universo Ibovespa (~85 ações) | IBrX 100; todas | Menor custo e melhor qualidade de dados |
| D3 | Cotação com delay de ~15 min | Fechamento; tempo real | Suficiente para valuation e gratuito na maioria dos provedores |
| D4 | Sync agendado grava no banco | Chamada sob demanda com cache | Protege limites, guarda histórico, simplifica testes |
| D5 | Provedor de API atrás de interface | Scraping; CVM direto | Rapidez no MVP e troca fácil depois |
| D6 | Métodos: Bazin, Graham, Gordon, DCF | Múltiplos, DDM de dois estágios | Cobrem simples → completo, bom para aprendizado |
| D7 | Premissas: presets + ajuste manual | Só presets; só manual | Flexibilidade sem perder o ponto de partida |
| D8 | Agentes agendados com cache | Sob demanda; chat | Custo previsível e testabilidade |
| D9 | Notícias por RSS | API de notícias | Gratuito e controlável |
| D10 | Angular | Next.js | Mesmo modelo mental do NestJS |
| D11 | Prisma | TypeORM; Drizzle | Melhor experiência para iniciante |
| D12 | Auth própria com JWT | Supabase Auth; sem auth | Aprendizado; reavaliar antes de abrir ao público |
| D13 | Monorepo simples (pnpm workspaces) | Dois repositórios; Nx | Menos atrito para dev solo |
| D14 | Vitest nos dois apps | Jest no back | Uniformidade; custo único de configurar SWC |
| D15 | PaaS no início, com caminho para nuvem | VPS; nuvem direto | Menos administração, containers permitem migrar |
| D16 | Banco multiusuário desde o início | `user_id` depois | Evitar retrabalho caro |
| D17 | Dinheiro em `Decimal`, nunca `float` | | Evitar erros de arredondamento |
| D18 | Extras (anti-armadilha, glossário, watchlist, alertas) ficam para v1.1 | Incluir no MVP | Foco em entregar o núcleo primeiro |
| D19 | Nome **Farol Invest** | Margem, Lastro, Prumo, Âncora | Conceito ligado aos agentes que apontam o que olhar; sufixo reduz colisão com fundos de mesmo nome |
| D20 | Paleta marinho e dourado; dourado restrito a marca e preço teto | Índigo puro; índigo e turquesa | Identidade de confiança e a "luz" do farol; restrição evita conflito com cores semânticas |
| D21 | Logo "Torre e luz" (símbolo + nome) | Ícone de app; monograma F | Mais reconhecível |
| D22 | Tipografia Inter com algarismos tabulares | IBM Plex; Inter + serifada | Legibilidade em tabelas de números |

---

## 14. Pendências e próximas conversas

### Decisões em aberto

| Item | Quando decidir |
|---|---|
| 🔶 **Domínio** de Farol Invest e busca no INPI | Antes de qualquer lançamento público |
| 🔶 Logo final em SVG (variações) e contraste AA da paleta | Fase 0 (tokens) e Fase 8 (acabamento) |
| 🔶 **Provedor de LLM** (comparar qualidade, custo e português com um teste real) | Antes da Fase 7 |
| 🔶 **Provedor de cotações/fundamentos** (validar planos, limites e termos atuais) | Antes da Fase 2 |
| 🔶 **PaaS** (Railway, Render ou Fly.io) | Antes da Fase 8 |
| 🔶 Biblioteca de UI e de gráficos do Angular | Antes da Fase 4 |
| 🔶 Fontes RSS de notícias (lista curada) | Antes da Fase 7 |
| 🔶 Serviço de e-mail (para recuperação de senha e alertas futuros) | Quando necessário |
| 🔶 Valores numéricos dos perfis conservador/moderado/otimista | Mini-spec da Fase 1 |
| 🔶 Prefixo de commits em inglês com descrição em PT-BR; Issues como gestão de tarefas | Início da Fase 0 |

### O que preciso de você

- Um **extrato real da B3 (anonimizado)** para especificar o parser de importação.
- Confirmar se **os extras da v1.1** continuam fora do MVP quando o núcleo estiver pronto (principalmente os filtros anti-armadilha, que eu recomendo).

### Custos recorrentes (preencher conforme surgirem)

| Item | Custo estimado | Observação |
|---|---|---|
| Provedor de dados | 🔶 | |
| LLM | 🔶 | Depende do provedor e do volume de relatórios |
| Hospedagem (PaaS + banco) | 🔶 | |
| Domínio | 🔶 | |
