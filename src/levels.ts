// Level data for 10 levels
export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'normal' | 'moving' | 'breakable' | 'spike';
  moveRange?: number;
  moveSpeed?: number;
  moveDir?: number;
  origX?: number;
}

export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'laser' | 'drone' | 'virus';
  moveRange?: number;
  moveSpeed?: number;
  moveDir?: number;
}

export interface Collectible {
  x: number;
  y: number;
  type: 'data' | 'shield' | 'boost';
  collected: boolean;
}

export interface Level {
  name: string;
  platforms: Platform[];
  obstacles: Obstacle[];
  collectibles: Collectible[];
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  bg: string;
  targetScore: number;
}

const GROUND_Y = 340;
const WORLD_W = 2000;

export const levels: Level[] = [
  // Level 1 - Tutorial: Simple platforms
  {
    name: "初始化 // INIT",
    platforms: [
      { x: 0, y: GROUND_Y, w: 400, h: 60 },
      { x: 450, y: GROUND_Y, w: 200, h: 60 },
      { x: 700, y: 300, w: 150, h: 20 },
      { x: 900, y: GROUND_Y, w: 300, h: 60 },
      { x: 1250, y: 280, w: 150, h: 20 },
      { x: 1450, y: GROUND_Y, w: 550, h: 60 },
    ],
    obstacles: [],
    collectibles: [
      { x: 500, y: GROUND_Y - 40, type: 'data', collected: false },
      { x: 750, y: 260, type: 'data', collected: false },
      { x: 1000, y: GROUND_Y - 40, type: 'data', collected: false },
      { x: 1300, y: 240, type: 'data', collected: false },
      { x: 1600, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#0a0a2e',
    targetScore: 3,
  },
  // Level 2 - First obstacles
  {
    name: "防火墙 // FIREWALL",
    platforms: [
      { x: 0, y: GROUND_Y, w: 300, h: 60 },
      { x: 350, y: 300, w: 120, h: 20 },
      { x: 520, y: 250, w: 120, h: 20 },
      { x: 700, y: GROUND_Y, w: 200, h: 60 },
      { x: 950, y: 280, w: 150, h: 20 },
      { x: 1150, y: GROUND_Y, w: 200, h: 60 },
      { x: 1400, y: 260, w: 120, h: 20 },
      { x: 1570, y: GROUND_Y, w: 430, h: 60 },
    ],
    obstacles: [
      { x: 400, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 750, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1200, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
    ],
    collectibles: [
      { x: 380, y: 260, type: 'data', collected: false },
      { x: 560, y: 210, type: 'data', collected: false },
      { x: 1000, y: 240, type: 'data', collected: false },
      { x: 1450, y: 220, type: 'data', collected: false },
      { x: 1700, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#0a1a2e',
    targetScore: 3,
  },
  // Level 3 - Moving platforms
  {
    name: "数据流 // DATA_STREAM",
    platforms: [
      { x: 0, y: GROUND_Y, w: 250, h: 60 },
      { x: 350, y: 280, w: 120, h: 20, type: 'moving', moveRange: 80, moveSpeed: 1.5, moveDir: 1 },
      { x: 600, y: GROUND_Y, w: 200, h: 60 },
      { x: 850, y: 260, w: 120, h: 20, type: 'moving', moveRange: 100, moveSpeed: 2, moveDir: 1 },
      { x: 1100, y: GROUND_Y, w: 200, h: 60 },
      { x: 1350, y: 280, w: 120, h: 20, type: 'moving', moveRange: 60, moveSpeed: 1.8, moveDir: 1 },
      { x: 1550, y: GROUND_Y, w: 450, h: 60 },
    ],
    obstacles: [
      { x: 650, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1150, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
    ],
    collectibles: [
      { x: 380, y: 240, type: 'data', collected: false },
      { x: 650, y: GROUND_Y - 40, type: 'data', collected: false },
      { x: 900, y: 220, type: 'data', collected: false },
      { x: 1150, y: GROUND_Y - 40, type: 'data', collected: false },
      { x: 1700, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#0a0a3e',
    targetScore: 3,
  },
  // Level 4 - Drones
  {
    name: "病毒入侵 // VIRUS",
    platforms: [
      { x: 0, y: GROUND_Y, w: 300, h: 60 },
      { x: 350, y: 300, w: 150, h: 20 },
      { x: 550, y: 240, w: 150, h: 20 },
      { x: 750, y: GROUND_Y, w: 200, h: 60 },
      { x: 1000, y: 280, w: 150, h: 20 },
      { x: 1200, y: 220, w: 150, h: 20 },
      { x: 1400, y: GROUND_Y, w: 200, h: 60 },
      { x: 1650, y: GROUND_Y, w: 350, h: 60 },
    ],
    obstacles: [
      { x: 400, y: 200, w: 25, h: 25, type: 'drone', moveRange: 100, moveSpeed: 1.5, moveDir: 1 },
      { x: 800, y: 180, w: 25, h: 25, type: 'drone', moveRange: 120, moveSpeed: 2, moveDir: 1 },
      { x: 1250, y: 150, w: 25, h: 25, type: 'drone', moveRange: 80, moveSpeed: 1.8, moveDir: 1 },
    ],
    collectibles: [
      { x: 400, y: 260, type: 'data', collected: false },
      { x: 600, y: 200, type: 'data', collected: false },
      { x: 1050, y: 240, type: 'data', collected: false },
      { x: 1250, y: 180, type: 'data', collected: false },
      { x: 1500, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#1a0a2e',
    targetScore: 3,
  },
  // Level 5 - Breakable platforms
  {
    name: "碎片化 // FRAGMENT",
    platforms: [
      { x: 0, y: GROUND_Y, w: 250, h: 60 },
      { x: 300, y: 300, w: 100, h: 20, type: 'breakable' },
      { x: 450, y: 260, w: 100, h: 20, type: 'breakable' },
      { x: 600, y: 220, w: 100, h: 20 },
      { x: 780, y: GROUND_Y, w: 150, h: 60 },
      { x: 980, y: 280, w: 100, h: 20, type: 'breakable' },
      { x: 1130, y: 240, w: 100, h: 20, type: 'breakable' },
      { x: 1280, y: GROUND_Y, w: 200, h: 60 },
      { x: 1530, y: 260, w: 100, h: 20, type: 'breakable' },
      { x: 1680, y: GROUND_Y, w: 320, h: 60 },
    ],
    obstacles: [
      { x: 820, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1320, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1100, y: 180, w: 25, h: 25, type: 'drone', moveRange: 80, moveSpeed: 1.5, moveDir: 1 },
    ],
    collectibles: [
      { x: 330, y: 260, type: 'data', collected: false },
      { x: 480, y: 220, type: 'data', collected: false },
      { x: 650, y: 180, type: 'data', collected: false },
      { x: 1020, y: 240, type: 'data', collected: false },
      { x: 1750, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#1a0a3e',
    targetScore: 3,
  },
  // Level 6 - Lasers
  {
    name: "激光矩阵 // LASER",
    platforms: [
      { x: 0, y: GROUND_Y, w: 250, h: 60 },
      { x: 300, y: GROUND_Y, w: 150, h: 60 },
      { x: 500, y: 280, w: 120, h: 20 },
      { x: 700, y: GROUND_Y, w: 200, h: 60 },
      { x: 950, y: 260, w: 120, h: 20 },
      { x: 1120, y: GROUND_Y, w: 200, h: 60 },
      { x: 1370, y: 280, w: 120, h: 20 },
      { x: 1540, y: GROUND_Y, w: 460, h: 60 },
    ],
    obstacles: [
      { x: 450, y: 200, w: 10, h: 140, type: 'laser', moveRange: 0, moveSpeed: 0, moveDir: 0 },
      { x: 900, y: 180, w: 10, h: 160, type: 'laser', moveRange: 0, moveSpeed: 0, moveDir: 0 },
      { x: 1320, y: 200, w: 10, h: 140, type: 'laser', moveRange: 0, moveSpeed: 0, moveDir: 0 },
      { x: 750, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
    ],
    collectibles: [
      { x: 350, y: GROUND_Y - 40, type: 'data', collected: false },
      { x: 550, y: 240, type: 'data', collected: false },
      { x: 1000, y: 220, type: 'data', collected: false },
      { x: 1420, y: 240, type: 'data', collected: false },
      { x: 1700, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#2a0a1e',
    targetScore: 3,
  },
  // Level 7 - Complex mix
  {
    name: "深层网络 // DEEP_NET",
    platforms: [
      { x: 0, y: GROUND_Y, w: 200, h: 60 },
      { x: 250, y: 300, w: 100, h: 20, type: 'moving', moveRange: 60, moveSpeed: 1.5, moveDir: 1 },
      { x: 420, y: 250, w: 100, h: 20, type: 'breakable' },
      { x: 580, y: GROUND_Y, w: 150, h: 60 },
      { x: 780, y: 280, w: 100, h: 20, type: 'moving', moveRange: 80, moveSpeed: 2, moveDir: 1 },
      { x: 950, y: 230, w: 100, h: 20, type: 'breakable' },
      { x: 1100, y: GROUND_Y, w: 150, h: 60 },
      { x: 1300, y: 270, w: 100, h: 20, type: 'moving', moveRange: 70, moveSpeed: 1.8, moveDir: 1 },
      { x: 1470, y: 220, w: 100, h: 20, type: 'breakable' },
      { x: 1620, y: GROUND_Y, w: 380, h: 60 },
    ],
    obstacles: [
      { x: 620, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 500, y: 170, w: 25, h: 25, type: 'drone', moveRange: 100, moveSpeed: 2, moveDir: 1 },
      { x: 1150, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1400, y: 160, w: 25, h: 25, type: 'drone', moveRange: 90, moveSpeed: 2.2, moveDir: 1 },
    ],
    collectibles: [
      { x: 280, y: 260, type: 'data', collected: false },
      { x: 450, y: 210, type: 'data', collected: false },
      { x: 820, y: 240, type: 'data', collected: false },
      { x: 1000, y: 190, type: 'data', collected: false },
      { x: 1750, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#1a0020',
    targetScore: 3,
  },
  // Level 8 - Speed challenge
  {
    name: "超频 // OVERCLOCK",
    platforms: [
      { x: 0, y: GROUND_Y, w: 180, h: 60 },
      { x: 230, y: 310, w: 80, h: 20 },
      { x: 360, y: 270, w: 80, h: 20, type: 'moving', moveRange: 50, moveSpeed: 2.5, moveDir: 1 },
      { x: 500, y: 230, w: 80, h: 20, type: 'breakable' },
      { x: 640, y: 280, w: 80, h: 20 },
      { x: 780, y: GROUND_Y, w: 120, h: 60 },
      { x: 950, y: 260, w: 80, h: 20, type: 'moving', moveRange: 60, moveSpeed: 2.8, moveDir: 1 },
      { x: 1100, y: 220, w: 80, h: 20, type: 'breakable' },
      { x: 1240, y: 270, w: 80, h: 20 },
      { x: 1380, y: GROUND_Y, w: 120, h: 60 },
      { x: 1550, y: 250, w: 80, h: 20, type: 'moving', moveRange: 70, moveSpeed: 3, moveDir: 1 },
      { x: 1700, y: GROUND_Y, w: 300, h: 60 },
    ],
    obstacles: [
      { x: 810, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1410, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 600, y: 160, w: 25, h: 25, type: 'drone', moveRange: 120, moveSpeed: 2.5, moveDir: 1 },
      { x: 1200, y: 150, w: 25, h: 25, type: 'drone', moveRange: 100, moveSpeed: 2.8, moveDir: 1 },
      { x: 1650, y: 180, w: 10, h: 120, type: 'laser', moveRange: 0, moveSpeed: 0, moveDir: 0 },
    ],
    collectibles: [
      { x: 260, y: 270, type: 'data', collected: false },
      { x: 530, y: 190, type: 'data', collected: false },
      { x: 990, y: 220, type: 'data', collected: false },
      { x: 1280, y: 230, type: 'data', collected: false },
      { x: 1800, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#200020',
    targetScore: 3,
  },
  // Level 9 - Near impossible
  {
    name: "核心突破 // CORE",
    platforms: [
      { x: 0, y: GROUND_Y, w: 150, h: 60 },
      { x: 200, y: 300, w: 80, h: 20, type: 'moving', moveRange: 50, moveSpeed: 2, moveDir: 1 },
      { x: 340, y: 260, w: 70, h: 20, type: 'breakable' },
      { x: 470, y: 220, w: 70, h: 20, type: 'moving', moveRange: 60, moveSpeed: 2.5, moveDir: 1 },
      { x: 600, y: 280, w: 80, h: 20 },
      { x: 740, y: GROUND_Y, w: 100, h: 60 },
      { x: 890, y: 250, w: 70, h: 20, type: 'breakable' },
      { x: 1020, y: 210, w: 70, h: 20, type: 'moving', moveRange: 70, moveSpeed: 3, moveDir: 1 },
      { x: 1160, y: 270, w: 70, h: 20, type: 'breakable' },
      { x: 1290, y: GROUND_Y, w: 100, h: 60 },
      { x: 1440, y: 240, w: 70, h: 20, type: 'moving', moveRange: 60, moveSpeed: 2.8, moveDir: 1 },
      { x: 1570, y: 200, w: 70, h: 20, type: 'breakable' },
      { x: 1700, y: GROUND_Y, w: 300, h: 60 },
    ],
    obstacles: [
      { x: 770, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1320, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 400, y: 150, w: 25, h: 25, type: 'drone', moveRange: 100, moveSpeed: 2.5, moveDir: 1 },
      { x: 850, y: 170, w: 25, h: 25, type: 'drone', moveRange: 120, moveSpeed: 3, moveDir: 1 },
      { x: 1350, y: 160, w: 10, h: 120, type: 'laser', moveRange: 0, moveSpeed: 0, moveDir: 0 },
      { x: 1600, y: 140, w: 25, h: 25, type: 'drone', moveRange: 80, moveSpeed: 3.2, moveDir: 1 },
    ],
    collectibles: [
      { x: 230, y: 260, type: 'data', collected: false },
      { x: 500, y: 180, type: 'data', collected: false },
      { x: 920, y: 210, type: 'data', collected: false },
      { x: 1200, y: 230, type: 'data', collected: false },
      { x: 1800, y: GROUND_Y - 40, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#200010',
    targetScore: 3,
  },
  // Level 10 - Final boss level
  {
    name: "终极解码 // FINAL_DECODE",
    platforms: [
      { x: 0, y: GROUND_Y, w: 150, h: 60 },
      { x: 200, y: 310, w: 70, h: 20, type: 'moving', moveRange: 40, moveSpeed: 2.5, moveDir: 1 },
      { x: 330, y: 270, w: 60, h: 20, type: 'breakable' },
      { x: 450, y: 230, w: 60, h: 20, type: 'moving', moveRange: 50, moveSpeed: 3, moveDir: 1 },
      { x: 570, y: 280, w: 70, h: 20 },
      { x: 700, y: 240, w: 60, h: 20, type: 'breakable' },
      { x: 820, y: GROUND_Y, w: 100, h: 60 },
      { x: 970, y: 260, w: 60, h: 20, type: 'moving', moveRange: 60, moveSpeed: 3, moveDir: 1 },
      { x: 1100, y: 220, w: 60, h: 20, type: 'breakable' },
      { x: 1220, y: 270, w: 70, h: 20 },
      { x: 1350, y: GROUND_Y, w: 100, h: 60 },
      { x: 1500, y: 250, w: 60, h: 20, type: 'moving', moveRange: 50, moveSpeed: 3.5, moveDir: 1 },
      { x: 1620, y: 210, w: 60, h: 20, type: 'breakable' },
      { x: 1740, y: GROUND_Y, w: 260, h: 60 },
    ],
    obstacles: [
      { x: 850, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 1380, y: GROUND_Y - 30, w: 30, h: 30, type: 'spike' },
      { x: 300, y: 160, w: 25, h: 25, type: 'drone', moveRange: 100, moveSpeed: 3, moveDir: 1 },
      { x: 650, y: 150, w: 25, h: 25, type: 'drone', moveRange: 120, moveSpeed: 3.5, moveDir: 1 },
      { x: 1050, y: 160, w: 25, h: 25, type: 'drone', moveRange: 90, moveSpeed: 3.2, moveDir: 1 },
      { x: 500, y: 150, w: 10, h: 130, type: 'laser', moveRange: 0, moveSpeed: 0, moveDir: 0 },
      { x: 1150, y: 140, w: 10, h: 130, type: 'laser', moveRange: 0, moveSpeed: 0, moveDir: 0 },
      { x: 1550, y: 150, w: 25, h: 25, type: 'drone', moveRange: 100, moveSpeed: 3.5, moveDir: 1 },
    ],
    collectibles: [
      { x: 230, y: 270, type: 'data', collected: false },
      { x: 480, y: 190, type: 'data', collected: false },
      { x: 730, y: 200, type: 'data', collected: false },
      { x: 1000, y: 220, type: 'data', collected: false },
      { x: 1250, y: 230, type: 'data', collected: false },
    ],
    startX: 50,
    startY: GROUND_Y - 50,
    endX: 1900,
    endY: GROUND_Y - 60,
    bg: '#100020',
    targetScore: 3,
  },
];
