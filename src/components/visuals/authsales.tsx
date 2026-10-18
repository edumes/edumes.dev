'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { defineCopy } from '@/i18n/copy';
import { Icon, type IconName } from '../icon';
import { delay, glow, row, scenarios, skeleton, Stage, Tabs, tone, Trap, Traps, useLoop, Wire, type WireState } from './shared';

// AuthSales case visuals. Every value on screen is made up; each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    foundation: {
      label:
        'Ilustração: a base AuthSales, com autenticação, permissões, auditoria, telas, temas e PDF, ligando três sistemas, e cada um escreve só o próprio domínio.',
      base: ['Autenticação', 'Permissões e escopo', 'Auditoria e outbox', 'CRUD e telas', 'Temas e i18n', 'PDF e e-mail'],
      // [name, tag, its own modules], in the order of SYSTEM_ICONS.
      systems: [
        ['Comercial', 'freelance', ['Clientes', 'Produtos', 'Orçamentos']],
        ['Hospitalar', 'estudo', ['Clínico', 'Fluxos de status']],
        ['ERP', '', ['Vendas', 'Compras', 'Estoque', 'Fiscal']]
      ] as [string, string, string[]][],
      fromBase: 'da base',
      title: 'Base AuthSales',
      packages: 'pacotes de backend, frontend e tipos'
    },
    halfWrite: {
      title: 'Escrita pela metade',
      verdict: 'Um pedido sem auditoria, que nenhum outro sistema ficou sabendo.',
      rows: [['Pedido', true], ['Auditoria', false], ['Evento de saída', false]] as [string, boolean][],
      saved: '✓ gravado',
      failed: '✗ falhou'
    },
    leak: {
      title: 'Dado de outra conta',
      verdict: 'Um usuário da Conta A vendo um pedido da Conta B.',
      account: 'Conta A',
      order: 'Pedido 87',
      customer: 'Cliente da Conta B'
    },
    drift: {
      title: 'Código copiado',
      verdict: 'A correção feita em um sistema não chega nas cópias.',
      fix: '+ correção',
      system: (n: number) => `Sistema ${n}`,
      fixed: '✓ corrigido',
      stale: '⚠ ainda com o bug',
      copy: 'cópia da base'
    },
    pipeline: {
      label:
        'Ilustração: uma requisição recebe um contexto imutável, passa pelo escopo da conta e grava escrita, auditoria, recibo e eventos numa só transação; se uma parte falha, nada é gravado; um pedido de outra conta responde 404.',
      tabs: ['Tudo certo', 'Uma parte falha', 'Pedido de outra conta'],
      parts: ['Escrita de negócio', 'Auditoria', 'Recibo de idempotência', 'Eventos na outbox'],
      outcome: {
        commit: '201 Created: tudo gravado junto, e os workers seguem depois do commit.',
        rollback: 'Rollback: a transação volta inteira, sem auditoria nem evento órfão.',
        denied: '404: para a Conta A, o pedido 87 não existe.'
      },
      request: 'Requisição',
      session: 'sessão autenticada',
      context: 'Contexto',
      chips: ['Conta A', 'Loja 1', 'Vendedor'],
      immutable: 'imutável até o fim',
      scope: 'Escopo',
      denied: '✗ O pedido 87 é da Conta B',
      inside: '✓ Dentro da conta e da loja',
      transaction: 'Uma transação',
      rollback: 'rollback: nada gravado'
    },
    migration: {
      label: 'Ilustração: mais de cem serviços passam da arquitetura antiga para a nova, e nenhuma assinatura pública muda.',
      signatures: 'Assinaturas públicas',
      same: 'as mesmas antes e depois',
      old: 'Arquitetura antiga',
      new: 'Nova arquitetura',
      moved: 'serviços migrados',
      changed: 'assinaturas públicas alteradas'
    }
  },
  en: {
    foundation: {
      label:
        'Illustration: the AuthSales foundation, with authentication, permissions, audit, screens, themes and PDF, powering three systems that each write only their own domain.',
      base: ['Authentication', 'Permissions and scope', 'Audit and outbox', 'CRUD and screens', 'Themes and i18n', 'PDF and e-mail'],
      systems: [
        ['Sales', 'freelance', ['Customers', 'Products', 'Quotes']],
        ['Healthcare', 'study', ['Clinical', 'Status flows']],
        ['ERP', '', ['Sales', 'Purchasing', 'Stock', 'Tax']]
      ],
      fromBase: 'from base',
      title: 'AuthSales foundation',
      packages: 'backend, frontend and type packages'
    },
    halfWrite: {
      title: 'Half-done writes',
      verdict: 'An order with no audit entry, and no other system heard about it.',
      rows: [['Order', true], ['Audit entry', false], ['Outgoing event', false]],
      saved: '✓ saved',
      failed: '✗ failed'
    },
    leak: {
      title: "Another account's data",
      verdict: 'A user from Account A looking at an order from Account B.',
      account: 'Account A',
      order: 'Order 87',
      customer: "Account B's customer"
    },
    drift: {
      title: 'Copied code',
      verdict: 'A fix made in one system never reaches the copies.',
      fix: '+ fix',
      system: (n) => `System ${n}`,
      fixed: '✓ fixed',
      stale: '⚠ still has the bug',
      copy: 'copied base'
    },
    pipeline: {
      label:
        'Illustration: a request gets an immutable context, passes the account scope and saves write, audit, receipt and events in one transaction; if one part fails, nothing is saved; another account’s order answers 404.',
      tabs: ['All good', 'One part fails', "Another account's order"],
      parts: ['Business write', 'Audit entry', 'Idempotency receipt', 'Outbox events'],
      outcome: {
        commit: '201 Created: everything saved together, and the workers follow after the commit.',
        rollback: 'Rollback: the whole transaction is undone, no orphan audit entry or event.',
        denied: '404: for Account A, order 87 does not exist.'
      },
      request: 'Request',
      session: 'signed-in session',
      context: 'Context',
      chips: ['Account A', 'Store 1', 'Seller'],
      immutable: 'immutable to the end',
      scope: 'Scope',
      denied: '✗ Order 87 belongs to Account B',
      inside: '✓ Inside the account and store',
      transaction: 'One transaction',
      rollback: 'rollback: nothing saved'
    },
    migration: {
      label: 'Illustration: over a hundred services move from the old architecture to the new one, and no public signature changes.',
      signatures: 'Public signatures',
      same: 'the same before and after',
      old: 'Old architecture',
      new: 'New architecture',
      moved: 'services moved',
      changed: 'public signatures changed'
    }
  }
});

