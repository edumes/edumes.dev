'use client';

import { Fragment } from 'react';
import { defineCopy } from '@/i18n/copy';
import type { IconName } from '../icon';
import { BeforeAfter, Log, Pains, scenarios, skeleton, Stage, Tabs, tone, Trap, Traps, useLoop, Window, Wire, type WireState } from './shared';

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
      label:
        'Ilustração: no painel financeiro, um título agrupado passa pela checagem de duplicidade antes da baixa no ERP, e excluir um agrupamento exige motivo e fica registrado; no coletor, um pedido de venda é criado no ERP e vira um PDF a partir do modelo da empresa, enviado por e-mail.',
      tabs: ['Painel financeiro', 'Coletor de pedidos'],
      // [stage, what it shows], one list per scenario, in the order of HOW_ICONS.
      flows: [
        [['Título agrupado', 'NF 1234 · 3 títulos'], ['Checagem', '✓ nenhum igual no ERP'], ['ERP em nuvem', '✓ baixado'], ['Exclusão', 'só com motivo, e fica registrada']],
        [['Pedido de venda', 'PV 0815 · 3 itens'], ['ERP em nuvem', '✓ criado e editado no ERP'], ['Modelo .docx', 'modelo da Empresa A'], ['PDF', '✓ enviado por e-mail']]
      ] as [string, string][][]
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
      label:
        'Illustration: in the finance panel, a grouped bill goes through a duplicate check before it is settled in the ERP, and deleting a group takes a reason and is logged; in the collector, a sales order is created in the ERP and becomes a PDF from the company’s template, sent by e-mail.',
      tabs: ['Finance panel', 'Order collector'],
      flows: [
        [['Grouped bill', 'Invoice 1234 · 3 bills'], ['Check', '✓ no match in the ERP'], ['Cloud ERP', '✓ settled'], ['Deletion', 'only with a reason, and logged']],
        [['Sales order', 'SO 0815 · 3 items'], ['Cloud ERP', '✓ created and edited in the ERP'], ['.docx template', "Company A's template"], ['PDF', '✓ sent by e-mail']]
      ]
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

// How it works, in two scenarios. The finance panel: a grouped bill is checked for a duplicate before it is settled in
// the ERP, and deleting a group takes a reason. The collector: a sales order goes to the ERP and comes back as a PDF
// from the company's template. Phases: one per stage, then hold.
const HOW = scenarios([
  [[0, 700], [1, 900], [2, 900], [3, 1100], [4, 2200]],
  [[0, 700], [1, 900], [2, 900], [3, 1100], [4, 2200]]
]);
const HOW_ICONS: IconName[][] = [
  ['receipt-text', 'shield-check', 'cloud-cog', 'badge-alert'],
  ['hand-coins', 'cloud-cog', 'file-text', 'send']
];

export function FinanceHow() {
  const t = useCopy().how;
  const { ref, step, on, inView } = useLoop(HOW.durations, 4);
  const { s, p } = HOW.steps[step];
  const wire = (from: number): WireState => (p < from ? 'idle' : p === from ? 'live' : 'done');

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <Tabs labels={t.tabs} s={s} total={HOW.totals[s]} on={on} inView={inView} />
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        {t.flows[s].map(([title, body], k) => (
          <Fragment key={title}>
            {k > 0 && <Wire state={wire(k)} />}
            <Stage icon={HOW_ICONS[s][k]} title={title} active={p === k} className="lg:flex-1">
              <p className={`morph ${p >= k ? '' : 'text-transparent'}`}>{body}</p>
            </Stage>
          </Fragment>
        ))}
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
