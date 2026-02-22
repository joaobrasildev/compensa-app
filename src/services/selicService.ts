// src/services/selicService.ts
// Busca taxa SELIC via API do Banco Central do Brasil

const TIMEOUT_MS = 10_000;
const SELIC_URL =
    'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json';

type SelicResponse = {
    data: string;
    valor: string;
};

function fetchWithTimeout(url: string, ms: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    return fetch(url, { signal: controller.signal }).finally(() =>
        clearTimeout(timeoutId),
    );
}

export async function fetchSelicRate(): Promise<number> {
    const res = await fetchWithTimeout(SELIC_URL, TIMEOUT_MS);
    const data = (await res.json()) as SelicResponse[];

    if (data.length === 0) {
        throw new Error('SELIC: resposta vazia do BCB');
    }

    const entry = data[0]!;
    const rate = parseFloat(entry.valor);

    if (isNaN(rate)) {
        throw new Error('SELIC: valor inválido');
    }

    return rate;
}
