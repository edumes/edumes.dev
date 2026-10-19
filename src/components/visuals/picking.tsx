'use client';

import { defineCopy } from '@/i18n/copy';
import { BeforeAfter, Pains, Phone, scenarios, skeleton, Stage, Tabs, tone, Trap, Traps, useLoop, Wire } from './shared';

// Warehouse picking case visuals. Every value on screen is made up; each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    scanner: {
      label:
        'Ilustração: um celular bipa produtos de um pedido dividido em três partes; cada leitura sai como aceita, repetida ou divergente, e a divergência fica registrada.',
      scans: { accepted: 'aceita', repeated: 'repetida', mismatch: 'divergente' },
      order: 'Pedido 5521',
      partOf: 'parte 2 de 3',
      recorded: '1 divergência registrada',
      partsTitle: 'Partes do pedido',
      parts: [['Parte 01', 'finalizada'], ['Parte 02', 'em andamento'], ['Parte 03', 'pendente']] as [string, string][]
    },
    interrupted: {
      title: 'Parou no meio',
      verdict: 'O trabalho para o tempo todo, e quem retoma não sabe onde parou.',
      pickerA: 'Separador A, parte 2',
      paused: 'pausado',
      pickerB: 'Separador B assume',
      fromWhere: 'de onde?'
    },
    tooBig: {
      title: 'Pedido grande demais',
      verdict: 'Pedido grande vira partes, e as partes nem sempre andam em ordem.',
      part: (n: number) => `Parte ${n}`,
      pending: 'pendente',
      outOfOrder: 'A parte 3 terminou antes da 2'
    },
    hidden: {
      title: 'Divergência escondida',
      verdict: 'Uma bipagem errada só aparecia no cliente.',
      rows: [['Bipado o produto errado', '✓ aceito'], ['Entregue ao cliente', '✗ produto errado']] as [string, string][]
    },
    resume: {
      label: 'Ilustração: ao retomar um pedido, uma função pura olha o estado da parte e decide entre continuar, recomeçar ou abrir a próxima parte.',
      tabs: ['Parte em andamento', 'Coleta divergente', 'Parte finalizada'],
      order: 'Pedido 5521, parte 2',
      states: ['em andamento: 3 de 5 itens', 'coleta divergente', 'finalizada: 5 de 5'],
      fn: 'proximoPasso(pedido)',
      pure: 'função pura, sem tela',
      rules: ['divergente? → recomeçar', 'finalizada? → próxima', 'senão → continuar'],
      answers: ['Continuar a parte de onde parou', 'Recomeçar a parte', 'Abrir a próxima parte']
    },
    tests: {
      label: 'Ilustração: cerca de 50 testes cobrem as regras e as telas.',
      names: ['chave duplicada', 'chave inválida', 'parte fora de ordem', 'coleta parcial divergente', 'setor repetido', 'confirmação final do pedido'],
      passing: '≈50 testes passando'
    },
    result: {
      label: 'Antes, um erro de bipagem aparecia no cliente; depois, aparece na hora, fica registrado e o pedido é retomado de onde parou.',
      before: ['Erro de bipagem aparecia no cliente', 'Sem saber onde o pedido parou'],
      rows: [
        ['Bipou 7891000999999', '✗ divergente, na hora'],
        ['Registrada no pedido 5521', '✓ visível até o fim'],
        ['Retomada por outra pessoa', '✓ parte 2, de onde parou']
      ] as [string, string][]
    }
  },
  en: {
    scanner: {
      label:
        'Illustration: a phone scans the products of an order split into three parts; each scan comes out accepted, repeated or mismatched, and the mismatch stays recorded.',
      scans: { accepted: 'accepted', repeated: 'repeated', mismatch: 'mismatch' },
      order: 'Order 5521',
      partOf: 'part 2 of 3',
      recorded: '1 mismatch recorded',
      partsTitle: 'Order parts',
      parts: [['Part 01', 'finished'], ['Part 02', 'in progress'], ['Part 03', 'pending']]
    },
    interrupted: {
      title: 'Stopped halfway',
      verdict: "Work stops all the time, and whoever resumes doesn't know where it stopped.",
      pickerA: 'Picker A, part 2',
      paused: 'paused',
      pickerB: 'Picker B takes over',
      fromWhere: 'from where?'
    },
    tooBig: {
      title: 'Too big for one go',
      verdict: "Big orders become parts, and the parts don't always move in order.",
      part: (n) => `Part ${n}`,
      pending: 'pending',
      outOfOrder: 'Part 3 finished before part 2'
    },
    hidden: {
      title: 'A hidden mismatch',
      verdict: 'A wrong scan only showed up at the customer.',
      rows: [['Wrong product scanned', '✓ accepted'], ['Delivered to the customer', '✗ wrong product']]
    },
    resume: {
      label: 'Illustration: when an order is resumed, a pure function looks at the part state and decides between continue, restart or open the next part.',
      tabs: ['Part in progress', 'Mismatched collection', 'Part finished'],
      order: 'Order 5521, part 2',
      states: ['in progress: 3 of 5 items', 'mismatched collection', 'finished: 5 of 5'],
      fn: 'nextStep(order)',
      pure: 'pure function, no screen',
      rules: ['mismatch? → restart', 'finished? → next', 'otherwise → continue'],
      answers: ['Continue the part where it stopped', 'Restart the part', 'Open the next part']
    },
    tests: {
      label: 'Illustration: about 50 tests cover the rules and the screens.',
      names: ['duplicate key', 'invalid key', 'part out of order', 'partial mismatched collection', 'repeated sector', 'final order confirmation'],
      passing: '≈50 tests passing'
    },
    result: {
      label: 'Before, a scanning mistake showed up at the customer; after, it shows up on the spot, gets recorded and the order resumes where it stopped.',
      before: ['A scanning mistake showed up at the customer', 'No way to tell where an order stopped'],
      rows: [
        ['Scanned 7891000999999', '✗ mismatch, on the spot'],
        ['Recorded on order 5521', '✓ visible to the end'],
        ['Resumed by someone else', '✓ part 2, where it stopped']
      ]
    }
  }
});

