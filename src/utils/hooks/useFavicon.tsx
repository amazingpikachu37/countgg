import { useEffect, useRef } from 'react'
import tinycon from 'tinycon'

export function useFavicon() {
  const countRef = useRef(0)

  tinycon.setOptions({
    // width: 7,
    // height: 12,
    // font: '9px Roboto',
    // font: 'Roboto',
    // font: `${10 * (Math.ceil(window.devicePixelRatio) || 1)}px sans-serif`,
    color: '#ffffff',
    // background: '#145365',
    fallback: true,
  })

  useEffect(() => {
    // tinycon.setOptions({ width: 16, height: 16, fallback: true });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Store the current count when the page is hidden
        tinycon.setBubble(0)
      } else {
        // Restore the previous count when the page is visible again
        countRef.current = 0
        tinycon.setBubble(countRef.current)
        tinycon.reset()
      }
    }

    // Listen for visibility changes and update the favicon accordingly
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Clean up the event listener on unmount
    return () => {
      tinycon.reset()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const setCount = () => {
    countRef.current += 1
    tinycon.setBubble(countRef.current)
  }

  return setCount
}
