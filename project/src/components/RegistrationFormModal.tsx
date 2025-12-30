// src/components/RegistrationFormModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { X, CheckCircle, Upload, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
  validateEmail,
  validatePhoneNumber,
  validateAadhaar,
  isAadhaarField,
  isPhoneField,
  isEmailField,
  countryCodes,
} from '../utils/formValidation';

interface FormField {
  id: string;
  label: string;
  field_type: string;
  placeholder: string;
  options: string[];
  is_required: boolean;
  sort_order: number;
}

interface RegistrationForm {
  id: string;
  name: string;
  description: string;
  success_message: string;
}

interface RegistrationFormModalProps {
  formId: string;
  programId?: string;
  courseId?: string;
  eventId?: string;
  onClose: () => void;
  courseName?: string;
}

const AADHAAR_BUCKET = 'site-assets';
const AADHAAR_FOLDER = 'aadhaar';
const MAX_MB = 10;

// ✅ basic digit-length rules (extend if needed)
const PHONE_MAX_LEN_BY_CC: Record<string, number> = {
  '+91': 10,
  '+1': 10,
  '+44': 10,
  '+971': 9,
  '+966': 9,
  '+61': 9,
};
const getPhoneMaxLen = (cc: string) => PHONE_MAX_LEN_BY_CC[cc] ?? 15;

// ✅ strict email rule
const isValidEmailStrict = (email: string) => /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test((email || '').trim());

function normalizeDigits(v: string) {
  return (v || '').replace(/[^\d]/g, '');
}

