import type {
  Cidade,
  Conexao,
  PontoTuristico,
  RotaResponse,
  CidadeRota,
} from "@/types/route";

export const cidadesMock: Cidade[] = [
  { id: 1, nome: "Florianópolis", latitude: -27.5954, longitude: -48.548 },
  { id: 2, nome: "Curitiba", latitude: -25.4284, longitude: -49.2733 },
  { id: 3, nome: "São Paulo", latitude: -23.5505, longitude: -46.6333 },
  { id: 4, nome: "Rio de Janeiro", latitude: -22.9068, longitude: -43.1729 },
  { id: 5, nome: "Brasília", latitude: -15.7975, longitude: -47.8919 },
  { id: 6, nome: "Belo Horizonte", latitude: -19.9167, longitude: -43.9345 },
];

export const conexoesMock: Conexao[] = [
  { cidadeOrigemId: 1, cidadeDestinoId: 2, distancia: 300, tempo: 4.5 },
  { cidadeOrigemId: 2, cidadeDestinoId: 3, distancia: 408, tempo: 5.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 4, distancia: 429, tempo: 5.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 6, distancia: 586, tempo: 7 },
  { cidadeOrigemId: 4, cidadeDestinoId: 6, distancia: 434, tempo: 5.5 },
  { cidadeOrigemId: 6, cidadeDestinoId: 5, distancia: 716, tempo: 8.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 5, distancia: 1015, tempo: 12 },
  { cidadeOrigemId: 2, cidadeDestinoId: 1, distancia: 300, tempo: 4.5 },
  { cidadeOrigemId: 3, cidadeDestinoId: 2, distancia: 408, tempo: 5.5 },
  { cidadeOrigemId: 4, cidadeDestinoId: 3, distancia: 429, tempo: 5.5 },
  { cidadeOrigemId: 6, cidadeDestinoId: 3, distancia: 586, tempo: 7 },
  { cidadeOrigemId: 6, cidadeDestinoId: 4, distancia: 434, tempo: 5.5 },
  { cidadeOrigemId: 5, cidadeDestinoId: 6, distancia: 716, tempo: 8.5 },
  { cidadeOrigemId: 5, cidadeDestinoId: 3, distancia: 1015, tempo: 12 },
];

export const pontosTuristicosMock: PontoTuristico[] = [
  { id: 1, nome: "Ponte Hercílio Luz", descricao: "Cartão postal de Florianópolis, ponte pênsil histórica.", categoria: "Histórico", cidadeId: 1 },
  { id: 2, nome: "Praia da Joaquina", descricao: "Famosa praia com dunas e surf.", categoria: "Praia", cidadeId: 1 },
  { id: 3, nome: "Jardim Botânico", descricao: "Jardim botânico com estufa de vidro art nouveau.", categoria: "Natureza", cidadeId: 2 },
  { id: 4, nome: "Museu Oscar Niemeyer", descricao: "Museu de arte com arquitetura icônica em formato de olho.", categoria: "Museu", cidadeId: 2 },
  { id: 5, nome: "Avenida Paulista", descricao: "Principal avenida cultural e financeira de São Paulo.", categoria: "Urbano", cidadeId: 3 },
  { id: 6, nome: "Parque Ibirapuera", descricao: "Maior parque urbano de São Paulo.", categoria: "Natureza", cidadeId: 3 },
  { id: 7, nome: "MASP", descricao: "Museu de Arte de São Paulo, acervo europeu importante.", categoria: "Museu", cidadeId: 3 },
  { id: 8, nome: "Cristo Redentor", descricao: "Estátua icônica no topo do Corcovado.", categoria: "Histórico", cidadeId: 4 },
  { id: 9, nome: "Pão de Açúcar", descricao: "Complexo de morros com bondinho e vista panorâmica.", categoria: "Natureza", cidadeId: 4 },
  { id: 10, nome: "Catedral de Brasília", descricao: "Catedral com arquitetura modernista de Niemeyer.", categoria: "Histórico", cidadeId: 5 },
  { id: 11, nome: "Congresso Nacional", descricao: "Sede do poder legislativo com torres gêmeas.", categoria: "Histórico", cidadeId: 5 },
  { id: 12, nome: "Praça da Liberdade", descricao: "Conjunto arquitetônico com museus e jardins.", categoria: "Urbano", cidadeId: 6 },
  { id: 13, nome: "Mercado Central", descricao: "Mercado tradicional com comida mineira e artesanato.", categoria: "Urbano", cidadeId: 6 },
];

type Criterio = "distancia" | "tempo";

export function calcularRotaMock(
  origemId: number,
  destinoId: number,
  criterio: Criterio,
): RotaResponse | null {
  const cidadeMap = new Map(cidadesMock.map((c) => [c.id, c]));

  if (!cidadeMap.has(origemId) || !cidadeMap.has(destinoId)) return null;
  if (origemId === destinoId) return null;

  const adj = new Map<number, { vizinho: number; peso: number }[]>();
  const distanciaMap = new Map<string, { distancia: number; tempo: number }>();

  for (const c of cidadesMock) {
    adj.set(c.id, []);
  }

  for (const con of conexoesMock) {
    const peso = criterio === "distancia" ? con.distancia : con.tempo;
    adj.get(con.cidadeOrigemId)!.push({ vizinho: con.cidadeDestinoId, peso });

    const key = [Math.min(con.cidadeOrigemId, con.cidadeDestinoId), Math.max(con.cidadeOrigemId, con.cidadeDestinoId)].join("-");
    if (!distanciaMap.has(key)) {
      distanciaMap.set(key, { distancia: con.distancia, tempo: con.tempo });
    }
  }

  const dist = new Map<number, number>();
  const prev = new Map<number, number | null>();
  const visited = new Set<number>();

  for (const c of cidadesMock) {
    dist.set(c.id, Infinity);
    prev.set(c.id, null);
  }
  dist.set(origemId, 0);

  while (true) {
    let u: number | null = null;
    let minDist = Infinity;

    for (const [id, d] of dist) {
      if (!visited.has(id) && d < minDist) {
        minDist = d;
        u = id;
      }
    }

    if (u === null || u === destinoId) break;
    visited.add(u);

    for (const { vizinho, peso } of adj.get(u)!) {
      if (visited.has(vizinho)) continue;
      const alt = dist.get(u)! + peso;
      if (alt < dist.get(vizinho)!) {
        dist.set(vizinho, alt);
        prev.set(vizinho, u);
      }
    }
  }

  if (dist.get(destinoId) === Infinity) return null;

  const path: number[] = [];
  let current: number | null = destinoId;
  while (current !== null) {
    path.unshift(current);
    current = prev.get(current)!;
  }

  let distanciaTotal = 0;
  let tempoTotal = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const key = [Math.min(path[i], path[i + 1]), Math.max(path[i], path[i + 1])].join("-");
    const edge = distanciaMap.get(key)!;
    distanciaTotal += edge.distancia;
    tempoTotal += edge.tempo;
  }

  const cidades: CidadeRota[] = path.map((id) => {
    const cidade = cidadeMap.get(id)!;
    return {
      nome: cidade.nome,
      latitude: cidade.latitude,
      longitude: cidade.longitude,
      pontosTuristicos: pontosTuristicosMock.filter((p) => p.cidadeId === id),
    };
  });

  return { cidades, distanciaTotal, tempoTotal };
}
