import { Alert, Button, Card, CardContent, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [msg, setMsg] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [totpSecret, setTotpSecret] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [qrPng, setQrPng] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  const load = async () => {
    try {
      const data = (await api.get('/account/profile')).data
      setProfile(data)
      setPhone(data.phone || '')
    } catch {
      setMsg('Niet ingelogd')
    }
  }
  useEffect(() => { load() }, [])

  return (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        maxWidth: 480,
        p: { xs: 2, sm: 4 },
        mt: { xs: 2, sm: 4 },
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h5" textAlign="center">Account</Typography>
        {msg && <Alert severity="info">{msg}</Alert>}

        {profile && (
          <Card variant="outlined">
            <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
              <Typography>Username: {profile.username}</Typography>
              <Typography>TOTP enabled: {String(profile.totpEnabled)}</Typography>
              {profile.phone && <Typography>Phone: {profile.phone}</Typography>}
            </CardContent>
          </Card>
        )}

        <Divider />
        <Typography variant="h6">Wachtwoord wijzigen</Typography>
        <TextField
          type="password"
          label="Old password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          type="password"
          label="New password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          fullWidth
          size="small"
        />
        <Button variant="contained" fullWidth onClick={async () => {
          try {
            await api.post('/account/change-password', { oldPassword, newPassword })
            setMsg('Wachtwoord gewijzigd')
            setOldPassword('')
            setNewPassword('')
          } catch (e: any) {
            setMsg(e?.response?.data?.error || 'Fout')
          }
        }}>Change password</Button>

        <Divider />
        <Typography variant="h6">Phone number</Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <TextField
            label="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+31612345678"
            size="small"
            sx={{ flex: 1, minWidth: 180 }}
          />
          <Button variant="outlined" onClick={async () => {
            try {
              await api.post('/account/phone', { phone })
              setMsg('Phone updated')
              load()
            } catch (e: any) {
              setMsg(e?.response?.data?.error || 'Fout')
            }
          }}>Save</Button>
        </Stack>

        <Divider />
        <Typography variant="h6">TOTP setup</Typography>
        <Button variant="outlined" fullWidth onClick={async () => {
          const data = (await api.post('/account/totp/setup')).data
          setTotpSecret(data.secret)
          setQrPng(data.qrPng)
        }}>Generate secret</Button>
        {qrPng && (
          <img
            src={qrPng}
            width={220}
            style={{ alignSelf: 'center', maxWidth: '100%' }}
            alt="TOTP QR"
          />
        )}
        {totpSecret && (
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            Secret: {totpSecret}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <TextField
            label="Code"
            value={totpCode}
            onChange={e => setTotpCode(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
          <Button variant="contained" onClick={async () => {
            try {
              await api.post('/account/totp/enable', { secret: totpSecret, code: totpCode })
              setMsg('TOTP enabled')
              load()
            } catch (e: any) {
              setMsg(e?.response?.data?.error || 'Fout')
            }
          }}>Enable</Button>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <TextField
            type="password"
            label="Password"
            value={disablePassword}
            onChange={e => setDisablePassword(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 120 }}
          />
          <Button variant="outlined" onClick={async () => {
            try {
              await api.post('/account/totp/disable', { password: disablePassword })
              setMsg('TOTP disabled')
              load()
            } catch (e: any) {
              setMsg(e?.response?.data?.error || 'Fout')
            }
          }}>Disable</Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
