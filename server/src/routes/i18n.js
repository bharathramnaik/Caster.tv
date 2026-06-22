import { Router } from 'express';

const router = Router();

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const TRANSLATIONS = {
  en: {
    'nav.home': 'Home', 'nav.templates': 'Templates', 'nav.editor': 'Editor',
    'nav.scenes': 'Scenes', 'nav.live': 'Live', 'nav.teams': 'Teams',
    'nav.points': 'Points', 'nav.integrations': 'Integrations',
    'nav.analytics': 'Analytics', 'nav.bugs': 'Bugs',
    'common.loading': 'Loading...', 'common.error': 'Error', 'common.success': 'Success',
    'common.cancel': 'Cancel', 'common.confirm': 'Confirm', 'common.save': 'Save',
    'common.delete': 'Delete', 'common.edit': 'Edit', 'common.close': 'Close',
  },
  es: {
    'nav.home': 'Inicio', 'nav.templates': 'Plantillas', 'nav.editor': 'Editor',
    'nav.scenes': 'Escenas', 'nav.live': 'En Vivo', 'nav.teams': 'Equipos',
    'nav.points': 'Puntos', 'nav.integrations': 'Integraciones',
    'nav.analytics': 'Analíticas', 'nav.bugs': 'Bugs',
    'common.loading': 'Cargando...', 'common.error': 'Error', 'common.success': 'Éxito',
    'common.cancel': 'Cancelar', 'common.confirm': 'Confirmar', 'common.save': 'Guardar',
    'common.delete': 'Eliminar', 'common.edit': 'Editar', 'common.close': 'Cerrar',
  },
  hi: {
    'nav.home': 'होम', 'nav.templates': 'टेम्पलेट्स', 'nav.editor': 'संपादक',
    'nav.scenes': 'दृश्य', 'nav.live': 'लाइव', 'nav.teams': 'टीमें',
    'nav.points': 'अंक', 'nav.integrations': 'एकीकरण',
    'nav.analytics': 'विश्लेषण', 'nav.bugs': 'बग्स',
    'common.loading': 'लोड हो रहा है...', 'common.error': 'त्रुटि', 'common.success': 'सफल',
    'common.cancel': 'रद्द करें', 'common.confirm': 'पुष्टि करें', 'common.save': 'सहेजें',
    'common.delete': 'हटाएं', 'common.edit': 'संपादित करें', 'common.close': 'बंद करें',
  },
  ar: {
    'nav.home': 'الرئيسية', 'nav.templates': 'القوالب', 'nav.editor': 'المحرر',
    'nav.scenes': 'المشاهد', 'nav.live': 'مباشر', 'nav.teams': 'الفرق',
    'nav.points': 'النقاط', 'nav.integrations': 'التكامل',
    'nav.analytics': 'التحليلات', 'nav.bugs': 'الأخطاء',
    'common.loading': 'جاري التحميل...', 'common.error': 'خطأ', 'common.success': 'نجاح',
    'common.cancel': 'إلغاء', 'common.confirm': 'تأكيد', 'common.save': 'حفظ',
    'common.delete': 'حذف', 'common.edit': 'تعديل', 'common.close': 'إغلاق',
  },
};

router.get('/languages', (_req, res) => {
  res.json(LANGUAGES);
});

router.get('/:lang', (req, res) => {
  const { lang } = req.params;
  const translations = TRANSLATIONS[lang];
  if (!translations) {
    return res.status(404).json({ error: `Language "${lang}" not found` });
  }
  res.json({ lang, translations });
});

export default router;
