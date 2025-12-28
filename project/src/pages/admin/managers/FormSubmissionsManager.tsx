import { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Eye, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface Form {
  id: string;
  name: string;
}

interface Submission {
  id: string;
  form_id: string;
  program_id: string | null;
  course_id: string | null;
  event_id: string | null;
  responses: Record<string, any>;
  submitted_at: string;
  registration_forms?: { name: string };
}

export default function FormSubmissionsManager() {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const itemsPerPage = 50;

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedFormId) {
      loadSubmissions();
      setSelectedIds(new Set());
    }
  }, [selectedFormId, currentPage]);

  const loadForms = async () => {
    const { data } = await supabase
      .from('registration_forms')
      .select('id, name')
      .order('name');

    if (data) {
      setForms(data);
      if (data.length > 0 && !selectedFormId) {
        setSelectedFormId(data[0].id);
      }
    }
  };

  const loadSubmissions = async () => {
    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, count } = await supabase
      .from('form_submissions')
      .select('*, registration_forms(name)', { count: 'exact' })
      .eq('form_id', selectedFormId)
      .order('submitted_at', { ascending: false })
      .range(from, to);

    if (data) {
      setSubmissions(data);
    }
    if (count !== null) {
      setTotalCount(count);
    }
  };

  const getUniqueFieldNames = (): string[] => {
    const fieldNames = new Set<string>();
    submissions.forEach(submission => {
      Object.keys(submission.responses || {}).forEach(key => fieldNames.add(key));
    });
    return Array.from(fieldNames);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(submissions.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    const { error } = await supabase
      .from('form_submissions')
      .delete()
      .eq('id', id);

    if (!error) {
      loadSubmissions();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.size} submission(s)?`)) return;

    const { error } = await supabase
      .from('form_submissions')
      .delete()
      .in('id', Array.from(selectedIds));

    if (!error) {
      setSelectedIds(new Set());
      loadSubmissions();
    }
  };

  const handleEdit = (submission: Submission) => {
    setEditingSubmission(submission);
    setEditFormData({ ...submission.responses });
  };

  const handleSaveEdit = async () => {
    if (!editingSubmission) return;

    const { error } = await supabase
      .from('form_submissions')
      .update({ responses: editFormData })
      .eq('id', editingSubmission.id);

    if (!error) {
      setEditingSubmission(null);
      setEditFormData({});
      loadSubmissions();
    }
  };

  const downloadCSV = async (selectedOnly: boolean = false) => {
    let data;

    if (selectedOnly && selectedIds.size > 0) {
      const result = await supabase
        .from('form_submissions')
        .select('*, registration_forms(name)')
        .in('id', Array.from(selectedIds))
        .order('submitted_at', { ascending: false });
      data = result.data;
    } else {
      const result = await supabase
        .from('form_submissions')
        .select('*, registration_forms(name)')
        .eq('form_id', selectedFormId)
        .order('submitted_at', { ascending: false });
      data = result.data;
    }

    if (!data || data.length === 0) return;

    const allKeys = new Set<string>();
    data.forEach(submission => {
      Object.keys(submission.responses || {}).forEach(key => allKeys.add(key));
    });

    const headers = ['Submission ID', 'Form Name', 'Submitted At', ...Array.from(allKeys)];

    const rows = data.map(submission => {
      const row: string[] = [
        submission.id,
        submission.registration_forms?.name || 'N/A',
        new Date(submission.submitted_at).toLocaleString(),
      ];

      allKeys.forEach(key => {
        const value = submission.responses[key];
        if (Array.isArray(value)) {
          row.push(value.join('; '));
        } else {
          row.push(value?.toString() || '');
        }
      });

      return row;
    });

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const filename = selectedOnly ? 'selected-submissions' : 'all-submissions';
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const allSelected = submissions.length > 0 && selectedIds.size === submissions.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Form Submissions</h2>
        <div className="flex gap-3">
          {selectedIds.size > 0 && (
            <>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 size={20} />
                Delete Selected ({selectedIds.size})
              </button>
              <button
                onClick={() => downloadCSV(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Download size={20} />
                Download Selected
              </button>
            </>
          )}
          {submissions.length > 0 && (
            <button
              onClick={() => downloadCSV(false)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Download size={20} />
              Download All
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Form
          </label>
          <select
            value={selectedFormId}
            onChange={(e) => {
              setSelectedFormId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name}
              </option>
            ))}
          </select>
        </div>

        {selectedFormId && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Total Submissions: {totalCount}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                      Submitted At
                    </th>
                    {getUniqueFieldNames().map((fieldName) => (
                      <th key={fieldName} className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {fieldName}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky right-0 bg-gray-50 z-10">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b group hover:bg-gray-50">
                      <td className="px-4 py-3 sticky left-0 bg-white group-hover:bg-gray-50 z-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(submission.id)}
                          onChange={(e) => handleSelectOne(submission.id, e.target.checked)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(submission.submitted_at)}
                      </td>
                      {getUniqueFieldNames().map((fieldName) => {
                        const value = submission.responses[fieldName];
                        return (
                          <td key={fieldName} className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={Array.isArray(value) ? value.join(', ') : value?.toString()}>
                              {Array.isArray(value) ? value.join(', ') : value?.toString() || '-'}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-gray-50 z-10">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedSubmission(submission)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm whitespace-nowrap"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <button
                            onClick={() => handleEdit(submission)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm whitespace-nowrap"
                          >
                            <Edit2 size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(submission.id)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm whitespace-nowrap"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {submissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No submissions yet for this form.
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 pb-4 border-b">
                <div className="text-sm text-gray-600">
                  Submitted: {formatDate(selectedSubmission.submitted_at)}
                </div>
                <div className="text-sm text-gray-600">
                  Form: {selectedSubmission.registration_forms?.name}
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(selectedSubmission.responses).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-sm font-semibold text-gray-700 mb-1">{key}</div>
                    <div className="text-gray-900 bg-gray-50 p-3 rounded">
                      {Array.isArray(value) ? value.join(', ') : value?.toString() || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {editingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Edit Submission</h3>
              <button
                onClick={() => {
                  setEditingSubmission(null);
                  setEditFormData({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 pb-4 border-b">
                <div className="text-sm text-gray-600">
                  Submitted: {formatDate(editingSubmission.submitted_at)}
                </div>
                <div className="text-sm text-gray-600">
                  Form: {editingSubmission.registration_forms?.name}
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(editFormData).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {key}
                    </label>
                    {Array.isArray(value) ? (
                      <input
                        type="text"
                        value={value.join(', ')}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          [key]: e.target.value.split(',').map(v => v.trim())
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    ) : (
                      <input
                        type="text"
                        value={value?.toString() || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          [key]: e.target.value
                        })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditingSubmission(null);
                    setEditFormData({});
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
