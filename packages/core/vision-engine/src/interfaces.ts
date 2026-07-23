// ─── Vision Engine Interfaces ─────────────────────────────────────────────────
// Sprint 08 - @jarbas/vision-engine
// Comprehensive type definitions for the Vision AI Platform

// ─── Vision Provider ─────────────────────────────────────────────────────────

export type VisionProviderType =
  | 'gpt-vision'
  | 'gemini-vision'
  | 'claude-vision'
  | 'qwen-vl'
  | 'llama-vision'
  | 'florence'
  | 'paddleocr'
  | 'tesseract'
  | 'easyocr';

export interface IVisionProvider {
  readonly id: string;
  readonly name: string;
  readonly type: VisionProviderType;
  readonly capabilities: VisionCapability[];
  readonly isAvailable: boolean;
  readonly priority: number;

  analyzeImage(request: VisionAnalysisRequest): Promise<VisionAnalysisResult>;
  analyzeBatch(requests: VisionAnalysisRequest[]): Promise<VisionAnalysisResult[]>;
  getHealth(): Promise<VisionProviderHealth>;
}

export type VisionCapability =
  | 'image-analysis'
  | 'document-analysis'
  | 'ocr'
  | 'object-detection'
  | 'face-detection'
  | 'scene-understanding'
  | 'video-analysis'
  | 'barcode-reading'
  | 'qr-reading'
  | 'text-extraction'
  | 'table-extraction'
  | 'chart-reading'
  | 'handwriting'
  | 'diagram-analysis'
  | 'architecture-analysis'
  | 'screenshot-analysis'
  | 'ui-analysis';

export interface VisionProviderHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  latencyMs: number;
  quotaRemaining?: number;
  lastChecked: Date;
  error?: string;
}

// ─── Vision Analysis ─────────────────────────────────────────────────────────

export type ImageFormat = 'jpeg' | 'png' | 'gif' | 'webp' | 'bmp' | 'tiff' | 'svg';
export type VideoFormat = 'mp4' | 'mov' | 'avi' | 'mkv' | 'webm';
export type DocumentFormat = 'pdf' | 'docx' | 'pptx' | 'xlsx' | 'txt' | 'html' | 'md';

export interface VisionAnalysisRequest {
  id: string;
  source: VisionSource;
  analysisType: VisionAnalysisType[];
  options?: VisionAnalysisOptions;
  context?: string;
  metadata?: Record<string, unknown>;
}

export type VisionSource =
  | { type: 'image'; data: Buffer; format: ImageFormat; url?: string }
  | { type: 'url'; url: string }
  | { type: 'base64'; data: string; mimeType: string }
  | { type: 'video'; data: Buffer; format: VideoFormat }
  | { type: 'document'; data: Buffer; format: DocumentFormat };

export type VisionAnalysisType =
  | 'describe'
  | 'ocr'
  | 'objects'
  | 'faces'
  | 'scene'
  | 'document'
  | 'diagram'
  | 'architecture'
  | 'screenshot'
  | 'ui'
  | 'handwriting'
  | 'tables'
  | 'charts'
  | 'barcode'
  | 'qr'
  | 'emotions'
  | 'metadata'
  | 'security';

export interface VisionAnalysisOptions {
  language?: string;
  detailed?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: 'low' | 'medium' | 'high';
  confidenceThreshold?: number;
  maxObjects?: number;
  includeConfidence?: boolean;
  includeBoundingBoxes?: boolean;
  includeMetadata?: boolean;
  customPrompt?: string;
}

export interface VisionAnalysisResult {
  id: string;
  requestId: string;
  success: boolean;
  timestamp: Date;
  provider: string;
  latencyMs: number;

  image?: ImageAnalysis;
  ocr?: OCRResult;
  objects?: DetectedObject[];
  faces?: DetectedFace[];
  scene?: SceneDescription;
  document?: DocumentAnalysis;
  diagram?: DiagramAnalysis;
  architecture?: ArchitectureAnalysis;
  screenshot?: ScreenshotAnalysis;
  ui?: UIAnalysis;
  handwriting?: HandwritingResult;
  tables?: ExtractedTable[];
  charts?: ChartAnalysis[];
  barcode?: BarcodeResult[];
  qr?: QRResult[];
  emotions?: EmotionResult[];
  metadata?: ImageMetadata;
  security?: SecurityAnalysis;

  tokensUsed?: number;
  cost?: number;
  error?: string;
}

// ─── Image Analysis ──────────────────────────────────────────────────────────

export interface ImageAnalysis {
  description: string;
  summary: string;
  tags: string[];
  category: ImageCategory;
  dominantColors: ColorInfo[];
  composition?: CompositionInfo;
  quality?: ImageQuality;
  textRegions?: TextRegion[];
}

