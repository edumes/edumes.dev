'use client';

import { useId } from 'react';
import { motion } from 'motion/react';
import { defineCopy } from '@/i18n/copy';
import { Icon, type IconName } from '../icon';
import { BeforeAfter, skeleton, Stage, tone, Trap, Traps, useLoop, Wire } from './shared';

// Device tracking case visuals. Every value on screen is made up; each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    lifecycle: {
      label:
        'Ilustração: o número de série de um terminal passa por entrada, estoque, venda, manutenção, devolução e garantia, e cada passagem vira histórico do mesmo aparelho. Uma manutenção lançada em dobro foi excluída: ela continua no histórico como cancelada, com a exclusão registrada.',
      // [stop, note], in the order of STOP_ICONS.
      stops: [
        ['Entrada', '03/02, nota 1234'],
        ['Estoque', '03/02'],
        ['Venda', '10/02, chave ativa'],
        ['Manutenção', '02/05, bateria'],
        ['Cancelada', '03/05, exclusão registrada'],
        ['Devolvido', '15/05'],
        ['Garantia', 'até 10/02/27']
      ] as [string, string][]
    },
    sideSheet: {
      title: 'Planilha paralela',
      verdict: 'Duas linhas para o mesmo aparelho, e nenhuma confiável.',
      serial: 'Serial',
      status: 'Situação',
      rows: ['Estoque', 'Vendido']
    },
    whereIs: {
      title: 'Onde está?',
      verdict: 'Ninguém sabia dizer onde estava cada aparelho.',
      places: ['Estoque', 'Cliente', 'Assistência']
    },
    notMatching: {
      title: 'Tudo precisa bater',
      verdict: 'Nota, ERP e estoque precisam contar a mesma história.',
      rows: [['Nota de entrada', '5 terminais'], ['ERP', '5 terminais'], ['Seriais no estoque', '4']] as [string, string][]
    },
    how: {
      label:
        'Ilustração: numa venda, os terminais são bipados um atrás do outro sem fechar a janela, e venda, movimentações e estoque são gravados numa só transação; cada aparelho ganha a venda no histórico.',
      sale: 'Venda 0815: 5 terminais',
      scanning: 'leitura em sequência, sem fechar a janela',
      transaction: 'Uma transação',
      tables: ['Venda', 'Movimentações', 'Estoque'],
      history: 'Histórico de cada aparelho',
      received: 'vendido na venda 0815',
      more: '+ 2 aparelhos'
    },
    result: {
      label: 'Antes, uma planilha paralela com linhas conflitantes; depois, uma busca pelo serial diz onde o aparelho está e por onde passou.',
      // One per serial in SHEET.
      sheet: ['Estoque', 'Vendido?', '?'],
      found: 'Com o cliente, em garantia até 10/02/27',
      history: ['10/02 venda, chave ativa', '02/05 manutenção interna', '03/05 manutenção cancelada', '15/05 devolvido ao cliente']
    }
  },
  en: {
    lifecycle: {
      label:
        'Illustration: a terminal’s serial number goes through receiving, stock, sale, repair, return and warranty, and each stop becomes history of the same device. A repair entered twice was deleted: it stays in the history as cancelled, with the deletion logged.',
      stops: [
        ['Receiving', 'Feb 3, invoice 1234'],
        ['Stock', 'Feb 3'],
        ['Sale', 'Feb 10, key active'],
        ['Repair', 'May 2, battery'],
        ['Cancelled', 'May 3, deletion logged'],
        ['Returned', 'May 15'],
        ['Warranty', 'until Feb 10, 2027']
      ]
    },
    sideSheet: {
      title: 'A side spreadsheet',
      verdict: 'Two rows for the same device, and neither is reliable.',
      serial: 'Serial',
      status: 'Status',
      rows: ['In stock', 'Sold']
    },
    whereIs: {
      title: 'Where is it?',
      verdict: 'Nobody could say where each device was.',
      places: ['Stock', 'Customer', 'Repair shop']
    },
    notMatching: {
      title: 'Everything has to match',
      verdict: 'Invoice, ERP and stock have to tell the same story.',
      rows: [['Purchase invoice', '5 terminals'], ['ERP', '5 terminals'], ['Serials in stock', '4']]
    },
    how: {
      label:
        'Illustration: in a sale, terminals are scanned one after another without closing the dialog, and the sale, movements and stock are written in one transaction; each device gets the sale in its history.',
      sale: 'Sale 0815: 5 terminals',
      scanning: 'scanned in sequence, dialog stays open',
      transaction: 'One transaction',
      tables: ['Sale', 'Movements', 'Stock'],
      history: "Each device's history",
      received: 'sold on sale 0815',
      more: '+ 2 devices'
    },
    result: {
      label: 'Before, a side spreadsheet with conflicting rows; after, one search by serial tells where the device is and where it has been.',
      sheet: ['In stock', 'Sold?', '?'],
      found: 'With the customer, under warranty until Feb 10, 2027',
      history: ['Feb 10 sale, key active', 'May 2 internal repair', 'May 3 repair cancelled', 'May 15 returned to the customer']
    }
  }
});

