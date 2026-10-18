'use client';

import { useFormatter } from 'next-intl';
import { defineCopy } from '@/i18n/copy';
import { BeforeAfter, Log, Pains, scenarios, skeleton, Stage, Tabs, tone, Trap, Traps, useLoop, Window, Wire, type WireState } from './shared';

// RPA orchestration case visuals. Every value on screen is made up; each one loops on its own while visible.

const useCopy = defineCopy({
  pt: {
    fleet: {
      label:
        'Ilustração: um painel agenda robôs em três estações de clientes; cada estação recebe a ordem pela própria conexão, roda um robô por vez e devolve os eventos; a terceira para e pede alguém.',
      robots: ['guias-fiscais', 'conciliacao', 'portal-gov'],
      status: { idle: 'agendado', queued: 'na fila', running: 'rodando', done: '✓ concluído', needs: '⚠ precisa de alguém' },
      panel: 'Painel',
      station: 'Estação',
      note: 'Cada estação abre a própria conexão com o painel: as ordens descem e os eventos sobem.'
    },
    byHand: {
      title: 'Disparado à mão',
      verdict: 'Ninguém via o que rodou, nem quando, nem se deu certo.',
      rows: [['Iniciado', 'à mão, 08:12', false], ['Log', 'nenhum', true], ['Terminou?', 'ninguém sabe', true]] as [string, string, boolean][]
    },
    oneMouse: {
      title: 'Um mouse, dois robôs',
      verdict: 'Robôs que usam mouse e teclado não podem rodar em paralelo.',
      device: 'Mouse e teclado da estação',
      robot: 'Robô',
      clash: '✗ clicando ao mesmo tempo'
    },
    misread: {
      title: 'Valor lido errado',
      verdict: 'Um valor lido errado vira um e-mail errado.',
      rows: [['Guia em PDF: total', '12.345,60'], ['Robô leu', '1.234,56'], ['E-mail ao cliente', 'R$ 1.234,56']] as [string, string][]
    },
    agent: {
      label:
        'Ilustração: o robô emite eventos para o agente, que guarda numa fila local e envia ao painel pela conexão aberta pela estação; se a conexão cai, os eventos esperam na fila e são reenviados sem duplicar; um robô que precisa de alguém diz de quem é a vez.',
      tabs: ['Execução normal', 'A conexão cai', 'Precisa de alguém'],
      panelStates: { wait: '—', live: 'log ao vivo', done: '✓ concluído', needs: '⚠ vez do cliente', offline: 'estação offline', resent: 'eventos reenviados, sem duplicar' },
      robotStates: { run: 'emitindo eventos', ok: 'sucesso', needs: 'precisa de alguém' },
      workstation: 'Estação do cliente, sem portas de entrada',
      robot: 'Robô',
      agent: 'Agente',
      oneAtATime: 'um robô por vez',
      queue: 'Fila local',
      resends: 'reenvia sem duplicar',
      server: 'Servidor do painel',
      panel: 'Painel',
      saved: '✓ gravado',
      truth: 'a única fonte da verdade'
    },
    reads: {
      label: 'Ilustração: o robô lê o mesmo valor em três lugares da guia; se as leituras concordam, envia o e-mail; se uma diverge, para e pede revisão.',
      tabs: ['As leituras concordam', 'Uma leitura diverge'],
      places: ['Valor total', 'Linha de totais', 'Bloco do PIX'],
      form: 'Guia de imposto (fictícia)',
      agree: 'Concordam?',
      cents: 'centavo a centavo',
      match: '✓ as três batem',
      differs: '✗ a terceira difere',
      decides: 'Decide o envio',
      sends: '✓ Compara com o mês anterior e envia o e-mail',
      stops: '⚠ Documento ilegível: o robô para e pede revisão'
    },
    result: {
      label: 'Antes, robôs disparados à mão e sem log; depois, robôs por agenda com log ao vivo, auditoria e pendências explicadas.',
      before: ['Disparado à mão', 'Sem log nem histórico', 'Valor divergente vira e-mail errado'],
      log: [
        ['06:00', 'agendado: guias-fiscais, Estação 01'],
        ['06:00', '▶ iniciado'],
        ['06:03', '✓ guias conferidas, e-mails enviados'],
        ['06:05', '⚠ valor divergente: pendência aberta para revisão', true],
        ['06:05', 'auditoria registrada']
      ] as [string, string, boolean?][]
    }
  },
  en: {
    fleet: {
      label:
        'Illustration: a panel schedules robots on three client workstations; each one gets the order over its own connection, runs one robot at a time and sends events back; the third stops and asks for a person.',
      robots: ['tax-forms', 'reconciliation', 'gov-portal'],
      status: { idle: 'scheduled', queued: 'queued', running: 'running', done: '✓ done', needs: '⚠ needs a person' },
      panel: 'Panel',
      station: 'Station',
      note: 'Each workstation opens its own connection to the panel: orders go down and events come up.'
    },
    byHand: {
      title: 'Started by hand',
      verdict: 'Nobody could see what ran, when, or whether it worked.',
      rows: [['Started', 'by hand, 8:12', false], ['Log', 'none', true], ['Finished?', 'nobody knows', true]]
    },
    oneMouse: {
      title: 'One mouse, two robots',
      verdict: 'Robots that drive the mouse and keyboard cannot run in parallel.',
      device: "The workstation's mouse and keyboard",
      robot: 'Robot',
      clash: '✗ clicking at the same time'
    },
    misread: {
      title: 'A misread amount',
      verdict: 'A misread amount becomes a wrong e-mail.',
      rows: [['PDF tax form: total', '12,345.60'], ['Robot read', '1,234.56'], ['E-mail to the client', '$1,234.56']]
    },
    agent: {
      label:
        'Illustration: the robot emits events to the agent, which keeps them in a local queue and sends them to the panel over the connection the workstation opened; if the connection drops, events wait in the queue and are resent without duplicates; a robot that needs a person says whose turn it is.',
      tabs: ['Normal run', 'The connection drops', 'Needs a person'],
      panelStates: { wait: '—', live: 'live log', done: '✓ done', needs: "⚠ the client's turn", offline: 'workstation offline', resent: 'events resent, no duplicates' },
      robotStates: { run: 'emitting events', ok: 'success', needs: 'needs a person' },
      workstation: "Client's workstation, no inbound ports",
      robot: 'Robot',
      agent: 'Agent',
      oneAtATime: 'one robot at a time',
      queue: 'Local queue',
      resends: 'resends without duplicates',
      server: 'Panel server',
      panel: 'Panel',
      saved: '✓ saved',
      truth: 'the single source of truth'
    },
    reads: {
      label: 'Illustration: the robot reads the same amount in three places on the form; if they agree it sends the e-mail; if one differs it stops and asks for review.',
      tabs: ['The reads agree', 'One read differs'],
      places: ['Total amount', 'Totals row', 'Payment block'],
      form: 'Tax form (made up)',
      agree: 'Do they agree?',
      cents: 'cent by cent',
      match: '✓ all three match',
      differs: '✗ the third differs',
      decides: 'Decides the sending',
      sends: '✓ Compares with last month and sends the e-mail',
      stops: '⚠ Unreadable document: the robot stops and asks for review'
    },
    result: {
      label: 'Before, robots started by hand with no log; after, scheduled robots with a live log, audit trail and explained follow-ups.',
      before: ['Started by hand', 'No log or history', 'A mismatch becomes a wrong e-mail'],
      log: [
        ['06:00', 'scheduled: tax-forms, Station 01'],
        ['06:00', '▶ started'],
        ['06:03', '✓ forms checked, e-mails sent'],
        ['06:05', '⚠ amount mismatch: follow-up opened for review', true],
        ['06:05', 'audit entry recorded']
      ]
    }
  }
});

