# Services

Toda a lógica de negócio deve ficar aqui. Componentes de UI não devem conter regras de negócio.

- Use funções pequenas e reutilizáveis.
- Acesso a dados centralizado em `@/lib/supabase`.
- Valide entradas com Zod antes de persistir.
