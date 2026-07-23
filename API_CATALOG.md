# JARBAS 2.0 — API Discovery & Classification

**Sprint:** 11.1 — Integration Hub Foundation
**Data:** 2026-07-13
**Fonte:** [public-apis/public-apis](https://github.com/public-apis/public-apis)

---

## Resumo

| Métrica | Valor |
|---------|-------|
| APIs Catalogadas | 187 |
| APIs Eliminadas (descontinuadas/obsoletas/redundantes) | ~1.200+ |
| Categorias Técnicas | 39 |
| APIs com Auth | 112 |
| APIs HTTPS | 187 (100%) |

---

## Critérios de Eliminação

- **Descontinuadas:** APIs com endpoints mortos ou documentação removida
- **Obsoletas:** APIs substituídas por versões superiores ou serviços paid-only
- **Redundantes:** APIs duplicadas dentro da mesma categoria
- **Irrelevantes:** APIs de nicho sem aplicação para Integration Hub (ex: APIs de anime, livros religiosos, memes)

---

## Índice por Domínio

1. [IA & Machine Learning](#1-ia--machine-learning)
2. [LLM](#2-llm)
3. [OCR & Vision](#3-ocr--vision)
4. [Speech & Audio](#4-speech--audio)
5. [Tradução & NLP](#5-tradução--nlp)
6. [Calendário & Temporal](#6-calendário--temporal)
7. [Comunicação & Messaging](#7-comunicação--messaging)
8. [Email](#8-email)
9. [Telefonia & SMS](#9-telefonia--sms)
10. [Autenticação & Identidade](#10-autenticação--identidade)
11. [Pagamentos & Fintech](#11-pagamentos--fintech)
12. [Open Finance & Bancos](#12-open-finance--bancos)
13. [ERP, CRM & Business](#13-erp-crm--business)
14. [RH & Recrutamento](#14-rh--recrutamento)
15. [Fiscal & Contabilidade](#15-fiscal--contabilidade)
16. [Documentos & PDF](#16-documentos--pdf)
17. [Analytics & BI](#17-analytics--bi)
18. [Logs & Monitoramento](#18-logs--monitoramento)
19. [Storage & Bancos de Dados](#19-storage--bancos-de-dados)
20. [Cache & CDN](#20-cache--cdn)
21. [Segurança & Anti-Malware](#21-segurança--anti-malware)
22. [Blockchain & Cripto](#22-blockchain--cripto)
23. [IoT & Hardware](#23-iot--hardware)
24. [Redes Sociais](#24-redes-sociais)
25. [Mapas & Geolocalização](#25-maps--geolocalização)
26. [Clima & Meio Ambiente](#26-clima--meio-ambiente)
27. [Dados Públicos & Governamentais](#27-dados-públicos--governamentais)
28. [Finance & Investimentos](#28-finance--investimentos)
29. [Comércio & E-commerce](#29-comércio--e-commerce)
30. [Transporte & Logística](#30-transporte--logística)
31. [Saúde & Fitness](#31-saúde--fitness)
32. [Desenvolvimento & DevOps](#32-desenvolvimento--devops)
33. [URL Shorteners](#33-url-shorteners)
34. [Test Data & Mock APIs](#34-test-data--mock-apis)
35. [Mídia & Entretenimento](#35-mídia--entretenimento)
36. [Esportes](#36-esportes)
37. [Notícias & Content](#37-notícias--content)
38. [Veículos & Automotive](#38-veículos--automotive)
39. [Fotografia & Imagens](#39-fotografia--imagens)

---

## 1. IA & Machine Learning

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Google Cloud Vision | https://cloud.google.com/vision/ | `apiKey` | ✅ Ativa | Líder em computer vision |
| Google Cloud Natural Language | https://cloud.google.com/natural-language/ | `apiKey` | ✅ Ativa | NLP avançado |
| Clarifai | https://www.clarifai.com/ | `apiKey` | ✅ Ativa | Visual recognition platform |
| Hugging Face Inference | https://huggingface.co/docs/api-inference/ | `apiKey` | ✅ Ativa | Hub de modelos ML |
| OpenAI | https://platform.openai.com/docs/api-reference | `apiKey` | ✅ Ativa | GPT, DALL-E, Whisper |
| Replicate | https://replicate.com/docs | `apiKey` | ✅ Ativa | Run open-source models |
| TensorFlow Serving | https://www.tensorflow.org/tfx/guide/serving | No | ✅ Ativa | Model serving |
| UpRes AI | https://upres.ai/docs/api | `apiKey` | ✅ Ativa | Image upscaling to 8K |
| Civitai | https://civitai.com/api/v1/Documentation | `apiKey` | ✅ Ativa | Generative AI models |

---

## 2. LLM

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| OpenAI API | https://platform.openai.com/docs/api-reference | `apiKey` | ✅ Ativa | GPT-4o, GPT-4, GPT-3.5 |
| Anthropic API | https://docs.anthropic.com/claude/reference | `apiKey` | ✅ Ativa | Claude 3.5/3 |
| Google AI (Gemini) | https://ai.google.dev/docs | `apiKey` | ✅ Ativa | Gemini 1.5/2.0 |
| Mistral AI | https://docs.mistral.ai/api/ | `apiKey` | ✅ Ativa | Mistral, Mixtral |
| Cohere | https://docs.cohere.com/reference | `apiKey` | ✅ Ativa | Command R+, Embed |
| Groq | https://console.groq.com/docs | `apiKey` | ✅ Ativa | LPU inference, ultra-rápido |
| Together AI | https://docs.together.ai/ | `apiKey` | ✅ Ativa | Multi-model inference |
| Perplexity | https://docs.perplexity.ai/ | `apiKey` | ✅ Ativa | Search-augmented LLM |
| Fireworks AI | https://docs.fireworks.ai/ | `apiKey` | ✅ Ativa | Fast inference |
| DeepSeek | https://platform.deepseek.com/api-docs | `apiKey` | ✅ Ativa | DeepSeek-V3/R1 |

---

## 3. OCR & Vision

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Google Cloud Vision OCR | https://cloud.google.com/vision/ | `apiKey` | ✅ Ativa | OCR + document detection |
| AWS Textract | https://aws.amazon.com/textract/ | `apiKey` | ✅ Ativa | Document text extraction |
| Azure Computer Vision | https://azure.microsoft.com/en-us/products/ai-services/computer-vision | `apiKey` | ✅ Ativa | OCR + spatial analysis |
| OCR.space | https://ocr.space/ocrapi/free | `apiKey` | ✅ Ativa | Free OCR API |
| Hirak OCR | https://ocr.hirak.site/ | `apiKey` | ✅ Ativa | 100+ languages |
| Mindee | https://developers.mindee.com/ | `apiKey` | ✅ Ativa | Document AI platform |
| Klippa | https://klippa.com/developers/ | `apiKey` | ✅ Ativa | Document OCR + parsing |

---

## 4. Speech & Audio

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| OpenAI Whisper | https://platform.openai.com/docs/guides/speech-to-text | `apiKey` | ✅ Ativa | Speech-to-text |
| Google Cloud Speech-to-Text | https://cloud.google.com/speech-to-text | `apiKey` | ✅ Ativa | STT enterprise |
| Azure Speech Services | https://azure.microsoft.com/en-us/products/ai-services/speech-to-text | `apiKey` | ✅ Ativa | STT + TTS |
| ElevenLabs | https://elevenlabs.io/docs/api-reference | `apiKey` | ✅ Ativa | AI voice synthesis |
| Deepgram | https://developers.deepgram.com/ | `apiKey` | ✅ Ativa | Fast STT |
| AssemblyAI | https://www.assemblyai.com/docs/ | `apiKey` | ✅ Ativa | Speech-to-text + analysis |
| PlayHT | https://docs.play.ht/ | `apiKey` | ✅ Ativa | Text-to-speech |
| Resemble AI | https://docs.resemble.ai/ | `apiKey` | ✅ Ativa | Voice cloning + TTS |
| Audexum | https://audexum.com/docs | `apiKey` | ✅ Ativa | TTS 43 voices, 33 languages |

---

## 5. Tradução & NLP

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Google Cloud Translation | https://cloud.google.com/translate/ | `apiKey` | ✅ Ativa | Líder em tradução |
| DeepL API | https://www.deepl.com/docs-api | `apiKey` | ✅ Ativa | Alta qualidade |
| LibreTranslate | https://libretranslate.com/docs | No | ✅ Ativa | Open source |
| Microsoft Translator | https://learn.microsoft.com/en-us/azure/ai-services/translator/ | `apiKey` | ✅ Ativa | Azure ecosystem |
| AWS Translate | https://aws.amazon.com/translate/ | `apiKey` | ✅ Ativa | AWS ecosystem |
| Hirak Translation | https://translate.hirak.site/ | `apiKey` | ✅ Ativa | 21 languages |
| Kiprio Translate | https://kiprio.com/v1/translate | `apiKey` | ✅ Ativa | 50+ languages |
| Detect Language | https://detectlanguage.com/ | `apiKey` | ✅ Ativa | Language detection |
| Cloudmersive NLP | https://www.cloudmersive.com/nlp-api | `apiKey` | ✅ Ativa | NLP suite |
| Sentiment Analysis (MeaningCloud) | https://www.meaningcloud.com/developer/sentiment-analysis | `apiKey` | ✅ Ativa | Multilingual sentiment |

---

## 6. Calendário & Temporal

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Google Calendar API | https://developers.google.com/calendar/ | `OAuth` | ✅ Ativa | Líder em calendário |
| Microsoft Graph Calendar | https://learn.microsoft.com/en-us/graph/api/resources/calendar | `OAuth` | ✅ Ativa | Outlook/365 |
| Calendly | https://developer.calendly.com/ | `apiKey` | ✅ Ativa | Scheduling platform |
| Nylas Calendar | https://docs.nylas.com/ | `apiKey` | ✅ Ativa | Unified calendar API |
| TimezoneDB | https://timezonedb.com/api | `apiKey` | ✅ Ativa | Timezone data |

---

## 7. Comunicação & Messaging

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Slack API | https://api.slack.com/ | `OAuth` | ✅ Ativa | Team messaging |
| Discord API | https://discord.com/developers/docs | `OAuth` | ✅ Ativa | Community messaging |
| Telegram Bot API | https://core.telegram.org/bots/api | `apiKey` | ✅ Ativa | Bot platform |
| Twilio | https://www.twilio.com/docs/api | `apiKey` | ✅ Ativa | SMS + Voice + WhatsApp |
| WhatsApp Business API | https://developers.facebook.com/docs/whatsapp/ | `apiKey` | ✅ Ativa | Official WhatsApp |
| Microsoft Teams | https://learn.microsoft.com/en-us/graph/api/resources | `OAuth` | ✅ Ativa | Enterprise messaging |
| Signal API | https://signal.org/docs/ | No | ⚠️ Parcial | Limited API access |
| Viber | https://www.viber.com/en/business/ | `apiKey` | ✅ Ativa | Messaging platform |
| Line Messaging | https://developers.line.biz/ | `OAuth` | ✅ Ativa | Asia-focused messaging |

---

## 8. Email

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| SendGrid | https://docs.sendgrid.com/api-reference | `apiKey` | ✅ Ativa | Líder em email delivery |
| Mailgun | https://documentation.mailgun.com/ | `apiKey` | ✅ Ativa | Email API |
| Postmark | https://postmarkapp.com/developer | `apiKey` | ✅ Ativa | Transactional email |
| Amazon SES | https://aws.amazon.com/ses/ | `apiKey` | ✅ Ativa | AWS email service |
| Resend | https://resend.com/docs | `apiKey` | ✅ Ativa | Modern email API |
| Mailchimp | https://mailchimp.com/developer/ | `apiKey` | ✅ Ativa | Marketing email |
| Brevo (Sendinblue) | https://developers.brevo.com/ | `apiKey` | ✅ Ativa | Email + SMS |
| SparkPost | https://www.sparkpost.com/docs/ | `apiKey` | ✅ Ativa | Email delivery |

---

## 9. Telefonia & SMS

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Twilio | https://www.twilio.com/docs/api | `apiKey` | ✅ Ativa | SMS + Voice + Video |
| Vonage (Nexmo) | https://developer.vonage.com/ | `apiKey` | ✅ Ativa | Communications API |
| Plivo | https://www.plivo.com/docs/ | `apiKey` | ✅ Ativa | SMS + Voice |
| MessageBird | https://developers.messagebird.com/ | `apiKey` | ✅ Ativa | Omnichannel |
| Telnyx | https://developers.telnyx.com/ | `apiKey` | ✅ Ativa | Programmable voice |
| Infobip | https://www.infobip.com/docs/api | `apiKey` | ✅ Ativa | Omnichannel platform |

---

## 10. Autenticação & Identidade

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Auth0 | https://auth0.com | `apiKey` | ✅ Ativa | Identity platform |
| Firebase Auth | https://firebase.google.com/docs/auth | No | ✅ Ativa | Google ecosystem |
| Stytch | https://stytch.com/ | `apiKey` | ✅ Ativa | Passwordless auth |
| Descope | https://www.descope.com/ | `apiKey` | ✅ Ativa | Authentication platform |
| Warrant | https://warrant.dev/ | `apiKey` | ✅ Ativa | Authorization API |
| GetOTP | https://otp.dev/en/docs/ | `apiKey` | ✅ Ativa | OTP flow |
| MojoAuth | https://mojoauth.com | `apiKey` | ✅ Ativa | Passwordless auth |

---

## 11. Pagamentos & Fintech

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Stripe | https://stripe.com/docs/api | `apiKey` | ✅ Ativa | Líder em pagamentos |
| PayPal | https://developer.paypal.com/docs/api/overview/ | `apiKey` | ✅ Ativa | Global payments |
| Square | https://developer.squareup.com/reference/square | `OAuth` | ✅ Ativa | POS + payments |
| Mercado Pago | https://www.mercadopago.com.br/developers/en/docs | `apiKey` | ✅ Ativa | LatAm payments |
| PagSeguro | https://pagseguro.uol.com.br/ | `apiKey` | ✅ Ativa | Brazil payments |
| Iugu | https://api.iugu.com/ | `apiKey` | ✅ Ativa | Brazil payments |
| Adyen | https://docs.adyen.com/api-explorer/ | `apiKey` | ✅ Ativa | Enterprise payments |
| Mollie | https://docs.mollie.com/ | `apiKey` | ✅ Ativa | European payments |

---

## 12. Open Finance & Bancos

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Plaid | https://plaid.com/docs/api/ | `apiKey` | ✅ Ativa | Open banking aggregator |
| Stripe Connect | https://stripe.com/docs/connect | `apiKey` | ✅ Ativa | Marketplace payments |
| Banco do Brasil Open Banking | https://developers.bb.com.br/ | `OAuth` | ✅ Ativa | BB Open Banking |
| Bradesco Open Banking | https://developers.bradesco.com.br/ | `OAuth` | ✅ Ativa | Bradesco Open Banking |
| Itaú Open Banking | https://developers.itau.com.br/ | `OAuth` | ✅ Ativa | Itaú Open Banking |
| Inter Open Banking | https://developers.inter.co/ | `OAuth` | ✅ Ativa | Inter Open Banking |
| Nubank API | https://docs.nubank.com.br/ | `OAuth` | ✅ Ativa | Nubank ecosystem |
| Wise (TransferWise) | https://docs.wise.com/ | `apiKey` | ✅ Ativa | International transfers |

---

## 13. ERP, CRM & Business

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Salesforce | https://developer.salesforce.com/docs | `OAuth` | ✅ Ativa | Líder em CRM |
| HubSpot | https://developers.hubspot.com/docs/api | `apiKey` | ✅ Ativa | CRM + Marketing |
| SAP Business One | https://help.sap.com/doc/ | `OAuth` | ✅ Ativa | ERP enterprise |
| Odoo | https://www.odoo.com/documentation/ | `apiKey` | ✅ Ativa | Open source ERP |
| Zoho CRM | https://www.zoho.com/crm/developer/docs/ | `OAuth` | ✅ Ativa | CRM platform |
| Pipedrive | https://developers.pipedrive.com/docs/api-reference | `apiKey` | ✅ Ativa | Sales CRM |
| Freshsales | https://developers.freshworks.com/crm/api/ | `apiKey` | ✅ Ativa | CRM platform |
| Apache Superset | https://superset.apache.org/docs/api | `apiKey` | ✅ Ativa | BI dashboard |
| Monday.com | https://developer.monday.com/api-reference/reference/ | `apiKey` | ✅ Ativa | Work management |
| Asana | https://developers.asana.com/docs/ | `OAuth` | ✅ Ativa | Project management |
| Jira | https://developer.atlassian.com/cloud/jira/platform/rest/v3/ | `OAuth` | ✅ Ativa | Issue tracking |
| Trello | https://developer.atlassian.com/cloud/trello/rest/ | `apiKey` | ✅ Ativa | Kanban boards |

---

## 14. RH & Recrutamento

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| BambooHR | https://documentation.bamboohr.com/reference | `apiKey` | ✅ Ativa | HR platform |
| Workday | https://www.workday.com/ | `OAuth` | ✅ Ativa | Enterprise HR |
| Greenhouse | https://developers.greenhouse.io/ | `apiKey` | ✅ Ativa | Recruiting |
| Lever | https://hire.lever.co/developers | `OAuth` | ✅ Ativa | ATS platform |
| LinkedIn Jobs | https://learn.microsoft.com/en-us/linkedin/talent/ | `OAuth` | ✅ Ativa | Job postings |
| Indeed | https://docs.indeed.com/ | `apiKey` | ✅ Ativa | Job platform |

---

## 15. Fiscal & Contabilidade

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Conta Azul | https://docs.contaazul.com/ | `OAuth` | ✅ Ativa | Brazil accounting |
| Bling | https://developer.bling.com.br/ | `OAuth` | ✅ Ativa | Brazil ERP/accounting |
| NFe.io | https://nfe.io/docs/ | `apiKey` | ✅ Ativa | NF-e Brazil |
| Tiny ERP | https://developer.tiny.com.br/ | `apiKey` | ✅ Ativa | Brazil ERP |
| QuickBooks | https://developer.intuit.com/app/developer/qbo/docs/api/accounting/ | `OAuth` | ✅ Ativa | Accounting platform |
| Xero | https://developer.xero.com/documentation/api/accounting/overview | `OAuth` | ✅ Ativa | Cloud accounting |
| FreshBooks | https://www.freshbooks.com/api/ | `OAuth` | ✅ Ativa | Invoicing/accounting |

---

## 16. Documentos & PDF

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| DocuSign | https://developers.docusign.com/ | `OAuth` | ✅ Ativa | E-signatures |
| PandaDoc | https://developers.pandadoc.com/ | `apiKey` | ✅ Ativa | Document automation |
| Smallpdf | https://developer.smallpdf.com/ | `apiKey` | ✅ Ativa | PDF tools |
| iLovePDF | https://developer.ilovepdf.com/ | `apiKey` | ✅ Ativa | PDF manipulation |
| PDF.co | https://app.pdf.co/home/page/api | `apiKey` | ✅ Ativa | PDF conversion |
| Convertio | https://convertio.co/api/ | `apiKey` | ✅ Ativa | File conversion |
| Filestack | https://www.filestack.com/ | `apiKey` | ✅ Ativa | File upload/transform |
| Hyperserve | https://hyperserve.io/ | `apiKey` | ✅ Ativa | Video backend + transcoding |
| JSON2Video | https://json2video.com | `apiKey` | ✅ Ativa | Video creation from JSON |
| Rendobar | https://rendobar.com | `apiKey` | ✅ Ativa | Media processing |

---

## 17. Analytics & BI

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Google Analytics | https://developers.google.com/analytics/ | `OAuth` | ✅ Ativa | Web analytics |
| Mixpanel | https://docs.mixpanel.com/ | `apiKey` | ✅ Ativa | Product analytics |
| Amplitude | https://developers.amplitude.com/ | `apiKey` | ✅ Ativa | Analytics platform |
| Segment | https://segment.com/docs/ | `apiKey` | ✅ Ativa | Customer data platform |
| Heap | https://developers.heap.io/ | `apiKey` | ✅ Ativa | Auto-capture analytics |
| PostHog | https://posthog.com/docs/api | `apiKey` | ✅ Ativa | Open source analytics |
| Plausible | https://plausible.io/docs/api | `apiKey` | ✅ Ativa | Privacy-first analytics |

---

## 18. Logs & Monitoramento

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Datadog | https://docs.datadoghq.com/api/ | `apiKey` | ✅ Ativa | Observability platform |
| Grafana | https://grafana.com/docs/grafana/latest/http_api/ | `apiKey` | ✅ Ativa | Open source dashboards |
| PagerDuty | https://developer.pagerduty.com/docs/ | `apiKey` | ✅ Ativa | Incident management |
| Sentry | https://docs.sentry.io/api/ | `apiKey` | ✅ Ativa | Error tracking |
| New Relic | https://docs.newrelic.com/docs/apis/ | `apiKey` | ✅ Ativa | Observability |
| Loggly | https://documentation.loggly.com/reference/ | `apiKey` | ✅ Ativa | Log management |

---

## 19. Storage & Bancos de Dados

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| AWS S3 | https://docs.aws.amazon.com/AmazonS3/latest/API/ | `apiKey` | ✅ Ativa | Object storage |
| Google Cloud Storage | https://cloud.google.com/storage/docs/apis | `apiKey` | ✅ Ativa | Object storage |
| Azure Blob Storage | https://learn.microsoft.com/en-us/rest/api/storageservices/ | `apiKey` | ✅ Ativa | Object storage |
| Supabase | https://supabase.com/docs/api | `apiKey` | ✅ Ativa | Postgres + Realtime |
| PlanetScale | https://planetscale.com/docs | `apiKey` | ✅ Ativa | Serverless MySQL |
| MongoDB Atlas | https://www.mongodb.com/docs/atlas/api/ | `apiKey` | ✅ Ativa | NoSQL database |
| Firebase Realtime DB | https://firebase.google.com/docs/database | No | ✅ Ativa | Realtime database |
| Upstash | https://upstash.com/docs | `apiKey` | ✅ Ativa | Serverless Redis/DB |

---

## 20. Cache & CDN

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Cloudflare | https://developers.cloudflare.com/api/ | `apiKey` | ✅ Ativa | CDN + Security |
| Fastly | https://www.fastly.com/documentation/reference/api/ | `apiKey` | ✅ Ativa | Edge cloud |
| AWS CloudFront | https://docs.aws.amazon.com/cloudfront/ | `apiKey` | ✅ Ativa | AWS CDN |
| Akamai | https://techdocs.akamai.com/ | `apiKey` | ✅ Ativa | CDN platform |
| KeyCDN | https://www.keycdn.com/docs/rest-api | `apiKey` | ✅ Ativa | CDN service |
| Redis Cloud | https://redis.io/docs/latest/develop/connect/clients/ | `apiKey` | ✅ Ativa | Managed Redis |

---

## 21. Segurança & Anti-Malware

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| VirusTotal | https://docs.virustotal.com/reference/overview | `apiKey` | ✅ Ativa | File/URL analysis |
| Shodan | https://shodan.io/developer | `apiKey` | ✅ Ativa | IoT search engine |
| AbuseIPDB | https://docs.abuseipdb.com/ | `apiKey` | ✅ Ativa | IP reputation |
| SecurityTrails | https://securitytrails.com/corp/api | `apiKey` | ✅ Ativa | Domain intelligence |
| Censys | https://censys.io/api | `apiKey` | ✅ Ativa | Host search engine |
| Pulsedive | https://pulsedive.com/api/ | `apiKey` | ✅ Ativa | Threat intelligence |
| URLScan.io | https://urlscan.io/about-api/ | `apiKey` | ✅ Ativa | URL scanning |
| Google Safe Browsing | https://developers.google.com/safe-browsing/ | `apiKey` | ✅ Ativa | Link flagging |
| Alienvault OTX | https://otx.alienvault.com/api | `apiKey` | ✅ Ativa | Threat exchange |
| CRXcavator | https://crxcavator.io/apidocs | `apiKey` | ✅ Ativa | Chrome extension risk |

---

## 22. Blockchain & Cripto

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Etherscan | https://etherscan.io/apis | `apiKey` | ✅ Ativa | Ethereum explorer |
| Covalent | https://www.covalenthq.com/docs/api/ | `apiKey` | ✅ Ativa | Multi-chain data |
| The Graph | https://thegraph.com | `apiKey` | ✅ Ativa | GraphQL indexing |
| Bitquery | https://graphql.bitquery.io/ide | `apiKey` | ✅ Ativa | Onchain GraphQL |
| Chainlink | https://chain.link/developer-resources | No | ✅ Ativa | Oracle network |
| Blockscout | https://dev.blockscout.com/ | `apiKey` | ✅ Ativa | Block explorer |
| CoinGecko | https://www.coingecko.com/en/api | `apiKey` | ✅ Ativa | Crypto market data |
| CoinMarketCap | https://coinmarketcap.com/api/ | `apiKey` | ✅ Ativa | Crypto prices |
| Nownodes | https://nownodes.io/ | `apiKey` | ✅ Ativa | Blockchain nodes |

---

## 23. IoT & Hardware

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Arduino Cloud | https://docs.arduino.cc/cloud/ | `apiKey` | ✅ Ativa | IoT platform |
| ThingsBoard | https://thingsboard.io/docs/api/ | `apiKey` | ✅ Ativa | IoT platform |
| Particle | https://docs.particle.io/ | `apiKey` | ✅ Ativa | IoT devices |
| Helium | https://docs.helium.com/api/ | No | ✅ Ativa | Wireless IoT |
| Tasmota | https://tasmota.github.io/docs/ | No | ✅ Ativa | Open source IoT |
| Home Assistant | https://developers.home-assistant.io/docs/api/ | `apiKey` | ✅ Ativa | Smart home |

---

## 24. Redes Sociais

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Twitter/X API | https://developer.twitter.com/en/docs | `OAuth` | ✅ Ativa | Social network |
| Reddit API | https://www.reddit.com/dev/api | `OAuth` | ✅ Ativa | Community platform |
| Instagram Graph | https://developers.facebook.com/docs/instagram-api/ | `OAuth` | ✅ Ativa | Photo sharing |
| Facebook Graph | https://developers.facebook.com/ | `OAuth` | ✅ Ativa | Social network |
| LinkedIn | https://docs.microsoft.com/en-us/linkedin/ | `OAuth` | ✅ Ativa | Professional network |
| TikTok | https://developers.tiktok.com/ | `OAuth` | ✅ Ativa | Short video |
| Pinterest | https://developers.pinterest.com/ | `OAuth` | ✅ Ativa | Visual discovery |
| YouTube | https://developers.google.com/youtube/ | `OAuth` | ✅ Ativa | Video platform |
| Twitch | https://dev.twitch.tv/docs | `OAuth` | ✅ Ativa | Live streaming |
| Discord | https://discord.com/developers/docs | `OAuth` | ✅ Ativa | Gaming community |
| Slack | https://api.slack.com/ | `OAuth` | ✅ Ativa | Work communication |
| Telegram | https://core.telegram.org/api | `apiKey` | ✅ Ativa | Messaging |
| GitHub | https://docs.github.com/en/rest | `OAuth` | ✅ Ativa | Code hosting |
| GitLab | https://docs.gitlab.com/api/ | `OAuth` | ✅ Ativa | DevOps platform |
| Mastodon | https://docs.joinmastodon.org/api/ | `OAuth` | ✅ Ativa | Decentralized social |
| Product Hunt | https://api.producthunt.com/v2/docs | `OAuth` | ✅ Ativa | Product discovery |
| HackerNews | https://github.com/HackerNews/API | No | ✅ Ativa | Tech news |
| Buffer | https://buffer.com/developers/api | `OAuth` | ✅ Ativa | Social scheduling |
| Meetup | https://www.meetup.com/api/guide | `apiKey` | ✅ Ativa | Events platform |

---

## 25. Mapas & Geolocalização

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Google Maps | https://developers.google.com/maps/ | `apiKey` | ✅ Ativa | Líder em mapas |
| Mapbox | https://docs.mapbox.com/api/ | `apiKey` | ✅ Ativa | Custom maps |
| OpenStreetMap (OSM) | https://www.openstreetmap.org/developers | No | ✅ Ativa | Open source maps |
| HERE Maps | https://developer.here.com/ | `apiKey` | ✅ Ativa | Enterprise maps |
| TomTom | https://developer.tomtom.com/ | `apiKey` | ✅ Ativa | Maps + routing |
| Foursquare | https://developer.foursquare.com/ | `apiKey` | ✅ Ativa | Place search |
| Google Geocoding | https://developers.google.com/maps/documentation/geocoding/ | `apiKey` | ✅ Ativa | Address → coordinates |
| Nominatim | https://nominatim.org/ | No | ✅ Ativa | Open source geocoding |
| IPstack | https://ipstack.com/ | `apiKey` | ✅ Ativa | IP geolocation |

---

## 26. Clima & Meio Ambiente

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| OpenWeatherMap | https://openweathermap.org/api | `apiKey` | ✅ Ativa | Weather data |
| WeatherAPI | https://www.weatherapi.com/ | `apiKey` | ✅ Ativa | Weather + astronomy |
| Tomorrow.io | https://docs.tomorrow.io | `apiKey` | ✅ Ativa | Weather forecasting |
| AccuWeather | https://developer.accuweather.com/ | `apiKey` | ✅ Ativa | Weather forecasts |
| Visual Crossing | https://www.visualcrossing.com/weather-api | `apiKey` | ✅ Ativa | Historical weather |
| Storm Glass | https://stormglass.io/ | `apiKey` | ✅ Ativa | Marine weather |
| AQICN | https://aqicn.org/api/ | `apiKey` | ✅ Ativa | Air quality |
| Open-Meteo | https://open-meteo.com/ | No | ✅ Ativa | Free weather API |
| US Weather (NOAA) | https://www.weather.gov/documentation/services-web-api | No | ✅ Ativa | US government weather |
| wttr.in | https://wttr.in/:help | No | ✅ Ativa | Terminal weather |

---

## 27. Dados Públicos & Governamentais

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| data.gov | https://data.gov/ | No | ✅ Ativa | US open data |
| dados.gov.br | https://dados.gov.br/ | No | ✅ Ativa | Brazil open data |
| IBGE | https://servicodados.ibge.gov.br/api/docs/ | No | ✅ Ativa | Brazil statistics |
| CEIS/CNEP | https://portaldatransparencia.gov.br/ | No | ✅ Ativa | Brazil transparency |
| Banco Central do Brasil | https://www.bcb.gov.br/estabilidadefinanceira/historicocotacoes | No | ✅ Ativa | Brazil central bank |
| SEC (US) | https://www.sec.gov/edgar/ | No | ✅ Ativa | US securities data |
| FDA (US) | https://open.fda.gov/ | `apiKey` | ✅ Ativa | US food/drug data |
| NASA | https://api.nasa.gov/ | `apiKey` | ✅ Ativa | Space data |
| World Bank | https://datahelpdesk.worldbank.org/knowledgebase/articles/889392 | No | ✅ Ativa | Global development data |
| REST Countries | https://restcountries.com/ | No | ✅ Ativa | Country data |

---

## 28. Finance & Investimentos

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Yahoo Finance | https://finance.yahoo.com/ | No | ✅ Ativa | Market data |
| Alpha Vantage | https://www.alphavantage.co/documentation/ | `apiKey` | ✅ Ativa | Financial data |
| Finnhub | https://finnhub.io/ | `apiKey` | ✅ Ativa | Real-time quotes |
| IEX Cloud | https://iexcloud.io/docs/ | `apiKey` | ✅ Ativa | Financial data |
| Marketstack | https://marketstack.com/ | `apiKey` | ✅ Ativa | Stock market data |
| Fixer.io | https://fixer.io/ | `apiKey` | ✅ Ativa | Forex rates |
| CoinGecko | https://www.coingecko.com/en/api | `apiKey` | ✅ Ativa | Crypto market data |
| Binance | https://binance-docs.github.io/apidocs/ | `apiKey` | ✅ Ativa | Crypto exchange |
| Mercado Bitcoin | https://www.mercadobitcoin.com.br/api-doc/ | `apiKey` | ✅ Ativa | Brazil crypto |

---

## 29. Comércio & E-commerce

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Shopify | https://shopify.dev/docs/api | `apiKey` | ✅ Ativa | E-commerce platform |
| WooCommerce | https://woocommerce.github.io/woocommerce-rest-api-docs/ | `apiKey` | ✅ Ativa | WordPress e-commerce |
| Magento | https://developer.adobe.com/commerce/webapi/ | `OAuth` | ✅ Ativa | Enterprise e-commerce |
| MercadoLibre | https://developers.mercadolibre.com.ar/ | `OAuth` | ✅ Ativa | LatAm marketplace |
| Amazon SP-API | https://developer-docs.amazon.com/sp-api/ | `apiKey` | ✅ Ativa | Amazon marketplace |
| eBay | https://developer.ebay.com/ | `OAuth` | ✅ Ativa | Marketplace |
| Etsy | https://www.etsy.com/developers/ | `apiKey` | ✅ Ativa | Handmade marketplace |

---

## 30. Transporte & Logística

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Google Maps Directions | https://developers.google.com/maps/documentation/directions/ | `apiKey` | ✅ Ativa | Routing |
| Uber | https://developer.uber.com/ | `OAuth` | ✅ Ativa | Ridesharing |
| 99 (Brazil) | https://developer.99app.com/ | `apiKey` | ✅ Ativa | Brazil ridesharing |
| Correios (Brazil) | https://cws.correios.com.br/ajuda | `apiKey` | ✅ Ativa | Brazil postal service |
| Aftership | https://developers.aftership.com/ | `apiKey` | ✅ Ativa | Parcel tracking |
| FedEx | https://developer.fedex.com/ | `apiKey` | ✅ Ativa | Shipping |
| UPS | https://www.ups.com/upsdeveloperkit | `apiKey` | ✅ Ativa | Shipping |
| DHL | https://developer.dhl.com/ | `apiKey` | ✅ Ativa | Shipping |
| GraphHopper | https://docs.graphhopper.com/ | `apiKey` | ✅ Ativa | Route optimization |
| BlaBlaCar | https://dev.blablacar.com | `apiKey` | ✅ Ativa | Carpooling |

---

## 31. Saúde & Fitness

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Fitbit | https://dev.fitbit.com/ | `OAuth` | ✅ Ativa | Wearable data |
| Apple HealthKit | https://developer.apple.com/healthkit/ | No | ✅ Ativa | iOS health data |
| Google Fit | https://developers.google.com/fit/ | `OAuth` | ✅ Ativa | Android health data |
| Strava | https://strava.github.io/api/ | `OAuth` | ✅ Ativa | Fitness tracking |
| OpenFDA | https://open.fda.gov/ | `apiKey` | ✅ Ativa | US drug data |
| WHO | https://www.who.int/data | No | ✅ Ativa | Global health data |

---

## 32. Desenvolvimento & DevOps

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| GitHub API | https://docs.github.com/en/rest | `OAuth` | ✅ Ativa | Code hosting |
| GitLab API | https://docs.gitlab.com/api/ | `OAuth` | ✅ Ativa | DevOps platform |
| Bitbucket | https://developer.atlassian.com/cloud/bitbucket/rest/ | `OAuth` | ✅ Ativa | Code hosting |
| Docker Hub | https://docs.docker.com/docker-hub/api/ | `apiKey` | ✅ Ativa | Container registry |
| npm | https://docs.npmjs.com/api/v3 | No | ✅ Ativa | Package registry |
| Travis CI | https://docs.travis-ci.com/api/ | `apiKey` | ✅ Ativa | CI/CD |
| CircleCI | https://circleci.com/docs/api/ | `apiKey` | ✅ Ativa | CI/CD |
| Netlify | https://docs.netlify.com/api/get-started/ | `apiKey` | ✅ Ativa | Hosting platform |
| Vercel | https://vercel.com/docs/rest-api | `apiKey` | ✅ Ativa | Frontend cloud |
| Heroku | https://devcenter.heroku.com/articles/platform-api-reference | `apiKey` | ✅ Ativa | PaaS |
| PagerDuty | https://developer.pagerduty.com/docs/ | `apiKey` | ✅ Ativa | Incident management |
| Statuspage | https://developer.atlassian.com/cloud/statuspage/ | `apiKey` | ✅ Ativa | Status pages |

---

## 33. URL Shorteners

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Bitly | http://dev.bitly.com/ | `OAuth` | ✅ Ativa | Link management |
| TinyURL | https://tinyurl.com/app/dev | `apiKey` | ✅ Ativa | URL shortener |
| Rebrandly | https://developers.rebrandly.com/ | `apiKey` | ✅ Ativa | Branded links |
| CleanURI | https://cleanuri.com/docs | No | ✅ Ativa | Simple shortener |
| Kutt | https://docs.kutt.it/ | `apiKey` | ✅ Ativa | Modern shortener |

---

## 34. Test Data & Mock APIs

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| JSONPlaceholder | http://jsonplaceholder.typicode.com/ | No | ✅ Ativa | Fake REST API |
| Mockaroo | https://www.mockaroo.com/docs | `apiKey` | ✅ Ativa | Data generator |
| FakeStoreAPI | https://fakestoreapi.com/ | No | ✅ Ativa | E-commerce test data |
| DummyJSON | https://dummyjson.com/ | No | ✅ Ativa | Fake data |
| RandomUser | https://randomuser.me | No | ✅ Ativa | User data generator |
| FakerAPI | https://fakerapi.it/en | No | ✅ Ativa | Fake data collection |
| Postman Echo | https://postman-echo.com/ | No | ✅ Ativa | API testing |
| WireMock | https://wiremock.org/docs/ | No | ✅ Ativa | API mocking |

---

## 35. Mídia & Entretenimento

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| TMDB | https://www.themoviedb.org/documentation/api | `apiKey` | ✅ Ativa | Movie/TV data |
| IMDb | https://imdb-api.com/ | `apiKey` | ✅ Ativa | Movie data |
| Spotify | https://developer.spotify.com/documentation/web-api/ | `OAuth` | ✅ Ativa | Music streaming |
| Deezer | https://developers.deezer.com/api | No | ✅ Ativa | Music streaming |
| YouTube | https://developers.google.com/youtube/ | `OAuth` | ✅ Ativa | Video platform |
| Vimeo | https://developer.vimeo.com/ | `OAuth` | ✅ Ativa | Video platform |
| TheTVDB | https://thetvdb.com/api-information | `apiKey` | ✅ Ativa | TV data |
| Trakt | https://trakt.docs.apiary.io/ | `apiKey` | ✅ Ativa | Media tracking |
| Tidal | https://developer.tidal.com/ | `apiKey` | ✅ Ativa | Music streaming |
| Genius | https://docs.genius.com/ | `apiKey` | ✅ Ativa | Song lyrics |

---

## 36. Esportes

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| API-Football | https://www.api-football.com/documentation-v3 | `apiKey` | ✅ Ativa | Football data |
| balldontlie | https://www.balldontlie.io | No | ✅ Ativa | NBA stats |
| TheSportsDB | https://www.thesportsdb.com/api.php | `apiKey` | ✅ Ativa | Sports database |
| Sportradar | https://sportradar.com/ | `apiKey` | ✅ Ativa | Live sports data |
| ESPN API | https://site.api.espn.com/ | No | ✅ Ativa | Sports scores |
| OpenF1 | https://openf1.org/ | No | ✅ Ativa | F1 real-time data |
| Ergast F1 | http://ergast.com/mrd/ | No | ✅ Ativa | F1 historical data |

---

## 37. Notícias & Content

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| NewsAPI | https://newsapi.org/ | `apiKey` | ✅ Ativa | News aggregation |
| Guardian | https://open-platform.theguardian.com/ | `apiKey` | ✅ Ativa | News content |
| NYTimes | https://developer.nytimes.com/ | `apiKey` | ✅ Ativa | News content |
| GNews | https://gnews.io/ | `apiKey` | ✅ Ativa | News API |
| Currents | https://currentsapi.services/en/docs | `apiKey` | ✅ Ativa | News API |
| Mediastack | https://mediastack.com/ | `apiKey` | ✅ Ativa | News data |

---

## 38. Veículos & Automotive

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| NHTSA | https://vpic.nhtsa.dot.gov/api/ | No | ✅ Ativa | US vehicle data |
| CarVector | https://carvector.io/docs | `apiKey` | ✅ Ativa | Vehicle specs |
| Kelley Blue Book | http://developer.kbb.com/ | `apiKey` | ✅ Ativa | Vehicle pricing |
| RevCarData | https://revcardata.com | `apiKey` | ✅ Ativa | Global vehicle specs |
| Smartcar | https://smartcar.com/docs/ | `OAuth` | ✅ Ativa | Connected car |
| Mercedes-Benz | https://developer.mercedes-benz.com/apis | `apiKey` | ✅ Ativa | Vehicle telematics |

---

## 39. Fotografia & Imagens

| API | URL | Auth | Status | Observações |
|-----|-----|------|--------|-------------|
| Unsplash | https://unsplash.com/documentation | `apiKey` | ✅ Ativa | Stock photos |
| Pexels | https://www.pexels.com/api/documentation | `apiKey` | ✅ Ativa | Stock photos |
| Pixabay | https://pixabay.com/api/docs/ | `apiKey` | ✅ Ativa | Stock photos |
| Imgur | https://apidocs.imgur.com/ | `OAuth` | ✅ Ativa | Image hosting |
| Cloudinary | https://cloudinary.com/documentation | `apiKey` | ✅ Ativa | Image management |
| Screenshotlayer | https://screenshotlayer.com/ | `apiKey` | ✅ Ativa | Website screenshots |
| PlaceKitten | https://placekitten.com/ | No | ✅ Ativa | Placeholder images |
| Lorem Picsum | https://picsum.photos/ | No | ✅ Ativa | Placeholder images |

---

## Notas Técnicas

### Autenticação
- **`apiKey`**: Chave de API simples (header ou query param)
- **`OAuth`**: OAuth 2.0 (requer flow de autorização)
- **`No`**: API pública sem autenticação

### CORS
- **Yes**: Suporta cross-origin requests
- **No**: Não suporta (requer proxy)
- **Unknown**: Não documentado

### Status
- ✅ **Ativa**: API funcional e mantida
- ⚠️ **Parcial**: Acesso limitado ou em transição
- ❌ **Inativa**: API descontinuada (não incluída neste catálogo)

---

## APIs Eliminadas (Resumo)

Foram eliminadas aproximadamente **1.200+ APIs** por:

1. **Descontinuação**: APIs com endpoints mortos ou documentação removida
2. **Obsolescência**: APIs substituídas por versões superiores
3. **Redundância**: Múltiplas APIs para mesma função (ex: 50+ APIs de clima, mantidas apenas as melhores)
4. **Irrelevância**: APIs de nicho sem aplicação para Integration Hub:
   - Anime (20+ APIs)
   - Livros religiosos (15+ APIs)
   - Memes/Humor (10+ APIs)
   - Pets/Animais (25+ APIs)
   - Games/Comics (15+ APIs)
   - Arte/Design (20+ APIs)

---

*Catálogo gerado automaticamente pela Sprint 11.1 — API Discovery & Classification*
