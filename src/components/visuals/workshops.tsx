'use client';

import { defineCopy } from '@/i18n/copy';
import { BeforeAfter, Pains, skeleton, tone, Trap, Traps, useLoop, Window, Wire } from './shared';

// Tire workshop network case visuals. Every value on screen is made up; each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    shops: ['Centro', 'Norte', 'Sul'],
    // A workshop by name in a sentence, and as the title of its window.
    shop: (name: string) => `Oficina ${name}`,
    window: (name: string) => `Oficina ${name}`,
    scope: {
      label: 'Ilustração: três oficinas no mesmo sistema; quem entra por uma oficina vê só as ordens de serviço dela, e as outras ficam fechadas.',
      session: 'Sessão',
      noAccess: 'sem acesso'
    },
    leak: {
      title: 'Uma vendo a outra',
      verdict: 'Uma oficina não pode enxergar as ordens de outra.',
      signedIn: 'Entrou como Oficina Norte',
      rows: [['OS 87', 'Oficina Norte'], ['OS 88', 'Oficina Norte'], ['OS 140', 'Oficina Sul']] as [string, string][]
    },
    legacy: {
      title: 'Sistema antigo',
      verdict: 'Os dados vinham de um sistema antigo com outra estrutura.'
    },
    unchecked: {
      title: 'Estoque sem contagem',
      verdict: 'Sem contagem, a diferença de estoque passava despercebida.',
      rows: [['Sistema: 185/65 R15', '8 pneus'], ['Na prateleira', '6 pneus'], ['Diferença', 'ninguém vê']] as [string, string][]
    },
    how: {
      label: 'Ilustração: a contagem de estoque de uma oficina, medida por medida, comparada com o esperado pelo sistema; as diferenças ficam destacadas.',
      count: 'Contagem, Oficina Norte',
      size: 'Medida',
      expected: 'Esperado',
      counted: 'Contado',
      gap: 'Diferença'
    },
    result: {
      label:
        'Antes, dados num sistema antigo e diferenças de estoque sem aparecer; depois, todas as oficinas no mesmo sistema, cada uma com seus dados, e a contagem aponta as diferenças.',
      before: ['Dados num sistema antigo, com outra estrutura', 'Diferenças de estoque sem aparecer'],
      ownData: '✓ só os seus dados',
      stockCount: 'Contagem de estoque',
      gaps: '⚠ 2 diferenças apontadas'
    }
  },
  en: {
    shops: ['Downtown', 'North', 'South'],
    shop: (name) => `${name} workshop`,
    window: (name) => name,
    scope: {
      label: 'Illustration: three workshops on the same system; whoever signs in at one workshop sees only its work orders, and the others stay closed.',
      session: 'Session',
      noAccess: 'no access'
    },
    leak: {
      title: 'Seeing the others',
      verdict: "One workshop must not see another's orders.",
      signedIn: 'Signed in as North',
      rows: [['OS 87', 'North'], ['OS 88', 'North'], ['OS 140', 'South']]
    },
    legacy: {
      title: 'An old system',
      verdict: 'The data came from an old system with a different structure.'
    },
    unchecked: {
      title: 'Stock never counted',
      verdict: 'Without a count, stock gaps went unnoticed.',
      rows: [['System: 185/65 R15', '8 tires'], ['On the shelf', '6 tires'], ['Gap', 'nobody sees it']]
    },
    how: {
      label: 'Illustration: a workshop’s stock count, size by size, compared with what the system expected; the gaps are highlighted.',
      count: 'Count, North workshop',
      size: 'Size',
      expected: 'Expected',
      counted: 'Counted',
      gap: 'Gap'
    },
    result: {
      label:
        'Before, data in an old system and stock gaps nobody saw; after, every workshop on the same system with its own data, and the count points out the gaps.',
      before: ['Data in an old system with a different structure', 'Stock gaps nobody saw'],
      ownData: '✓ only its own data',
      stockCount: 'Stock count',
      gaps: '⚠ 2 gaps pointed out'
    }
  }
});

