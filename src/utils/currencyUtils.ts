export const formatCentsAsCurrency = (centsAmount: number) =>
    (centsAmount / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

    export const getRawCents = (formatted: string) => Number(formatted.replace(/\D/g, ''));