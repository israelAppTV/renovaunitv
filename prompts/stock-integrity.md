You are reviewing a digital code marketplace system.

Your task is to ensure that the stock system prevents duplicate code delivery.

Analyze the code and verify that:

- Code selection is atomic
- Database transactions are used
- Two simultaneous purchases cannot receive the same code
- Codes are marked as used immediately after assignment
- Webhooks cannot assign codes twice

If the system is unsafe, propose a transaction-safe solution.

The system must guarantee that each code can only be delivered once.