const SN = 'SN 0042-7781';
const STOP_ICONS: IconName[] = ['receipt-text', 'boxes', 'hand-coins', 'wrench', 'badge-alert', 'truck', 'shield-check'];
// The stop for the deleted repair: it stays on the timeline, marked as cancelled.
const CANCELLED = 4;
const LIFE = [900, 900, 900, 900, 900, 900, 900, 2600];

// One device's life: the serial travels from receiving to warranty, and every stop becomes part of its history.
export function Lifecycle() {
  const t = useCopy().lifecycle;
  const { ref, step } = useLoop(LIFE);
  const at = Math.min(step, t.stops.length - 1);
  const id = useId();

  return (
    <div ref={ref} role="img" aria-label={t.label} className="@container">
      <ol className="relative grid gap-3 @2xl:grid-cols-7 @2xl:gap-2 @2xl:pt-9" aria-hidden style={{ '--p': at / (t.stops.length - 1) } as React.CSSProperties}>
        <span className="absolute top-4 bottom-4 left-4 w-px bg-border @2xl:top-13 @2xl:right-[7.14%] @2xl:bottom-auto @2xl:left-[7.14%] @2xl:h-px @2xl:w-auto">
          <span className="morph absolute inset-0 origin-top transform-[scaleY(var(--p))] bg-primary @2xl:origin-left @2xl:transform-[scaleX(var(--p))]" />
        </span>
        {t.stops.map(([label, note], k) => {
          const reached = k <= at;
          const look = !reached ? 'border-border bg-card text-muted-foreground' : k === CANCELLED ? `${tone.warn} text-foreground` : 'border-primary bg-card text-foreground';
          return (
            <li key={label} className="relative flex items-center gap-3 @2xl:flex-col @2xl:gap-2 @2xl:text-center">
              <span className={`morph relative grid size-8 shrink-0 place-items-center rounded-full border ${look} ${k === at ? 'lit' : ''}`}>
                <Icon name={STOP_ICONS[k]} size={14} play={k === at} />
              </span>
              <div className={`morph min-w-0 ${reached ? '' : 'opacity-50'}`}>
                <p className="text-xs font-semibold font-stretch-104%">{label}</p>
                <p className="text-[0.6875rem] leading-tight text-muted-foreground">{note}</p>
              </div>
              {k === at && (
                <motion.span
                  layoutId={id}
                  transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
                  className="ml-auto rounded-sm bg-primary px-1.5 py-0.5 font-mono text-[0.625rem] whitespace-nowrap text-primary-foreground shadow-[0_0_14px_-2px_var(--glow-1)] @2xl:absolute @2xl:-top-8 @2xl:ml-0"
                >
                  {SN}
                </motion.span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// The problem: three traps, each on a loop of its own.
const SHEET = [500, 600, 600, 800, 2600];
function SideSheet() {
  const t = useCopy().sideSheet;
  const { ref, step } = useLoop(SHEET);
  return (
    <Trap ref={ref} icon="file-chart-line" title={t.title} shown={step >= 3} verdict={t.verdict}>
      <div className="overflow-hidden rounded-sm border border-border text-[0.8125rem]">
        <p className="grid grid-cols-2 bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <span>{t.serial}</span>
          <span>{t.status}</span>
        </p>
        {t.rows.map((r, k) => (
          <p key={r} className={`morph grid grid-cols-2 border-t px-2.5 py-1.5 ${step <= k ? skeleton : step >= 3 ? tone.bad : 'border-border'}`}>
            <span className="font-mono text-xs">0042-7781</span>
            {r}
          </p>
        ))}
      </div>
    </Trap>
  );
}

const WHERE = [600, 600, 600, 600, 2600];
function WhereIs() {
  const t = useCopy().whereIs;
  const { ref, step } = useLoop(WHERE);
  return (
    <Trap ref={ref} icon="search" title={t.title} shown={step === 4} verdict={t.verdict}>
      <p className="font-mono text-xs text-muted-foreground">{SN}</p>
      <ul className="mt-2 grid grid-cols-3 gap-1.5">
        {t.places.map((p, k) => (
          <li key={p} className={`morph rounded-sm border px-1.5 py-2 text-center text-xs ${step === 4 ? tone.warn : step === k + 1 ? `${tone.idle} lit` : tone.idle}`}>
            {p}
            <span className="mt-0.5 block font-mono">{step === 4 || step === k + 1 ? '?' : ' '}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

const COUNT = [500, 600, 600, 800, 2600];
function NotMatching() {
  const t = useCopy().notMatching;
  const { ref, step } = useLoop(COUNT);
  return (
    <Trap ref={ref} icon="receipt-text" title={t.title} shown={step >= 3} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : i === 2 && step >= 3 ? tone.bad : tone.idle}`}>
            {k}
            <span className="font-mono text-[0.6875rem]">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

export function SerialTraps() {
  return (
    <Traps>
      <SideSheet />
      <WhereIs />
      <NotMatching />
    </Traps>
  );
}

// How it works: a sale's terminals scanned one after another in the same dialog, written to several tables in one
// transaction, and the sale lands in each device's history. Steps: reset, five scans, writes, commit, hold.
const SERIALS = ['0042-7781', '0042-7782', '0042-7783', '0042-7784', '0042-7785'];
const BULK = [700, 350, 350, 350, 350, 350, 900, 900, 2400];

export function SerialHow() {
  const t = useCopy().how;
  const { ref, step } = useLoop(BULK);
  const scanned = Math.min(step, SERIALS.length);
  const writing = step === 6;
  const done = step >= 7;

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <Stage icon="scan-text" title={t.sale} active={step >= 1 && step <= SERIALS.length} className="lg:w-52">
          <p className="text-muted-foreground">{t.scanning}</p>
          <ul className="mt-2 grid gap-1">
            {SERIALS.map((sn, k) => (
              <li key={sn} className={`morph flex justify-between rounded-sm border px-2 py-0.5 font-mono ${k < scanned ? tone.ok : skeleton}`}>
                {sn}
                <span>✓</span>
              </li>
            ))}
          </ul>
        </Stage>
        <Wire state={writing ? 'live' : done ? 'done' : 'idle'} />
        <div className={`morph rounded-md border border-primary/40 bg-primary/6 p-3 lg:flex-1 ${writing || step === 7 ? 'lit' : ''}`}>
          <p className="flex items-center gap-2 text-[0.8125rem] leading-tight font-semibold font-stretch-104%">
            <Icon name="database-backup" size={14} play={writing} className="text-muted-foreground" />
            {t.transaction}
          </p>
          <ul className="mt-2 grid gap-1">
            {t.tables.map((table, k) => (
              <li
                key={table}
                className={`morph flex justify-between rounded-sm border px-2 py-1 text-xs ${done ? tone.ok : writing ? 'border-dashed border-primary/60 bg-card' : 'border-border text-muted-foreground'}`}
                style={{ transitionDelay: writing ? `${k * 200}ms` : '0ms' }}
              >
                {table}
                <span className="font-mono">{done ? '✓' : writing ? '…' : ''}</span>
              </li>
            ))}
          </ul>
          <p className={`morph mt-2 font-mono text-xs ${done ? '' : 'text-transparent'}`}>commit</p>
        </div>
        <Wire state={step === 7 ? 'live' : step > 7 ? 'done' : 'idle'} />
        <Stage icon="calendar-days" title={t.history} active={step === 7} className="lg:w-52">
          <ul className="grid gap-1">
            {SERIALS.slice(0, 3).map((sn) => (
              <li key={sn} className={`morph rounded-sm px-2 py-0.5 ${done ? 'bg-secondary text-secondary-foreground' : 'bg-foreground/[0.07] text-transparent'}`}>
                <span className="font-mono">{sn}</span> · {t.received}
              </li>
            ))}
            <li className={`morph text-muted-foreground ${done ? '' : 'opacity-0'}`}>{t.more}</li>
          </ul>
        </Stage>
      </div>
    </div>
  );
}

// The outcome: one search answers where a device is and where it has been, with no side spreadsheet.
const QUERY = '0042-7781';
const FIND = [700, ...[...QUERY].map(() => 110), 700, 2800];
const SHEET_SN = ['0042-7781', '0042-7781', '0042-7790'];

export function SerialResult() {
  const t = useCopy().result;
  const { ref, step } = useLoop(FIND);
  const typed = Math.min(step, QUERY.length);
  const answered = step > QUERY.length;
  return (
    <div ref={ref}>
      <BeforeAfter
        label={t.label}
        lit={answered}
        before={
          <div className="overflow-hidden rounded-sm border border-border font-mono text-xs">
            {SHEET_SN.map((sn, k) => (
              <p key={k} className="grid grid-cols-2 border-t border-border px-2.5 py-1 first:border-t-0">
                <span>{sn}</span>
                <span className="text-muted-foreground">{t.sheet[k]}</span>
              </p>
            ))}
          </div>
        }
        after={
          <div className="text-[0.8125rem]">
            <p className="flex items-center gap-2 rounded-sm border border-border bg-background px-2.5 py-1.5 font-mono text-xs">
              <Icon name="search" size={14} still className="text-muted-foreground" />
              {QUERY.slice(0, typed)}
              <span className={`h-3.5 w-px bg-foreground ${answered ? 'opacity-0' : 'motion-safe:animate-pulse'}`} />
            </p>
            <div className={`morph mt-2 rounded-sm border px-2.5 py-2 ${answered ? tone.ok : skeleton}`} style={{ transform: answered ? 'none' : 'translateY(-4px)' }}>
              <p className="font-semibold">{t.found}</p>
              <ul className="mt-1 grid gap-0.5 font-mono text-[0.6875rem]">
                {t.history.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
}
