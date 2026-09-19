// Project & Portfolio Case Study Model Definition and Formatting

/**
 * Validate and format an incoming Project document for MongoDB storage
 */
export function formatProjectDoc(data, existing = null) {
  const nowIso = new Date().toISOString();
  const id = data.id || existing?.id || `proj-${Date.now()}`;

  // Sanitize gallery items ensuring unique ID and proper grid structure
  const galleryItems = Array.isArray(data.galleryItems)
    ? data.galleryItems.map((item, idx) => ({
        id: item.id || `gal-${Date.now()}-${idx + 1}`,
        title: (item.title || `Mockup ${idx + 1}`).trim(),
        cat: item.cat || 'Desktop',
        kind: item.kind || 'desktop',
        tone: item.tone || 'ink',
        c: Number(item.c) || 6,
        r: Number(item.r) || 3,
        src: item.src || '',
        note: (item.note || '').trim()
      }))
    : (existing?.galleryItems || []);

  // Sanitize metric cards
  const metrics = Array.isArray(data.metrics)
    ? data.metrics.map(m => ({
        label: (m.label || '').trim(),
        value: (m.value || '').trim()
      }))
    : (existing?.metrics || []);

  return {
    id,
    title: (data.title || existing?.title || 'Untitled Case Study').trim(),
    client: (data.client || existing?.client || '').trim(),
    category: (data.category || existing?.category || 'SaaS & AI').trim(),
    year: String(data.year || existing?.year || new Date().getFullYear()),
    tagline: (data.tagline || existing?.tagline || '').trim(),
    result: (data.result || existing?.result || '').trim(),
    roiStat: (data.roiStat || existing?.roiStat || '').trim(),
    roiLabel: (data.roiLabel || existing?.roiLabel || '').trim(),
    liveUrl: (data.liveUrl || existing?.liveUrl || '').trim(),
    deliverables: Array.isArray(data.deliverables)
      ? data.deliverables
      : (existing?.deliverables || ["UX Strategy", "Bespoke Design", "React Build"]),
    image: data.image || existing?.image || '',
    mockups: Array.isArray(data.mockups)
      ? data.mockups
      : (existing?.mockups || (data.image ? [data.image] : [])),
    galleryItems,
    problem: (data.problem || existing?.problem || '').trim(),
    solution: (data.solution || existing?.solution || '').trim(),
    metrics,
    quote: data.quote ? {
      text: (data.quote.text || '').trim(),
      author: (data.quote.author || '').trim(),
      title: (data.quote.title || '').trim()
    } : (existing?.quote || null),
    featured: Boolean(data.featured !== undefined ? data.featured : existing?.featured),
    order: data.order !== undefined ? Number(data.order) : (existing?.order || 1),
    createdAt: existing?.createdAt || data.createdAt || nowIso,
    updatedAt: nowIso
  };
}

export default {
  formatProjectDoc
};
