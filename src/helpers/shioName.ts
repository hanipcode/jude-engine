enum Shio {
  Dog = 'dog',
  Dragon = 'dragon',
  Goat = 'goat',
  Horse = 'horse',
  Monkey = 'monkey',
  Ox = 'ox',
  Pig = 'pig',
  Rabbit = 'rabbit',
  Rat = 'rat',
  Rooster = 'rooster',
  Snake = 'snake',
  Tiger = 'tiger',
}

const ShioDictionary = {
  1: Shio.Dog,
  2: Shio.Dragon,
  3: Shio.Goat,
  4: Shio.Horse,
  5: Shio.Monkey,
  6: Shio.Ox,
  7: Shio.Pig,
  8: Shio.Rabbit,
  9: Shio.Rat,
  10: Shio.Rooster,
  11: Shio.Snake,
  12: Shio.Tiger,
};

export function getShioName(shioId: number): Shio {
  return ShioDictionary[shioId];
}
