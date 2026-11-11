export const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Error al consultar endpoint: ' + url);
    throw error;
  }
  return res.json();
};