type Scan = 'accepted' | 'repeated' | 'mismatch';
const SCANS: [string, Scan][] = [['7891000100103', 'accepted'], ['7891000100103', 'repeated'], ['7891000999999', 'mismatch']];
const SCAN_LOOK: Record<Scan, string> = { accepted: tone.ok, repeated: 'border-border bg-muted text-muted-foreground', mismatch: tone.bad };
const PART_DOT = ['bg-primary', 'bg-(--attention)', 'bg-muted-foreground/30'];
const BARS = [2, 1, 1, 3, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 2, 1, 3, 1, 1, 2];

function Barcode({ scanning }: { scanning: boolean }) {
  let x = 0;
  return (
    <div className="relative overflow-hidden rounded-sm border border-border bg-background px-3 py-2">
      <svg viewBox="0 0 60 18" className="h-8 w-full text-foreground" preserveAspectRatio="none" aria-hidden>
        {BARS.map((w, k) => {
          const bar = k % 2 === 0 && <rect key={k} x={x} y={0} width={w} height={18} fill="currentColor" />;
          x += w + 0.4;
          return bar;
        })}
      </svg>
      {scanning && <span className="laser" />}
    </div>
  );
}

// Reset, three scans (accepted, repeated, mismatch), hold. The mismatch stays on screen until the order is done.
const SCANNER = [700, 900, 900, 900, 2600];

