export const formatDatetime = (date: Date) => date.toLocaleString('pt-BR');

export const formatDate = (date: Date) => date.toLocaleString('pt-BR').split(' ')[0];
