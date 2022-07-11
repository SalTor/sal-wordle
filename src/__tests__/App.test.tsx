import { render, screen } from '@testing-library/react'
import { expect } from 'jest-without-globals'
import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'

import App from '../App'

it('Renders a grid', () => {
  render(<App />)
  expect(screen.queryByTestId('grid')).toBeInTheDocument()
})