const SYSTEM_ICONS: IconName[] = ['hand-coins', 'stethoscope', 'boxes'];
// Reset, then for each system: plug into the base, write its own domain. Then hold with all three running.
const FOUNDATION = [700, 1100, 900, 1100, 900, 1100, 900, 2800];

// One base, several systems: each one plugs in, inherits every base module and only writes its own domain.
export function Foundation() {
  const t = useCopy().foundation;
  const { ref, step } = useLoop(FOUNDATION);
  const booting = step % 2 === 1 && step < 7 ? (step - 1) / 2 : -1;
  const writing = step % 2 === 0 && step > 0 && step < 7 ? step / 2 - 1 : -1;
  const base = t.base;

  return (
    <div ref={ref} role="img" aria-label={t.label} className="@container">
      <ul className="grid grid-cols-3 gap-2 @xl:gap-4">
        {t.systems.map(([name, tag, modules], i) => {
          const on = step >= 1 + 2 * i;
          const written = step >= 2 + 2 * i;
          return (
            <li key={name} className="flex flex-col">
              <div
                className={`morph flex-1 rounded-md border p-2 @md:p-3 ${on ? 'border-border bg-card' : 'border-dashed border-border opacity-55'} ${
                  booting === i || writing === i ? 'lit' : ''
                }`}
              >
                <span className="flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-1 rounded-full bg-border @md:size-1.5" />
                  ))}
                </span>
                <p className="mt-2 flex flex-col gap-1 text-[0.6875rem] leading-tight font-semibold font-stretch-104% @md:flex-row @md:items-center @md:gap-1.5 @xl:text-[0.8125rem]">
                  <Icon name={SYSTEM_ICONS[i]} size={14} play={booting === i} className="text-muted-foreground" />
                  {name}
                  {tag && <span className="hidden font-normal text-muted-foreground @3xl:inline">· {tag}</span>}
                </p>
                <p className="mt-2 flex items-center gap-0.75">
                  <span className="mr-1 hidden text-[0.6875rem] text-muted-foreground @2xl:inline">{t.fromBase}</span>
                  {base.map((b, j) => (
                    <span
                      key={b}
                      className={`morph size-1.5 rounded-xs @xl:size-2 ${on ? 'bg-primary' : 'bg-border'}`}
                      style={{ ...delay(on, 250 + j * 90), boxShadow: booting === i ? glow : 'none' }}
                    />
                  ))}
                </p>
                <ul className="mt-2 flex flex-col gap-1 @xl:flex-row @xl:flex-wrap">
                  {modules.map((m, k) => (
                    <li
                      key={m}
                      className={`morph rounded-sm border px-1.5 py-0.5 text-[0.625rem] leading-tight @xl:text-xs ${
                        written ? 'border-border bg-secondary text-secondary-foreground' : skeleton
                      }`}
                      style={{ ...delay(written, k * 140), transform: written ? 'none' : 'scale(0.94)' }}
                    >
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <span className="relative mx-auto block h-5 w-px bg-border @md:h-7">
                <span className="morph absolute inset-0 origin-bottom bg-primary" style={{ transform: on ? 'none' : 'scaleY(0)' }} />
                {booting === i && <span className="wire-dot [animation-direction:reverse]" />}
              </span>
            </li>
          );
        })}
      </ul>
      <div className={`morph rounded-md border border-primary/40 bg-primary/6 p-2.5 @md:p-4 ${booting >= 0 ? 'lit' : ''}`}>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[0.8125rem] font-semibold font-stretch-104% @xl:text-[0.9375rem]">
          <Icon name="blocks" size={16} play={booting >= 0} className="text-muted-foreground" />
          {t.title}
          <span className="text-xs font-normal text-muted-foreground">{t.packages}</span>
        </p>
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {base.map((b, j) => (
            <li key={b} className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-2 py-1 text-[0.6875rem] leading-tight @xl:text-[0.8125rem]">
              <span
                className={`morph size-1.5 shrink-0 rounded-xs @xl:size-2 ${booting >= 0 ? 'bg-primary' : 'bg-primary/50'}`}
                style={{ ...delay(booting >= 0, j * 90), boxShadow: booting >= 0 ? glow : 'none' }}
              />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// The problem: three traps, each acted out on a loop of its own.
const HALF = [500, 600, 600, 600, 2600];
function HalfWrite() {
  const t = useCopy().halfWrite;
  const { ref, step } = useLoop(HALF);
  return (
    <Trap ref={ref} icon="database-backup" title={t.title} shown={step === 4} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([label, ok], k) => (
          <li key={label} className={`${row} ${step <= k ? skeleton : ok ? tone.idle : tone.bad}`}>
            {label}
            <span className="font-mono text-[0.6875rem]">{ok ? t.saved : t.failed}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

const LEAK = [500, 700, 700, 2600];
function Leak() {
  const t = useCopy().leak;
  const { ref, step } = useLoop(LEAK);
  return (
    <Trap ref={ref} icon="users" title={t.title} shown={step === 3} verdict={t.verdict}>
      <div className="grid gap-1.5">
        <p className={`${row} ${step < 1 ? skeleton : tone.idle}`}>
          {t.account}
          <span className="font-mono text-[0.6875rem]">GET /orders/87</span>
        </p>
        <div className={`morph rounded-sm border px-2.5 py-2 text-[0.8125rem] ${step < 2 ? skeleton : tone.bad}`} style={{ transform: step < 2 ? 'translateY(-4px)' : 'none' }}>
          <p className="font-semibold">{t.order}</p>
          <p className="mt-0.5 flex justify-between gap-3 text-xs">
            {t.customer}
            <span className="font-mono">R$ 980,00</span>
          </p>
        </div>
      </div>
    </Trap>
  );
}

const DRIFT = [500, 800, 700, 2600];
function Drift() {
  const t = useCopy().drift;
  const { ref, step } = useLoop(DRIFT);
  return (
    <Trap ref={ref} icon="copy" title={t.title} shown={step === 3} verdict={t.verdict}>
      <div className="grid grid-cols-3 gap-1.5">
        <span
          className="morph col-span-3 mb-1 w-fit rounded-sm bg-primary px-2 py-0.5 font-mono text-[0.6875rem] text-primary-foreground"
          style={{ opacity: step === 1 ? 1 : 0, transform: step < 1 ? 'translateY(-6px)' : step > 1 ? 'translateY(10px) scale(0.9)' : 'none' }}
        >
          {t.fix}
        </span>
        {[1, 2, 3].map((n) => {
          const state = n === 1 ? (step >= 2 ? 'fixed' : 'copy') : step >= 3 ? 'stale' : 'copy';
          return (
            <div
              key={n}
              className={`morph rounded-sm border px-2 py-2 text-xs/tight ${
                state === 'fixed' ? tone.ok : state === 'stale' ? tone.warn : tone.idle
              }`}
            >
              <p className="font-semibold">{t.system(n)}</p>
              <p className="mt-1 text-[0.6875rem] text-muted-foreground">{t[state]}</p>
            </div>
          );
        })}
      </div>
    </Trap>
  );
}

export function Pitfalls() {
  return (
    <Traps>
      <HalfWrite />
      <Leak />
      <Drift />
    </Traps>
  );
}

// How it works: one request through the platform, in three scenarios. Phases: 0 request, 1 context, 2 scope,
// 3 transaction writes, 4 commit or rollback, 5 workers, 6 hold.
const ENDS = ['commit', 'rollback', 'denied'] as const;
const FLOW = scenarios([
  [[0, 600], [1, 800], [2, 700], [3, 1200], [4, 800], [5, 900], [6, 1900]],
  [[0, 600], [1, 800], [2, 700], [3, 1200], [4, 1200], [6, 1900]],
  [[0, 600], [1, 800], [2, 1000], [6, 2100]]
]);

export function Pipeline() {
  const t = useCopy().pipeline;
  const { ref, step, on, inView } = useLoop(FLOW.durations, 6);
  const { s, p } = FLOW.steps[step];
  const end = ENDS[s];
  const wire = (from: number): WireState => (p < from ? 'idle' : p === from ? 'live' : 'done');
  const writes = end !== 'denied' && p >= 3;
  const settled = writes && p >= 4;
  const showOutcome = end === 'denied' ? p >= 2 : p >= 4;

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <Tabs labels={t.tabs} s={s} total={FLOW.totals[s]} on={on} inView={inView} />

      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <Stage icon="send" title={t.request} active={p === 0} className="lg:w-30">
          <p className="font-mono">{end === 'denied' ? 'GET /orders/87' : 'POST /orders'}</p>
          <p className="mt-1 text-muted-foreground">{t.session}</p>
        </Stage>
        <Wire state={wire(1)} />
        <Stage icon="shield-check" title={t.context} active={p === 1} className="lg:w-38">
          <ul className="flex flex-wrap gap-1">
            {t.chips.map((c, k) => (
              <li key={c} className={`morph rounded-sm px-1.5 py-0.5 ${p >= 1 ? 'bg-secondary text-secondary-foreground' : 'bg-foreground/[0.07] text-transparent'}`} style={delay(p >= 1, k * 140)}>
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-1 text-muted-foreground">{t.immutable}</p>
        </Stage>
        <Wire state={wire(2)} />
        <Stage icon="search" title={t.scope} active={p === 2} className={`lg:w-36 ${end === 'denied' && p >= 2 ? 'border-destructive/60!' : ''}`}>
          <p className={`morph min-h-10 ${p < 2 ? 'text-transparent' : end === 'denied' ? 'text-destructive' : ''}`}>{end === 'denied' ? t.denied : t.inside}</p>
        </Stage>
        <Wire state={end === 'denied' ? (p >= 2 ? 'blocked' : 'idle') : wire(3)} />
        <div className={`morph rounded-md border border-primary/40 bg-primary/6 p-3 lg:flex-1 ${p === 3 || (end === 'commit' && p === 4) ? 'lit' : ''} ${end === 'rollback' && p >= 4 ? 'border-destructive/60!' : ''}`}>
          <p className="flex items-center gap-2 text-[0.8125rem] leading-tight font-semibold font-stretch-104%">
            <Icon name="database-backup" size={14} play={p === 3} className="text-muted-foreground" />
            {t.transaction}
          </p>
          <ul className="mt-2 grid gap-1 sm:grid-cols-2">
            {t.parts.map((label, k) => {
              const failed = end === 'rollback' && k === 3;
              const state = !writes ? 'idle' : failed ? 'fail' : !settled ? 'pending' : end === 'commit' ? 'ok' : 'undone';
              const look = {
                idle: 'border-border text-muted-foreground',
                pending: 'border-dashed border-primary/60 bg-card',
                ok: 'border-primary/50 bg-primary/10',
                fail: 'border-destructive/60 bg-destructive/10',
                undone: 'border-border text-muted-foreground line-through opacity-60'
              }[state];
              const mark = { idle: '', pending: '…', ok: '✓', fail: '✗', undone: '↺' }[state];
              const wait = state === 'pending' || state === 'fail' ? k * 220 : state === 'undone' ? (3 - k) * 120 : 0;
              return (
                <li key={label} className={`morph flex items-center justify-between gap-2 rounded-sm border px-2 py-1 text-xs/tight ${look}`} style={{ transitionDelay: `${wait}ms` }}>
                  {label}
                  <span className="font-mono">{mark}</span>
                </li>
              );
            })}
          </ul>
          <p className={`morph mt-2 font-mono text-xs ${!settled ? 'text-transparent' : end === 'commit' ? 'text-foreground' : 'text-destructive'}`}>
            {end === 'rollback' ? t.rollback : 'commit'}
          </p>
        </div>
        <Wire state={end === 'commit' ? wire(5) : end === 'rollback' && p >= 4 ? 'blocked' : 'idle'} />
        <Stage icon="cog" title="Workers" active={p === 5} className="lg:w-28">
          <ul className="flex flex-wrap gap-1 lg:flex-col">
            {['E-mail', 'PDF', 'ERP'].map((w, k) => {
              const lit = end === 'commit' && p >= 5;
              return (
                <li key={w} className={`morph rounded-sm border px-1.5 py-0.5 ${lit ? 'border-primary/50 bg-primary/10' : 'border-border text-muted-foreground'}`} style={delay(lit, k * 150)}>
                  {w}
                </li>
              );
            })}
          </ul>
        </Stage>
      </div>

      <p className={`morph mt-4 min-h-[1.5em] text-[0.8125rem] ${showOutcome ? '' : 'opacity-0'}`} aria-hidden>
        {t.outcome[end]}
      </p>
    </div>
  );
}

// The outcome: services move one by one to the new architecture while every public signature stays put. They leave
// from the end of one list and land at the end of the other, so nothing else reflows.
const SERVICES = ['orders', 'customers', 'products', 'stock', 'finance', 'users', 'stores', 'reports', 'tax', 'purchasing', 'contracts', 'notifications'];
const MIGRATION = [900, ...SERVICES.map(() => 230), 2800];

export function Migration() {
  const t = useCopy().migration;
  const { ref, step } = useLoop(MIGRATION);
  const id = useId();
  const moved = Math.min(step, SERVICES.length);
  const done = moved === SERVICES.length;
  const chip = (n: string) => (
    <motion.li key={n} layoutId={id + n} transition={{ type: 'spring', bounce: 0, duration: 0.5 }} className="rounded-sm border border-border bg-card px-2 py-1 font-mono text-[0.6875rem] leading-tight">
      {n}
    </motion.li>
  );
  const box = (title: string, lit: boolean, items: string[]) => (
    <div className={`morph rounded-md border p-3 lg:flex-1 ${lit ? 'lit bg-primary/6' : 'border-border bg-background/60'}`}>
      <p className="text-[0.8125rem] font-semibold font-stretch-104%">{title}</p>
      <ul className="mt-2 flex min-h-18 flex-wrap content-start gap-1.5">{items.map(chip)}</ul>
    </div>
  );

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <div aria-hidden>
        <div className={`morph rounded-md border bg-card px-3 py-2.5 ${done ? 'lit' : 'border-border'}`}>
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-[0.8125rem] font-semibold font-stretch-104%">
            {t.signatures}
            <span className="text-xs font-normal text-muted-foreground">{t.same}</span>
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
            <li>orders.create(input)</li>
            <li>customers.find(id)</li>
            <li>stock.reserve(items)</li>
          </ul>
        </div>
        <div className="mt-3 flex flex-col lg:flex-row lg:items-stretch">
          {box(t.old, false, SERVICES.slice(0, SERVICES.length - moved))}
          <Wire state={moved > 0 ? 'done' : 'idle'} />
          {box(t.new, done, SERVICES.slice(SERVICES.length - moved).reverse())}
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-4">
          {[
            [done ? '100+' : String(Math.round((moved / SERVICES.length) * 100)), t.moved],
            ['0', t.changed]
          ].map(([value, label]) => (
            <div key={label} className="flex flex-col-reverse border-t border-border pt-3">
              <dt className="type-meta">{label}</dt>
              <dd className="type-title tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
