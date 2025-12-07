export const formatDate = (dateIso: string) => {
  const date = new Date(dateIso);
  return date.toLocaleString("pt-BR");
}