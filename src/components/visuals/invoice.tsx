'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { defineCopy } from '@/i18n/copy';
import { BeforeAfter, Pains, scenarios, skeleton, Stage, Tabs, tone, Trap, Traps, useLoop, Wire, type WireState } from './shared';

// Invoice checklist case visuals. Every value on screen is made up; each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    checklist: {
      label:
        'Ilustração: uma nota de fornecedor passa por um checklist; cada item passa, falha ou é pulado, e a nota sai aprovada ou com um motivo, como saldo insuficiente.',
      supplier: 'Fornecedor Exemplo (fictício)',
      // One per run in RUNS.
      amounts: ['R$ 4.560,00', 'R$ 8.900,00'],
      items: ['Chave de acesso única', 'Fornecedor existe no ERP', 'Pedido ou contrato identificado', 'Saldo suficiente', 'Representante do fornecedor'],
      flagged: 'Inconsistente: saldo insuficiente',
      approved: 'Aprovada para lançamento'
    },
    byHand: {
      title: 'Conferência à mão',
      verdict: 'Cada nota conferida à mão contra pedido e contrato.',
      waiting: 'aguardando conferência'
    },
    formats: {
      title: 'Vários formatos',
      verdict: 'Vários tipos de documento, cada um com sua chave e seu formato.',
      rows: [['NF-e', 'chave de 44 dígitos'], ['NFS-e', 'formato do município'], ['CT-e', 'documento de transporte']] as [string, string][]
    },
    lateCancel: {
      title: 'Cancelamento atrasado',
      verdict: 'Cancelamentos chegavam depois da conferência.',
      rows: [['NF 1234', '✓ conferida'], ['NF 1234', '✓ lançada'], ['Cancelamento', '✗ chega depois']] as [string, string][]
    },
    how: {
      label:
        'Ilustração: a nota chega por webhook ou em lote, é classificada, passa pelas exceções e pelo checklist e sai aprovada ou com o motivo; uma nota cancelada encerra nas exceções.',
      tabs: ['Passa no checklist', 'Falha com motivo', 'Nota cancelada'],
      intake: 'Entrada',
      batch: 'lote, base64',
      classification: 'Classificação',
      exceptions: 'Exceções',
      cancelled: '✗ cancelada: encerra aqui',
      none: '✓ nenhuma',
      marks: 'passou, falhou ou pulado',
      outcome: 'Resultado',
      flagged: 'Inconsistente: saldo insuficiente',
      approved: '✓ Aprovada'
    },
    result: {
      label: 'Antes, toda nota era conferida à mão; depois, a triagem acontece na entrada e o time fiscal só recebe o que falhou, com o motivo.',
      before: ['Toda nota conferida à mão', 'A triagem vinha depois, não na entrada'],
      reasons: { balance: 'saldo insuficiente', order: 'pedido não encontrado' },
      posted: '✓ Lançamento automático',
      queue: 'Fila do fiscal, com motivo'
    }
  },
  en: {
    checklist: {
      label:
        'Illustration: a supplier invoice goes through a checklist; each item passes, fails or is skipped, and the invoice leaves approved or with a reason, such as not enough balance.',
      supplier: 'Example Supplier (made up)',
      amounts: ['$4,560.00', '$8,900.00'],
      items: ['Unique access key', 'Supplier exists in the ERP', 'Order or contract found', 'Enough balance', "Supplier's representative"],
      flagged: 'Flagged: not enough balance',
      approved: 'Approved for posting'
    },
    byHand: {
      title: 'Checked by hand',
      verdict: 'Every invoice checked by hand against order and contract.',
      waiting: 'waiting for a check'
    },
    formats: {
      title: 'Several formats',
      verdict: 'Several document types, each with its own key and format.',
      rows: [['NF-e', '44-digit key'], ['NFS-e', "the city's own format"], ['CT-e', 'transport document']]
    },
    lateCancel: {
      title: 'Late cancellation',
      verdict: 'Cancellations arrived after the check.',
      rows: [['NF 1234', '✓ checked'], ['NF 1234', '✓ posted'], ['Cancellation', '✗ arrives later']]
    },
    how: {
      label:
        'Illustration: the invoice arrives by webhook or in a batch, gets classified, goes through exceptions and the checklist and leaves approved or with a reason; a cancelled invoice stops at the exceptions.',
      tabs: ['Passes the checklist', 'Fails with a reason', 'Cancelled invoice'],
      intake: 'Intake',
      batch: 'batch, base64',
      classification: 'Classification',
      exceptions: 'Exceptions',
      cancelled: '✗ cancelled: stops here',
      none: '✓ none',
      marks: 'passed, failed or skipped',
      outcome: 'Outcome',
      flagged: 'Flagged: not enough balance',
      approved: '✓ Approved'
    },
    result: {
      label: 'Before, every invoice was checked by hand; after, triage happens on arrival and the tax team only gets what failed, reason included.',
      before: ['Every invoice checked by hand', 'Triage came later, not on arrival'],
      reasons: { balance: 'not enough balance', order: 'order not found' },
      posted: '✓ Posted automatically',
      queue: 'Tax team queue, with reason'
    }
  }
});