/** ✅ Searchable Country Code Combobox */
function CountryCodeCombobox({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (code: string) => void;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return countryCodes;

    const q2 = query.startsWith('+') ? query.slice(1) : query;

    return countryCodes.filter((c) => {
      const codeDigits = c.code.replace('+', '');
      return (
        c.code.toLowerCase().includes(query) ||
        codeDigits.includes(q2) ||
        c.name.toLowerCase().includes(query)
      );
    });
  }, [q]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const base =
    'border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  const border = error ? 'border-red-500' : 'border-gray-300';

  return (
    <div className="relative w-32 shrink-0" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className={`${base} ${border} h-10 w-full px-2 text-sm bg-white flex items-center justify-between`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={16} className="text-gray-500 ml-2" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 max-w-[85vw] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Type +91, 91, India..."
              className="w-full h-9 px-3 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          <div className="max-h-56 overflow-y-auto">
            {filtered.map((c, idx) => (
              <button
                key={`${c.code}-${c.name}-${idx}`}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                  setQ('');
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="font-medium">{c.code}</span>
                <span className="text-gray-600 ml-3 truncate">{c.name}</span>
              </button>
            ))}

            {filtered.length === 0 && <div className="px-3 py-3 text-sm text-gray-500">No match</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistrationFormModal({
  formId,
  programId,
  courseId,
  eventId,
  onClose,
}: RegistrationFormModalProps) {
  const [form, setForm] = useState<RegistrationForm | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedCountryCodes, setSelectedCountryCodes] = useState<Record<string, string>>({});
  const [aadhaarImages, setAadhaarImages] = useState<Record<string, string>>({});
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ show errors only after blur OR submit (prevents "required" while still typing/selecting)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);

  // keep focus on phone input after selecting country code
  const phoneInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  const loadForm = async () => {
    const [formRes, fieldsRes] = await Promise.all([
      supabase.from('registration_forms').select('*').eq('id', formId).maybeSingle(),
      supabase.from('form_fields').select('*').eq('form_id', formId).order('sort_order'),
    ]);

    if (formRes.data) setForm(formRes.data as RegistrationForm);

    if (fieldsRes.data) {
      const f = fieldsRes.data as FormField[];
      setFields(f);

      const initialCodes: Record<string, string> = {};
      f.forEach((field) => {
        if (isPhoneField(field.field_type, field.label)) initialCodes[field.id] = '+91';
      });
      setSelectedCountryCodes(initialCodes);

      // reset state for new form
      setFormData({});
      setErrors({});
      setTouched({});
      setSubmitAttempted(false);
      setFocusedFieldId(null);
    }
  };

  /** ✅ Validate one field (used on blur + submit; onChange only if already touched/submitAttempted) */
  const validateField = (field: FormField, rawValue: any) => {
    const value = rawValue ?? '';
    const label = field.label;

    // required
    if (field.is_required && String(value).trim() === '') {
      return `${label} is required`;
    }
    if (String(value).trim() === '') return '';

    // EMAIL
    if (isEmailField(field.field_type, field.label)) {
      const v = validateEmail(value);
      if (!v.isValid) return v.error || 'Invalid email';
      if (!isValidEmailStrict(String(value))) return 'Enter a valid email (example@domain.com)';
      return '';
    }

    // PHONE
    if (isPhoneField(field.field_type, field.label)) {
      const cc = selectedCountryCodes[field.id] || '+91';
      const digits = normalizeDigits(String(value));
      const maxLen = getPhoneMaxLen(cc);

      if (digits.length !== maxLen) return `Phone number must be ${maxLen} digits for ${cc}`;

      const full = `${cc}${digits}`;
      const v = validatePhoneNumber(full);
      if (!v.isValid) return v.error || 'Invalid phone number';
      return '';
    }

    // AADHAAR
    if (isAadhaarField(field.label)) {
      const digits = normalizeDigits(String(value));
      if (digits.length !== 12) return 'Aadhaar must be 12 digits';

      const v = validateAadhaar(digits);
      if (!v.isValid) return v.error || 'Invalid Aadhaar';
      return '';
    }

    return '';
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const msg = validateField(field, formData[field.id]);
      if (msg) newErrors[field.id] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!validateForm()) return;

    setIsSubmitting(true);

    const responses: Record<string, any> = {};
    fields.forEach((field) => {
      if (isPhoneField(field.field_type, field.label) && formData[field.id]) {
        const cc = selectedCountryCodes[field.id] || '+91';
        const digits = normalizeDigits(String(formData[field.id]));
        responses[field.label] = `${cc} ${digits}`;
      } else if (isAadhaarField(field.label)) {
        const digits = normalizeDigits(String(formData[field.id] || ''));
        responses[field.label] = digits;
        if (aadhaarImages[field.id]) responses[`${field.label} (Image)`] = aadhaarImages[field.id];
      } else {
        responses[field.label] = formData[field.id] || '';
      }
    });

    const { error } = await supabase.from('form_submissions').insert({
      form_id: formId,
      program_id: programId || null,
      course_id: courseId || null,
      event_id: eventId || null,
      responses,
    });

    setIsSubmitting(false);
    if (!error) setIsSuccess(true);
  };

  const shouldShowError = (fieldId: string) => Boolean(submitAttempted || touched[fieldId]);

  const handleFieldChange = (field: FormField, value: any) => {
    setFormData((p) => ({ ...p, [field.id]: value }));

    // ✅ while typing, only validate if already touched (blurred once) OR submit was tried
    if (!shouldShowError(field.id)) {
      setErrors((p) => ({ ...p, [field.id]: '' }));
      return;
    }

    const msg = validateField(field, value);
    setErrors((p) => ({ ...p, [field.id]: msg }));
  };

  const handleFieldBlur = (field: FormField) => {
    setFocusedFieldId((cur) => (cur === field.id ? null : cur));
    setTouched((p) => ({ ...p, [field.id]: true }));

    const msg = validateField(field, formData[field.id]);
    setErrors((p) => ({ ...p, [field.id]: msg }));
  };

  const handleCountryCodeChange = (field: FormField, code: string) => {
    setSelectedCountryCodes((p) => ({ ...p, [field.id]: code }));

    // trim current digits based on new cc
    const maxLen = getPhoneMaxLen(code);
    const digits = normalizeDigits(String(formData[field.id] || '')).slice(0, maxLen);
    setFormData((p) => ({ ...p, [field.id]: digits }));

    // ✅ DO NOT show "required" just because cc changed while user is still in the field.
    if (shouldShowError(field.id)) {
      const msg = validateField(field, digits);
      setErrors((p) => ({ ...p, [field.id]: msg }));
    } else {
      setErrors((p) => ({ ...p, [field.id]: '' }));
    }

    // ✅ keep cursor in phone number input after selecting cc
    setTimeout(() => {
      phoneInputRefs.current[field.id]?.focus();
    }, 0);
  };

  const handleAadhaarImageUpload = async (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = MAX_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors((p) => ({ ...p, [`${fieldId}_image`]: `Image too large (max ${MAX_MB}MB)` }));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrors((p) => ({ ...p, [`${fieldId}_image`]: 'Please select an image file' }));
      return;
    }

    setUploadingImages((p) => ({ ...p, [fieldId]: true }));
    setErrors((p) => ({ ...p, [`${fieldId}_image`]: '' }));

    try {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `aadhaar-${Math.random().toString(36).slice(2)}-${Date.now()}.${ext}`;
      const filePath = `${AADHAAR_FOLDER}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(AADHAAR_BUCKET)
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw new Error(uploadError.message || 'Upload failed');

      const { data } = supabase.storage.from(AADHAAR_BUCKET).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error(`Uploaded, but no public URL. Make bucket "${AADHAAR_BUCKET}" Public.`);

      setAadhaarImages((p) => ({ ...p, [fieldId]: publicUrl }));
    } catch (err: any) {
      setErrors((p) => ({ ...p, [`${fieldId}_image`]: err?.message || 'Failed to upload image' }));
    } finally {
      setUploadingImages((p) => ({ ...p, [fieldId]: false }));
      e.target.value = '';
    }
  };

  const clearAadhaarImage = (fieldId: string) => {
    setAadhaarImages((p) => {
      const copy = { ...p };
      delete copy[fieldId];
      return copy;
    });
  };

  const renderField = (field: FormField) => {
    const base =
      'w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
    const showErr = shouldShowError(field.id);
    const errText = showErr ? errors[field.id] : '';
    const errorClass = errText ? 'border-red-500' : 'border-gray-300';
    let placeholder = (field.placeholder || '').trim();

    // ✅ PHONE UI (no "required" while still focused)
    if (isPhoneField(field.field_type, field.label)) {
      if (!placeholder) placeholder = 'e.g., 9876543210';

      const cc = selectedCountryCodes[field.id] || '+91';
      const maxLen = getPhoneMaxLen(cc);

      return (
        <div className="flex items-stretch gap-2 w-full">
          <CountryCodeCombobox
            value={cc}
            onChange={(code) => handleCountryCodeChange(field, code)}
            error={Boolean(errText)}
          />

          <input
            ref={(el) => {
              phoneInputRefs.current[field.id] = el;
            }}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={String(formData[field.id] || '')}
            onFocus={() => setFocusedFieldId(field.id)}
            onChange={(e) => {
              const digits = normalizeDigits(e.target.value).slice(0, maxLen);
              handleFieldChange(field, digits);
            }}
            onBlur={() => handleFieldBlur(field)}
            placeholder={placeholder}
            className={`border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errorClass} h-10 px-3 text-sm flex-1 min-w-0`}
            maxLength={maxLen}
          />
        </div>
      );
    }

    // ✅ AADHAAR UI
    if (isAadhaarField(field.label)) {
      if (!placeholder) placeholder = 'e.g., 123456789012';

      return (
        <div className="space-y-2">
          <input
            type="text"
            inputMode="numeric"
            value={String(formData[field.id] || '')}
            onFocus={() => setFocusedFieldId(field.id)}
            onChange={(e) => handleFieldChange(field, normalizeDigits(e.target.value).slice(0, 12))}
            onBlur={() => handleFieldBlur(field)}
            placeholder={placeholder}
            className={`${base} ${errorClass} h-10 px-3 text-sm`}
            maxLength={12}
            autoComplete="off"
          />

          <div className="border-t pt-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">Upload Aadhaar Image (Optional)</label>

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-6 h-6 mb-1 text-gray-400" />
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Click to upload</span>
                </p>
                <p className="text-[11px] text-gray-500">PNG, JPG up to {MAX_MB}MB</p>
              </div>

              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleAadhaarImageUpload(field.id, e)}
                disabled={uploadingImages[field.id]}
              />
            </label>

            {uploadingImages[field.id] && <p className="mt-1 text-xs text-blue-600">Uploading...</p>}
            {errors[`${field.id}_image`] && <p className="mt-1 text-xs text-red-600">{errors[`${field.id}_image`]}</p>}

            {aadhaarImages[field.id] && (
              <div className="mt-2 relative inline-block">
                <img
                  src={aadhaarImages[field.id]}
                  alt="Aadhaar"
                  className="h-20 w-auto object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => clearAadhaarImage(field.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // ✅ EMAIL placeholder + validate on blur (or after submit)
    if (isEmailField(field.field_type, field.label) && !placeholder) placeholder = 'e.g., example@domain.com';

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onFocus={() => setFocusedFieldId(field.id)}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={placeholder}
            className={`${base} ${errorClass} px-3 py-2 text-sm`}
            rows={3}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onFocus={() => setFocusedFieldId(field.id)}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            className={`${base} ${errorClass} h-10 px-3 text-sm bg-white`}
          >
            <option value="">Select...</option>
            {field.options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type={isEmailField(field.field_type, field.label) ? 'email' : field.field_type}
            value={formData[field.id] || ''}
            onFocus={() => setFocusedFieldId(field.id)}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            onBlur={() => handleFieldBlur(field)}
            placeholder={placeholder}
            className={`${base} ${errorClass} h-10 px-3 text-sm`}
          />
        );
    }
  };

  if (!form) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <CheckCircle size={56} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-700 text-sm mb-5">{form.success_message}</p>
          <button
            onClick={onClose}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-start p-4 border-b">
          <div className="pr-6">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{form.name}</h2>
            {form.description && <p className="text-gray-600 mt-1 text-xs">{form.description}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {fields.map((field) => {
              const showErr = shouldShowError(field.id);
              return (
                <div key={field.id}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.is_required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {renderField(field)}

                  {showErr && errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 mt-5 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
