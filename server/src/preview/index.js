/**
 * Preview Module - Main Entry Point
 * Provides template preview, sample data generation, and export capabilities.
 */

export {
  renderPreview,
  renderPreviewFragment,
  renderPreviewScaled,
  renderGallery
} from './renderer.js';

export {
  sampleData,
  getSampleDataForTemplate,
  getSampleDataForSport,
  flattenData,
  setNestedValue,
  getAvailableSports
} from './sampleData.js';

export {
  generatePreviewPage
} from './previewPage.js';

export {
  exportAsHTML,
  exportForOBS,
  exportForVMix,
  exportForWirecast,
  exportAsImageHTML,
  exportAsGallery
} from './exporter.js';
