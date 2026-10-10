// Каталог машин. Каждая машина описывает:
// - геометрию кузова (для процедурной отрисовки спрайта)
// - характеристики, влияющие на физику в гонке

export const CARS = [
  {
    id: 'street',
    name: 'Уличный седан',
    tagline: 'Сбалансированный и прощает ошибки',
    color: 0x2e7dd1,
    accentColor: 0x1b4f8a,
    stats: { speed: 6, accel: 5, handling: 7, grip: 7 },
    // физика
    physics: {
      maxSpeed: 340,
      acceleration: 520,
      turnRate: 2.6,
      friction: 0.92,
      driftGrip: 0.9,
    },
    body: {
      width: 52,
      length: 100,
      cabinRatio: 0.42, // доля длины под кабину
      cabinWidthRatio: 0.78,
      spoiler: false,
      roofStripe: false,
    },
  },
  {
    id: 'sport',
    name: 'Спорткар «Вектра»',
    tagline: 'Быстрый, но нервный',
    color: 0xe03c3c,
    accentColor: 0x8f1d1d,
    stats: { speed: 9, accel: 8, handling: 6, grip: 6 },
    physics: {
      maxSpeed: 430,
      acceleration: 660,
      turnRate: 2.9,
      friction: 0.9,
      driftGrip: 0.82,
    },
    body: {
      width: 48,
      length: 104,
      cabinRatio: 0.36,
      cabinWidthRatio: 0.72,
      spoiler: true,
      roofStripe: true,
    },
  },
  {
    id: 'muscle',
    name: 'Маслкар «Гром»',
    tagline: 'Много момента на задних, берегите резину',
    color: 0xf5a623,
    accentColor: 0x9c5f0a,
    stats: { speed: 8, accel: 9, handling: 4, grip: 5 },
    physics: {
      maxSpeed: 410,
      acceleration: 720,
      turnRate: 2.2,
      friction: 0.9,
      driftGrip: 0.72,
    },
    body: {
      width: 56,
      length: 108,
      cabinRatio: 0.4,
      cabinWidthRatio: 0.74,
      spoiler: false,
      roofStripe: true,
    },
  },
  {
    id: 'rally',
    name: 'Раллийный хэтчбек',
    tagline: 'Цепляется за всё и вся',
    color: 0x37b26b,
    accentColor: 0x1d6b40,
    stats: { speed: 7, accel: 6, handling: 9, grip: 9 },
    physics: {
      maxSpeed: 370,
      acceleration: 580,
      turnRate: 3.2,
      friction: 0.93,
      driftGrip: 0.96,
    },
    body: {
      width: 50,
      length: 92,
      cabinRatio: 0.5,
      cabinWidthRatio: 0.82,
      spoiler: true,
      roofStripe: false,
    },
  },
];

export function getCarById(id) {
  return CARS.find((c) => c.id === id) || CARS[0];
}
