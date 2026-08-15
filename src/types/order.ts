import type { Drink } from '../data/drinks'

export interface Order {
  id: string
  customerName: string
  drink: Drink
  selections: Record<string, string>
  specialInstructions: string
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  createdAt: string
}