type Mark = 'PASSED' | 'FAILED' | 'SKIPPED';
const MARK_LOOK: Record<Mark, string> = { PASSED: 'bg-primary/15 text-foreground', FAILED: 'bg-destructive/15 text-foreground', SKIPPED: 'bg-muted text-muted-foreground' };
const RUNS: Mark[][] = [
  ['PASSED', 'PASSED', 'PASSED', 'PASSED', 'SKIPPED'],
  ['PASSED', 'PASSED', 'PASSED', 'FAILED', 'SKIPPED']
];
// Per run: reset, one item at a time, verdict.
const CHECK = scenarios(RUNS.map(() => [[0, 600], [1, 450], [2, 450], [3, 450], [4, 450], [5, 450], [6, 2400]]));

// One invoice through the checklist: every item records whether it passed, failed or was skipped, and the invoice
// leaves with a readable reason.
export function Checklist() {
  const t = useCopy().checklist;
  const { ref, step } = useLoop(CHECK.durations, 6);
  const { s, p } = CHECK.steps[step];
  const marks = RUNS[s];
  const failed = s === 1;
  const verdict = p === 6;

  return (
    <div ref={ref} role="img" aria-label={t.label} className="@container">
      <div className="flex flex-col gap-3 @xl:flex-row @xl:items-stretch" aria-hidden>
        <div className={`morph rounded-md border border-border bg-card p-3 text-card-foreground @xl:w-[12rem] @xl:flex-none ${p === 0 ? 'lit' : ''}`}>
          <p className="flex items-center justify-between gap-2 text-xs font-semibold [font-stretch:104%]">
            {failed ? 'NF-e 1203' : 'NF-e 1201'}
            <span className="rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[0.625rem] font-normal text-secondary-foreground">XML</span>
          </p>
          <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">{t.supplier}</p>
          <p className="mt-1 font-mono text-xs tabular-nums">{t.amounts[s]}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-3 text-card-foreground @xl:flex-1">
          <ul className="grid gap-1">
            {t.items.map((label, k) => {
              const done = p > k;
              return (
                <li key={label} className={`morph flex items-center justify-between gap-3 rounded-sm px-1.5 py-0.5 text-[0.6875rem] @md:text-xs ${p === k + 1 ? 'bg-primary/[0.06]' : ''}`}>
                  <span className={done ? '' : 'text-muted-foreground'}>{label}</span>
                  <span className={`morph rounded-sm px-1.5 py-0.5 font-mono text-[0.625rem] ${done ? MARK_LOOK[marks[k]] : 'text-transparent'}`}>{marks[k]}</span>
                </li>
              );
            })}
          </ul>
          <p className={`morph mt-2 rounded-sm border px-2 py-1 text-xs ${verdict ? `${failed ? tone.warn : tone.ok} lit` : skeleton}`}>{failed ? t.flagged : t.approved}</p>
        </div>
      </div>
    </div>
  );
}

// The problem: three traps, each on a loop of its own.
const PILE = [500, 400, 400, 400, 400, 2600];
function ByHand() {
  const t = useCopy().byHand;
  const { ref, step } = useLoop(PILE);
  const shown = Math.min(step, 4);
  return (
    <Trap ref={ref} icon="clipboard-check" title={t.title} shown={step === 5} verdict={t.verdict}>
      <div className="relative h-24">
        {[0, 1, 2, 3].map((k) => (
          <p
            key={k}
            className={`morph absolute inset-x-0 rounded-sm border px-2.5 py-1.5 text-xs ${k < shown ? tone.idle : 'border-transparent opacity-0'}`}
            style={{ top: `${k * 18}px`, left: `${k * 6}px`, right: `${(3 - k) * 6}px`, transform: k < shown ? 'none' : 'translateY(-8px)' }}
          >
            NF {1201 + k} <span className="text-muted-foreground">· {t.waiting}</span>
          </p>
        ))}
      </div>
    </Trap>
  );
}

const FORMATS = [500, 600, 600, 600, 2600];
function Formats() {
  const t = useCopy().formats;
  const { ref, step } = useLoop(FORMATS);
  return (
    <Trap ref={ref} icon="file-text" title={t.title} shown={step === 4} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : tone.idle}`}>
            <span className="font-mono text-xs">{k}</span>
            <span className="text-[0.6875rem] text-muted-foreground">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

const LATE = [500, 600, 600, 800, 2600];
const LATE_LOOK = [tone.idle, tone.idle, tone.bad];
function LateCancel() {
  const t = useCopy().lateCancel;
  const { ref, step } = useLoop(LATE);
  return (
    <Trap ref={ref} icon="badge-alert" title={t.title} shown={step === 4} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={i} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : LATE_LOOK[i]}`}>
            {k}
            <span className="font-mono text-[0.6875rem]">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

export function InvoiceTraps() {
  return (
    <Traps>
      <ByHand />
      <Formats />
      <LateCancel />
    </Traps>
  );
}

