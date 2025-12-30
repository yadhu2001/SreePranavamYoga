import { useState, useEffect } from 'react';
import { X, CheckCircle, Upload } from 'lucide-react';
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

/** ✅ Use your existing PUBLIC bucket */
const AADHAAR_BUCKET = 'site-assets'; // change if you use "media"
const AADHAAR_FOLDER = 'aadhaar';
const MAX_MB = 10;

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
      setFields(fieldsRes.data as FormField[]);
      const initialCodes: Record<string, string> = {};
      (fieldsRes.data as FormField[]).forEach((field) => {
        if (isPhoneField(field.field_type, field.label)) initialCodes[field.id] = '+91';
      });
      setSelectedCountryCodes(initialCodes);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.id];

      if (field.is_required && !value) {
        newErrors[field.id] = `${field.label} is required`;
        return;
      }
      if (!value) return;

      if (isEmailField(field.field_type, field.label)) {
        const v = validateEmail(value);
        if (!v.isValid && v.error) newErrors[field.id] = v.error;
      }

      if (isPhoneField(field.field_type, field.label)) {
        const cc = selectedCountryCodes[field.id] || '+91';
        const full = `${cc}${value}`;
        const v = validatePhoneNumber(full);
        if (!v.isValid && v.error) newErrors[field.id] = v.error;
      }

      if (isAadhaarField(field.label)) {
        const v = validateAadhaar(value);
        if (!v.isValid && v.error) newErrors[field.id] = v.error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const responses: Record<string, any> = {};
    fields.forEach((field) => {
      if (isPhoneField(field.field_type, field.label) && formData[field.id]) {
        const cc = selectedCountryCodes[field.id] || '+91';
        responses[field.label] = `${cc} ${formData[field.id]}`;
      } else if (isAadhaarField(field.label)) {
        responses[field.label] = formData[field.id] || '';
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

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((p) => ({ ...p, [fieldId]: value }));
    if (errors[fieldId]) setErrors((p) => ({ ...p, [fieldId]: '' }));
  };

  const handleCountryCodeChange = (fieldId: string, code: string) => {
    setSelectedCountryCodes((p) => ({ ...p, [fieldId]: code }));
    if (errors[fieldId]) setErrors((p) => ({ ...p, [fieldId]: '' }));
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

      if (uploadError) {
        const msg = String(uploadError.message || '');
        if (msg.toLowerCase().includes('bucket')) {
          throw new Error(
            `Bucket "${AADHAAR_BUCKET}" not found. Create it in Supabase → Storage → Buckets and make it Public.`
          );
        }
        if (
          msg.toLowerCase().includes('row') ||
          msg.toLowerCase().includes('policy') ||
          msg.toLowerCase().includes('permission')
        ) {
          throw new Error(`Upload blocked by Storage policy. Allow uploads for bucket "${AADHAAR_BUCKET}".`);
        }
        throw new Error(msg || 'Upload failed');
      }

      const { data } = supabase.storage.from(AADHAAR_BUCKET).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (!publicUrl) {
        throw new Error(`Uploaded, but no public URL. Make bucket "${AADHAAR_BUCKET}" Public.`);
      }

      setAadhaarImages((p) => ({ ...p, [fieldId]: publicUrl }));
    } catch (err: any) {
      console.error('Upload error:', err);
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
    const errorClass = errors[field.id] ? 'border-red-500' : 'border-gray-300';
    let placeholder = (field.placeholder || '').trim();

    // ✅ PHONE: country code small + number normal (no weird tiny box)
    if (isPhoneField(field.field_type, field.label)) {
      if (!placeholder) placeholder = 'e.g., 9876543210';
      return (
        <div className="flex items-stretch gap-2">
          <select
            value={selectedCountryCodes[field.id] || '+91'}
            onChange={(e) => handleCountryCodeChange(field.id, e.target.value)}
            className={`${base} ${errorClass} h-10 shrink-0 w-24 sm:w-28 px-2 text-sm bg-white`}
          >
            {countryCodes.map((c, idx) => (
              <option key={`${c.code}-${c.name}-${idx}`} value={c.code}>
                {c.code} {c.name}
              </option>
            ))}
          </select>

          {/* wrapper prevents extra small "box" on the right and keeps full width */}
          <div className="flex-1 min-w-0">
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={formData[field.id] || ''}
              onChange={(e) =>
                // optional: keep only digits
                handleFieldChange(field.id, (e.target.value || '').replace(/[^\d]/g, ''))
              }
              placeholder={placeholder}
              className={`${base} ${errorClass} h-10 px-3 text-sm`}
            />
          </div>
        </div>
      );
    }

    if (isAadhaarField(field.label)) {
      if (!placeholder) placeholder = 'e.g., 123456789012';

      return (
        <div className="space-y-2">
          <input
            type="text"
            inputMode="numeric"
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, (e.target.value || '').replace(/[^\d]/g, ''))}
            placeholder={placeholder}
            className={`${base} ${errorClass} h-10 px-3 text-sm`}
            maxLength={12}
            autoComplete="off"
          />

          <div className="border-t pt-2">
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Upload Aadhaar Image (Optional)
            </label>

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
                <img src={aadhaarImages[field.id]} alt="Aadhaar" className="h-20 w-auto object-cover rounded-lg border border-gray-300" />
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

    if (isEmailField(field.field_type, field.label) && !placeholder) placeholder = 'e.g., example@domain.com';

    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={placeholder}
            className={`${base} ${errorClass} px-3 py-2 text-sm`}
            rows={3}
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
            type={field.field_type}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
            {fields.map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {errors[field.id] && <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>}
              </div>
            ))}
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
