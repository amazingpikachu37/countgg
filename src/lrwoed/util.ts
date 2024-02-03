import dictionary from './dictionary.json'

export enum Difficulty {
  Normal,
  Hard,
  UltraHard,
}

export const day1Date = new Date('May 31 2023')
export const todayDate = new Date()

export function dateToNumber(date: Date): number {
  return Math.floor((date.getTime() - day1Date.getTime()) / (1000 * 60 * 60 * 24))
}

const todayNumber = dateToNumber(todayDate)
export const day1Number = dateToNumber(day1Date)

const paramDay = urlParam('x') ?? undefined
export const allowPractice = true
export const practice = allowPractice && urlParam('unlimited') !== null
export const cheat = urlParam('cheat') !== null
export const dayNum: number = paramDay ? parseInt(paramDay) : 1 + todayNumber - day1Number
export const todayDayNum: number = 1 + todayNumber - day1Number
export const bonusPuzzle = urlParam('bonus') ?? ''

export const gameName = 'lrwoed'
export const maxGuesses = 8

export const dictionarySet: Set<string> = new Set(dictionary)

function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function urlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name)
}

const now = new Date()

const todaySeed =
  now.toLocaleDateString('en-US', { year: 'numeric' }) +
  now.toLocaleDateString('en-US', { month: '2-digit' }) +
  now.toLocaleDateString('en-US', { day: '2-digit' })

export const seed = Number(urlParam('seed'))
const makeRandom = () => (seed ? mulberry32(seed) : mulberry32(Number(todaySeed)))
let random = makeRandom()

export function resetRng(): void {
  random = makeRandom()
}

export function pick<T>(array: Array<T>): T {
  return array[Math.floor(array.length * random())]
}

// https://a11y-guidelines.orange.com/en/web/components-examples/make-a-screen-reader-talk/
export function speak(text: string, priority: 'polite' | 'assertive' = 'assertive') {
  var el = document.createElement('div')
  var id = 'speak-' + Date.now()
  el.setAttribute('id', id)
  el.setAttribute('aria-live', priority || 'polite')
  el.classList.add('sr-only')
  document.body.appendChild(el)

  window.setTimeout(function () {
    document.getElementById(id)!.innerHTML = text
  }, 100)

  window.setTimeout(function () {
    document.body.removeChild(document.getElementById(id)!)
  }, 1000)
}

export function ordinal(n: number): string {
  return n + ([, 'st', 'nd', 'rd'][(n % 100 >> 3) ^ 1 && n % 10] || 'th')
}

export const englishNumbers = 'zero one two three four five six seven eight nine ten eleven'.split(' ')

export function describeSeed(seed: number): string {
  const year = Math.floor(seed / 10000)
  const month = Math.floor(seed / 100) % 100
  const day = seed % 100
  const isLeap = year % (year % 25 ? 4 : 16) === 0
  const feb = isLeap ? 29 : 28
  const days = [0, 31, feb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  if (year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= days[month]) {
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } else {
    return 'seed ' + seed
  }
}
