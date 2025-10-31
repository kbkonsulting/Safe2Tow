export enum TowingSafetyLevel {
  SAFE = 'SAFE',
  CAUTION = 'CAUTION',
  DOLLY_REQUIRED = 'DOLLY_REQUIRED',
}

export enum TowingMethodSafetyLevel {
  SAFE = 'SAFE',
  SAFE_WITH_CAUTION = 'SAFE_WITH_CAUTION',
  UNSAFE = 'UNSAFE',
}

export interface TowingMethod {
  safetyLevel: TowingMethodSafetyLevel;
  instructions: string;
}

export interface AWDVariantInfo {
  summary: string;
  frontTowing: TowingMethod;
  rearTowing: TowingMethod;
  cautions: string[];
  awdSystemType: string;
  isAwdMechanicallyEngagedWhenOff: boolean;
  steeringLocksWhenOff: boolean;
}

export interface TowingInfo {
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim: string;
  };
  drivetrain: string;
  awdSystemType: string;
  isAwdMechanicallyEngagedWhenOff: boolean;
  steeringLocksWhenOff: boolean;
  towingSafetyLevel: TowingSafetyLevel;
  summary: string;
  frontTowing: TowingMethod;
  rearTowing: TowingMethod;
  cautions: string[];
  awdVariantInfo?: AWDVariantInfo;
}