const color = { idle: 'text-muted-foreground', queued: '', running: 'text-foreground', done: 'text-foreground', needs: 'text-(--attention)' };
type Run = keyof typeof color;
// Reset, then each station in turn: the order goes down, the robot runs, events come up. The third needs a person.
const FLEET = [700, 800, 1300, 1300, 1300, 900, 2600];
const run = (step: number, i: number): Run =>
  step < 1 + i ? 'idle' : step === 1 + i ? 'queued' : step === 2 + i ? 'running' : i === 2 ? 'needs' : 'done';

// The panel schedules robots on client workstations; each one runs one robot at a time over its own outbound link.
export function Fleet() {
  const t = useCopy().fleet;
  const { ref, step } = useLoop(FLEET);
  const robots = t.robots;
  const label = t.status;
  const busy = robots.some((_, i) => ['queued', 'running'].includes(run(step, i)));

  return (
    <div ref={ref} role="img" aria-label={t.label} className="@container">
      <div aria-hidden>
        <Window title={t.panel} icon="layout-panel-top" lit={busy}>
          <ul className="grid gap-1">
            {robots.map((r, i) => {
              const st = run(step, i);
              return (
                <li key={r} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-sm bg-background/60 px-2 py-1 text-[0.625rem] leading-tight @md:grid-cols-[2.5rem_minmax(0,1fr)_auto] @md:text-xs">
                  <span className="hidden font-mono text-muted-foreground @md:inline">06:{String(i * 5).padStart(2, '0')}</span>
                  <span className="truncate font-mono">{r}</span>
                  <span className={`morph ${color[st]}`}>{label[st]}</span>
                </li>
              );
            })}
          </ul>
        </Window>
        <ul className="grid grid-cols-3 gap-2 @xl:gap-4">
          {robots.map((r, i) => {
            const st = run(step, i);
            const width = st === 'running' ? (i === 2 ? '55%' : '100%') : st === 'done' ? '100%' : st === 'needs' ? '55%' : '0%';
            return (
              <li key={r} className="flex flex-col">
                <span className="relative mx-auto block h-5 w-px bg-border @md:h-7">
                  <span className="morph absolute inset-0 origin-top bg-primary" style={{ transform: st === 'idle' ? 'scaleY(0)' : 'none' }} />
                  {st === 'queued' && <span className="wire-dot" />}
                  {st === 'running' && <span className="wire-dot [animation-direction:reverse] [animation-iteration-count:2]" />}
                </span>
                <Window title={`${t.station} 0${i + 1}`} ghost={st === 'idle'} lit={st === 'queued' || st === 'running'} className="flex-1">
                  <p className="truncate font-mono text-[0.625rem] @md:text-xs">{st === 'idle' ? '—' : r}</p>
                  <span className="mt-2 block h-1 overflow-hidden rounded-full bg-border">
                    <span
                      className={`block h-full ${st === 'needs' ? 'bg-(--attention)' : 'bg-primary'}`}
                      style={{ width, transition: st === 'running' ? 'width 1200ms linear' : 'none' }}
                    />
                  </span>
                  <p className={`morph mt-1.5 text-[0.625rem] leading-tight @md:text-xs ${color[st]}`}>{label[st]}</p>
                </Window>
              </li>
            );
          })}
        </ul>
        <p className="type-meta mt-3 hidden @2xl:block">{t.note}</p>
      </div>
    </div>
  );
}

