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
