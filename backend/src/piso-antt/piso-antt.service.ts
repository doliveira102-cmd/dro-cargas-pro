import { Injectable } from '@nestjs/common';
import {
  COEFICIENTES_BASE,
  ALIQUOTAS_RTC,
  CONFIGS_VEICULO,
  TIPOS_CARGA,
  UFS,
} from './piso-antt.data';

export interface CalcularPisoInput {
  origemUf: string;
  destinoUf: string;
  operacao: 'NACIONAL' | 'EXPORTAÇÃO';
  distanciaKm: number;
  tipoCarga: string;
  margemPercent?: number; // padrão 10, igual à planilha (célula H9:H15)
  // pedágio por configuração de veículo — chave é o "label" da config (ex: "3 Eixos").
  // Se omitido, assume 0 (campo em branco na planilha = usuário preenche).
  pedagios?: Record<string, number>;
}

export interface LinhaResultado {
  config: string;
  eixos: number;
  peso: number;
  pisoMinimoAntt: number | null; // B: fórmula SUMIFS de Base_Aliquotas
  freteMotoristaSemPedagio: number | null; // D: B/C
  pedagio: number; // E: input do usuário
  freteMotoristaComPedagio: number | null; // F: (B+E)/C
  icmsIssPercent: number; // G: SUMIFS de Parametros (RTC)
  margemPercent: number; // H: input do usuário, padrão 10
  freteEmpresaTotal: number | null; // I: (B+E)/(100-G-H)*100
  freteEmpresaTon: number | null; // J: I/C
}

@Injectable()
export class PisoAnttService {
  listarOpcoes() {
    return { tiposCarga: TIPOS_CARGA, ufs: UFS, configsVeiculo: CONFIGS_VEICULO.map((c) => c.label) };
  }

  private buscarCoeficiente(tipoCarga: string, eixos: number) {
    return COEFICIENTES_BASE.find((c) => c.tipo === tipoCarga && c.eixos === eixos) || null;
  }

  private buscarAliquotaIcms(operacao: string, origem: string, destino: string): number {
    if (!operacao || !origem || !destino) return 0;
    const encontrada = ALIQUOTAS_RTC.find(
      (r) => r.operacao === operacao && r.origem === origem && r.destino === destino,
    );
    return encontrada ? encontrada.aliquota : 0;
  }

  calcular(input: CalcularPisoInput): LinhaResultado[] {
    const margemPadrao = input.margemPercent ?? 10;
    const icms = this.buscarAliquotaIcms(input.operacao, input.origemUf, input.destinoUf);

    return CONFIGS_VEICULO.map((config) => {
      const coef = this.buscarCoeficiente(input.tipoCarga, config.eixos);
      // Réplica exata de: =$B$5*SUMIFS(CCD,...)+SUMIFS(CC,...) — "—" (null) se não houver combinação
      const pisoMinimo = coef ? input.distanciaKm * coef.ccd + coef.cc : null;

      const peso = config.pesoPadrao;
      const pedagio = input.pedagios?.[config.label] ?? 0;
      const margem = margemPadrao;

      const freteMotoristaSemPedagio = pisoMinimo !== null ? pisoMinimo / peso : null;
      const freteMotoristaComPedagio = pisoMinimo !== null ? (pisoMinimo + pedagio) / peso : null;

      const denominador = 100 - icms - margem;
      const freteEmpresaTotal =
        pisoMinimo !== null && denominador !== 0
          ? ((pisoMinimo + pedagio) / denominador) * 100
          : null;
      const freteEmpresaTon = freteEmpresaTotal !== null ? freteEmpresaTotal / peso : null;

      return {
        config: config.label,
        eixos: config.eixos,
        peso,
        pisoMinimoAntt: pisoMinimo,
        freteMotoristaSemPedagio,
        pedagio,
        freteMotoristaComPedagio,
        icmsIssPercent: icms,
        margemPercent: margem,
        freteEmpresaTotal,
        freteEmpresaTon,
      };
    });
  }
}
