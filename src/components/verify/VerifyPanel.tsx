import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import {
  canOffer,
  canPayout,
  getVerify,
  stubVerifyBusiness,
  stubVerifyId,
  stubVerifyPhone,
  verifyLevel,
} from '../../lib/verify'
import { useI18n } from '../../lib/i18n'

export function VerifyPanel({ focus }: { focus?: 'offer' | 'payout' }) {
  const { t } = useI18n()
  const v = getVerify()
  const [phone, setPhone] = useState(v.phoneValue || '')
  const [, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)
  const level = verifyLevel()

  return (
    <section id="verify" className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
      <div>
        <h2 className="text-lg font-semibold">{t('verify.title')}</h2>
        <p className="mt-1 text-xs text-muted">{t('verify.lead')}</p>
      </div>
      <ol className="space-y-2 text-sm">
        <li className="flex items-center justify-between gap-2">
          <span>{t('verify.email')}</span>
          <Badge tone={v.email ? 'green' : 'amber'}>{v.email ? t('verify.done') : t('verify.needed')}</Badge>
        </li>
        <li className="space-y-2 rounded-xl border border-border/80 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <span>{t('verify.phone')}</span>
            <Badge tone={v.phone ? 'green' : 'amber'}>{v.phone ? t('verify.done') : t('verify.offerGate')}</Badge>
          </div>
          {!v.phone && (
            <div className="flex flex-wrap gap-2">
              <Input
                label={t('verify.phoneLabel')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+49 171 …"
              />
              <Button
                size="sm"
                onClick={() => {
                  stubVerifyPhone(phone)
                  refresh()
                }}
              >
                {t('verify.phoneCta')}
              </Button>
            </div>
          )}
        </li>
        <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 px-3 py-2">
          <span>{t('verify.id')}</span>
          {v.id || v.business ? (
            <Badge tone="green">{t('verify.done')}</Badge>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                stubVerifyId()
                refresh()
              }}
            >
              {t('verify.idCta')}
            </Button>
          )}
        </li>
        <li className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 px-3 py-2">
          <span>{t('verify.business')}</span>
          {v.business ? (
            <Badge tone="green">{t('verify.done')}</Badge>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                stubVerifyBusiness()
                refresh()
              }}
            >
              {t('verify.businessCta')}
            </Button>
          )}
        </li>
      </ol>
      <p className="text-[11px] text-muted">
        {t('verify.level')}: {level}
        {focus === 'offer' && !canOffer() ? ` · ${t('verify.needPhone')}` : ''}
        {focus === 'payout' && !canPayout() ? ` · ${t('verify.needId')}` : ''}
      </p>
    </section>
  )
}
