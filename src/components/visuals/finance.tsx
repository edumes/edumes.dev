'use client';

import { defineCopy } from '@/i18n/copy';
import { BeforeAfter, Log, Pains, skeleton, Stage, tone, Trap, Traps, useLoop, Window, Wire } from './shared';

// Finance and cloud ERP case visuals. Every value on screen is made up; each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    sync: {
      label: 'Ilustração: no painel financeiro, os títulos de uma nota são baixados e depois estornados, e o ERP em nuvem acompanha cada mudança.',
      panel: 'Painel financeiro · Empresa A',
      invoice: 'NF 1234 · Fornecedor Exemplo',
      bills: ['1/3 · R$ 1.200,00', '2/3 · R$ 1.200,00', '3/3 · R$ 1.200,00'],
      status: { open: 'aberto', paid: '✓ baixado', reversed: '↺ estornado' },
      settle: 'baixa',
      reverse: 'estorno',
      erp: 'ERP em nuvem',
      payable: 'Contas a pagar',
      erpStatus: { open: 'aberto', paid: '✓ pago' }
    },
    rateLimit: {
      title: 'API com limite',
      verdict: 'A API do ERP tem limites e responde devagar.',
      rows: [['Consulta 1', '200 OK'], ['Consulta 2', '200 OK, 4 s'], ['Consulta 3', '429 limite']] as [string, string][]
    },
    duplicate: {
      title: 'Título duplicado',
      verdict: 'Títulos duplicados apareciam com frequência.',
      amount: 'R$ 1.200,00',
      twice: '✗ o mesmo título duas vezes'
    },
    scattered: {
      title: 'Cadastros espalhados',
      verdict: 'Cada empresa com seus cadastros, e categorias erradas.',
      expense: 'O mesmo gasto com combustível',
      rows: [['Empresa A', 'Combustível'], ['Empresa B', 'Combustiveis'], ['Empresa C', 'Despesas gerais']] as [string, string][]
    },
    how: {
      label: 'Ilustração: a sincronização de cada empresa com o ERP vai em lotes de 50, com uma pausa entre eles, e o uso da API fica sempre abaixo do limite.',
      panel: 'Painel · Empresa A',
      entities: ['Categorias', 'Contas bancárias', 'Clientes', 'Fornecedores', 'Ordens de serviço', 'Contratos'],
      batches: 'Lotes de 50',
      done: '✓ 200 registros, nenhum 429',
      pausing: 'pausa antes do próximo lote…',
      sending: 'enviando…',
      erp: 'ERP em nuvem',
      synced: '✓ sincronizado'
    },
    result: {
      label:
        'Antes, retrabalho para lançar no ERP e exclusões sem registro; depois, os lançamentos nascem no painel e chegam ao ERP, com registro de quem excluiu o quê e por quê.',
      before: ['Retrabalho para lançar no ERP', 'Exclusões sem saber quem nem por quê'],
      log: [
        ['09:12', 'título da NF 1234 criado no painel'],
        ['09:12', '→ ERP: sincronizado'],
        ['09:40', 'agrupamento da NF 1240 excluído por financeiro@empresa-a', true],
        ['09:40', 'motivo: lançado em duplicidade', true]
      ] as [string, string, boolean?][]
    }
  },
  en: {
    sync: {
      label: 'Illustration: in the finance panel, the bills of one invoice are settled and then reversed, and the cloud ERP follows each change.',
      panel: 'Finance panel · Company A',
      invoice: 'Invoice 1234 · Example Supplier',
      bills: ['1/3 · $1,200.00', '2/3 · $1,200.00', '3/3 · $1,200.00'],
      status: { open: 'open', paid: '✓ settled', reversed: '↺ reversed' },
      settle: 'settle',
      reverse: 'reverse',
      erp: 'Cloud ERP',
      payable: 'Accounts payable',
      erpStatus: { open: 'open', paid: '✓ paid' }
    },
    rateLimit: {
      title: 'A rate-limited API',
      verdict: 'The ERP API has limits and answers slowly.',
      rows: [['Request 1', '200 OK'], ['Request 2', '200 OK, 4 s'], ['Request 3', '429 limit']]
    },
    duplicate: {
      title: 'Duplicate bills',
      verdict: 'Duplicate bills showed up often.',
      amount: '$1,200.00',
      twice: '✗ the same bill twice'
    },
    scattered: {
      title: 'Scattered master data',
      verdict: 'Each company with its own master data, and wrong categories.',
      expense: 'The same fuel expense',
      rows: [['Company A', 'Fuel'], ['Company B', 'Fuels'], ['Company C', 'General expenses']]
    },
    how: {
      label: 'Illustration: each company’s sync with the ERP goes in batches of 50 with a pause between them, and API usage always stays under the limit.',
      panel: 'Panel · Company A',
      entities: ['Categories', 'Bank accounts', 'Customers', 'Suppliers', 'Work orders', 'Contracts'],
      batches: 'Batches of 50',
      done: '✓ 200 records, no 429',
      pausing: 'pausing before the next batch…',
      sending: 'sending…',
      erp: 'Cloud ERP',
      synced: '✓ in sync'
    },
    result: {
      label:
        'Before, rework to post in the ERP and deletions with no record; after, entries start in the panel and reach the ERP, with a record of who deleted what and why.',
      before: ['Rework to post in the ERP', 'Deletions with no who or why'],
      log: [
        ['09:12', 'bill for invoice 1234 created in the panel'],
        ['09:12', '→ ERP: in sync'],
        ['09:40', 'group for invoice 1240 deleted by finance@company-a', true],
        ['09:40', 'reason: posted twice', true]
      ]
    }
  }
});

