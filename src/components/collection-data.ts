export interface TarotCard {
  id?: string;
  name: string;
  numeral?: string;
  image?: string;
  meaning?: string;
}

export const leagues = [
  { id: 'premier', name: 'Ngoại hạng Anh', code: 'EN', color: '#bda0e9' },
  { id: 'laliga', name: 'La Liga', code: 'ES', color: '#ecac8d' },
  { id: 'serie', name: 'Serie A', code: 'IT', color: '#90b9ee' },
  { id: 'bundesliga', name: 'Bundesliga', code: 'DE', color: '#e697a1' },
  { id: 'ligue', name: 'Ligue 1', code: 'FR', color: '#a8cda2' },
  { id: 'other', name: 'Giải khác', code: '+', color: '#d8bd86' },
] as const;

export const clubs = [
  { id: 'manu', name: 'Manchester United', nickname: 'The Red Devils', initials: 'MU', league: 'premier', color: '#e99598' },
  { id: 'arsenal', name: 'Arsenal', nickname: 'The Gunners', initials: 'ARS', league: 'premier', color: '#eea59c' },
  { id: 'liverpool', name: 'Liverpool', nickname: 'You’ll Never Walk Alone', initials: 'LIV', league: 'premier', color: '#eb989d' },
  { id: 'chelsea', name: 'Chelsea', nickname: 'The Blues', initials: 'CHE', league: 'premier', color: '#93b7ec' },
  { id: 'mancity', name: 'Manchester City', nickname: 'The Citizens', initials: 'MCI', league: 'premier', color: '#9bd4ed' },
  { id: 'tottenham', name: 'Tottenham', nickname: 'Spurs', initials: 'TOT', league: 'premier', color: '#b8bfdc' },
  { id: 'newcastle', name: 'Newcastle', nickname: 'The Magpies', initials: 'NEW', league: 'premier', color: '#c1cad0' },
  { id: 'astonvilla', name: 'Aston Villa', nickname: 'The Villans', initials: 'AVL', league: 'premier', color: '#c595b0' },
  { id: 'fulham', name: 'Fulham', nickname: 'The Cottagers', initials: 'FUL', league: 'premier', color: '#c9c6cd' },
  { id: 'everton', name: 'Everton', nickname: 'The Toffees', initials: 'EVE', league: 'premier', color: '#93b7ec' },
  { id: 'southampton', name: 'Southampton', nickname: 'The Saints', initials: 'SOU', league: 'premier', color: '#e99598' },
  { id: 'sunderland', name: 'Sunderland', nickname: 'The Black Cats', initials: 'SUN', league: 'premier', color: '#e6a1a8' },
  { id: 'wolverhampton', name: 'Wolverhampton', nickname: 'Wolves', initials: 'WOL', league: 'premier', color: '#e4b48f' },
  { id: 'brentford', name: 'Brentford', nickname: 'The Bees', initials: 'BRE', league: 'premier', color: '#eea59c' },
  { id: 'qpr', name: 'QPR', nickname: 'The Hoops', initials: 'QPR', league: 'premier', color: '#9bd4ed' },
  { id: 'westham', name: 'West Ham', nickname: 'The Hammers', initials: 'WHU', league: 'premier', color: '#c595b0' },
  { id: 'stokecity', name: 'Stoke City', nickname: 'The Potters', initials: 'STK', league: 'premier', color: '#db9393' },
  { id: 'wands', name: 'Những dấu ấn khác', nickname: 'Beyond the spotlight', initials: '★', league: 'premier', color: '#d8bd86' },
  { id: 'barcelona', name: 'Barcelona', nickname: 'Blaugrana', initials: 'BAR', league: 'laliga', color: '#be9acb' },
  { id: 'realmadrid', name: 'Real Madrid', nickname: 'Los Blancos', initials: 'RMA', league: 'laliga', color: '#e2d3a6' },
  { id: 'atletico', name: 'Atlético Madrid', nickname: 'Los Colchoneros', initials: 'ATM', league: 'laliga', color: '#e6a1a8' },
  { id: 'valencia', name: 'Valencia', nickname: 'Los Che', initials: 'VAL', league: 'laliga', color: '#e4b48f' },
  { id: 'sevilla', name: 'Sevilla', nickname: 'Los Nervionenses', initials: 'SEV', league: 'laliga', color: '#e6a1a8' },
  { id: 'inter', name: 'Inter Milan', nickname: 'Nerazzurri', initials: 'INT', league: 'serie', color: '#8faee5' },
  { id: 'acmilan', name: 'AC Milan', nickname: 'Rossoneri', initials: 'ACM', league: 'serie', color: '#db9393' },
  { id: 'juventus', name: 'Juventus', nickname: 'Bianconeri', initials: 'JUV', league: 'serie', color: '#ccc9d4' },
  { id: 'roma', name: 'AS Roma', nickname: 'I Giallorossi', initials: 'ROM', league: 'serie', color: '#dba28b' },
  { id: 'napoli', name: 'Napoli', nickname: 'Partenopei', initials: 'NAP', league: 'serie', color: '#9bd4ed' },
  { id: 'lazio', name: 'Lazio', nickname: 'I Biancocelesti', initials: 'LAZ', league: 'serie', color: '#a4cedb' },
  { id: 'bayern', name: 'Bayern Munich', nickname: 'Die Roten', initials: 'BAY', league: 'bundesliga', color: '#e1a2ab' },
  { id: 'dortmund', name: 'Borussia Dortmund', nickname: 'Die Borussen', initials: 'BVB', league: 'bundesliga', color: '#e4d28d' },
  { id: 'psg', name: 'Paris Saint-Germain', nickname: 'Les Parisiens', initials: 'PSG', league: 'ligue', color: '#9baed5' },
  { id: 'benfica', name: 'Benfica', nickname: 'As Águias', initials: 'BEN', league: 'other', color: '#e99598' },
] as const;

export type Club = typeof clubs[number];
export type LeagueId = typeof leagues[number]['id'] | 'all';
export type TarotData = Partial<Record<Club['id'], Array<TarotCard | string>>>;
export type CardGroup = { name: string; cards: TarotCard[]; club: Club };

export const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
export const countCards = (groups: CardGroup[]) => groups.reduce((sum, group) => sum + group.cards.length, 0);

export function groupCards(data: TarotData, club: Club): CardGroup[] {
  const grouped = new Map<string, TarotCard[]>();
  for (const card of data[club.id] ?? []) {
    if (typeof card === 'string') continue;
    const name = card.name.split(' (')[0].trim();
    const entries = grouped.get(name) ?? [];
    entries.push(card);
    grouped.set(name, entries);
  }
  return Array.from(grouped, ([name, cards]) => ({ name, cards, club }));
}
