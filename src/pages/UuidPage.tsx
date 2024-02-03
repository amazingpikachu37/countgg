import { useEffect, useState } from 'react'
import { Box, TextField, Typography } from '@mui/material'
import { convertToTimestamp, formatDate, formatDateExact, formatTimeDiff } from '../utils/helpers'
import { useLocation } from 'react-router-dom'

export const UuidPage = () => {
  const [uuid1, setUuid1] = useState('')
  const [uuid2, setUuid2] = useState('')

  const timestamp1 = convertToTimestamp(uuid1)
  const timestamp2 = convertToTimestamp(uuid2)
  const timeDiff = timestamp1 && timestamp2 ? Math.abs(timestamp1 - timestamp2) : null

  const location = useLocation()
  useEffect(() => {
    document.title = `UUID Calculator | Counting!`
    return () => {
      document.title = 'Counting!'
    }
  }, [location.pathname])

  return (
    <Box sx={{ bgcolor: 'background.paper', flexGrow: 1, p: 2, color: 'text.primary' }}>
      <Typography variant="h4" component="h1" align="center">
        UUID to Timestamp converter
      </Typography>

      <TextField label="UUID 1" variant="outlined" fullWidth margin="normal" onChange={(e) => setUuid1(e.target.value.slice(-36))} />

      <TextField label="UUID 2" variant="outlined" fullWidth margin="normal" onChange={(e) => setUuid2(e.target.value.slice(-36))} />

      {timestamp1 !== null && (
        <Typography variant="body1" component="p">
          UUID 1 timestamp: {formatDateExact(timestamp1)} ({timestamp1}, {formatDate(timestamp1)})
        </Typography>
      )}

      {timestamp2 !== null && (
        <Typography variant="body1" component="p">
          UUID 2 timestamp: {formatDateExact(timestamp2)} ({timestamp2}, {formatDate(timestamp2)})
        </Typography>
      )}

      {timeDiff !== null && (
        <Typography variant="body1" component="p">
          Time difference: {formatTimeDiff(timestamp1, timestamp2)}
        </Typography>
      )}
    </Box>
  )
}
