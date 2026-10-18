import { Foundation, Migration, Pipeline, Pitfalls } from './authsales';
import { FinanceHow, FinanceResult, FinanceTraps, Sync } from './finance';
import { Checklist, InvoiceHow, InvoiceResult, InvoiceTraps } from './invoice';
import { PickingHow, PickingResult, PickingTraps, Scanner } from './picking';
import { Fleet, RpaHow, RpaResult, RpaTraps } from './rpa';
import { Lifecycle, SerialHow, SerialResult, SerialTraps } from './serial';
import { WorkshopHow, WorkshopResult, Workshops, WorkshopTraps } from './workshops';

type Visual = () => React.ReactElement;
export type Visuals = { hero: Visual; problem: Visual; how: Visual; result: Visual };

// A case's visual story: the hero (also on its home card), the problem, how it works and the outcome.
export const visuals: Record<string, Visuals> = {
  authsales: { hero: Foundation, problem: Pitfalls, how: Pipeline, result: Migration },
  'separacao-pedidos': { hero: Scanner, problem: PickingTraps, how: PickingHow, result: PickingResult },
  'rastreio-equipamentos': { hero: Lifecycle, problem: SerialTraps, how: SerialHow, result: SerialResult },
  'orquestracao-rpa': { hero: Fleet, problem: RpaTraps, how: RpaHow, result: RpaResult },
  'checklist-notas-fiscais': { hero: Checklist, problem: InvoiceTraps, how: InvoiceHow, result: InvoiceResult },
  'gestao-oficinas': { hero: Workshops, problem: WorkshopTraps, how: WorkshopHow, result: WorkshopResult },
  'financeiro-erp': { hero: Sync, problem: FinanceTraps, how: FinanceHow, result: FinanceResult }
};
