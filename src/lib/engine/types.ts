export type VehicleType = "6-wheel" | "10-wheel" | "trailer";

export type Confidence = "routed" | "estimated" | "must-verify" | "unverified";

export type RiskLevel = "normal" | "watch" | "act" | "insufficient" | "infeasible";

export type GapStatus = "set" | "default" | "missing" | "demo-only";

export type PlaceKind = "origin" | "waypoint" | "destination" | "rest" | "current";

export type Place = {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  kind?: PlaceKind;
  clientSite?: boolean;
};

export type RestStop = Place & {
  highway?: string;
  truckOk: boolean;
  facilities: string[];
  verification: Confidence;
  note?: string;
};

export type Policy = {
  maxContinuousMin: number;
  restMin: number;
  bufferMin: number;
  serviceMin: number;
  restResetsDriving: boolean;
  vehicleType: VehicleType;
  mapSource: "osm-osrm" | "manual";
  trafficSource: "none" | "driver-report";
  avgHighwayKmh: number;
};

export type GapItem = {
  id: string;
  topic: string;
  field: string;
  status: GapStatus;
  current: string;
  needed: string;
  owner: string;
  risk: string;
};

export type RouteLeg = {
  fromId: string;
  toId: string;
  distanceKm: number;
  durationMin: number;
  geometry: [number, number][];
  source: Confidence;
};

export type PlanStopType =
  | "depart"
  | "drive"
  | "waypoint"
  | "rest"
  | "arrive"
  | "delay";

export type PlanStop = {
  seq: number;
  type: PlanStopType;
  title: string;
  place: Place;
  start: string;
  end: string;
  distanceKm: number;
  driveMin: number;
  restMin: number;
  serviceMin: number;
  delayMin: number;
  continuousAfterMin: number;
  remainingBeforeRestMin: number;
  note: string;
  confidence: Confidence;
  onRoute: boolean;
};

export type PlanResult = {
  stops: PlanStop[];
  totalDistanceKm: number;
  totalDriveMin: number;
  totalRestMin: number;
  totalServiceMin: number;
  totalDelayMin: number;
  eta: string;
  risk: RiskLevel;
  riskNote: string;
  restCount: number;
  unverifiedRestCount: number;
  source: Confidence;
};

export type TripEventType =
  | "planned"
  | "depart"
  | "progress"
  | "traffic"
  | "arrive-stop"
  | "rest-start"
  | "rest-done"
  | "arrive"
  | "replan";

export type TripEvent = {
  id: string;
  type: TripEventType;
  at: string;
  label: string;
  extraMin?: number;
};

export type TripStatus = "planned" | "enroute" | "resting" | "completed";

export type Trip = {
  id: string;
  code: string;
  title: string;
  client: "SCGJWD";
  createdAt: string;
  origin: Place;
  waypoints: Place[];
  destination: Place;
  startTime: string;
  status: TripStatus;
  vehicleType: VehicleType;
  plan: PlanResult;
  events: TripEvent[];
  continuousMin: number;
  clock: string;
  currentStopSeq: number;
  delayMin: number;
  policySnapshot: Policy;
  /** เส้นทางจริงแยกช่วง (จาก OSRM) ใช้ฉายตำแหน่ง GPS */
  legs?: RouteLeg[];
  /** เวลาที่เริ่มขับรอบล่าสุด (null = ไม่ได้อยู่ระหว่างขับ) */
  enrouteSince?: string | null;
  /** เวลาที่เริ่มพักรอบล่าสุด (null = ไม่ได้อยู่ระหว่างพัก) */
  restStartedAt?: string | null;
};
