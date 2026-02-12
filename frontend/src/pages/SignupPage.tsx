import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { api } from '../api/client'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')

  const submit = async () => {
    try {
      const res = await api.post('/signup', { username, email, password, phone: phone || undefined })
      setMsg(`Signup status: ${res.data.status}`)
    } catch (e: any) {
      setMsg(e?.response?.data?.error || 'Signup mislukt')
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
        <Typography variant="h5" textAlign="center">Signup</Typography>
        {msg && <Alert severity="info">{msg}</Alert>}
        <TextField
          label="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          fullWidth
        />
        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
        />
        <TextField
          label="Phone (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+31612345678"
          fullWidth
          helperText="For SMS password reset"
        />
        <Button variant="contained" onClick={submit} fullWidth>Signup</Button>
      </Stack>
    </Paper>
  )
}