// The problem: three traps, each on a loop of its own.
const HAND = [500, 600, 600, 600, 2600];
function ByHand() {
  const t = useCopy().byHand;
  const { ref, step } = useLoop(HAND);
  return (
    <Trap ref={ref} icon="cursor-click" title={t.title} shown={step === 4} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v, warn], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step <= i ? skeleton : warn ? tone.warn : tone.idle}`}>
            {k}
            <span className="font-mono text-[0.6875rem]">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

const MOUSE = [500, 700, 800, 2600];
function OneMouse() {
  const t = useCopy().oneMouse;
  const { ref, step } = useLoop(MOUSE);
  return (
    <Trap ref={ref} icon="bot" title={t.title} shown={step === 3} verdict={t.verdict}>
      <div className={`morph rounded-sm border p-2.5 ${step >= 2 ? tone.bad : tone.idle}`}>
        <p className="text-xs text-muted-foreground">{t.device}</p>
        <div className="mt-2 flex gap-1.5">
          {['A', 'B'].map((r, k) => (
            <span
              key={r}
              className={`morph rounded-sm border px-2 py-1 text-xs ${step > k ? (step >= 2 ? tone.bad : tone.ok) : skeleton}`}
              style={{ transform: step > k ? 'none' : 'translateY(-6px)' }}
            >
              {t.robot} {r}
            </span>
          ))}
        </div>
        <p className="morph mt-2 font-mono text-[0.6875rem] text-destructive" style={{ opacity: step >= 2 ? 1 : 0 }}>
          {t.clash}
        </p>
      </div>
    </Trap>
  );
}

const MISREAD = [500, 700, 700, 2600];
function Misread() {
  const t = useCopy().misread;
  const { ref, step } = useLoop(MISREAD);
  return (
    <Trap ref={ref} icon="scan-text" title={t.title} shown={step === 3} verdict={t.verdict}>
      <ul className="grid gap-1.5">
        {t.rows.map(([k, v], i) => (
          <li key={k} className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${step < i ? skeleton : i ? tone.bad : tone.idle}`}>
            {k}
            <span className="font-mono text-[0.6875rem] tabular-nums">{v}</span>
          </li>
        ))}
      </ul>
    </Trap>
  );
}

