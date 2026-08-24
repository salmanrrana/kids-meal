import { afterEach, describe, expect, test } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
} from '@tanstack/react-router'
import { LunchboxPage } from './pages/LunchboxPage'
import { lunchboxRecipes } from './data/lunchboxRecipes'
import { lunchRecipes } from './data/lunchRecipes'

function renderWithRouter(ui) {
  const rootRoute = createRootRoute({ component: () => ui })
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => null }),
  ])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/lunchbox'] }),
  })
  return render(<RouterProvider router={router} />)
}

describe('LunchboxPage', () => {
  afterEach(cleanup)

  test('renders the full collection of 50 ideas', async () => {
    renderWithRouter(<LunchboxPage />)
    expect(await screen.findByText('Lunchbox ideas')).toBeDefined()
    expect((await screen.findAllByRole('article')).length).toBe(50)
  })

  test('collection filters narrow and restore the grid', async () => {
    renderWithRouter(<LunchboxPage />)
    await screen.findByText('Lunchbox ideas')
    expect((await screen.findAllByRole('article')).length).toBe(50)

    fireEvent.click(screen.getByRole('button', { name: 'Sweet & Fruity' }))
    const sweetCount = screen.getAllByRole('article').length
    expect(sweetCount).toBeGreaterThan(0)
    expect(sweetCount).toBeLessThan(50)

    fireEvent.click(screen.getByRole('button', { name: 'All Ideas' }))
    expect(screen.getAllByRole('article').length).toBe(50)
  })
})

describe('LunchboxPage sourced mode', () => {
  afterEach(cleanup)

  test('toggle shows sourced recipes with working filters, and switches back', async () => {
    renderWithRouter(<LunchboxPage />)
    await screen.findByText('Lunchbox ideas')
    expect(screen.getAllByRole('article').length).toBe(lunchboxRecipes.length)

    fireEvent.click(screen.getByRole('tab', { name: 'From Real Sites' }))
    expect(await screen.findAllByRole('article')).toHaveLength(lunchRecipes.length)
    expect(lunchRecipes.length).toBeGreaterThanOrEqual(25)

    // every sourced recipe keeps its source attribution data
    for (const r of lunchRecipes) {
      expect(r.sourceUrl).toMatch(/^https?:\/\//)
      expect(r.sourceName).toBeTruthy()
      expect(r.image).toMatch(/^https?:\/\//)
      expect(r.ingredients.length).toBeGreaterThan(0)
      expect(r.steps.length).toBeGreaterThan(0)
    }

    // sourced collections filter
    fireEvent.click(screen.getByRole('button', { name: 'Pasta Salads' }))
    const pastaCount = screen.getAllByRole('article').length
    expect(pastaCount).toBeGreaterThan(0)
    expect(pastaCount).toBeLessThan(lunchRecipes.length)

    fireEvent.click(screen.getByRole('tab', { name: 'Quick Ideas' }))
    expect(await screen.findAllByRole('article')).toHaveLength(lunchboxRecipes.length)
  })
})
