export interface HerbInfo {
  name: string;
  scientificName: string;
  magicalProperties: string[];
  elementalAssociation: string;
  planetaryAssociation: string;
  deityAssociation: string[];
  lore: string;
  usage: string;
}

export interface FavoriteHerb extends HerbInfo {
  herbImage: string;
}
