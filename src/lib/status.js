// Single source of truth for status colors — semantic meaning only.
// success=green · info=blue · warning=amber · danger=red · neutral=gray
export const LISTS = {
  orderStatus: ['פתוח', 'סגור'],
  shipmentStatus: ['בתשלום', 'בייצור', 'בבוקינג', 'במשלוח', 'בנמל ממתין לשחרור', 'למכור'],
  shipType: ['ימי', 'אווירי'],
  containerSize: ['LCL', '40', '20'],
  payStatus: ['יש לבצע תשלום', 'שולם במלואו'],
  payType: ['SWIFT', 'כרטיס אשראי'],
  supplierType: ['חו"ל', 'מקומי'],
}

const CLASS = {
  'פתוח': 'badge-success',
  'סגור': 'badge-neutral',
  'בתשלום': 'badge-warning',
  'בייצור': 'badge-warning',
  'בבוקינג': 'badge-warning',
  'במשלוח': 'badge-info',
  'בנמל ממתין לשחרור': 'badge-danger',
  'למכור': 'badge-success',
  'יש לבצע תשלום': 'badge-danger',
  'שולם במלואו': 'badge-success',
  'חו"ל': 'badge-info',
  'מקומי': 'badge-warning',
  'ימי': 'badge-info',
  'אווירי': 'badge-info',
}
export const chipClass = (v) => CLASS[v] || 'badge-neutral'

// Shipment pipeline — real statuses in operational order
export const PIPELINE = ['בתשלום', 'בייצור', 'בבוקינג', 'במשלוח', 'בנמל ממתין לשחרור', 'למכור']
