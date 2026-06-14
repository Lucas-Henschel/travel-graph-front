export interface Cidade {
  id: number;
  nome: string;
  latitude: number;
  longitude: number;
}

export interface PontoTuristico {
  id: number;
  nome: string;
  descricao: string;
  categoria: string;
  cidadeId: number;
}

export interface Conexao {
  cidadeOrigemId: number;
  cidadeDestinoId: number;
  distancia: number;
  tempo: number;
}

export interface CidadeRota {
  nome: string;
  latitude: number;
  longitude: number;
  pontosTuristicos: PontoTuristico[];
}

export interface RotaResponse {
  cidades: CidadeRota[];
  distanciaTotal: number;
  tempoTotal: number;
}