export function RpaTraps() {
  return (
    <Traps>
      <ByHand />
      <OneMouse />
      <Misread />
    </Traps>
  );
}

// How it works, part 1: robot, agent and local queue on the workstation, panel and database on the server.
// Frames: [ms, robot, wires (robot→agent, agent→queue, queue→panel, panel→db), queued events, panel, saved, active stage].
type Frame = [number, 'run' | 'ok' | 'needs', string, number, 'wait' | 'live' | 'done' | 'needs' | 'offline' | 'resent', boolean, number];
const AGENT: Frame[][] = [
  [[700, 'run', 'liii', 0, 'wait', false, 0], [700, 'run', 'dlii', 1, 'wait', false, 1], [800, 'run', 'ddli', 0, 'live', false, 3], [800, 'ok', 'dddl', 0, 'done', true, 4], [1800, 'ok', 'dddd', 0, 'done', true, -1]],
  [
    [600, 'run', 'liii', 0, 'wait', false, 0],
    [700, 'run', 'dlbi', 1, 'offline', false, 2],
    [700, 'run', 'dlbi', 2, 'offline', false, 2],
    [700, 'run', 'dlbi', 3, 'offline', false, 2],
    [900, 'run', 'ddli', 0, 'resent', false, 3],
    [800, 'ok', 'dddl', 0, 'done', true, 4],
    [1800, 'ok', 'dddd', 0, 'done', true, -1]
  ],
  [[700, 'needs', 'liii', 0, 'wait', false, 0], [700, 'needs', 'dlii', 1, 'wait', false, 1], [800, 'needs', 'ddli', 0, 'needs', false, 3], [800, 'needs', 'dddl', 0, 'needs', true, 4], [2000, 'needs', 'dddd', 0, 'needs', true, -1]]
];
const AGENT_STEPS = AGENT.flatMap((frames, s) => frames.map((f) => ({ s, f })));
const AGENT_MS = AGENT_STEPS.map(({ f }) => f[0]);
const WIRE: Record<string, WireState> = { i: 'idle', l: 'live', d: 'done', b: 'blocked' };
const ROBOT_OUT = { run: '{"tipo":"progresso"}', ok: 'exit 0', needs: 'exit 3' };

function AgentFlow() {
  const t = useCopy().agent;
  const { ref, step, on, inView } = useLoop(AGENT_MS, 4);
  const { s, f } = AGENT_STEPS[step];
  const [, robot, wires, queued, panel, saved, active] = f;
  const w = [...wires].map((c) => WIRE[c]);
  // A wire that stays live across frames restarts its dot on every one.
  const wire = (k: number) => <Wire key={w[k] === 'live' ? `l${step}` : `w${k}`} state={w[k]} />;
  const group = 'rounded-lg border border-dashed border-border p-2.5 lg:flex lg:items-stretch';

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <Tabs labels={t.tabs} s={s} total={AGENT[s].reduce((a, x) => a + x[0], 0)} on={on} inView={inView} />
      <div className="flex flex-col lg:flex-row lg:items-stretch" aria-hidden>
        <div className="lg:flex-3">
          <p className="type-meta mb-2">{t.workstation}</p>
          <div className={group}>
            <Stage icon="bot" title={t.robot} active={active === 0} className={`lg:flex-1 ${robot === 'needs' ? 'border-(--attention)!' : ''}`}>
              <p className="truncate font-mono">{ROBOT_OUT[robot]}</p>
              <p className={`mt-1 ${robot === 'needs' ? 'text-(--attention)' : 'text-muted-foreground'}`}>{t.robotStates[robot]}</p>
            </Stage>
            {wire(0)}
            <Stage icon="cpu" title={t.agent} active={active === 1} className="lg:flex-1">
              <p className="text-muted-foreground">{t.oneAtATime}</p>
            </Stage>
            {wire(1)}
            <Stage icon="hard-drive-upload" title={t.queue} active={active === 2} className="lg:flex-1">
              <span className="flex h-2 gap-1">
                {Array.from({ length: queued }, (_, k) => (
                  <span key={k} className="size-2 rounded-xs bg-(--attention)" />
                ))}
              </span>
              <p className="mt-1 text-muted-foreground">{t.resends}</p>
            </Stage>
          </div>
        </div>
        <div className="lg:flex lg:items-center lg:pt-7">{wire(2)}</div>
        <div className="lg:flex-2">
          <p className="type-meta mb-2">{t.server}</p>
          <div className={group}>
            <Stage icon="layout-panel-top" title={t.panel} active={active === 3} className={`lg:flex-1 ${panel === 'offline' ? 'border-destructive/60!' : ''}`}>
              <p className={panel === 'needs' ? 'text-(--attention)' : panel === 'offline' ? 'text-destructive' : ''}>{t.panelStates[panel]}</p>
            </Stage>
            {wire(3)}
            <Stage icon="database-backup" title="PostgreSQL" active={active === 4} className="lg:flex-1">
              <p>{saved ? t.saved : '—'}</p>
              <p className="mt-1 text-muted-foreground">{t.truth}</p>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}

