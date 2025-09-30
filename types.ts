export interface ExternalResource {
  source: string;
  url: string;
}

export interface HerbalOilInfo {
  lore: string;
  usage: string;
}

export interface ComplementaryEssence {
  name: string;
  purpose: string;
}

export interface HerbInfo {
  name: string;
  scientificName: string;
  magicalProperties: string[];
  elementalAssociation: string;
  planetaryAssociation: string;
  deityAssociation?: string[];
  lore: string;
  usage:string;
  herbalOil?: HerbalOilInfo;
  externalResources?: ExternalResource[];
  complementaryEssences?: ComplementaryEssence[];
}

export interface FavoriteHerb extends HerbInfo {
  image: string;
  category?: string;
}

export interface Spell {
  id: string;
  name: string;
  ingredients: string[]; // Herb names
  instructions: string;
}