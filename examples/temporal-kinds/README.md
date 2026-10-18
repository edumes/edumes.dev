# temporal-kinds

Estudo de caso: [AuthSales, uma base para vários sistemas](https://edumes.dev/casos/authsales/) · Case study: [AuthSales, one foundation for several systems](https://edumes.dev/en/cases/authsales/)

**PT** · Um valor de data e hora só faz sentido depois que alguém declara o que ele é. Este exemplo define quatro tipos: **instante** (`timestamptz`), **data civil** (`date`), **hora local** (`time`) e **data-hora local** (`timestamp`). Os testes mostram dois bugs reais. O primeiro: uma coluna `timestamp` sem fuso guarda o relógio de parede do processo, então o mesmo momento gravado de uma máquina em São Paulo e de um container em UTC fica com três horas de diferença, e nada na linha explica por quê. O segundo: vencimento é uma data civil, não um instante, e comparar com o dia em UTC acusa atraso antes de o dia acabar no Brasil.

**EN** · A date/time value only means something once someone declares what it is. This example defines four kinds: **instant** (`timestamptz`), **civil date** (`date`), **local time** (`time`) and **local date-time** (`timestamp`). The tests show two real bugs. First: a `timestamp` column without a zone stores the process's wall clock, so the same moment written from a machine in São Paulo and from a container in UTC ends up three hours apart, with nothing in the row to explain why. Second: a due date is a civil date, not an instant, and comparing it with the UTC day flags it overdue before the day has ended in Brazil.

Sem dependências. / No dependencies (Node 23.6+ runs the TypeScript directly).

```bash
node --test kinds.test.ts
```

- [kinds.ts](kinds.ts): branded types, constructors that reject bad values, `isOverdue`, and `wallClock` (what a driver writes into `timestamp`).
- [schema.sql](schema.sql): an example schema where every column declares its kind.
