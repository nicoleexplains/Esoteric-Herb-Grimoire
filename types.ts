export interface HerbalOilInfo {
  lore: string;
  usage: string;
}

export interface HerbInfo {
  name: string;
  scientificName: string;
  magicalProperties: string[];
  elementalAssociation: string;
  planetaryAssociation: string;
  deityAssociation?: string[];
  lore: string;
  usage: string;
  herbalOil?: HerbalOilInfo;
}

export interface FavoriteHerb extends HerbInfo {
  image: string;
  category?: string;
}
