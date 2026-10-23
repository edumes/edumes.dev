'use client';

import { useId, useState } from 'react';
import { useFormatter } from 'next-intl';
import { defineCopy } from '@/i18n/copy';
import { Icon } from '../icon';
import { Stage, tone, useLoop, Window, Wire } from './shared';

const useCopy = defineCopy({
  pt: {
    disclaimer: 'Ilustração conceitual com dados fictícios.',
    scenarios: 'Escolher cenário da ilustração',
    pause: 'Pausar',
    resume: 'Retomar',
    reduced: 'Movimento reduzido',
    waiting: 'aguardando',
    saved: 'gravado',
    running: 'em andamento',
    topics: {
      outbox: {
        title: 'Do commit à entrega',
        scenarios: ['Commit', 'Rollback', 'Reentrega'],
        notes: [
          'Pedido e evento são gravados na mesma transação. O worker entrega depois do commit.',
          'Uma falha desfaz todas as escritas. O worker não recebe um evento dessa transação.',
          'A entrega pode se repetir. Neste exemplo, o consumidor reconhece o mesmo evento e aplica o efeito uma vez.'
        ]
      },
      themes: {
        title: 'Medir o par de cores',
        scenarios: ['Claro', 'Escuro', 'Contraste baixo'],
        notes: [
          'Este par fictício supera 4,5:1 para texto normal. A medida considera as duas cores opacas.',
          'O modo escuro também exige medir texto e superfície. O nome do tema não determina o contraste.',
          'O mesmo texto fica difícil de ler. O teste recusa o par, mesmo que as outras cores do tema passem.'
        ]
      },
      temporal: {
        title: 'Um instante, duas datas no relógio',
        scenarios: ['Data do negócio', 'Data em UTC'],
        notes: [
          'O negócio fica em São Paulo. Às 23:30 do dia 15, o vencimento do dia 15 ainda está em dia.',
          'Usar o dia em UTC acusa atraso três horas antes de o dia terminar em São Paulo. Os relógios mostram o mesmo instante.'
        ]
      },
      'pdf-geometry': {
        title: 'Qual número pertence ao rótulo?',
        scenarios: ['Pela posição', 'Texto corrido', 'Leitura divergente'],
        notes: [
          'A geometria encontra o valor na coluna do total. Neste exemplo, três leituras concordam.',
          'Depois dos dois rótulos, o texto extraído traz os dois valores. Pegar o próximo número escolhe a caixa vizinha.',
          'Uma leitura independente difere. O fluxo pede revisão e não escolhe um valor para continuar.'
        ]
      },
      'desktop-ocr': {
        title: 'Da imagem ao alvo na tela',
        scenarios: ['Alvo único', 'Dois alvos', 'Sem alvo'],
        notes: [
          'O recorte foi ampliado duas vezes. O centro reconhecido volta à escala original antes de somar a origem da captura.',
          'Duas ocorrências de Export não definem um destino único. O robô precisa restringir a busca ou pedir revisão.',
          'Sem uma leitura correspondente, o robô não inventa uma coordenada para clicar.'
        ]
      },
      'rpa-checkpoints': {
        title: 'O que o checkpoint permite concluir',
        scenarios: ['Concluída', 'Leitura interrompida', 'Resultado incerto'],
        notes: [
          'A etapa terminou e a confirmação local foi salva. Na retomada, ela é pulada.',
          'A etapa é uma leitura repetível. A nova tentativa pode concluir o que foi interrompido.',
          'O marcador running não diz se a ação externa aconteceu. A retomada pede revisão antes de repetir.'
        ]
      },
      'automation-dry-run': {
        title: 'O mesmo plano, efeitos diferentes',
        scenarios: ['Simulação', 'Envio habilitado', 'Resposta incerta'],
        notes: [
          'O plano pode ser inspecionado. O caminho de simulação não chama o transporte de envio.',
          'O envio foi habilitado explicitamente. O transporte recebe o mesmo plano que gerou a prévia.',
          'A resposta do transporte se perdeu. Isso não comprova que o envio falhou; uma repetição precisa tratar a incerteza.'
        ]
      }
    },
    outbox: {
      transaction: 'Uma transação',
      records: ['Pedido 482', 'Auditoria', 'Recibo da requisição', 'Evento evt-27'],
      staged: 'na transação',
      rollback: 'desfeito',
      worker: 'Worker',
      pending: 'evento pendente',
      delivering: 'entregando evt-27',
      delivered: 'evt-27 entregue',
      repeated: 'evt-27 entregue de novo',
      noEvent: 'nenhum evento para entregar',
      consumer: 'Consumidor',
      effect: 'Efeitos aplicados',
      deduplicated: 'mesmo evento reconhecido'
    },
    themes: {
      sample: 'Amostra de texto',
      text: 'Texto',
      surface: 'Fundo',
      measure: 'Contraste calculado',
      threshold: 'Mínimo: 4,5:1 para texto normal',
      passed: '✓ Par aprovado',
      failed: '✗ Par recusado'
    },
    temporal: {
      utc: 'Relógio em UTC',
      business: 'Relógio em São Paulo',
      due: 'Vencimento civil',
      compare: 'Dia usado na comparação',
      current: '✓ Ainda em dia',
      wrong: '✗ Atraso acusado antes da hora'
    },
    pdf: {
      document: 'Documento fictício',
      original: 'Valor original',
      total: 'Valor total',
      extracted: 'Ordem no texto extraído',
      readings: ['Caixa do total', 'Linha de totais', 'Bloco de pagamento'],
      accepted: '✓ Leituras concordam',
      wrong: '✗ A caixa vizinha foi escolhida',
      review: '⚠ Leituras divergem: revisar'
    },
    ocr: {
      application: 'Aplicação fictícia',
      crop: 'Recorte reconhecido',
      empty: 'Nenhum alvo reconhecido',
      map: 'Voltar às coordenadas da tela',
      origin: 'Origem',
      scale: 'Ampliação',
      center: 'Centro na imagem',
      point: 'Ponto na tela',
      unique: '✓ Alvo único; conferir o estado após o clique',
      ambiguous: '⚠ Dois alvos: não clicar',
      missing: '⚠ Nenhum alvo: não clicar'
    },
    checkpoint: {
      file: 'Checkpoint local',
      action: 'Etapa',
      company: 'Empresa',
      period: 'Período',
      state: 'Estado',
      destination: 'Sistema de destino',
      reading: 'consulta sem efeito externo',
      external: 'ação com efeito externo',
      noReply: 'resposta não recebida',
      confirmed: 'resultado confirmado',
      resume: 'Na retomada',
      skip: '✓ Pular etapa concluída',
      retry: '✓ Leitura repetida e concluída',
      review: '⚠ Conferir o destino antes de repetir'
    },
    simulation: {
      plan: 'Plano revisável',
      recipient: 'Destinatário',
      subject: 'Assunto',
      subjectValue: 'Lote de exemplo',
      transport: 'Transporte de envio',
      disabled: 'desabilitado',
      enabled: 'habilitado explicitamente',
      calls: 'Chamadas a send(plan)',
      result: 'Resultado observado',
      preview: '✓ Prévia gerada, sem envio',
      submitted: '✓ Submetido ao transporte',
      uncertain: '⚠ Resposta incerta: não presumir falha'
    }
  },
  en: {
    disclaimer: 'Conceptual illustration with made-up data.',
    scenarios: 'Choose an illustration scenario',
    pause: 'Pause',
    resume: 'Resume',
    reduced: 'Reduced motion',
    waiting: 'waiting',
    saved: 'saved',
    running: 'running',
    topics: {
      outbox: {
        title: 'From commit to delivery',
        scenarios: ['Commit', 'Rollback', 'Redelivery'],
        notes: [
          'The order and event are saved in one transaction. The worker delivers after the commit.',
          'A failure rolls back every write. The worker receives no event from this transaction.',
          'Delivery can repeat. In this example, the consumer recognizes the same event and applies the effect once.'
        ]
      },
      themes: {
        title: 'Measure the color pair',
        scenarios: ['Light', 'Dark', 'Low contrast'],
        notes: [
          'This made-up pair exceeds 4.5:1 for normal text. The measurement uses two opaque colors.',
          'Dark mode also needs text and surface measurements. A theme name does not determine contrast.',
          'The same text becomes hard to read. The check rejects this pair even if the other theme colors pass.'
        ]
      },
      temporal: {
        title: 'One instant, two calendar dates',
        scenarios: ['Business date', 'UTC date'],
        notes: [
          'The business is in São Paulo. At 23:30 on the 15th, a due date of the 15th is still current.',
          'Using the UTC date reports an overdue item three hours before the day ends in São Paulo. Both clocks show the same instant.'
        ]
      },
      'pdf-geometry': {
        title: 'Which amount belongs to the label?',
        scenarios: ['By position', 'Text order', 'Conflicting reading'],
        notes: [
          'Geometry finds the amount in the total column. Three readings agree in this example.',
          'After both labels, extracted text contains both amounts. Taking the next number selects the neighboring box.',
          'An independent reading differs. The workflow requests a review instead of choosing an amount to proceed.'
        ]
      },
      'desktop-ocr': {
        title: 'From image to screen target',
        scenarios: ['One target', 'Two targets', 'No target'],
        notes: [
          'The crop was enlarged twice. The recognized center returns to its original scale before adding the capture origin.',
          'Two occurrences of Export do not identify a unique destination. The robot must narrow its search or request review.',
          'Without a matching reading, the robot does not invent a click coordinate.'
        ]
      },
      'rpa-checkpoints': {
        title: 'What the checkpoint can tell us',
        scenarios: ['Completed', 'Interrupted read', 'Uncertain outcome'],
        notes: [
          'The stage finished and its local confirmation was saved. Recovery skips it.',
          'The stage is a repeatable read. A new attempt can complete the interrupted work.',
          'The running marker does not say whether the external action happened. Recovery requests review before repeating it.'
        ]
      },
      'automation-dry-run': {
        title: 'The same plan, different effects',
        scenarios: ['Simulation', 'Sending enabled', 'Uncertain response'],
        notes: [
          'The plan can be inspected. The simulation path does not call the sending transport.',
          'Sending was explicitly enabled. The transport receives the same plan used for the preview.',
          'The transport response was lost. This does not prove that sending failed; a retry needs to handle uncertainty.'
        ]
      }
    },
    outbox: {
      transaction: 'One transaction',
      records: ['Order 482', 'Audit entry', 'Request receipt', 'Event evt-27'],
      staged: 'in transaction',
      rollback: 'rolled back',
      worker: 'Worker',
      pending: 'pending event',
      delivering: 'delivering evt-27',
      delivered: 'evt-27 delivered',
      repeated: 'evt-27 delivered again',
      noEvent: 'no event to deliver',
      consumer: 'Consumer',
      effect: 'Effects applied',
      deduplicated: 'same event recognized'
    },
    themes: {
      sample: 'Text sample',
      text: 'Text',
      surface: 'Background',
      measure: 'Calculated contrast',
      threshold: 'Minimum: 4.5:1 for normal text',
      passed: '✓ Pair passes',
      failed: '✗ Pair fails'
    },
    temporal: {
      utc: 'UTC clock',
      business: 'São Paulo clock',
      due: 'Civil due date',
      compare: 'Date used for comparison',
      current: '✓ Still current',
      wrong: '✗ Reported overdue too early'
    },
    pdf: {
      document: 'Made-up document',
      original: 'Original amount',
      total: 'Total amount',
      extracted: 'Extracted text order',
      readings: ['Total box', 'Totals row', 'Payment block'],
      accepted: '✓ Readings agree',
      wrong: '✗ The neighboring box was selected',
      review: '⚠ Conflicting readings: review'
    },
    ocr: {
      application: 'Made-up application',
      crop: 'Recognized crop',
      empty: 'No target recognized',
      map: 'Map back to the screen',
      origin: 'Origin',
      scale: 'Scale',
      center: 'Image center',
      point: 'Screen point',
      unique: '✓ One target; check the state after clicking',
      ambiguous: '⚠ Two targets: do not click',
      missing: '⚠ No target: do not click'
    },
    checkpoint: {
      file: 'Local checkpoint',
      action: 'Stage',
      company: 'Company',
      period: 'Period',
      state: 'State',
      destination: 'Destination system',
      reading: 'query without an external effect',
      external: 'action with an external effect',
      noReply: 'no response received',
      confirmed: 'outcome confirmed',
      resume: 'On recovery',
      skip: '✓ Skip the completed stage',
      retry: '✓ Read repeated and completed',
      review: '⚠ Check the destination before retrying'
    },
    simulation: {
      plan: 'Reviewable plan',
      recipient: 'Recipient',
      subject: 'Subject',
      subjectValue: 'Example batch',
      transport: 'Sending transport',
      disabled: 'disabled',
      enabled: 'explicitly enabled',
      calls: 'Calls to send(plan)',
      result: 'Observed result',
      preview: '✓ Preview generated, no sending',
      submitted: '✓ Submitted to the transport',
      uncertain: '⚠ Uncertain response: do not assume failure'
    }
  }
});

