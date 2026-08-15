export interface DrinkOption {
  name: string
  choices: string[]
}

export interface Drink {
  id: number
  name: string
  description: string
  price: number
  options: DrinkOption[]
}

export const drinks: Drink[] = [
  {
    id: 1,
    name: 'Mojito',
    description: 'White rum, lime, mint and soda',
    price: 12,
    options: [
      {
        name: 'Size',
        choices: ['Regular', 'Large'],
      },
      {
        name: 'Ice',
        choices: ['None', 'Light', 'Regular'],
      },
      {
        name: 'Sweetness',
        choices: ['Light', 'Regular'],
      },
      {
        name: 'Extras',
        choices: ['None', 'Extra Mint', 'Extra Lime'],
      },
    ],
  },

  {
    id: 2,
    name: 'Margarita',
    description: 'Tequila, lime and orange liqueur',
    price: 11,
    options: [
      {
        name: 'Size',
        choices: ['Regular', 'Large'],
      },
      {
        name: 'Ice',
        choices: ['None', 'Light', 'Regular'],
      },
      {
        name: 'Salt',
        choices: ['No Salt', 'Salt'],
      },
    ],
  },

  {
    id: 3,
    name: 'Piña Colada',
    description: 'Rum, coconut cream and pineapple',
    price: 13,
    options: [
      {
        name: 'Size',
        choices: ['Regular', 'Large'],
      },
      {
        name: 'Ice',
        choices: ['None', 'Light', 'Regular'],
      },
      {
        name: 'Extras',
        choices: ['None', 'Extra Pineapple', 'Extra Coconut'],
      },
    ],
  },
]