// How it works: intake, classification, exceptions, checklist, outcome, in three scenarios.
// Phases: 0 intake, 1 classification, 2 exceptions, 3 checklist, 4 outcome, 5 hold. A cancelled invoice stops at 2.
const FLOW = scenarios([
  [[0, 600], [1, 700], [2, 700], [3, 1100], [4, 800], [5, 2000]],
  [[0, 600], [1, 700], [2, 700], [3, 1100], [4, 800], [5, 2000]],
  [[0, 600], [1, 700], [2, 1000], [5, 2200]]
]);

export function InvoiceHow() {
  const t = useCopy().how;
  const { ref, step, on, inView } = useLoop(FLOW.durations, 5);
  const { s, p } = FLOW.steps[step];
  const cancelled = s === 2;
  const failed = s === 1;
  const wire = (from: number): WireState => (p < from ? 'idle' : p === from ? 'live' : 'done');

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <Tabs labels={t.tabs} s={s} total={FLOW.totals[s]} on={on} inView={inView} />
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <Stage icon="webhook" title={t.intake} active={p === 0} className="lg:flex-1">
          <p className="font-mono">{failed ? t.batch : 'webhook, XML'}</p>
        </Stage>
        <Wire state={wire(1)} />
        <Stage icon="file-text" title={t.classification} active={p === 1} className="lg:flex-1">
          <p className={`morph font-mono ${p >= 1 ? '' : 'text-transparent'}`}>{failed ? 'CT-e' : 'NF-e'}</p>
        </Stage>
        <Wire state={wire(2)} />
        <Stage icon="badge-alert" title={t.exceptions} active={p === 2} className={`lg:flex-1 ${cancelled && p >= 2 ? 'border-destructive/60!' : ''}`}>
          <p className={`morph ${p < 2 ? 'text-transparent' : cancelled ? 'text-destructive' : ''}`}>{cancelled ? t.cancelled : t.none}</p>
        </Stage>
        <Wire state={cancelled ? (p >= 2 ? 'blocked' : 'idle') : wire(3)} />
        <Stage icon="clipboard-check" title="Checklist" active={p === 3} className="lg:flex-[1.3]">
          <span className="flex gap-1">
            {Array.from({ length: 10 }, (_, k) => {
              const bad = failed && k === 6;
              const run = !cancelled && p >= 3;
              return (
                <span
                  key={k}
                  className={`morph size-2.5 rounded-[2px] ${!run ? 'bg-border' : bad ? 'bg-destructive' : k === 9 ? 'bg-muted-foreground/40' : 'bg-primary'}`}
                  style={{ transitionDelay: run && p === 3 ? `${k * 90}ms` : '0ms' }}
                />
              );
            })}
          </span>
          <p className="mt-1.5 text-muted-foreground">{t.marks}</p>
        </Stage>
        <Wire state={cancelled ? 'idle' : wire(4)} />
        <Stage icon="circle-check" title={t.outcome} active={p === 4} className={`lg:flex-[1.2] ${failed && p >= 4 ? 'border-[var(--attention)]!' : ''}`}>
          <p className={`morph ${cancelled || p < 4 ? 'text-transparent' : failed ? 'text-[var(--attention)]' : ''}`}>{failed ? t.flagged : t.approved}</p>
        </Stage>
      </div>
    </div>
  );
}

// The outcome: triage happens on arrival, and the tax team only gets what failed, reason included.
type Reason = 'balance' | 'order';
const NOTES: [string, Reason?][] = [['NF 1201'], ['NF 1202'], ['NF 1203', 'balance'], ['NF 1204'], ['NF 1205'], ['CT 0420', 'order']];
const SORT = [800, 550, 550, 550, 550, 550, 550, 2600];

export function InvoiceResult() {
  const t = useCopy().result;
  const { ref, step } = useLoop(SORT);
  const id = useId();
  const sorted = Math.min(step, NOTES.length);
  const chip = ([name, reason]: [string, Reason?]) => (
    <motion.li
      key={name}
      layoutId={id + name}
      transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
      className={`rounded-sm border px-2 py-1 font-mono text-[0.6875rem] leading-tight ${reason ? tone.warn : 'border-border bg-background'}`}
    >
      {name}
      {reason && <span className="ml-1.5 font-sans">· {t.reasons[reason]}</span>}
    </motion.li>
  );
  const done = NOTES.slice(0, sorted);
  return (
    <div ref={ref}>
      <BeforeAfter
        label={t.label}
        before={<Pains items={t.before} />}
        after={
          <div className="grid gap-2 text-xs">
            <ul className="flex min-h-7 flex-wrap gap-1.5">{NOTES.slice(sorted).map(chip)}</ul>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-sm border border-border p-2">
                <p className="mb-1.5 text-muted-foreground">{t.posted}</p>
                <ul className="flex min-h-7 flex-wrap gap-1.5">{done.filter(([, r]) => !r).map(chip)}</ul>
              </div>
              <div className="rounded-sm border border-border p-2">
                <p className="mb-1.5 text-muted-foreground">{t.queue}</p>
                <ul className="flex min-h-7 flex-wrap gap-1.5">{done.filter(([, r]) => r).map(chip)}</ul>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