type SceneProps = { scenario: number; step: number };
const TIMING = [800, 1000, 1100, 1100, 3000];
const flow = 'flex min-w-0 flex-col @xl:flex-row @xl:items-stretch';
const rows = 'mt-3 grid gap-2 text-xs';

function Outbox({ scenario, step }: SceneProps) {
  const t = useCopy();
  const rolledBack = scenario === 1;
  const status = step < 1 ? t.waiting : step < 2 ? t.outbox.staged : rolledBack ? t.outbox.rollback : t.saved;
  const worker = rolledBack ? t.outbox.noEvent : step < 3 ? t.outbox.pending : step < 4 ? t.outbox.delivering : scenario === 2 ? t.outbox.repeated : t.outbox.delivered;
  return (
    <div className={flow}>
      <Window title={t.outbox.transaction} icon="database-backup" lit={step === 1} className="min-w-0 flex-1">
        <ul className={rows}>
          {t.outbox.records.map((record) => (
            <li key={record} className={`morph flex flex-wrap justify-between gap-x-2 gap-y-1 rounded-sm border p-2 ${step < 2 ? tone.idle : rolledBack ? tone.bad : tone.ok}`}>
              <span>{record}</span><span className="text-muted-foreground">{status}</span>
            </li>
          ))}
        </ul>
      </Window>
      <Wire cq state={step < 2 ? 'idle' : rolledBack ? 'blocked' : step === 2 ? 'live' : 'done'} />
      <Stage icon="refresh-cw" title={t.outbox.worker} active={step === 3 && !rolledBack} className="min-w-0 flex-1">
        <p className="min-h-10">{step < 2 ? t.waiting : worker}</p>
        <p className="mt-3 rounded-sm bg-muted p-2 font-mono">evt-27</p>
      </Stage>
      <Wire cq state={step < 3 || rolledBack ? 'idle' : step === 3 ? 'live' : 'done'} />
      <Stage icon="clipboard-check" title={t.outbox.consumer} active={step === 4 && !rolledBack} className="min-w-0 flex-1">
        <p>{t.outbox.effect}</p>
        <p className="mt-2 font-mono text-3xl tabular-nums">{step >= 3 && !rolledBack ? 1 : 0}</p>
        <p className="mt-3 min-h-10 text-muted-foreground">{scenario === 2 && step >= 4 ? t.outbox.deduplicated : step >= 3 && !rolledBack ? t.saved : t.waiting}</p>
      </Stage>
    </div>
  );
}

