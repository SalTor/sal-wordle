import { useState, useCallback, useEffect } from 'react'

import './App.css'

const COLUMN_COUNT = 5
const ROW_COUNT = 6

type Grid = Row[]
type Row = string[]

const grid = Array(ROW_COUNT).fill([...Array(COLUMN_COUNT).fill('')])

function App() {
  const [targetWord, setTargetWord] = useState('')
  const [guesses, setGuesses] = useState<Grid>([])
  const [currentGuess, setCurrentGuess] = useState<Row>([])
  const [gameFinished, setGameFinished] = useState(false)

  const getWord = async (initial?: string) => {
    if (initial) {
      setTargetWord(initial.toUpperCase())
      return
    }
    const res = await fetch('https://random-words-api.herokuapp.com/w')
    const words = await res.json()
    const target = words.find((w: string) => w.length === 5)
    if (target) {
      setTargetWord(target.toUpperCase())
    } else {
      console.log('looking again')
      getWord()
    }
  }

  useEffect(() => {
    getWord()
    return () => {}
  }, [])

  useEffect(() => {
    if (guesses.length) {
      if (guesses[guesses.length - 1].join('') === targetWord.toUpperCase()) {
        alert('you got it!')
        setGameFinished(true)
      } else if (guesses.length === ROW_COUNT) {
        alert(`Failed! Word was ${targetWord}`)
        setGameFinished(true)
      }
    }
  }, [guesses])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameFinished) {
        // do nothing
        if (event.key === 'r') {
          setGuesses([])
          setCurrentGuess([])
          getWord()
          setGameFinished(false)
        }
      } else if (event.key === 'Backspace') {
        setCurrentGuess((old) => old.slice(0, -1))
      } else if (currentGuess.length < COLUMN_COUNT) {
        const alphabet = /^[a-z]$/i
        if (alphabet.test(event.key)) {
          const char = event.key.toUpperCase()
          setCurrentGuess((old) => [...old, char])
        }
      } else if (event.key === 'Enter') {
        setGuesses((old) => [...old, currentGuess])
        setCurrentGuess([])
      } else {
        // alert user they're at max length
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentGuess, gameFinished])

  const charValidityCname = (char: string, charIndex: number) => {
    if (!char) return ''
    if (char === targetWord[charIndex]) return 'match'
    if (targetWord.includes(char)) return 'almost'
    return 'nope'
  }

  return (
    <div className="container">
      {grid.map((row: Row, rowIndex) => {
        const forcurrent = rowIndex === guesses.length
        return (
          <div key={`guess-${rowIndex}`} className="guess">
            {forcurrent && <div className="current-row rarr">&rarr;</div>}

            {row.map((_, charIndex) => {
              const sourceRow = forcurrent
                ? currentGuess
                : guesses[rowIndex] || []
              const letter = sourceRow[charIndex]
              return (
                <div
                  className={[
                    'letter',
                    forcurrent ? '' : charValidityCname(letter, charIndex),
                    forcurrent && charIndex === currentGuess.length
                      ? 'curr-cell'
                      : '',
                  ].join(' ')}
                  key={`${rowIndex}-${charIndex}`}
                >
                  {letter}
                </div>
              )
            })}

            {forcurrent && <div className="current-row larr">&larr;</div>}
          </div>
        )
      })}
      {gameFinished && (
        <section>
          <pre>Press R to try again</pre>
        </section>
      )}
    </div>
  )
}

export default App
