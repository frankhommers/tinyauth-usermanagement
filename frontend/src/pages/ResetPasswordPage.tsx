import { Alert, Button, Divider, Paper, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function ResetPasswordPage() {
  const [tab, setTab] = useState(0)
  const [smsEnabled, setSmsEnabled] = useState(false)

  // Email reset state
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')

  // SMS reset state
  const [phone, setPhone] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [smsNewPassword, setSmsNewPassword] = useState('')
  const [smsMsg, setSmsMsg] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  useEffect(() => {
    api.get('/features').then(res => {
      setSmsEnabled(res.data.smsEnabled === true)
    }).catch(() => {})
  }, [])

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
        <Typography variant="h5" textAlign="center">Password Reset</Typography>

        {smsEnabled && (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab label="Email" />
            <Tab label="SMS" />
          </Tabs>
        )}

        {tab === 0 && (
          <>
            {msg && <Alert severity="info">{msg}</Alert>}
            <TextField
              label="Username/email"
              value={username}
              onChange={e => setUsername(e.target.value)}
              fullWidth
            />
            <Button variant="outlined" fullWidth onClick={async () => {
              await api.post('/password-reset/request', { username })
              setMsg('Als user bestaat is mail verstuurd (of in logs)')
            }}>Request reset</Button>
            <Divider />
            <TextField
              label="Token"
              value={token}
              onChange={e => setToken(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label="New password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              fullWidth
            />
            <Button variant="contained" fullWidth onClick={async () => {
              try {
                await api.post('/password-reset/confirm', { token, newPassword })
                setMsg('Wachtwoord gewijzigd')
              } catch (e: any) {
                setMsg(e?.response?.data?.error || 'Reset mislukt')
              }
            }}>Reset password</Button>
          </>
        )}

        {tab === 1 && smsEnabled && (
          <>
            {smsMsg && <Alert severity="info">{smsMsg}</Alert>}
            {!codeSent ? (
              <>
                <TextField
                  label="Phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+31612345678"
                  fullWidth
                />
                <Button variant="outlined" fullWidth onClick={async () => {
                  try {
                    await api.post('/auth/forgot-password-sms', { phone })
                    setSmsMsg('Code verstuurd als het nummer bekend is')
                    setCodeSent(true)
                  } catch (e: any) {
                    setSmsMsg(e?.response?.data?.error || 'Fout bij verzenden')
                  }
                }}>Send reset code</Button>
              </>
            ) : (
              <>
                <TextField
                  label="SMS code"
                  value={smsCode}
                  onChange={e => setSmsCode(e.target.value)}
                  fullWidth
                />
                <TextField
                  type="password"
                  label="New password"
                  value={smsNewPassword}
                  onChange={e => setSmsNewPassword(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" fullWidth onClick={async () => {
                  try {
                    await api.post('/auth/reset-password-sms', { phone, code: smsCode, newPassword: smsNewPassword })
                    setSmsMsg('Wachtwoord gewijzigd!')
                  } catch (e: any) {
                    setSmsMsg(e?.response?.data?.error || 'Reset mislukt')
                  }
                }}>Reset password</Button>
                <Button variant="text" onClick={() => { setCodeSent(false); setSmsMsg('') }}>
                  Resend code
                </Button>
              </>
            )}
          </>
        )}
      </Stack>
    </Paper>
  )
}
