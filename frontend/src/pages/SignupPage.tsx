import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '../api/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true)
    try {
      const res = await api.post('/signup', { username, email, password, phone: phone || undefined })
      setMsg(t('signupPage.status', { status: res.data.status }))
    } catch (e: any) {
      setMsg(e?.response?.data?.error || t('signupPage.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="min-w-xs sm:min-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-3xl">{t('signupPage.title')}</CardTitle>
        <CardDescription className="text-center">{t('signupPage.description')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {msg && <div className="rounded-md border bg-muted px-3 py-2 text-sm">{msg}</div>}
        <div className="grid gap-2">
          <Label htmlFor="username">{t('common.username')}</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">{t('common.email')}</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">{t('common.password')}</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">{t('common.phoneOptional')}</Label>
          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+31612345678" />
          <p className="text-xs text-muted-foreground">{t('signupPage.phoneHelp')}</p>
        </div>
        <Button onClick={submit} loading={loading} disabled={!username || !email || !password}>
          {t('signupPage.submit')}
        </Button>
      </CardContent>
    </Card>
  )
}
