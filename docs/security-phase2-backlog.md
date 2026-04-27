# Backlog Fase 2 (Medio/Baixo)

Itens adiados intencionalmente para uma segunda etapa apos estabilizar os controles criticos/altos.

## Medio

- Reduzir exposição de PII em logs de homologação:
  - evitar log de `rawBody`;
  - mascarar e-mail/IP quando possível.
- Trocar `ref=orderId` por token público opaco na página de sucesso.
- Revisar limite de upload/import de planilhas admin (adiado por decisão operacional).

## Baixo

- Padronizar respostas de erro públicas para reduzir enumeração.
- Expandir trilhas de auditoria (ações administrativas além do login).

## Critério para iniciar fase 2

- Fase 1 implantada e validada em produção por pelo menos 7 dias sem regressão no fluxo de checkout.
