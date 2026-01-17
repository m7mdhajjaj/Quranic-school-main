/**
 * 📖 Quran Services - Main Export
 */

const QuranImportService = require('./QuranImportService');
const QuranRAGService = require('./QuranRAGService');
const TafsirRAGService = require('./TafsirRAGService');
const EmbeddingsService = require('./EmbeddingsService');

module.exports = {
  QuranImportService,
  QuranRAGService,
  TafsirRAGService,
  EmbeddingsService
};