export function Scanner() {
  const t = useCopy().scanner;
  const { ref, step } = useLoop(SCANNER);
  const shown = Math.min(step, SCANS.length);

  return (
    <div ref={ref} role="img" aria-label={t.label} className="@container">
      <div className="flex flex-col items-center gap-4 @md:flex-row @md:items-center @md:justify-center @xl:gap-8" aria-hidden>
        <Phone className="@md:w-56 @md:flex-none">
          <p className="flex items-baseline justify-between gap-2 text-xs font-semibold font-stretch-104%">
            {t.order}
            <span className="font-normal text-muted-foreground">{t.partOf}</span>
          </p>
          <div className="mt-2">
            <Barcode key={step} scanning={step >= 1 && step <= SCANS.length} />
          </div>
          <ul className="mt-2 grid gap-1">
            {SCANS.map(([code, result], k) => (
              <li
                key={k}
                className={`morph flex items-center justify-between gap-2 rounded-sm border px-2 py-1 text-[0.625rem] ${k < shown ? SCAN_LOOK[result] : skeleton}`}
                style={{ transform: k < shown ? 'none' : 'translateY(-4px)' }}
              >
                <span className="font-mono tabular-nums">{code}</span>
                {t.scans[result]}
              </li>
            ))}
          </ul>
          <p className={`morph mt-2 flex items-center gap-1.5 text-[0.625rem] text-(--attention) ${shown === 3 ? '' : 'opacity-0'}`}>
            <span className="size-1.5 rounded-full bg-(--attention)" />
            {t.recorded}
          </p>
        </Phone>
        <div className="w-full max-w-60 rounded-md border border-border bg-card p-3 text-card-foreground @md:w-auto @md:min-w-44">
          <p className="text-xs font-semibold font-stretch-104%">{t.partsTitle}</p>
          <ul className="mt-2 grid gap-1.5 text-xs">
            {t.parts.map(([part, state], k) => (
              <li key={part} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${PART_DOT[k]} ${k === 1 && step >= 1 && step <= SCANS.length ? 'motion-safe:animate-pulse' : ''}`} />
                  {part}
                </span>
                <span className="text-muted-foreground">{state}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// The problem: three traps, each on a loop of its own.
const PAUSE = [500, 900, 800, 2600];
function Interrupted() {
  const t = useCopy().interrupted;
  const { ref, step } = useLoop(PAUSE);
  return (
    <Trap ref={ref} icon="users" title={t.title} shown={step === 3} verdict={t.verdict}>
      <div className={`morph rounded-sm border px-2.5 py-2 text-[0.8125rem] ${step >= 2 ? tone.warn : tone.idle}`}>
        <p className="flex justify-between gap-3">
          {t.pickerA}
          <span className="font-mono text-[0.6875rem]">{step >= 2 ? t.paused : '…'}</span>
        </p>
        <span className="mt-2 block h-1 overflow-hidden rounded-full bg-border">
          <span className="block h-full bg-primary" style={{ width: step >= 1 ? '60%' : '0%', transition: step === 1 ? 'width 800ms ease-out' : 'none' }} />
        </span>
      </div>
      <p className={`morph mt-1.5 flex justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step >= 2 ? tone.idle : skeleton}`}>
        {t.pickerB}
        <span className="font-mono text-[0.6875rem]">{t.fromWhere}</span>
      </p>
    </Trap>
  );
}

const SPLIT = [500, 800, 800, 2600];
function TooBig() {
  const t = useCopy().tooBig;
  const { ref, step } = useLoop(SPLIT);
  const look = (k: number) => (step < 2 ? tone.idle : k === 2 ? tone.ok : k === 1 ? tone.warn : tone.ok);
  return (
    <Trap ref={ref} icon="boxes" title={t.title} shown={step === 3} verdict={t.verdict}>
      <div className="flex transition-[gap] duration-500" style={{ gap: step >= 1 ? '6px' : '0px' }}>
        {[1, 2, 3].map((n, k) => (
          <div key={n} className={`morph flex-1 border px-2 py-2 text-center text-xs first:rounded-l-sm last:rounded-r-sm ${step >= 1 ? 'rounded-sm' : ''} ${look(k)}`}>
            <p className={step >= 1 ? '' : 'text-transparent'}>{t.part(n)}</p>
            <p className={`mt-0.5 font-mono text-[0.625rem] ${step >= 2 ? '' : 'text-transparent'}`}>{k === 1 ? t.pending : '✓'}</p>
          </div>
        ))}
      </div>
      <p className={`morph mt-2 text-xs ${step >= 2 ? 'text-(--attention)' : 'text-transparent'}`}>{t.outOfOrder}</p>
    </Trap>
  );
}

const HIDDEN = [500, 700, 800, 2600];
function Hidden() {
  const t = useCopy().hidden;
  const { ref, step } = useLoop(HIDDEN);
  return (
    <Trap ref={ref} icon="scan-text" title={t.title} shown={step === 3} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : i ? tone.bad : tone.idle}`}>
            {k}
            <span className="font-mono text-[0.6875rem]">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

export function PickingTraps() {
  return (
    <Traps>
      <Interrupted />
      <TooBig />
      <Hidden />
    </Traps>
  );
}

// How it works, part 1: resuming an order is a pure function of its state. Phases: 0 input, 1 rule, 2 answer, 3 hold.
const RESUME = scenarios([
  [[0, 700], [1, 900], [2, 1100], [3, 1700]],
  [[0, 700], [1, 900], [2, 1100], [3, 1700]],
  [[0, 700], [1, 900], [2, 1100], [3, 1700]]
]);
const RULE_FOR = [2, 0, 1]; // the rule line each scenario matches
const STATE_LOOK = [tone.idle, tone.bad, tone.ok];

function Resume() {
  const t = useCopy().resume;
  const { ref, step, on, inView } = useLoop(RESUME.durations, 3);
  const { s, p } = RESUME.steps[step];

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <Tabs labels={t.tabs} s={s} total={RESUME.totals[s]} on={on} inView={inView} />
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <Stage icon="smartphone-nfc" title={t.order} active={p === 0} className="lg:w-48">
          <p className={`morph rounded-sm border px-2 py-1 ${STATE_LOOK[s]}`}>{t.states[s]}</p>
        </Stage>
        <Wire state={p === 1 ? 'live' : p > 1 ? 'done' : 'idle'} />
        <div className={`morph rounded-md border border-border bg-card px-3 py-2.5 font-mono text-xs text-card-foreground lg:flex-1 ${p === 1 ? 'lit' : ''}`}>
          <p className="font-semibold">{t.fn}</p>
          <p className="mt-0.5 font-sans text-muted-foreground">{t.pure}</p>
          <ul className="mt-2 grid gap-1">
            {t.rules.map((r, k) => (
              <li key={r} className={`morph rounded-sm px-2 py-0.5 ${p >= 1 && RULE_FOR[s] === k ? 'bg-primary/15 text-foreground' : 'text-muted-foreground'}`}>
                {r}
              </li>
            ))}
          </ul>
        </div>
        <Wire state={p === 2 ? 'live' : p > 2 ? 'done' : 'idle'} />
        <ul className="grid gap-1.5 lg:w-56">
          {t.answers.map((a, k) => (
            <li key={a} className={`morph rounded-md border px-3 py-2 text-[0.8125rem] ${p >= 2 && k === s ? `${tone.ok} ${p === 2 ? 'lit' : ''}` : 'border-border bg-card text-muted-foreground'}`}>
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// How it works, part 2: the tests that pin those rules down, ticking through.
const TESTS = [500, 350, 350, 350, 350, 350, 350, 2400];
function TestRun() {
  const t = useCopy().tests;
  const { ref, step } = useLoop(TESTS);
  const names = t.names;
  const passed = Math.min(step, names.length);
  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <div className="rounded-md border border-border bg-card p-3 font-mono text-xs text-card-foreground" aria-hidden>
        <p className="flex justify-between gap-3 text-muted-foreground">
          <span>$ npm test</span>
          <span className={`morph ${passed === names.length ? 'text-foreground' : ''}`}>{passed === names.length ? t.passing : '…'}</span>
        </p>
        <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          {names.map((n, k) => (
            <li key={n} className={`morph flex gap-2 ${k < passed ? '' : 'opacity-30'}`}>
              <span className={k < passed ? 'text-primary' : ''}>{k < passed ? '✓' : '○'}</span>
              {n}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function PickingHow() {
  return (
    <>
      <Resume />
      <hr className="my-8 border-border" />
      <TestRun />
    </>
  );
}

// The outcome: a wrong scan shows up on the spot, gets recorded, and the order resumes where it stopped.
const AFTER = [600, 700, 700, 700, 2600];
const RESULT_LOOK = [tone.bad, tone.ok, tone.ok];
export function PickingResult() {
  const t = useCopy().result;
  const { ref, step } = useLoop(AFTER);
  return (
    <div ref={ref}>
      <BeforeAfter
        label={t.label}
        lit={step > 0 && step < 4}
        before={<Pains items={t.before} />}
        after={
          <ul className="grid gap-1.5">
            {t.rows.map(([k, v], i) => (
              <li key={k} className={`morph flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step > i ? RESULT_LOOK[i] : skeleton}`}>
                {k}
                <span className="font-mono text-[0.6875rem]">{v}</span>
              </li>
            ))}
          </ul>
        }
      />
    </div>
  );
}