const ORDERS: [string, string][][] = [
  [['OS 311', '205/55 R16'], ['OS 312', '185/65 R15']],
  [['OS 87', '175/70 R14'], ['OS 88', '195/60 R15']],
  [['OS 140', '205/55 R16'], ['OS 141', '185/65 R15']]
];
const SCOPE = [1900, 1900, 1900];

// The same system for every workshop, and each one signed in sees only its own work orders.
export function Workshops() {
  const c = useCopy();
  const t = c.scope;
  const { ref, step } = useLoop(SCOPE, 0);
  const shops = c.shops;
  return (
    <div ref={ref} role="img" aria-label={t.label} className="@container">
      <div aria-hidden>
        <p className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">{t.session}</span>
          <span key={step} className="lit rounded-sm border px-2 py-0.5 font-semibold">
            {c.shop(shops[step])}
          </span>
        </p>
        <ul className="grid grid-cols-3 gap-2 @xl:gap-4">
          {shops.map((shop, k) => {
            const mine = k === step;
            return (
              <li key={shop} className="flex">
                <Window title={c.window(shop)} icon="wrench" lit={mine} ghost={!mine} className="flex-1">
                  <ul className="grid gap-1">
                    {ORDERS[k].map(([os, size]) => (
                      <li key={os} className={`morph rounded-sm border px-1.5 py-1 text-[0.625rem] leading-tight @md:text-xs ${mine ? 'border-border bg-background' : skeleton}`}>
                        <span className="font-semibold">{os}</span>
                        <span className={`block font-mono @xl:ml-1.5 @xl:inline ${mine ? 'text-muted-foreground' : ''}`}>{size}</span>
                      </li>
                    ))}
                  </ul>
                  <p className={`morph mt-1.5 text-[0.625rem] text-muted-foreground @md:text-xs ${mine ? 'opacity-0' : ''}`}>{t.noAccess}</p>
                </Window>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// The problem: three traps, each on a loop of its own.
const LEAK = [500, 500, 500, 800, 2600];
const LEAKED = [false, false, true];
function Leak() {
  const t = useCopy().leak;
  const { ref, step } = useLoop(LEAK);
  return (
    <Trap ref={ref} icon="users" title={t.title} shown={step >= 3} verdict={t.verdict}>
      <p className="mb-1.5 text-xs text-muted-foreground">{t.signedIn}</p>
      <ul className="grid gap-1.5">
        {t.rows.map(([os, shop], i) => (
          <li key={os} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : LEAKED[i] && step >= 3 ? tone.bad : tone.idle}`}>
            {os}
            <span className="text-[0.6875rem]">{shop}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

const LEGACY = [500, 600, 600, 800, 2600];
function Legacy() {
  const t = useCopy().legacy;
  const { ref, step } = useLoop(LEGACY);
  const rows: [string, string, boolean][] = [['cli_nome', 'customer.name', false], ['dt_os', 'opened_at', false], ['seq_os', '?', true]];
  return (
    <Trap ref={ref} icon="database-backup" title={t.title} shown={step >= 3} verdict={t.verdict}>
      <ul className="grid gap-1.5 font-mono text-[0.6875rem]">
        {rows.map(([from, to, odd], i) => (
          <li key={from} className={`morph grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-sm border px-2.5 py-1.5 ${step <= i ? skeleton : odd && step >= 3 ? tone.warn : tone.idle}`}>
            <span>{from}</span>
            <span className="text-muted-foreground">→</span>
            <span>{to}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

const STOCK = [500, 600, 600, 800, 2600];
function Unchecked() {
  const t = useCopy().unchecked;
  const { ref, step } = useLoop(STOCK);
  return (
    <Trap ref={ref} icon="boxes" title={t.title} shown={step >= 3} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : i === 2 ? tone.warn : tone.idle}`}>
            {k}
            <span className="font-mono text-[0.6875rem]">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

export function WorkshopTraps() {
  return (
    <Traps>
      <Leak />
      <Legacy />
      <Unchecked />
    </Traps>
  );
}

// How it works: a stock count, item by item, compared with what the system expected.
const SIZES: [string, number, number][] = [['205/55 R16', 12, 12], ['185/65 R15', 8, 6], ['175/70 R14', 4, 4], ['195/60 R15', 6, 7]];
const COUNT = [600, 600, 600, 600, 600, 1000, 2600];

export function WorkshopHow() {
  const t = useCopy().how;
  const { ref, step } = useLoop(COUNT);
  const counted = Math.min(step, SIZES.length);
  const compared = step > SIZES.length;
  const cell = 'px-2 py-1 text-right tabular-nums';
  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <div className={`morph rounded-md border border-border bg-card p-3 text-card-foreground lg:w-[15rem] ${step >= 1 && !compared ? 'lit' : ''}`}>
          <p className="text-[0.8125rem] font-semibold [font-stretch:104%]">{t.count}</p>
          <ul className="mt-2 grid gap-1 text-xs">
            {SIZES.map(([size, , count], k) => (
              <li key={size} className="flex items-center justify-between gap-3 rounded-sm border border-border px-2 py-1">
                <span className="font-mono">{size}</span>
                <span className={`morph min-w-6 rounded-sm px-1.5 text-center font-mono tabular-nums ${k < counted ? 'bg-secondary text-secondary-foreground' : 'bg-foreground/[0.07] text-transparent'}`}>{count}</span>
              </li>
            ))}
          </ul>
        </div>
        <Wire state={step === SIZES.length + 1 ? 'live' : compared ? 'done' : 'idle'} />
        <div className={`morph overflow-hidden rounded-md border border-border bg-card text-card-foreground lg:flex-1 ${step === SIZES.length + 1 ? 'lit' : ''}`}>
          <table className="w-full text-xs">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-2 py-1 text-left font-normal">{t.size}</th>
                <th className={`${cell} font-normal`}>{t.expected}</th>
                <th className={`${cell} font-normal`}>{t.counted}</th>
                <th className={`${cell} font-normal`}>{t.gap}</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map(([size, expected, count]) => {
                const gap = count - expected;
                return (
                  <tr key={size} className={`morph border-t border-border ${compared && gap ? 'bg-destructive/10' : ''}`}>
                    <td className="px-2 py-1 font-mono">{size}</td>
                    <td className={cell}>{expected}</td>
                    <td className={`${cell} morph ${compared ? '' : 'text-transparent'}`}>{count}</td>
                    <td className={`${cell} morph font-mono ${compared ? (gap ? 'text-destructive' : 'text-muted-foreground') : 'text-transparent'}`}>{gap > 0 ? `+${gap}` : gap || '✓'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// The outcome: every workshop on the same system with its own data, and the count points out the gaps.
const JOIN = [600, 500, 500, 500, 800, 2600];
export function WorkshopResult() {
  const c = useCopy();
  const t = c.result;
  const { ref, step } = useLoop(JOIN);
  const rows: [string, string, string][] = [
    ...c.shops.map((s): [string, string, string] => [c.shop(s), t.ownData, tone.idle]),
    [t.stockCount, t.gaps, tone.warn]
  ];
  return (
    <div ref={ref}>
      <BeforeAfter
        label={t.label}
        lit={step === 4}
        before={<Pains items={t.before} />}
        after={
          <ul className="grid gap-1.5">
            {rows.map(([k, v, look], i) => (
              <li key={k} className={`morph flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step > i ? look : skeleton}`}>
                {k}
                <span className="text-[0.6875rem]">{v}</span>
              </li>
            ))}
          </ul>
        }
      />
    </div>
  );
}
