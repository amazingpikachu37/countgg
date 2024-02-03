import { useEffect, useRef, useState } from 'react'
import { Row, RowState } from './Row'
import dictionary from './dictionary.json'
import { Clue, clue, describeClue, violation } from './clue'
import { Keyboard } from './Keyboard'
import { describeSeed, dictionarySet, Difficulty, gameName, pick, resetRng, seed, speak, urlParam } from './util'
import { decode, encode } from './base64'
import seedrandom from 'seedrandom'
import moment from 'moment-timezone'

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number
  hidden: boolean
  difficulty: Difficulty
  colorBlind: boolean
  keyboardLayout: string
}

// const targets = targetList.slice(0, targetList.indexOf("murky") + 1); // Words no rarer than this one
const minLength = 4
const defaultLength = 5
const maxLength = 11
const limitLength = (n: number) => (n >= minLength && n <= maxLength ? n : defaultLength)

// function randomTarget(wordLength: number): string {
//   const eligible = targets.filter((word) => word.length === wordLength);
//   let candidate: string;
//   do {
//     candidate = pick(eligible);
//   } while (/\*/.test(candidate));
//   return candidate;
// }

// function getRandomNonDictionaryWord(seed: number): string {
//   let randomWord: string;
//   const random = crypto.randomBytes(3);
//   do {
//     randomWord = random.toString('hex').substring(0, 5);
//   } while (dictionary.includes(randomWord));

//   return randomWord;
// }

function getRandomNonDictionaryWord(seed) {
  if (!seed) {
    const now = new Date()

    const todaySeed =
      now.toLocaleDateString('en-US', { year: 'numeric' }) +
      now.toLocaleDateString('en-US', { month: '2-digit' }) +
      now.toLocaleDateString('en-US', { day: '2-digit' })

    seed = Number(todaySeed)
  }
  let result = ''
  let failCount = 0
  const characters = 'abcdefghijklmnopqrstuvwxyz'
  const charactersLength = characters.length

  // console.log(`Ok, ${seed}`);

  const rngWord = () => {
    let counter = 0
    while (counter < 5) {
      var rng = seedrandom(`${seed}-${failCount}-${counter}`)
      // console.log(`seedrandom is ${rng()}, floor is ${Math.floor(rng() * charactersLength)}`);
      result += characters.charAt(Math.floor(rng() * charactersLength))
      counter += 1
    }
    return result
  }

  let word = rngWord()

  // console.log(`Hi, ${word}`);

  while (dictionary.includes(word)) {
    // console.log(`Failed word: ${word}`);
    failCount += 1
    word = rngWord()
  }
  // console.log(`Success word: ${word}`);
  return word
}

function useLocalStorage<T>(key: string, initial: T): [T, (value: T | ((t: T) => T)) => void] {
  const [current, setCurrent] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initial
    } catch (e) {
      return initial
    }
  })
  const setSetting = (value: T | ((t: T) => T)) => {
    try {
      const v: any = value instanceof Function ? value(current) : value
      setCurrent(v)
      for (var i = 0; i < localStorage.length; i++) {
        const bum = localStorage.key(i)
        if (bum == null) continue
        if (bum.includes('lrwoed')) {
          if (+bum.split('-')[2] != +key.split('-')[2]) {
            localStorage.removeItem(bum)
            i--
          }
        }
      }
      if (key.includes('lrwoed-hint')) {
        if (v.includes('Too short') || v.includes('valid words') || v.includes('copied to clipboard')) return [current, setSetting]
      }
      window.localStorage.setItem(key, JSON.stringify(v))
    } catch (e) {}
  }
  return [current, setSetting]
}

function getChallengeUrl(target: string): string {
  return window.location.origin + window.location.pathname + '?challenge=' + encode(target)
}

let initChallenge = ''
let challengeError = false
try {
  initChallenge = decode(urlParam('challenge') ?? '').toLowerCase()
} catch (e) {
  console.warn(e)
  challengeError = true
}
if (initChallenge && !dictionarySet.has(initChallenge)) {
  initChallenge = ''
  challengeError = true
}

function parseUrlLength(): number {
  const lengthParam = urlParam('length')
  if (!lengthParam) return defaultLength
  return limitLength(Number(lengthParam))
}

function parseUrlGameNumber(): number {
  const gameParam = urlParam('game')
  if (!gameParam) return 1
  const gameNumber = Number(gameParam)
  return gameNumber >= 1 && gameNumber <= 1000 ? gameNumber : 1
}

