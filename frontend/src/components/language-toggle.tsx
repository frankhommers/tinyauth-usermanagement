import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

const languages: Record<string, string> = {
  en: 'English',
  nl: 'Nederlands',
}

export const LanguageSelector = () => {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState(
    i18n.resolvedLanguage?.startsWith('nl') ? 'nl' : 'en'
  )

  const handleSelect = (option: string) => {
    setLanguage(option)
    void i18n.changeLanguage(option)
  }

  return (
    <Select onValueChange={handleSelect} value={language}>
      <SelectTrigger>
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languages).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