// Reset, pick the group, settle it in the panel, the ERP follows; then reverse it, and the ERP follows again.
const SYNC = [700, 800, 900, 900, 1600, 900, 900, 2200];
const look = { open: 'border-border bg-background', paid: tone.ok, reversed: tone.warn };

export function Sync() {
  const t = useCopy().sync;
  const { ref, step } = useLoop(SYNC, 4);
  const panel = step < 2 ? 'open' : step < 5 ? 'paid' : 'reversed';
  const erp = step < 3 ? 'open' : step < 6 ? 'paid' : 'open';
  const action = step === 2 ? t.settle : step === 5 ? t.reverse : '';

  return (
    <div ref={ref} role="img" aria-label={t.label} className="@container">
      <div className="flex flex-col @xl:flex-row @xl:items-stretch" aria-hidden>
        <Window title={t.panel} icon="wallet" lit={[1, 2, 5].includes(step)} className="@xl:flex-[1.2]">
          <p className="flex items-center justify-between gap-2 text-[0.6875rem] @md:text-xs">
            <span className="font-semibold">{t.invoice}</span>
            <span className={`morph rounded-sm bg-primary px-1.5 py-0.5 text-[0.625rem] text-primary-foreground ${action ? '' : 'opacity-0'}`}>{action || ' '}</span>
          </p>
          <ul className="mt-2 grid gap-1">
            {t.bills.map((b, k) => (
              <li key={b} className={`morph flex items-center justify-between gap-2 rounded-sm border px-2 py-1 text-[0.625rem] @md:text-xs ${look[panel]}`} style={{ transitionDelay: `${k * 120}ms` }}>
                <span className="font-mono tabular-nums">{b}</span>
                {t.status[panel]}
              </li>
            ))}
          </ul>
        </Window>
        <Wire cq key={step === 3 || step === 6 ? `l${step}` : 'w'} state={step === 3 || step === 6 ? 'live' : step > 3 ? 'done' : 'idle'} />
        <Window title={t.erp} icon="cloud-cog" lit={step === 3 || step === 6} className="@xl:flex-1">
          <p className="text-[0.6875rem] text-muted-foreground @md:text-xs">{t.payable}</p>
          <ul className="mt-2 grid gap-1">
            {t.bills.map((b, k) => (
              <li key={b} className={`morph flex items-center justify-between gap-2 rounded-sm border px-2 py-1 text-[0.625rem] @md:text-xs ${look[erp]}`} style={{ transitionDelay: `${k * 120}ms` }}>
                <span className="font-mono tabular-nums">{b.split(' · ')[0]}</span>
                {t.erpStatus[erp]}
              </li>
            ))}
          </ul>
        </Window>
      </div>
    </div>
  );
}

// The problem: three traps, each on a loop of its own.
const LIMIT = [500, 600, 700, 800, 2600];
const LIMIT_LOOK = [tone.idle, tone.warn, tone.bad];
function RateLimit() {
  const t = useCopy().rateLimit;
  const { ref, step } = useLoop(LIMIT);
  return (
    <Trap ref={ref} icon="cloud-cog" title={t.title} shown={step === 4} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : LIMIT_LOOK[i]}`}>
            {k}
            <span className="font-mono text-[0.6875rem]">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

const TWICE = [500, 600, 600, 800, 2600];
function Duplicate() {
  const t = useCopy().duplicate;
  const { ref, step } = useLoop(TWICE);
  return (
    <Trap ref={ref} icon="copy" title={t.title} shown={step >= 3} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {[0, 1].map((i) => (
          <li key={i} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : step >= 3 ? tone.bad : tone.idle}`}>
            <span className="font-mono text-xs">NF 1234 · 1/3</span>
            <span className="font-mono text-[0.6875rem]">{t.amount}</span>
          </li>
        ))}
      </ul>
      <p className={`morph mt-1.5 font-mono text-[0.6875rem] text-destructive ${step >= 3 ? '' : 'opacity-0'}`}>{t.twice}</p>
    </Trap>
  );
}