// Opaque sRGB examples; ratios are calculated from relative luminance, before rounding.
const COLOR_PAIRS = [
  { text: '#334155', background: '#f8fafc', ratio: 9.9 },
  { text: '#e2e8f0', background: '#0f172a', ratio: 14.48 },
  { text: '#94a3b8', background: '#f8fafc', ratio: 2.45 }
];

function Contrast({ scenario, step }: SceneProps) {
  const t = useCopy().themes;
  const format = useFormatter();
  const pair = COLOR_PAIRS[scenario];
  const passed = pair.ratio >= 4.5;
  return (
    <div className="grid gap-4 @md:grid-cols-2">
      <div className="min-w-0">
        <div aria-hidden className="flex min-h-36 items-center justify-center rounded-md border border-border p-5" style={{ background: pair.background }}>
          <p className="morph text-xl font-semibold" style={{ color: pair.text, opacity: step >= 1 ? 1 : 0.25 }}>{t.sample}</p>
        </div>
        <dl className={`${rows} font-mono`}>
          <div className="flex flex-wrap justify-between gap-2"><dt>{t.text}</dt><dd>{pair.text}</dd></div>
          <div className="flex flex-wrap justify-between gap-2"><dt>{t.surface}</dt><dd>{pair.background}</dd></div>
        </dl>
      </div>
      <Stage icon="palette" title={t.measure} active={step === 2}>
        <p className="my-4 font-mono text-4xl tabular-nums">{step >= 2 ? format.number(pair.ratio, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}<span className="text-base text-muted-foreground"> : 1</span></p>
        <p className="text-muted-foreground">{t.threshold}</p>
        <p className={`morph mt-4 rounded-sm border p-2 ${step < 3 ? tone.idle : passed ? tone.ok : tone.bad}`} style={{ opacity: step >= 3 ? 1 : 0 }}>{passed ? t.passed : t.failed}</p>
      </Stage>
    </div>
  );
}

const INSTANT = new Date('2026-08-16T02:30:00.000Z');
const DUE = new Date('2026-08-15T00:00:00.000Z');

function Temporal({ scenario, step }: SceneProps) {
  const t = useCopy().temporal;
  const format = useFormatter();
  const date = (timeZone: string) => format.dateTime(INSTANT, { timeZone, day: '2-digit', month: 'short' });
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {[[t.utc, 'UTC'], [t.business, 'America/Sao_Paulo']].map(([title, timeZone], index) => (
          <Window key={timeZone} title={title} icon="calendar-days" lit={step >= 2 && index === (scenario ? 0 : 1)}>
            <p className="mt-4 font-mono text-2xl tabular-nums @sm:text-3xl">{format.dateTime(INSTANT, { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })}</p>
            <p className="mt-1 text-sm">{date(timeZone)}</p>
            <p className="mt-3 break-all text-[0.625rem] text-muted-foreground">{timeZone}</p>
          </Window>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-md border border-border p-3"><p>{t.due}</p><p className="mt-2 font-mono text-base">{format.dateTime(DUE, { timeZone: 'UTC', day: '2-digit', month: 'short' })}</p></div>
        <div className="rounded-md border border-border p-3"><p>{t.compare}</p><p className="morph mt-2 font-mono text-base" style={{ opacity: step >= 2 ? 1 : 0 }}>{date(scenario ? 'UTC' : 'America/Sao_Paulo')}</p></div>
      </div>
      <p className={`morph mt-4 rounded-md border p-3 text-sm ${scenario ? tone.bad : tone.ok}`} style={{ opacity: step >= 3 ? 1 : 0 }}>{scenario ? t.wrong : t.current}</p>
    </div>
  );
}

function Pdf({ scenario, step }: SceneProps) {
  const t = useCopy().pdf;
  const format = useFormatter();
  const amount = (value: number) => format.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const badText = scenario === 1;
  return (
    <div>
      <Window title={t.document} icon="file-text">
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[[t.original, amount(1100)], [t.total, amount(1234.56)]].map(([label, value], index) => {
            const selected = step >= 1 && index === (badText ? 0 : 1);
            return (
              <div key={label} className={`morph rounded-sm border p-3 ${selected ? badText ? tone.bad : tone.ok : tone.idle}`}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-2 font-mono text-base @sm:text-xl">{value}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{t.extracted}</p>
        <p className="mt-1 break-words font-mono text-xs">{t.original} · {t.total}<br />{amount(1100)} · {amount(1234.56)}</p>
      </Window>
      <div className="mt-4 grid gap-2 @md:grid-cols-3">
        {t.readings.map((label, index) => (
          <div key={label} className={`morph rounded-md border p-3 ${step >= 3 && (badText && index === 0 || scenario === 2 && index === 2) ? tone.warn : tone.idle}`}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="morph mt-2 font-mono text-base" style={{ opacity: step >= 2 ? 1 : 0 }}>{amount(badText && index === 0 ? 1100 : scenario === 2 && index === 2 ? 1240 : 1234.56)}</p>
          </div>
        ))}
      </div>
      <p className={`morph mt-4 rounded-md border p-3 text-sm ${scenario === 0 ? tone.ok : tone.warn}`} style={{ opacity: step >= 4 ? 1 : 0 }}>{badText ? t.wrong : scenario === 2 ? t.review : t.accepted}</p>
    </div>
  );
}

function Ocr({ scenario, step }: SceneProps) {
  const t = useCopy().ocr;
  const values = [[t.origin, '(420, 180)'], [t.scale, '2×'], [t.center, '(140, 50)'], [t.point, '(490, 205)']];
  return (
    <div className="grid gap-4 @md:grid-cols-2">
      <Window title={t.application} icon="layout-panel-top">
        <div className="relative mt-3 h-44 overflow-hidden rounded-sm bg-muted">
          <div className="absolute inset-x-3 top-3 flex gap-2" aria-hidden>{[0, 1, 2].map(i => <span key={i} className="h-1.5 w-8 rounded-full bg-border" />)}</div>
          <div className={`morph absolute inset-x-3 top-10 bottom-3 rounded-sm border border-dashed p-3 ${step >= 1 ? 'border-primary' : 'border-border'}`}>
            <p className="text-[0.625rem] text-muted-foreground">{t.crop}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {scenario < 2 ? Array.from({ length: scenario + 1 }, (_, index) => (
                <span key={index} className={`morph relative rounded-sm border px-2 py-1 text-xs ${step >= 2 ? scenario ? tone.warn : tone.ok : tone.idle}`}>
                  Export
                  {scenario === 0 && <span className="morph absolute -right-2 -bottom-3 text-primary" style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'none' : 'translate(8px, 8px)' }} aria-hidden><Icon name="cursor-click" size={22} still /></span>}
                </span>
              )) : <span className="text-xs text-muted-foreground">{t.empty}</span>}
            </div>
          </div>
        </div>
      </Window>
      <Stage icon="scan-text" title={t.map} active={step === 2 && scenario === 0}>
        <dl className={rows}>
          {values.map(([label, value], index) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{label}</dt><dd className="morph font-mono" style={{ opacity: step >= Math.min(index, 3) && scenario === 0 ? 1 : 0 }}>{value}</dd></div>)}
        </dl>
        <p className={`morph mt-4 rounded-sm border p-2 ${scenario === 0 ? tone.ok : tone.warn}`} style={{ opacity: step >= 4 ? 1 : 0 }}>{scenario === 0 ? t.unique : scenario === 1 ? t.ambiguous : t.missing}</p>
      </Stage>
    </div>
  );
}

function Checkpoint({ scenario, step }: SceneProps) {
  const t = useCopy();
  const uncertain = scenario === 2;
  const completed = !uncertain && step >= (scenario === 1 ? 4 : 3);
  const state = step === 0 ? 'pending' : completed ? 'done' : 'running';
  return (
    <div>
      <div className={flow}>
        <Window title={t.checkpoint.file} icon="hard-drive-upload" lit={step === 1 || completed} className="min-w-0 flex-1">
          <dl className={rows}>
            {[[t.checkpoint.company, 'company-7'], [t.checkpoint.period, '2026-10'], [t.checkpoint.action, scenario === 1 ? 'read' : 'submit'], [t.checkpoint.state, state]].map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2"><dt className="text-muted-foreground">{label}</dt><dd className="morph font-mono">{value}</dd></div>)}
          </dl>
        </Window>
        <Wire cq state={step < 2 ? 'idle' : uncertain ? 'blocked' : completed ? 'done' : 'live'} />
        <Stage icon="cloud-cog" title={t.checkpoint.destination} active={step === 2 || scenario === 1 && step === 3} className="min-w-0 flex-1">
          <p>{scenario === 1 ? t.checkpoint.reading : t.checkpoint.external}</p>
          <p className={`morph mt-4 rounded-sm border p-2 ${uncertain || scenario === 1 && step === 2 ? tone.warn : tone.ok}`} style={{ opacity: step >= 2 ? 1 : 0 }}>{uncertain || scenario === 1 && step === 2 ? t.checkpoint.noReply : completed ? t.checkpoint.confirmed : t.running}</p>
        </Stage>
      </div>
      <div className={`morph mt-4 rounded-md border p-3 ${uncertain ? tone.warn : tone.ok}`} style={{ opacity: step >= 4 ? 1 : 0 }}>
        <p className="text-xs text-muted-foreground">{t.checkpoint.resume}</p>
        <p className="mt-1 text-sm">{scenario === 0 ? t.checkpoint.skip : scenario === 1 ? t.checkpoint.retry : t.checkpoint.review}</p>
      </div>
    </div>
  );
}

function Simulation({ scenario, step }: SceneProps) {
  const t = useCopy().simulation;
  return (
    <div>
      <div className={flow}>
        <Window title={t.plan} icon="file-check" lit={step === 1} className="min-w-0 flex-1">
          <dl className={rows}>
            <div><dt className="text-muted-foreground">{t.recipient}</dt><dd className="mt-1 break-all font-mono">review@example.invalid</dd></div>
            <div><dt className="text-muted-foreground">{t.subject}</dt><dd className="mt-1">{t.subjectValue}</dd></div>
          </dl>
        </Window>
        <Wire cq state={scenario === 0 || step < 2 ? 'idle' : step === 2 ? 'live' : 'done'} />
        <Stage icon="send" title={t.transport} active={step === 3 && scenario > 0} className="min-w-0 flex-1">
          <p>{scenario === 0 ? t.disabled : t.enabled}</p>
          <p className="mt-4 text-muted-foreground">{t.calls}</p>
          <p className="mt-2 font-mono text-3xl tabular-nums">{scenario > 0 && step >= 3 ? 1 : 0}</p>
        </Stage>
      </div>
      <div className={`morph mt-4 rounded-md border p-3 ${scenario === 2 ? tone.warn : tone.ok}`} style={{ opacity: step >= 4 ? 1 : 0 }}>
        <p className="text-xs text-muted-foreground">{t.result}</p>
        <p className="mt-1 text-sm">{scenario === 0 ? t.preview : scenario === 1 ? t.submitted : t.uncertain}</p>
      </div>
    </div>
  );
}

const scenes: Record<string, React.ComponentType<SceneProps>> = {
  outbox: Outbox,
  themes: Contrast,
  temporal: Temporal,
  'pdf-geometry': Pdf,
  'desktop-ocr': Ocr,
  'rpa-checkpoints': Checkpoint,
  'automation-dry-run': Simulation
};

function Player({ scene: Scene, scenario, playing, id }: { scene: React.ComponentType<SceneProps>; scenario: number; playing: boolean; id: string }) {
  const { ref, step, inView } = useLoop(TIMING, TIMING.length - 1, playing);
  return <div id={id} ref={ref} data-step={step} data-playing={playing && inView} className="min-w-0"><Scene scenario={scenario} step={step} /></div>;
}

// MDX supplies the post id; scenarios, playback and the made-up-data caption stay consistent across articles.
export function BlogIllustration({ id }: { id: string }) {
  const t = useCopy();
  const topics: Record<string, { title: string; scenarios: string[]; notes: string[] }> = t.topics;
  const topic = topics[id];
  const Scene = scenes[id];
  const [scenario, setScenario] = useState(0);
  const [playing, setPlaying] = useState(true);
  const figureId = useId();
  const playerId = `${figureId}-player`;
  if (!Object.hasOwn(topics, id) || !Object.hasOwn(scenes, id)) {
    throw new Error(`Blog post "${id}" needs a localized illustration in src/components/visuals/blog.tsx.`);
  }

  return (
    <figure aria-labelledby={figureId} data-illustration={id} data-paused={!playing} className="blog-illustration @container my-10 min-w-0 rounded-lg border border-border bg-muted/40 p-4 sm:p-6">
      <figcaption>
        <p id={figureId} className="text-[0.9375rem] font-semibold font-stretch-104%">{topic.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t.disclaimer}</p>
      </figcaption>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label={t.scenarios} className="flex flex-wrap gap-1.5">
          {topic.scenarios.map((label, index) => <button key={label} type="button" aria-pressed={scenario === index} aria-controls={playerId} onClick={() => setScenario(index)} className={`pressable min-h-10 rounded-sm border px-2.5 py-2 text-xs ${scenario === index ? 'border-foreground bg-foreground text-background' : 'border-border hover:bg-muted'}`}>{label}</button>)}
        </div>
        <span className="hidden text-xs text-muted-foreground motion-reduce:inline">{t.reduced}</span>
        <button type="button" aria-controls={playerId} onClick={() => setPlaying(!playing)} className="pressable min-h-10 rounded-sm px-2 py-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground motion-reduce:hidden">{playing ? t.pause : t.resume}</button>
      </div>
      <div className="mt-5">
        <Player key={scenario} id={playerId} scene={Scene} scenario={scenario} playing={playing} />
      </div>
      <p className="mt-4 text-[0.8125rem] leading-relaxed text-muted-foreground" aria-live="polite">{topic.notes[scenario]}</p>
    </figure>
  );
}
