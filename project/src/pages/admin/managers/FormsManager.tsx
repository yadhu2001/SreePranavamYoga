import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, Eye, Download } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface FormField {
  id?: string;
  form_id?: string;
  label: string;
  field_type: string;
  placeholder: string;
  options: string[];
  is_required: boolean;
  sort_order: number;
}

interface RegistrationForm {
  id?: string;
  name: string;
  description: string;
  success_message: string;
  is_active: boolean;
}

export default function FormsManager() {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'fields' | 'submissions'>('list');
  const [formData, setFormData] = useState<RegistrationForm>({
    name: '',
    description: '',
    success_message: 'Thank you for registering!',
    is_active: true,
  });
  const [newField, setNewField] = useState<FormField>({
    label: '',
    field_type: 'text',
    placeholder: '',
    options: [],
    is_required: false,
    sort_order: 0,
  });

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadFields();
      loadSubmissions();
    }
  }, [selectedForm]);

  const loadForms = async () => {
    const { data } = await supabase.from('registration_forms').select('*').order('created_at', { ascending: false });
    if (data) setForms(data);
  };

  const loadFields = async () => {
    if (!selectedForm) return;
    const { data } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', selectedForm)
      .order('sort_order');
    if (data) setFields(data);
  };

  const loadSubmissions = async () => {
    if (!selectedForm) return;
    const { data } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', selectedForm)
      .order('submitted_at', { ascending: false });
    if (data) setSubmissions(data);
  };

  const handleSaveForm = async () => {
    if (selectedForm) {
      await supabase.from('registration_forms').update(formData).eq('id', selectedForm);
    } else {
      const { data } = await supabase.from('registration_forms').insert(formData).select().single();
      if (data) setSelectedForm(data.id);
    }
    loadForms();
    setViewMode('list');
  };

  const handleDeleteForm = async (id: string) => {
    if (confirm('Are you sure? This will delete all fields and submissions.')) {
      await supabase.from('registration_forms').delete().eq('id', id);
      loadForms();
    }
  };

  const handleAddField = async () => {
    if (!selectedForm || !newField.label) return;

    const maxOrder = Math.max(0, ...fields.map(f => f.sort_order || 0));
    await supabase.from('form_fields').insert({
      form_id: selectedForm,
      ...newField,
      sort_order: maxOrder + 1,
    });

    loadFields();
    setNewField({
      label: '',
      field_type: 'text',
      placeholder: '',
      options: [],
      is_required: false,
      sort_order: 0,
    });
  };

  const handleDeleteField = async (id: string) => {
    if (confirm('Are you sure?')) {
      await supabase.from('form_fields').delete().eq('id', id);
      loadFields();
    }
  };

  const handleEditForm = (form: RegistrationForm) => {
    setFormData(form);
    setSelectedForm(form.id!);
    setViewMode('edit');
  };

  const handleManageFields = (formId: string) => {
    setSelectedForm(formId);
    setViewMode('fields');
  };

  const handleViewSubmissions = (formId: string) => {
    setSelectedForm(formId);
    setViewMode('submissions');
  };

  const exportSubmissions = () => {
    if (submissions.length === 0) return;

    const csv = [
      ['Submitted At', ...Object.keys(submissions[0].responses)].join(','),
      ...submissions.map(sub => [
        new Date(sub.submitted_at).toLocaleString(),
        ...Object.values(sub.responses as object)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'form-submissions.csv';
    a.click();
  };

  if (viewMode === 'edit') {
    return (
      <div>
        <button
          onClick={() => {
            setViewMode('list');
            setSelectedForm(null);
          }}
          className="mb-4 text-primary-600 hover:text-primary-700"
        >
          ← Back to Forms
        </button>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">{selectedForm ? 'Edit' : 'Create'} Form</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Form Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Success Message</label>
              <input
                type="text"
                value={formData.success_message}
                onChange={(e) => setFormData({ ...formData, success_message: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              onClick={handleSaveForm}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Save size={18} /> Save Form
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                setSelectedForm(null);
              }}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'fields') {
    const form = forms.find(f => f.id === selectedForm);
    return (
      <div>
        <button
          onClick={() => {
            setViewMode('list');
            setSelectedForm(null);
          }}
          className="mb-4 text-primary-600 hover:text-primary-700"
        >
          ← Back to Forms
        </button>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Manage Fields: {form?.name}</h3>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-3">Add New Field</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Label</label>
                <input
                  type="text"
                  value={newField.label}
                  onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., Full Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Field Type</label>
                <select
                  value={newField.field_type}
                  onChange={(e) => setNewField({ ...newField, field_type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Dropdown</option>
                  <option value="checkbox">Checkbox</option>
                  <option value="radio">Radio Buttons</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Placeholder</label>
                <input
                  type="text"
                  value={newField.placeholder}
                  onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              {['select', 'checkbox', 'radio'].includes(newField.field_type) && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options (comma separated)</label>
                  <input
                    type="text"
                    value={newField.options.join(', ')}
                    onChange={(e) => setNewField({ ...newField, options: e.target.value.split(',').map(o => o.trim()) })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newField.is_required}
                    onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Required</span>
                </label>
              </div>
            </div>
            <button
              onClick={handleAddField}
              className="mt-3 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Plus size={18} /> Add Field
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Current Fields</h4>
            {fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <GripVertical size={18} className="text-gray-400" />
                  <div>
                    <div className="font-medium">{field.label}</div>
                    <div className="text-sm text-gray-600">
                      Type: {field.field_type} {field.is_required && '• Required'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteField(field.id!)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-gray-500 text-center py-4">No fields yet. Add your first field above.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'submissions') {
    const form = forms.find(f => f.id === selectedForm);
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedForm(null);
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            ← Back to Forms
          </button>
          {submissions.length > 0 && (
            <button
              onClick={exportSubmissions}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
            >
              <Download size={18} /> Export CSV
            </button>
          )}
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Submissions: {form?.name}</h3>
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(submission.submitted_at).toLocaleString()}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(submission.responses).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium text-sm">{key}:</span>
                      <span className="ml-2 text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {submissions.length === 0 && (
              <p className="text-gray-500 text-center py-8">No submissions yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Registration Forms</h2>
        <button
          onClick={() => {
            setFormData({
              name: '',
              description: '',
              success_message: 'Thank you for registering!',
              is_active: true,
            });
            setSelectedForm(null);
            setViewMode('edit');
          }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <Plus size={20} /> Create Form
        </button>
      </div>

      <div className="grid gap-4">
        {forms.map((form) => (
          <div key={form.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{form.name}</h3>
                <p className="text-sm text-gray-600">{form.description}</p>
                {form.is_active && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    Active
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewSubmissions(form.id!)}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded"
                  title="View Submissions"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => handleManageFields(form.id!)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Manage Fields"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleEditForm(form)}
                  className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                  title="Edit Form"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteForm(form.id!)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete Form"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {forms.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500">No forms yet. Create your first registration form!</p>
          </div>
        )}
      </div>
    </div>
  );
}
