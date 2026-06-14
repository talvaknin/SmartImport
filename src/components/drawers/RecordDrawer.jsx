import { useEffect, useMemo, useState } from 'react'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter,
  Button, Input, Textarea, Select, SelectItem, Divider, addToast,
} from '@heroui/react'
import { Pencil, Trash2, Save, X } from 'lucide-react'
import StatusBadge from '../tables/StatusBadge'
import ConfirmDialog from '../feedback/ConfirmDialog'
import { supabase } from '../../lib/supabase'
import { fmtDate, fmtMoney, exNum, exTxt } from '../../lib/dates'

function display(field, v) {
  if (v == null || v === '') return <span className="text-gray-300">—</span>
  if (field.badge) return <StatusBadge value={v} />
  if (field.t === 'date') return <span dir="ltr">{fmtDate(v)}</span>
  if (field.t === 'number') return <span dir="ltr">{fmtMoney(v)}</span>
  return String(v)
}

export default function RecordDrawer({ schema, record, isOpen, onClose, onSaved, startInEdit }) {
  const isNew = !record?.id
  const [edit, setEdit] = useState(false)
  const [form, setForm] = useState({})
  const [missing, setMissing] = useState([])
  const [saving, setSaving] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const init = {}
      schema.fields.forEach((f) => { init[f.k] = record?.[f.k] ?? '' })
      setForm(init); setMissing([]); setDirty(false)
      setEdit(Boolean(startInEdit) || isNew)
    }
  }, [isOpen, record, schema, startInEdit, isNew])

  const groups = useMemo(() => {
    const g = []
    schema.fields.forEach((f) => {
      let grp = g.find((x) => x.name === (f.group || ''))
      if (!grp) { grp = { name: f.group || '', fields: [] }; g.push(grp) }
      grp.fields.push(f)
    })
    return g
  }, [schema])

  const set = (k, v) => { setForm((s) => ({ ...s, [k]: v })); setDirty(true) }

  const tryClose = () => {
    if (edit && dirty) { setConfirmClose(true); return }
    onClose()
  }

  async function save() {
    const miss = schema.fields.filter((f) => f.req && !String(form[f.k] ?? '').trim()).map((f) => f.k)
    setMissing(miss)
    if (miss.length) {
      addToast({ title: 'יש למלא את שדות החובה המסומנים', color: 'danger' })
      return
    }
    setSaving(true)
    const rec = {}
    schema.fields.forEach((f) => {
      let v = form[f.k]
      if (f.t === 'number') v = exNum(v)
      else if (f.t === 'date') v = v || null
      else v = exTxt(v)
      rec[f.k] = v
    })
    const q = isNew
      ? supabase.from(schema.table).insert(rec)
      : supabase.from(schema.table).update(rec).eq('id', record.id)
    const { error } = await q
    setSaving(false)
    if (error) { addToast({ title: 'השמירה נכשלה: ' + error.message, color: 'danger' }); return }
    addToast({ title: 'הרשומה נשמרה', color: 'success' })
    setDirty(false)
    onSaved()
    onClose()
  }

  async function doDelete() {
    setDeleting(true)
    const { error } = await supabase.from(schema.table).delete().eq('id', record.id)
    setDeleting(false)
    setConfirmDel(false)
    if (error) { addToast({ title: 'המחיקה נכשלה: ' + error.message, color: 'danger' }); return }
    addToast({ title: 'הרשומה נמחקה', color: 'success' })
    onSaved()
    onClose()
  }

  const title = isNew ? `רשומה חדשה — ${schema.title}` : (record?.[schema.titleField] || schema.title)
  const subtitle = isNew ? '' : record?.[schema.subtitleField]
  const badgeField = schema.fields.find((f) => f.badge)

  return (
    <>
      <Drawer isOpen={isOpen} onClose={tryClose} placement="left" size="2xl"
        classNames={{ base: 'max-w-full sm:max-w-[640px]', wrapper: 'z-[60]', backdrop: 'z-[55]' }} dir="rtl">
        <DrawerContent>
          <DrawerHeader className="sticky top-0 z-10 flex flex-col gap-1 border-b border-brand-border bg-white">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">{title}</span>
              {!isNew && badgeField && <StatusBadge value={record?.[badgeField.k]} />}
            </div>
            {subtitle && <span className="text-sm font-normal text-gray-500">{subtitle}</span>}
          </DrawerHeader>

          <DrawerBody className="py-4">
            {groups.map((g) => (
              <div key={g.name} className="mb-4">
                {g.name && (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400">{g.name}</span>
                    <Divider className="flex-1" />
                  </div>
                )}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {g.fields.map((f) => (
                    <div key={f.k} className={f.wide ? 'sm:col-span-2' : ''}>
                      {edit ? (
                        f.t === 'select' ? (
                          <Select label={f.l} size="sm" isRequired={f.req}
                            isInvalid={missing.includes(f.k)} errorMessage={missing.includes(f.k) ? 'שדה חובה' : ''}
                            selectedKeys={form[f.k] ? [String(form[f.k])] : []}
                            onChange={(e) => set(f.k, e.target.value)}>
                            {f.opts.map((o) => <SelectItem key={o}>{o}</SelectItem>)}
                          </Select>
                        ) : f.t === 'textarea' ? (
                          <Textarea label={f.l} size="sm" minRows={2} value={form[f.k] ?? ''}
                            onValueChange={(v) => set(f.k, v)} />
                        ) : (
                          <Input label={f.l} size="sm" isRequired={f.req}
                            isInvalid={missing.includes(f.k)} errorMessage={missing.includes(f.k) ? 'שדה חובה' : ''}
                            type={f.t === 'number' ? 'number' : f.t === 'date' ? 'date' : 'text'}
                            value={String(form[f.k] ?? (f.t === 'date' && form[f.k] ? String(form[f.k]).slice(0, 10) : form[f.k] ?? ''))}
                            onValueChange={(v) => set(f.k, v)} />
                        )
                      ) : (
                        <div className="rounded-lg bg-gray-50 px-3 py-2">
                          <div className="text-[11px] text-gray-400">{f.l}</div>
                          <div className="text-sm">{display(f, record?.[f.k])}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!isNew && record?.created_at && (
              <div className="text-[11px] text-gray-400">נוצר: {fmtDate(record.created_at)}</div>
            )}
          </DrawerBody>

          <DrawerFooter className="sticky bottom-0 z-10 border-t border-brand-border bg-white">
            {edit ? (
              <>
                <Button color="primary" isLoading={saving} startContent={!saving && <Save size={16} />} onPress={save}>
                  שמירה
                </Button>
                <Button variant="flat" startContent={<X size={16} />} onPress={isNew ? tryClose : () => { setEdit(false); setDirty(false) }}>
                  ביטול
                </Button>
              </>
            ) : (
              <Button color="primary" variant="flat" startContent={<Pencil size={16} />} onPress={() => setEdit(true)}>
                עריכה
              </Button>
            )}
            {!isNew && (
              <Button color="danger" variant="light" className="ms-auto" startContent={<Trash2 size={16} />}
                onPress={() => setConfirmDel(true)}>
                מחיקה
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        isOpen={confirmDel} onClose={() => setConfirmDel(false)} onConfirm={doDelete} loading={deleting}
        title="מחיקת רשומה" body="הרשומה תימחק לצמיתות עבור כל המשתמשים. להמשיך?"
      />
      <ConfirmDialog
        isOpen={confirmClose} onClose={() => setConfirmClose(false)}
        onConfirm={() => { setConfirmClose(false); setDirty(false); onClose() }}
        title="יש שינויים שלא נשמרו" body="לצאת בלי לשמור את השינויים?" confirmLabel="צא בלי לשמור"
      />
    </>
  )
}
