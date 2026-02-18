
export enum CropType {
  WHEAT = 'Blé',
  BARLEY = 'Orge',
  CANOLA = 'Colza',
  OAT = 'Avoine',
  CORN = 'Maïs',
  SUNFLOWER = 'Tournesol',
  SOYBEAN = 'Soja',
  POTATO = 'Pomme de terre',
  SUGARBEET = 'Betteraves sucrières',
  GRASS = 'Herbes',
  COTTON = 'Coton',
  GRAPE = 'Raisin',
  OLIVE = 'Olive',
  SORGHUM = 'Sorgho'
}

export enum FieldStatus {
  PLOWING = 'Labour',
  CULTIVATING = 'Culture',
  SOWING = 'Semis',
  GROWING = 'Croissance',
  HARVESTING = 'Récolte',
  FALLOW = 'Jachère'
}

export enum AnimalType {
  COWS = 'Moutons',
  PIGS = 'Cochons',
  SHEEP = 'Brebis',
  CHICKENS = 'Poules',
  HORSES = 'Chevaux',
  BEES = 'Abeilles'
}

export interface Field {
  id: string;
  number: number;
  size: number; // in hectares
  crop: CropType;
  status: FieldStatus;
  fertilizer: number; // 0, 50, 100
  needsLime: boolean;
  needsPlowing: boolean;
  isWaiting: boolean; // Attente
  needsSlurry: boolean; // Lisier
  needsMulching: boolean; // Broyer
  needsSowing: boolean; // Semis
  needsStoneRemoval: boolean; // Pierres
  needsHarvest: boolean; // Récolter
  yieldPotential: number; // percentage
  nextCrop?: CropType; // Culture suivante
  sownIn?: number; // Month index 0-11
  currentTool?: string; // Outil en cours
  lastCompletedTool?: string; // Dernier outil terminé
}

export interface AnimalPen {
  id: string;
  type: AnimalType;
  name?: string; // Nom personnalisé (ex: Moutons 2)
  count: number;
  health: number; // 0-100
  foodLevel: number; // 0-100
  waterLevel: number; // 0-100
  productivity: number; // 0-100
  lastFed: string; // ISO date
  cowDetails?: {
      silageProtein: number;
      hay: number;
      hydration: number;
      concentrate: number;
  };
  pigDetails?: {
      foodConcentrate: number; // Concentrés alimentaires
      foodProtein: number;     // Aliments proteinés
      foodEnergy: number;      // Aliments énergétique
      foodHydration: number;   // Aliments hydratant
  };
  chickenDetails?: {
      protein: number; // Aliments protéinés 35%
      energy: number;  // Aliments énergétique 10%
      base: number;    // Aliments de base 35%
      hydration: number; // Aliments hydratant 20%
  };
}

export interface Shortcut {
  action: string;
  keyboard: string;
  mouse?: string;
  gamepad?: string;
}

export interface GameState {
  money: number;
  month: number; // 1-12
  year: number;
  fields: Field[];
  animals: AnimalPen[];
  toolAssignments?: Record<string, CropType[]>;
  shortcuts?: Record<string, Shortcut[]>;
}
