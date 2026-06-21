const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') {
      qs.set(k, v);
    }
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

export async function fetchTemplates(filters = {}) {
  const query = buildQuery(filters);
  const res = await fetch(`${API}/api/templates${query}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch templates');
  return res.json();
}

export async function fetchTemplate(id) {
  const res = await fetch(`${API}/api/templates/${id}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch template');
  return res.json();
}

export async function createTemplate(data) {
  const res = await fetch(`${API}/api/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create template');
  return res.json();
}

export async function updateTemplate(id, data) {
  const res = await fetch(`${API}/api/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update template');
  return res.json();
}

export async function deleteTemplate(id) {
  const res = await fetch(`${API}/api/templates/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
}

export async function duplicateTemplate(id) {
  const res = await fetch(`${API}/api/templates/${id}/duplicate`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to duplicate template');
  return res.json();
}

export async function importTemplate(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API}/api/templates/import`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
    body: formData
  });
  if (!res.ok) throw new Error('Failed to import template');
  return res.json();
}

export async function importTemplateFromJson(jsonData) {
  const res = await fetch(`${API}/api/templates/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(jsonData)
  });
  if (!res.ok) throw new Error('Failed to import template');
  return res.json();
}

export async function importTemplateFromUrl(url) {
  const res = await fetch(`${API}/api/templates/import-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ url })
  });
  if (!res.ok) throw new Error('Failed to import template from URL');
  return res.json();
}

export async function exportTemplate(id, format = 'json') {
  const res = await fetch(`${API}/api/templates/${id}/export?format=${format}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to export template');

  if (format === 'json') {
    return res.json();
  }
  return res.text();
}

export async function fetchTemplateVersions(id) {
  const res = await fetch(`${API}/api/templates/${id}/versions`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch versions');
  return res.json();
}

export async function restoreTemplateVersion(id, versionId) {
  const res = await fetch(`${API}/api/templates/${id}/versions/${versionId}/restore`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to restore version');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API}/api/template-categories`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createCategory(data) {
  const res = await fetch(`${API}/api/template-categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function updateCategory(id, data) {
  const res = await fetch(`${API}/api/template-categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
}

export async function deleteCategory(id) {
  const res = await fetch(`${API}/api/template-categories/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return res.json();
}

export async function getShareLink(id) {
  const res = await fetch(`${API}/api/templates/${id}/share`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to get share link');
  return res.json();
}

export async function getEmbedCode(id) {
  const res = await fetch(`${API}/api/templates/${id}/embed`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to get embed code');
  return res.json();
}
