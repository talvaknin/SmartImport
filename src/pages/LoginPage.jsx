import { useState } from 'react'
import { Card, CardBody, Input, Button } from '@heroui/react'
import { motion, useAnimationControls } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const shake = useAnimationControls()

  async function login(e) {
    e?.preventDefault()
    setErr(''); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: pass })
    setLoading(false)
    if (error) {
      setErr('הכניסה נכשלה — בדקו אימייל וסיסמה.')
      shake.start({ x: [0, -9, 8, -5, 0], transition: { duration: 0.4 } })
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-navy p-4">
      {/* subtle corporate gradient glow */}
      <div className="pointer-events-none absolute -top-32 right-1/2 h-[460px] w-[460px] translate-x-1/2 rounded-full bg-brand-blue/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-surface/40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative w-[92%] max-w-[420px]">
      <motion.div animate={shake}>
        <Card className="rounded-3xl border border-white/10 bg-white shadow-2xl">
          <CardBody className="gap-7 p-8 sm:p-9">
            {/* Brand block */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-blue text-3xl font-extrabold text-white shadow-lg">U</div>
              <div>
                <div className="text-2xl font-extrabold tracking-tight text-brand-text">SmartImport</div>
                <div className="mt-1.5 text-sm leading-relaxed text-brand-muted">
                  מערכת ניהול יבוא ותפעול
                  <span className="mt-0.5 block text-xs text-slate-400">Universal Import U.M.I Ltd.</span>
                </div>
              </div>
            </div>

            <form onSubmit={login} className="flex flex-col gap-4">
              <Input label="אימייל" labelPlacement="outside" type="email" dir="ltr"
                autoComplete="username" value={email} onValueChange={setEmail} isRequired
                variant="bordered" size="lg" classNames={{ inputWrapper: 'h-12' }} />
              <Input label="סיסמה" labelPlacement="outside" dir="ltr"
                type={show ? 'text' : 'password'} autoComplete="current-password"
                value={pass} onValueChange={setPass} isRequired
                variant="bordered" size="lg" classNames={{ inputWrapper: 'h-12' }}
                endContent={
                  <button type="button" onClick={() => setShow((s) => !s)} aria-label="הצגת סיסמה"
                    className="text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                } />
              <Button type="submit" color="primary" size="lg" isLoading={loading}
                className="mt-2 h-12 w-full text-base font-bold">
                כניסה למערכת
              </Button>
              <div className="min-h-5 text-center text-sm text-danger" role="alert">{err}</div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
      </motion.div>
    </div>
  )
}
