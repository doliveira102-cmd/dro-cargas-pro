// Autocomplete de cidades brasileiras via API pública do IBGE.
// Busca e cacheia a lista de municípios por UF (evita repetir a mesma chamada).

const cache: Record<string, string[]> = {};

export async function getCidadesPorUf(uf: string): Promise<string[]> {
  if (!uf || uf.length !== 2) return [];
  const key = uf.toUpperCase();
  if (cache[key]) return cache[key];

  try {
    const res = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${key}/municipios`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const nomes: string[] = data.map((m: any) => m.nome).sort((a: string, b: string) => a.localeCompare(b, "pt-BR"));
    cache[key] = nomes;
    return nomes;
  } catch {
    return [];
  }
}

export const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