const SPREAD = [500, 500, 500, 800, 2600];
function Scattered() {
  const t = useCopy().scattered;
  const { ref, step } = useLoop(SPREAD);
  return (
    <Trap ref={ref} icon="layers" title={t.title} shown={step >= 3} verdict={t.verdict}>
      <p className="mb-1.5 text-xs text-muted-foreground">{t.expense}</p>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : step >= 3 && i ? tone.warn : tone.idle}`}>
            {k}
            <span className="text-[0.6875rem]">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

export function FinanceTraps() {
  return (
    <Traps>
      <RateLimit />
      <Duplicate />
      <Scattered />
    </Traps>
  );
}

// How it works: the per-company sync goes to the ERP in batches of 50 with a pause between them, so the API's limit
// is never reached. Steps: reset, then batch and pause in turn, then hold.
const BATCH = [600, 700, 500, 700, 500, 700, 500, 700, 2400];

export function FinanceHow() {
  const t = useCopy().how;
  const { ref, step } = useLoop(BATCH);
  const sending = step % 2 === 1 && step < 8;
  const pausing = step % 2 === 0 && step > 0 && step < 8;
  const done = step === 8;

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <Stage icon="wallet" title={t.panel} active={step === 0} className="lg:w-52">
          <ul className="flex flex-wrap gap-1">
            {t.entities.map((e) => (
              <li key={e} className="rounded-sm bg-secondary px-1.5 py-0.5 text-secondary-foreground">
                {e}
              </li>
            ))}
          </ul>
        </Stage>
        <Wire key={sending ? `l${step}` : 'w'} state={sending ? 'live' : step > 0 ? 'done' : 'idle'} />
        <div className={`morph flex gap-3 rounded-md border border-border bg-card p-3 text-card-foreground lg:flex-1 ${sending ? 'lit' : ''}`}>
          <div className="flex-1">
            <p className="text-[0.8125rem] font-semibold font-stretch-104%">{t.batches}</p>
            <ul className="mt-2 grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((k) => {
                const state = step > 2 * k + 1 ? 'done' : step === 2 * k + 1 ? 'live' : 'idle';
                return (
                  <li key={k} className={`morph rounded-sm border py-1.5 text-center font-mono text-xs ${state === 'done' ? tone.ok : state === 'live' ? `${tone.ok} lit` : 'border-dashed border-border text-muted-foreground'}`}>
                    50
                  </li>
                );
              })}
            </ul>
            <p className={`morph mt-2 text-xs ${pausing ? 'text-foreground' : done ? 'text-foreground' : 'text-muted-foreground'}`}>
              {done ? t.done : pausing ? t.pausing : t.sending}
            </p>
          </div>
          <div className="flex w-10 flex-col items-center">
            <span className="relative block h-full min-h-20 w-3 overflow-hidden rounded-full bg-border">
              <span className="absolute inset-x-0 top-[15%] border-t border-dashed border-destructive" />
              <span className="absolute inset-x-0 bottom-0 bg-primary transition-[height] duration-500 ease-out" style={{ height: sending ? '70%' : '12%' }} />
            </span>
            <span className="mt-1 text-[0.625rem] leading-tight text-muted-foreground">API</span>
          </div>
        </div>
        <Wire key={step === 7 ? 'erp7' : 'erp'} state={step === 7 ? 'live' : done ? 'done' : 'idle'} />
        <Stage icon="cloud-cog" title={t.erp} active={step === 7 || done} className="lg:w-40">
          <p className={done ? '' : 'text-muted-foreground'}>{done ? t.synced : '—'}</p>
        </Stage>
      </div>
    </div>
  );
}

// The outcome: entries start in the panel and reach the ERP with no rework, and deletions keep who and why.
const AUDIT = [500, 600, 600, 700, 700, 2600];
export function FinanceResult() {
  const t = useCopy().result;
  const { ref, step } = useLoop(AUDIT);
  const lines = t.log;
  return (
    <div ref={ref}>
      <BeforeAfter
        label={t.label}
        lit={step > 0 && step < 5}
        before={<Pains items={t.before} />}
        after={<Log lines={lines} shown={Math.min(step, lines.length)} />}
      />
    </div>
  );
}