// Specify the target date (5-30-2023)
// const targetDate = new Date('2023-05-30');
// // const targetDate = getLocalDate(2023, 5, 30)
// targetDate.setHours(0, 0, 0, 0);

// const targetDatee = new Date('2023-05-30');
// const targetDateString = targetDatee.toLocaleDateString(undefined, {
//   year: 'numeric',
//   month: '2-digit',
//   day: '2-digit',
// });
// const targetDate = new Date(targetDateString);

// console.log(targetDate);

// // Get the current date
// const currentDate = new Date();
// // const dateStr = new Date().toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' });
// // const currentDate = new Date(dateStr);

// // const now = new Date();
// // const todaySeed =
// //   now.toLocaleDateString("en-US", { year: "numeric" }) +
// //   now.toLocaleDateString("en-US", { month: "2-digit" }) +
// //   now.toLocaleDateString("en-US", { day: "2-digit" });
// // const currentDate = new Date(todaySeed);

// // Calculate the time difference in milliseconds
// const timeDiff = currentDate.getTime() - targetDate.getTime();

// // Convert the time difference to days
// const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

const targetDate = moment.tz('2023-05-30', moment.tz.guess())
const currentDate = moment()

const daysDiff = currentDate.diff(targetDate, 'days')

function Game(props: GameProps) {
  let stateStorageKey = 'lrwoed-result-' + daysDiff
  let guessesStorageKey = 'lrwoed-guesses-' + daysDiff
  let hintStorageKey = 'lrwoed-hint-' + daysDiff
  const [gameState, setGameState] = useLocalStorage<GameState>(stateStorageKey, GameState.Playing)
  const [guesses, setGuesses] = useLocalStorage<string[]>(guessesStorageKey, new Array(0))
  const [currentGuess, setCurrentGuess] = useState<string>('')
  const [challenge, setChallenge] = useState<string>(initChallenge)
  const [wordLength, setWordLength] = useState(challenge ? challenge.length : parseUrlLength())
  const [gameNumber, setGameNumber] = useState(parseUrlGameNumber())
  const [target, setTarget] = useState(() => {
    return getRandomNonDictionaryWord(seed)
    // resetRng();
    // // Skip RNG ahead to the parsed initial game number:
    // for (let i = 1; i < gameNumber; i++) randomTarget(wordLength);
    // return challenge || randomTarget(wordLength);
  })
  const [hint, setHint] = useLocalStorage<string>(
    hintStorageKey,
    challengeError ? `Invalid challenge string, playing random game.` : `Make your first guess!`,
  )
  const currentSeedParams = () => `?seed=${seed}&length=${wordLength}&game=${gameNumber}`
  useEffect(() => {
    if (seed) {
      window.history.replaceState({}, document.title, window.location.pathname + currentSeedParams())
    }
  }, [wordLength, gameNumber])
  const tableRef = useRef<HTMLTableElement>(null)
  const startNextGame = () => {
    if (challenge) {
      // Clear the URL parameters:
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    setChallenge('')
    const newWordLength = limitLength(wordLength)
    setWordLength(newWordLength)
    // setTarget(randomTarget(newWordLength));
    setTarget(getRandomNonDictionaryWord(seed))
    setHint('')
    setGuesses([])
    setCurrentGuess('')
    setGameState(GameState.Playing)
    setGameNumber((x) => x + 1)
  }

  async function share(copiedHint: string, text?: string) {
    const url = seed ? window.location.origin + window.location.pathname + currentSeedParams() : getChallengeUrl(target)
    const body = text ? text : ''
    if (/android|iphone|ipad|ipod|webos/i.test(navigator.userAgent) && !/firefox/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ text: body })
        return
      } catch (e) {
        console.warn('navigator.share failed:', e)
      }
    }
    try {
      await navigator.clipboard.writeText(body)
      setHint(copiedHint)
      return
    } catch (e) {
      console.warn('navigator.clipboard.writeText failed:', e)
    }
    setHint(copiedHint)
  }

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === 'Enter') {
        // startNextGame();
      }
      return
    }
    if (guesses.length === props.maxGuesses) return
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) => (guess + key.toLowerCase()).slice(0, wordLength))
      tableRef.current?.focus()
      setHint('')
    } else if (key === 'Backspace') {
      setCurrentGuess((guess) => guess.slice(0, -1))
      setHint('')
    } else if (key === 'Enter') {
      if (currentGuess.length !== wordLength) {
        setHint('Too short')
        return
      }
      if (dictionary.includes(currentGuess)) {
        setHint('Not valid words allowed')
        return
      }
      for (const g of guesses) {
        const c = clue(g, target)
        const feedback = violation(props.difficulty, c, currentGuess)
        if (feedback) {
          setHint(feedback)
          return
        }
      }
      setGuesses((guesses) => guesses.concat([currentGuess]))
      setCurrentGuess((guess) => '')

      const gameOver = (verbed: string) => {
        return `You ${verbed}! The answer was ${target.toUpperCase()}. `
      }

      if (currentGuess === target) {
        setHint(gameOver('won'))
        setGameState(GameState.Won)
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(gameOver('lost'))
        setGameState(GameState.Lost)
      } else {
        setHint('')
        speak(describeClue(clue(currentGuess, target)))
      }
    }
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key)
      }
      if (e.key === 'Backspace') {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [currentGuess, gameState])

  let letterInfo = new Map<string, Clue>()
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? ''
      const cluedLetters = clue(guess, target)
      const lockedIn = i < guesses.length
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break
          const old = letterInfo.get(letter)
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue)
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={lockedIn ? RowState.LockedIn : i === guesses.length ? RowState.Editing : RowState.Pending}
          cluedLetters={cluedLetters}
        />
      )
    })

  return (
    <div className="Game" style={{ display: props.hidden ? 'none' : 'block' }}>
      <div className="Game-options">
        {/* <label htmlFor="wordLength">Letters:</label>
        <input
          type="range"
          min={minLength}
          max={maxLength}
          id="wordLength"
          disabled={
            gameState === GameState.Playing &&
            (guesses.length > 0 || currentGuess !== "" || challenge !== "")
          }
          value={wordLength}
          onChange={(e) => {
            const length = Number(e.target.value);
            resetRng();
            setGameNumber(1);
            setGameState(GameState.Playing);
            setGuesses([]);
            setCurrentGuess("");
            setTarget(randomTarget(length));
            setWordLength(length);
            setHint(`${length} letters`);
          }}
        ></input> */}
        {/* <button
          style={{ flex: "0 0 auto" }}
          disabled={gameState !== GameState.Playing || guesses.length === 0}
          onClick={() => {
            setHint(
              `The answer was ${target.toUpperCase()}. (Enter to play again)`
            );
            setGameState(GameState.Lost);
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Give up
        </button> */}
      </div>
      <table className="Game-rows" tabIndex={0} aria-label="Table of guesses" ref={tableRef}>
        <tbody>{tableRows}</tbody>
      </table>
      <p
        role="alert"
        style={{
          userSelect: /https?:/.test(hint) ? 'text' : 'none',
          whiteSpace: 'pre-wrap',
        }}
      >
        {hint || `\u00a0`}
      </p>
      <Keyboard layout={props.keyboardLayout} letterInfo={letterInfo} onKey={onKey} />
      <div className="Game-seed-info">
        {challenge
          ? 'playing a challenge game'
          : seed
            ? `${describeSeed(seed)} — length ${wordLength}, game ${gameNumber}`
            : `playing today's game (${daysDiff})`}
      </div>
      <p>
        {/* <button
          onClick={() => {
            share("Link copied to clipboard!");
          }}
        >
          Share a link to this game
        </button>{" "} */}
        {gameState !== GameState.Playing && (
          <button
            onClick={() => {
              const emoji = props.colorBlind ? ['⬛', '🟦', '🟧'] : ['⬛', '🟨', '🟩']
              const score = gameState === GameState.Lost ? 'X' : guesses.length
              share(
                'Result copied to clipboard!',
                `${gameName} ${daysDiff} ${score}/${props.maxGuesses}\n` +
                  // `${gameName} ${daysDiff}${props.difficulty === Difficulty.Hard ? '*' : props.difficulty === Difficulty.UltraHard ? '**' : ''} ${score}/${props.maxGuesses}\n` +
                  guesses
                    .map((guess) =>
                      clue(guess, target)
                        .map((c) => emoji[c.clue ?? 0])
                        .join(''),
                    )
                    .join('\n') +
                  `\nhttps://counting.gg/lrwoed`,
              )
            }}
          >
            Copy results
          </button>
        )}
      </p>
    </div>
  )
}

export default Game
