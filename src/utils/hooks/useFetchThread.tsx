import { useEffect, useState } from 'react'
import { getAllThreads, getThread, getUnapproved } from '../api'
import { Counter, ThreadType } from '../types'
import { useIsMounted } from './useIsMounted'
import { useThread } from '../contexts/ThreadContext'

export function useFetchThread(name: string) {
  const [thread, setThread] = useState<ThreadType>()
  const [threadLoading, setThreadLoading] = useState<boolean>(true)
  const { setFullThread } = useThread()

  const isMounted = useIsMounted()

  useEffect(() => {
    getThread(name)
      .then(({ data }) => {
        if (isMounted.current) {
          setThread(data)
          setFullThread && setFullThread(data)
        }
        setThreadLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [name])

  return { thread, threadLoading, setThread }
}