// How it works, part 2: the amount that decides sending is read in three places that must agree.
const READS = scenarios([
  [[0, 500], [1, 600], [2, 600], [3, 600], [4, 900], [5, 2200]],
  [[0, 500], [1, 600], [2, 600], [3, 600], [4, 900], [5, 2200]]
]);

function TripleRead() {
  const t = useCopy().reads;
  const format = useFormatter();
  const { ref, step, on, inView } = useLoop(READS.durations, 5);
  const { s, p } = READS.steps[step];
  const agree = s === 0;
  const amounts = [1234.56, 1234.56, agree ? 1234.56 : 1243.56];
  const Line = ({ w }: { w: string }) => <span className={`block h-1.5 rounded-full bg-border ${w}`} />;

  return (
    <div ref={ref} role="img" aria-label={t.label}>
      <Tabs labels={t.tabs} s={s} total={READS.totals[s]} on={on} inView={inView} />
      <div className="flex flex-col lg:flex-row lg:items-center" aria-hidden>
        <div className="rounded-md border border-border bg-card p-4 text-card-foreground lg:w-68 lg:flex-none">
          <p className="text-[0.8125rem] font-semibold">{t.form}</p>
          <div className="mt-3 grid gap-2">
            <Line w="w-3/4" />
            <Line w="w-1/2" />
            {t.places.map((label, k) => {
              const read = p > k;
              const odd = read && !agree && k === 2;
              return (
                <div key={label}>
                  <div
                    className={`morph flex items-center justify-between gap-3 rounded-sm border px-2.5 py-1.5 text-[0.8125rem] ${
                      odd ? tone.bad : read ? 'border-primary/60 bg-primary/6' : 'border-border'
                    } ${p === k + 1 && !odd ? 'lit' : ''}`}
                  >
                    <span className="flex items-center">
                      <span className={`morph mr-2 inline-grid size-4 place-items-center rounded-full text-[0.625rem] ${read ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{k + 1}</span>
                      {label}
                    </span>
                    <span className={`morph font-mono tabular-nums ${read ? '' : 'text-transparent'}`}>{format.number(amounts[k], { minimumFractionDigits: 2 })}</span>
                  </div>
                  {k < 2 && <Line w={k ? 'mt-2 w-1/3' : 'mt-2 w-2/3'} />}
                </div>
              );
            })}
          </div>
        </div>
        <Wire state={p >= 4 ? 'done' : p >= 1 ? 'live' : 'idle'} />
        <Stage icon="scan-text" title={t.agree} active={p === 4} className="lg:w-40">
          <p className={p >= 4 ? (agree ? '' : 'text-destructive') : 'text-muted-foreground'}>{p < 4 ? t.cents : agree ? t.match : t.differs}</p>
        </Stage>
        <Wire state={p >= 5 ? (agree ? 'done' : 'blocked') : 'idle'} />
        <div className={`morph rounded-md border px-3 py-2.5 text-[0.8125rem] lg:flex-1 ${p < 5 ? 'border-border text-muted-foreground' : agree ? tone.ok : tone.warn}`}>
          {p < 5 ? t.decides : agree ? t.sends : t.stops}
        </div>
      </div>
    </div>
  );
}

export function RpaHow() {
  return (
    <>
      <AgentFlow />
      <hr className="my-8 border-border" />
      <TripleRead />
    </>
  );
}

// The outcome: from started by hand to a scheduled run with a live log, where a mismatch is a follow-up.
const LOG = [500, 500, 500, 600, 700, 500, 2600];
export function RpaResult() {
  const t = useCopy().result;
  const { ref, step } = useLoop(LOG);
  const lines = t.log;
  const shown = Math.min(step, lines.length);
  return (
    <div ref={ref}>
      <BeforeAfter
        label={t.label}
        lit={step > 0 && step < lines.length}
        before={<Pains items={t.before} />}
        after={
          <Log lines={lines} shown={shown} />
        }
      />
    </div>
  );
}
