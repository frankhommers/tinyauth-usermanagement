import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async () => {
    try {
      await api.post('/auth/login', { username, password })
      setMsg('Ingelogd')
    } catch (e: any) {
      setMsg(e?.response?.data?.error || 'Login mislukt')
    }
  }

  return (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        maxWidth: 400,
        p: { xs: 2, sm: 4 },
        mt: { xs: 2, sm: 4 },
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h5" textAlign="center">Login</Typography>
        {msg && <Alert severity="info">{msg}</Alert>}
        <TextField
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
        />
        <Button variant="contained" onClick={submit} fullWidth>Login</Button>
      </Stack>
    </Paper>
  )
}