export type ImageCategory =
  | 'photograph'
  | 'screenshot'
  | 'diagram'
  | 'chart'
  | 'document'
  | 'logo'
  | 'illustration'
  | 'map'
  | 'technical-drawing'
  | 'architecture'
  | 'mixed';

export interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  percentage: number;
  name?: string;
}

export interface CompositionInfo {
  aspectRatio: number;
  orientation: 'landscape' | 'portrait' | 'square';
  hasText: boolean;
  hasBorder: boolean;
  backgroundType: 'solid' | 'gradient' | 'complex';
}

export interface ImageQuality {
  resolution: { width: number; height: number };
  dpi?: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  noise?: number;
  overallScore: number;
}

// ─── OCR ─────────────────────────────────────────────────────────────────────

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
  regions: OCRRegion[];
  structuredText?: StructuredText;
  tables?: ExtractedTable[];
  forms?: ExtractedForm[];
  signatures?: SignatureRegion[];
  barcodes?: BarcodeResult[];
  qrcodes?: QRResult[];
}

export interface OCRRegion {
  id: string;
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'code' | 'caption';
  language?: string;
}

export interface StructuredText {
  title?: string;
  headings: { level: number; text: string }[];
  paragraphs: string[];
  lists: string[][];
  footnotes?: string[];
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface TextRegion {
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface ExtractedTable {
  id: string;
  rows: number;
  columns: number;
  cells: TableCell[][];
  headers?: string[];
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface TableCell {
  text: string;
  confidence: number;
  rowSpan?: number;
  colSpan?: number;
  isHeader?: boolean;
}

export interface ExtractedForm {
  fields: FormField[];
  confidence: number;
}

export interface FormField {
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'select';
  boundingBox?: BoundingBox;
  confidence: number;
}

export interface SignatureRegion {
  id: string;
  boundingBox: BoundingBox;
  confidence: number;
  text?: string;
}

// ─── Object Detection ────────────────────────────────────────────────────────

export interface DetectedObject {
  id: string;
  label: string;
  category: ObjectCategory;
  confidence: number;
  boundingBox: BoundingBox;
  attributes?: Record<string, string>;
  trackingId?: string;
}

export type ObjectCategory =
  | 'person'
  | 'vehicle'
  | 'computer'
  | 'mobile'
  | 'document'
  | 'furniture'
  | 'equipment'
  | 'product'
  | 'animal'
  | 'food'
  | 'plant'
  | 'building'
  | 'sign'
  | 'other';

// ─── Face Detection ──────────────────────────────────────────────────────────

export interface DetectedFace {
  id: string;
  boundingBox: BoundingBox;
  confidence: number;
  age?: AgeRange;
  gender?: string;
  attributes?: FaceAttributes;
  landmarks?: FaceLandmark[];
}

export interface AgeRange {
  min: number;
  max: number;
  estimated: number;
}

export interface FaceAttributes {
  glasses: boolean;
  hat: boolean;
  mask: boolean;
  beard: boolean;
  smile: boolean;
  eyesOpen: boolean;
  mouthOpen: boolean;
}

export interface FaceLandmark {
  type: string;
  x: number;
  y: number;
}

// ─── Emotion Detection ───────────────────────────────────────────────────────

export interface EmotionResult {
  faceId: string;
  emotions: EmotionScore[];
  dominant: string;
  confidence: number;
}

export interface EmotionScore {
  emotion: string;
  score: number;
}

// ─── Scene Understanding ─────────────────────────────────────────────────────

export interface SceneDescription {
  summary: string;
  detailed: string;
  context: string;
  setting: SceneSetting;
  activity?: string;
  timeOfDay?: string;
  weather?: string;
  location?: string;
  peopleCount: number;
  relevantObjects: string[];
  potentialRisks: string[];
  confidence: number;
  followUpQuestions?: string[];
}

export type SceneSetting =
  | 'indoor'
  | 'outdoor'
  | 'vehicle'
  | 'mixed'
  | 'unknown';

// ─── Document Analysis ───────────────────────────────────────────────────────

export interface DocumentAnalysis {
  type: DocumentType;
  title?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  language: string;
  pageCount?: number;
  wordCount: number;
  structure: DocumentStructure;
  content: DocumentContent;
  metadata?: Record<string, unknown>;
}

export type DocumentType =
  | 'report'
  | 'invoice'
  | 'receipt'
  | 'contract'
  | 'letter'
  | 'memo'
  | 'presentation'
  | 'spreadsheet'
  | 'resume'
  | 'certificate'
  | 'other';

export interface DocumentStructure {
  headings: { level: number; text: string }[];
  sections: string[];
  hasTableOfContents: boolean;
  hasReferences: boolean;
  hasAppendix: boolean;
}

export interface DocumentContent {
  summary: string;
  keyPoints: string[];
  entities: DocumentEntity[];
  sentiment?: string;
  topics?: string[];
}

export interface DocumentEntity {
  text: string;
  type: 'person' | 'organization' | 'location' | 'date' | 'amount' | 'other';
  confidence: number;
}

// ─── Diagram Analysis ────────────────────────────────────────────────────────

export interface DiagramAnalysis {
  type: DiagramType;
  title?: string;
  elements: DiagramElement[];
  connections: DiagramConnection[];
  description: string;
  documentation?: string;
  suggestedImprovements?: string[];
}

export type DiagramType =
  | 'uml'
  | 'bpmn'
  | 'flowchart'
  | 'erd'
  | 'mermaid'
  | 'architecture'
  | 'orgchart'
  | 'sequence'
  | 'class'
  | 'other';

export interface DiagramElement {
  id: string;
  type: string;
  label: string;
  boundingBox: BoundingBox;
  attributes?: Record<string, string>;
}

export interface DiagramConnection {
  source: string;
  target: string;
  label?: string;
  type: 'solid' | 'dashed' | 'dotted' | 'arrow';
}

// ─── Architecture Analysis ───────────────────────────────────────────────────

export interface ArchitectureAnalysis {
  type: ArchitectureType;
  summary: string;
  rooms: RoomInfo[];
  objects: string[];
  measures?: MeasureInfo[];
  recommendations?: string[];
  safetyIssues?: string[];
}

export type ArchitectureType =
  | 'floor-plan'
  | 'electrical'
  | 'hydraulic'
  | 'commercial'
  | 'residential'
  | 'industrial'
  | 'other';

export interface RoomInfo {
  name: string;
  type: string;
  area?: number;
  boundingBox?: BoundingBox;
  features?: string[];
}

export interface MeasureInfo {
  label: string;
  value: number;
  unit: string;
  location?: BoundingBox;
}

// ─── Screenshot Analysis ─────────────────────────────────────────────────────

export interface ScreenshotAnalysis {
  platform: 'web' | 'mobile' | 'desktop' | 'unknown';
  application?: string;
  description: string;
  components: UIComponent[];
  messages?: ScreenMessage[];
  suggestions?: string[];
}

export interface UIComponent {
  type: string;
  label?: string;
  boundingBox: BoundingBox;
  interactive: boolean;
  state?: string;
}

export interface ScreenMessage {
  type: 'error' | 'warning' | 'info' | 'success';
  text: string;
  source?: string;
}

// ─── UI Analysis ─────────────────────────────────────────────────────────────

export interface UIAnalysis {
  framework?: string;
  designSystem?: string;
  accessibility: AccessibilityInfo;
  layout: LayoutInfo;
  components: UIComponent[];
  issues?: UIIssue[];
  suggestions?: string[];
}

export interface AccessibilityInfo {
  score: number;
  issues: string[];
  colorContrast?: number;
  fontSize?: number;
}

export interface LayoutInfo {
  type: string;
  responsive: boolean;
  navigation: string;
  sidebar: boolean;
  header: boolean;
  footer: boolean;
}

export interface UIIssue {
  type: 'accessibility' | 'performance' | 'ux' | 'design';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

// ─── Handwriting ─────────────────────────────────────────────────────────────

export interface HandwritingResult {
  text: string;
  confidence: number;
  language: string;
  style?: string;
  regions: HandwritingRegion[];
}

export interface HandwritingRegion {
  id: string;
  text: string;
  confidence: number;
  boundingBox: BoundingBox;
}

// ─── Chart Reading ───────────────────────────────────────────────────────────

export interface ChartAnalysis {
  type: ChartType;
  title?: string;
  description: string;
  dataPoints: DataPoint[];
  axes?: AxesInfo;
  legend?: string[];
  insights?: string[];
}

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'scatter'
  | 'area'
  | 'heatmap'
  | 'treemap'
  | 'other';

export interface DataPoint {
  label: string;
  value: number;
  category?: string;
  x?: number;
  y?: number;
}

export interface AxesInfo {
  xLabel?: string;
  yLabel?: string;
  xRange?: { min: number; max: number };
  yRange?: { min: number; max: number };
}

// ─── Barcode & QR ────────────────────────────────────────────────────────────

export interface BarcodeResult {
  type: string;
  format: string;
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

export interface QRResult {
  value: string;
  type: 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'other';
  confidence: number;
  boundingBox?: BoundingBox;
  parsed?: Record<string, string>;
}

// ─── Video Analysis ──────────────────────────────────────────────────────────

export interface VideoAnalysis {
  duration: number;
  resolution: { width: number; height: number };
  fps: number;
  format: string;
  frames: VideoFrame[];
  scenes: SceneChange[];
  objects: VideoObject[];
  people: VideoPerson[];
  summary?: string;
  transcript?: string;
}

export interface VideoFrame {
  timestamp: number;
  image: string;
  objects: DetectedObject[];
  scene?: SceneDescription;
}

export interface SceneChange {
  timestamp: number;
  type: 'cut' | 'fade' | 'dissolve' | 'wipe';
  fromScene?: string;
  toScene?: string;
}

export interface VideoObject {
  label: string;
  firstSeen: number;
  lastSeen: number;
  frameCount: number;
  trajectory?: { x: number; y: number; timestamp: number }[];
}

export interface VideoPerson {
  id: string;
  firstSeen: number;
  lastSeen: number;
  appearance?: string;
  action?: string;
}

// ─── Frame Extraction ────────────────────────────────────────────────────────

export interface FrameExtractionResult {
  totalFrames: number;
  extractedFrames: ExtractedFrame[];
  keyFrames: number[];
  scenes: SceneChange[];
}

export interface ExtractedFrame {
  index: number;
  timestamp: number;
  image: string;
  isKeyFrame: boolean;
  quality: number;
}

// ─── Metadata ────────────────────────────────────────────────────────────────

export interface ImageMetadata {
  format: string;
  size: { width: number; height: number };
  dpi?: number;
  colorSpace?: string;
  bitDepth?: number;
  hasAlpha?: boolean;
  exif?: EXIFData;
  iptc?: Record<string, string>;
  xmp?: Record<string, string>;
  file?: FileInfo;
}

export interface EXIFData {
  camera?: string;
  lens?: string;
  focalLength?: number;
  aperture?: number;
  shutterSpeed?: string;
  iso?: number;
  dateTaken?: Date;
  gps?: { latitude: number; longitude: number };
  orientation?: number;
}

export interface FileInfo {
  name: string;
  size: number;
  created: Date;
  modified: Date;
  mimeType: string;
}

// ─── Image Search ────────────────────────────────────────────────────────────

export interface ImageSearchRequest {
  query?: string;
  image?: Buffer;
  tags?: string[];
  category?: ImageCategory;
  limit?: number;
  offset?: number;
}

export interface ImageSearchResult {
  id: string;
  url: string;
  description: string;
  score: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

// ─── Prompt Generation ───────────────────────────────────────────────────────

export interface VisionPrompt {
  system: string;
  user: string;
  images: { data: string; mimeType: string }[];
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userTemplate: string;
  analysisTypes: VisionAnalysisType[];
}

// ─── Security ────────────────────────────────────────────────────────────────

export interface SecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  issues: SecurityIssue[];
  piiDetected: PIIInfo[];
  contentWarnings: string[];
  safeForWork: boolean;
  malwareIndicators?: string[];
}

export interface SecurityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  location?: BoundingBox;
}

export interface PIIInfo {
  type: 'name' | 'email' | 'phone' | 'address' | 'document' | 'other';
  value: string;
  confidence: number;
  boundingBox?: BoundingBox;
}

// ─── Analytics & Monitoring ──────────────────────────────────────────────────

export interface VisionMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatencyMs: number;
  totalTokensUsed: number;
  totalCost: number;
  requestsByType: Record<VisionAnalysisType, number>;
  requestsByProvider: Record<string, number>;
  errorsByType: Record<string, number>;
  uptime: number;
}

export interface VisionError {
  id: string;
  timestamp: Date;
  type: string;
  message: string;
  provider?: string;
  requestId?: string;
  stack?: string;
}

export interface VisionHealth {
  status: 'healthy' | 'degraded' | 'unavailable';
  providers: { id: string; status: string; latencyMs: number }[];
  uptime: number;
  lastError?: VisionError;
}

// ─── Vision AI Config ────────────────────────────────────────────────────────

export interface VisionEngineConfig {
  providers: ProviderConfig[];
  defaultProvider: string;
  defaultLanguage: string;
  security: SecurityConfig;
  analytics: AnalyticsConfig;
  storage?: StorageConfig;
}

export interface ProviderConfig {
  id: string;
  type: VisionProviderType;
  apiKey: string;
  baseUrl?: string;
  priority: number;
  capabilities: VisionCapability[];
  rateLimit?: number;
  timeout?: number;
}

export interface SecurityConfig {
  enablePIIDetection: boolean;
  enableContentFiltering: boolean;
  enableMalwareDetection: boolean;
  safeSearch?: boolean;
  maxFileSize: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  storeResults: boolean;
  retentionDays: number;
}

export interface StorageConfig {
  type: 'local' | 's3' | 'gcs';
  bucket?: string;
  path?: string;
}

// ─── Vision API ──────────────────────────────────────────────────────────────

export interface VisionAPIConfig {
  port: number;
  host: string;
  cors: boolean;
  rateLimit: number;
  maxFileSize: number;
}
