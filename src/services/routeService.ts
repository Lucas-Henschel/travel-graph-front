import type { ServiceResult } from "@/types/api";
import type { Cidade, RotaResponse } from "@/types/route";
import { cidadesMock, calcularRotaMock } from "@/mocks/routesMock";

export const routeService = {
  async listarCidades(): Promise<ServiceResult<Cidade[]>> {
    // TODO: swap for api.get<Cidade[]>("/cidades") when backend is ready
    return { data: cidadesMock, error: null };
  },

  async calcularRota(
    origemId: number,
    destinoId: number,
    criterio: "distancia" | "tempo",
  ): Promise<ServiceResult<RotaResponse>> {
    // TODO: swap for api.get<RotaResponse>(`/rotas?origem=${origemId}&destino=${destinoId}&criterio=${criterio}`) when backend is ready
    const result = calcularRotaMock(origemId, destinoId, criterio);

    if (!result) {
      return { data: null, error: "Nenhuma rota encontrada entre as cidades selecionadas." };
    }

    return { data: result, error: null };
  },
};
