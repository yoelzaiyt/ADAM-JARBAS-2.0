# JARBAS 2.0 — API Technical Evaluation Matrix

**Sprint:** 11.2 — API Technical Evaluation
**Data:** 2026-07-13
**Fonte:** API_CATALOG.md (Sprint 11.1)

---

## Legenda de Classificacao

| Classificacao | Significado | Criterio |
|---------------|-------------|----------|
| **ESSENCIAL** | Integrar obrigatoriamente na fase 1 | API lider de market, documentacao excelente, ampla adocao |
| **IMPORTANTE** | Integrar na fase 2-3 | API madura, boa documentacao, uso significativo |
| **OPCIONAL** | Integrar conforme demanda | API funcional, mas nichada ou com alternativas melhores |
| **EXPERIMENTAL** | Validar viabilidade | API nova, limitada ou sem garantia de longevidade |

---

## Criterios de Avaliacao

| Criterio | Pontuacao | Descricao |
|----------|-----------|-----------|
| Maturidade | 1-5 | Anos no mercado, estabilidade |
| Documentacao | 1-5 | Qualidade, completude, exemplos |
| Seguranca | 1-5 | Criptografia, conformidade, protecao de dados |
| Facilidade | 1-5 | Curva de aprendizado, SDK disponiveis |
| Comunidade | 1-5 | Tamanho, suporte, ecossistema |
| Custo | 1-5 | 5=gratuito, 1=muito caro |
---

## 1. IA & Machine Learning

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Google Cloud Vision | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| OpenAI | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| Hugging Face | 4 | 5 | 4 | 4 | 5 | 4 | **ESSENCIAL** |
| Replicate | 4 | 4 | 4 | 4 | 4 | 3 | **IMPORTANTE** |
| Clarifai | 5 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Google Cloud NL | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| Civitai | 3 | 3 | 3 | 3 | 4 | 4 | **OPCIONAL** |
| UpRes AI | 2 | 2 | 3 | 3 | 2 | 3 | **EXPERIMENTAL** |
| TensorFlow Serving | 5 | 4 | 4 | 3 | 5 | 5 | **OPCIONAL** |

## 2. LLM

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| OpenAI API | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| Anthropic (Claude) | 4 | 5 | 5 | 5 | 4 | 2 | **ESSENCIAL** |
| Google Gemini | 4 | 5 | 5 | 4 | 5 | 3 | **ESSENCIAL** |
| Groq | 3 | 4 | 4 | 5 | 4 | 4 | **ESSENCIAL** |
| DeepSeek | 3 | 4 | 4 | 4 | 3 | 4 | **IMPORTANTE** |
| Mistral AI | 3 | 4 | 4 | 4 | 4 | 3 | **IMPORTANTE** |
| Together AI | 3 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Cohere | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Perplexity | 3 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Fireworks AI | 3 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |

## 3. OCR & Vision

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Google Cloud Vision | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| AWS Textract | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| Azure Computer Vision | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| Mindee | 4 | 5 | 4 | 5 | 3 | 3 | **IMPORTANTE** |
| Klippa | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| OCR.space | 4 | 3 | 3 | 4 | 3 | 4 | **OPCIONAL** |
| Hirak OCR | 2 | 2 | 2 | 3 | 2 | 4 | **EXPERIMENTAL** |

## 4. Speech & Audio

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| OpenAI Whisper | 5 | 5 | 5 | 5 | 5 | 3 | **ESSENCIAL** |
| ElevenLabs | 4 | 5 | 4 | 5 | 4 | 2 | **ESSENCIAL** |
| Deepgram | 4 | 5 | 4 | 5 | 4 | 3 | **ESSENCIAL** |
| Google Cloud STT | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| Azure Speech | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| AssemblyAI | 4 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| PlayHT | 3 | 4 | 3 | 4 | 3 | 3 | **OPCIONAL** |
| Resemble AI | 3 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Audexum | 2 | 2 | 2 | 3 | 2 | 3 | **EXPERIMENTAL** |
---

## 5. Traducao & NLP

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Google Cloud Translation | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| DeepL | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| Microsoft Translator | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| AWS Translate | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Detect Language | 4 | 3 | 3 | 5 | 3 | 4 | **OPCIONAL** |
| LibreTranslate | 3 | 3 | 3 | 4 | 4 | 5 | **OPCIONAL** |
| Cloudmersive NLP | 3 | 3 | 3 | 3 | 3 | 3 | **OPCIONAL** |
| MeaningCloud | 3 | 3 | 3 | 3 | 3 | 3 | **OPCIONAL** |
| Hirak Translation | 2 | 2 | 2 | 3 | 2 | 4 | **EXPERIMENTAL** |
| Kiprio | 2 | 2 | 2 | 3 | 2 | 4 | **EXPERIMENTAL** |

## 6. Calendario & Temporal

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Google Calendar | 5 | 5 | 5 | 5 | 5 | 5 | **ESSENCIAL** |
| Microsoft Graph Calendar | 5 | 5 | 5 | 4 | 5 | 4 | **ESSENCIAL** |
| Calendly | 4 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| Nylas Calendar | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| TimezoneDB | 4 | 3 | 3 | 5 | 3 | 4 | **OPCIONAL** |

## 7. Comunicacao & Messaging

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Slack API | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| Discord API | 5 | 5 | 4 | 5 | 5 | 5 | **ESSENCIAL** |
| Telegram Bot | 5 | 5 | 4 | 5 | 5 | 5 | **ESSENCIAL** |
| WhatsApp Business | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| Microsoft Teams | 5 | 5 | 5 | 4 | 5 | 4 | **IMPORTANTE** |
| Twilio | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| Line Messaging | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Viber | 4 | 3 | 3 | 3 | 3 | 3 | **OPCIONAL** |
| Signal API | 2 | 2 | 5 | 2 | 2 | 5 | **EXPERIMENTAL** |

## 8. Email

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| SendGrid | 5 | 5 | 5 | 5 | 5 | 3 | **ESSENCIAL** |
| Resend | 3 | 5 | 4 | 5 | 3 | 4 | **ESSENCIAL** |
| Postmark | 4 | 5 | 5 | 5 | 4 | 3 | **IMPORTANTE** |
| Mailgun | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Amazon SES | 5 | 5 | 5 | 3 | 5 | 5 | **IMPORTANTE** |
| Brevo | 4 | 4 | 4 | 4 | 3 | 4 | **OPCIONAL** |
| Mailchimp | 5 | 4 | 4 | 4 | 5 | 2 | **OPCIONAL** |
| SparkPost | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |

## 9. Telefonia & SMS

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Twilio | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| Vonage | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| Infobip | 4 | 4 | 4 | 4 | 3 | 2 | **IMPORTANTE** |
| Plivo | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Telnyx | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| MessageBird | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
---

## 10. Autenticacao & Identidade

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Auth0 | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| Firebase Auth | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| Stytch | 3 | 5 | 4 | 5 | 3 | 3 | **IMPORTANTE** |
| Descope | 3 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| GetOTP | 3 | 3 | 3 | 4 | 2 | 4 | **OPCIONAL** |
| Warrant | 2 | 3 | 4 | 3 | 2 | 3 | **OPCIONAL** |
| MojoAuth | 2 | 3 | 3 | 3 | 2 | 4 | **EXPERIMENTAL** |

## 11. Pagamentos & Fintech

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Stripe | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| PayPal | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| Mercado Pago | 5 | 4 | 5 | 4 | 4 | 2 | **ESSENCIAL** |
| PagSeguro | 5 | 4 | 5 | 4 | 4 | 2 | **IMPORTANTE** |
| Square | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Adyen | 5 | 5 | 5 | 3 | 4 | 2 | **IMPORTANTE** |
| Iugu | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Mollie | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |

## 12. Open Finance & Bancos

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Plaid | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| Stripe Connect | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| BB Open Banking | 4 | 3 | 5 | 3 | 3 | 5 | **IMPORTANTE** |
| Itau Open Banking | 4 | 3 | 5 | 3 | 3 | 5 | **IMPORTANTE** |
| Inter Open Banking | 4 | 3 | 5 | 3 | 3 | 5 | **IMPORTANTE** |
| Bradesco Open Banking | 4 | 3 | 5 | 3 | 3 | 5 | **OPCIONAL** |
| Wise | 4 | 4 | 5 | 4 | 4 | 3 | **OPCIONAL** |
| Nubank | 3 | 3 | 5 | 3 | 3 | 4 | **EXPERIMENTAL** |

## 13. ERP, CRM & Business

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Salesforce | 5 | 5 | 5 | 3 | 5 | 1 | **ESSENCIAL** |
| HubSpot | 5 | 5 | 5 | 5 | 5 | 3 | **ESSENCIAL** |
| Jira | 5 | 5 | 5 | 4 | 5 | 3 | **ESSENCIAL** |
| Asana | 4 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| Monday.com | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Trello | 5 | 4 | 4 | 5 | 5 | 4 | **IMPORTANTE** |
| Zoho CRM | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Pipedrive | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Odoo | 4 | 4 | 4 | 3 | 4 | 4 | **OPCIONAL** |
| SAP | 5 | 4 | 5 | 2 | 5 | 1 | **OPCIONAL** |
| Freshsales | 3 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Superset | 4 | 3 | 3 | 3 | 4 | 5 | **OPCIONAL** |

## 14. RH & Recrutamento

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| BambooHR | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Greenhouse | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Workday | 5 | 4 | 5 | 2 | 4 | 1 | **OPCIONAL** |
| Lever | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| LinkedIn Jobs | 5 | 4 | 5 | 3 | 5 | 2 | **OPCIONAL** |
| Indeed | 4 | 3 | 4 | 3 | 4 | 3 | **OPCIONAL** |
---

## 15. Fiscal & Contabilidade

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Conta Azul | 4 | 4 | 4 | 4 | 3 | 3 | **ESSENCIAL** |
| Bling | 4 | 4 | 4 | 4 | 3 | 3 | **ESSENCIAL** |
| NFe.io | 4 | 4 | 4 | 4 | 3 | 3 | **ESSENCIAL** |
| QuickBooks | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Xero | 5 | 5 | 5 | 5 | 5 | 3 | **IMPORTANTE** |
| Tiny ERP | 4 | 3 | 3 | 3 | 3 | 4 | **OPCIONAL** |
| FreshBooks | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |

## 16. Documentos & PDF

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| DocuSign | 5 | 5 | 5 | 4 | 5 | 2 | **ESSENCIAL** |
| PandaDoc | 4 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| iLovePDF | 4 | 4 | 4 | 5 | 3 | 3 | **IMPORTANTE** |
| PDF.co | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Filestack | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Smallpdf | 4 | 3 | 3 | 4 | 3 | 3 | **OPCIONAL** |
| Convertio | 3 | 3 | 3 | 4 | 3 | 3 | **OPCIONAL** |
| JSON2Video | 3 | 3 | 3 | 3 | 2 | 3 | **EXPERIMENTAL** |
| Hyperserve | 2 | 2 | 3 | 3 | 2 | 3 | **EXPERIMENTAL** |
| Rendobar | 2 | 2 | 3 | 3 | 2 | 3 | **EXPERIMENTAL** |

## 17. Analytics & BI

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Google Analytics | 5 | 5 | 5 | 4 | 5 | 4 | **ESSENCIAL** |
| Mixpanel | 5 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| Amplitude | 5 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| Segment | 5 | 5 | 5 | 4 | 4 | 2 | **IMPORTANTE** |
| PostHog | 4 | 5 | 4 | 5 | 4 | 4 | **IMPORTANTE** |
| Plausible | 4 | 4 | 5 | 5 | 3 | 4 | **OPCIONAL** |
| Heap | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |

## 18. Logs & Monitoramento

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Datadog | 5 | 5 | 5 | 4 | 5 | 1 | **ESSENCIAL** |
| Sentry | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| Grafana | 5 | 5 | 4 | 4 | 5 | 5 | **ESSENCIAL** |
| PagerDuty | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| New Relic | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| Loggly | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |

## 19. Storage & Bancos de Dados

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| AWS S3 | 5 | 5 | 5 | 4 | 5 | 4 | **ESSENCIAL** |
| Google Cloud Storage | 5 | 5 | 5 | 4 | 5 | 4 | **ESSENCIAL** |
| Supabase | 4 | 5 | 4 | 5 | 4 | 4 | **ESSENCIAL** |
| MongoDB Atlas | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Firebase Realtime DB | 5 | 5 | 5 | 5 | 5 | 4 | **IMPORTANTE** |
| Upstash | 3 | 4 | 4 | 5 | 3 | 4 | **IMPORTANTE** |
| PlanetScale | 4 | 5 | 5 | 5 | 3 | 3 | **OPCIONAL** |
| Azure Blob Storage | 5 | 5 | 5 | 4 | 5 | 4 | **OPCIONAL** |

## 20. Cache & CDN

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Cloudflare | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| AWS CloudFront | 5 | 5 | 5 | 4 | 5 | 4 | **IMPORTANTE** |
| Redis Cloud | 5 | 5 | 5 | 5 | 5 | 3 | **IMPORTANTE** |
| Fastly | 5 | 5 | 5 | 4 | 4 | 2 | **OPCIONAL** |
| Akamai | 5 | 4 | 5 | 3 | 4 | 1 | **OPCIONAL** |
| KeyCDN | 4 | 3 | 4 | 4 | 3 | 4 | **OPCIONAL** |
---

## 21. Seguranca & Anti-Malware

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| VirusTotal | 5 | 5 | 5 | 4 | 5 | 4 | **ESSENCIAL** |
| Shodan | 5 | 5 | 5 | 4 | 5 | 3 | **ESSENCIAL** |
| Google Safe Browsing | 5 | 5 | 5 | 5 | 5 | 5 | **ESSENCIAL** |
| AbuseIPDB | 4 | 5 | 5 | 5 | 4 | 4 | **IMPORTANTE** |
| SecurityTrails | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Censys | 4 | 4 | 4 | 3 | 3 | 3 | **OPCIONAL** |
| Pulsedive | 3 | 3 | 4 | 3 | 3 | 4 | **OPCIONAL** |
| URLScan.io | 3 | 4 | 4 | 4 | 3 | 4 | **OPCIONAL** |
| Alienvault OTX | 4 | 4 | 4 | 4 | 3 | 4 | **OPCIONAL** |
| CRXcavator | 2 | 3 | 3 | 3 | 2 | 4 | **EXPERIMENTAL** |

## 22. Blockchain & Cripto

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| CoinGecko | 5 | 5 | 4 | 5 | 5 | 4 | **ESSENCIAL** |
| Etherscan | 5 | 5 | 4 | 4 | 5 | 4 | **ESSENCIAL** |
| CoinMarketCap | 5 | 5 | 4 | 4 | 5 | 3 | **IMPORTANTE** |
| The Graph | 4 | 5 | 4 | 4 | 4 | 4 | **IMPORTANTE** |
| Binance | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Covalent | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Bitquery | 3 | 4 | 4 | 3 | 3 | 3 | **OPCIONAL** |
| Chainlink | 5 | 4 | 5 | 3 | 5 | 4 | **OPCIONAL** |
| Blockscout | 4 | 3 | 4 | 3 | 3 | 5 | **OPCIONAL** |
| Nownodes | 3 | 3 | 4 | 3 | 2 | 3 | **EXPERIMENTAL** |

## 23. IoT & Hardware

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Arduino Cloud | 4 | 4 | 4 | 5 | 5 | 4 | **IMPORTANTE** |
| Home Assistant | 5 | 5 | 4 | 4 | 5 | 5 | **IMPORTANTE** |
| ThingsBoard | 4 | 4 | 4 | 4 | 3 | 4 | **OPCIONAL** |
| Particle | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Tasmota | 4 | 3 | 3 | 3 | 4 | 5 | **OPCIONAL** |
| Helium | 3 | 3 | 3 | 3 | 3 | 4 | **EXPERIMENTAL** |

## 24. Redes Sociais

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| GitHub | 5 | 5 | 5 | 5 | 5 | 5 | **ESSENCIAL** |
| Discord | 5 | 5 | 4 | 5 | 5 | 5 | **ESSENCIAL** |
| Slack | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| Telegram | 5 | 5 | 4 | 5 | 5 | 5 | **ESSENCIAL** |
| YouTube | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| Twitter/X | 5 | 4 | 4 | 4 | 5 | 2 | **IMPORTANTE** |
| Reddit | 5 | 5 | 4 | 5 | 5 | 5 | **IMPORTANTE** |
| LinkedIn | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Instagram | 5 | 4 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| TikTok | 4 | 4 | 4 | 4 | 4 | 3 | **IMPORTANTE** |
| Twitch | 5 | 5 | 4 | 5 | 5 | 5 | **IMPORTANTE** |
| Pinterest | 4 | 4 | 4 | 4 | 3 | 4 | **OPCIONAL** |
| Facebook | 5 | 5 | 5 | 4 | 5 | 3 | **OPCIONAL** |
| GitLab | 5 | 5 | 5 | 5 | 5 | 4 | **OPCIONAL** |
| Mastodon | 4 | 4 | 4 | 4 | 4 | 5 | **OPCIONAL** |
| Buffer | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| HackerNews | 5 | 3 | 3 | 5 | 5 | 5 | **OPCIONAL** |
| Product Hunt | 4 | 4 | 4 | 4 | 3 | 4 | **OPCIONAL** |
| Meetup | 4 | 3 | 3 | 3 | 3 | 3 | **EXPERIMENTAL** |

## 25. Mapas & Geolocalizacao

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Google Maps | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| Mapbox | 5 | 5 | 4 | 5 | 4 | 3 | **ESSENCIAL** |
| HERE Maps | 5 | 5 | 5 | 4 | 4 | 3 | **IMPORTANTE** |
| TomTom | 5 | 5 | 5 | 4 | 4 | 3 | **IMPORTANTE** |
| OpenStreetMap | 5 | 3 | 3 | 4 | 5 | 5 | **IMPORTANTE** |
| Foursquare | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Nominatim | 4 | 3 | 3 | 4 | 4 | 5 | **OPCIONAL** |
| IPstack | 4 | 3 | 3 | 5 | 3 | 4 | **OPCIONAL** |
| Google Geocoding | 5 | 5 | 5 | 5 | 5 | 2 | **OPCIONAL** |
---

## 26. Clima & Meio Ambiente

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| OpenWeatherMap | 5 | 5 | 4 | 5 | 5 | 4 | **ESSENCIAL** |
| WeatherAPI | 4 | 5 | 4 | 5 | 4 | 4 | **IMPORTANTE** |
| Tomorrow.io | 4 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| Visual Crossing | 4 | 4 | 4 | 4 | 3 | 3 | **IMPORTANTE** |
| Open-Meteo | 4 | 4 | 3 | 5 | 4 | 5 | **IMPORTANTE** |
| AccuWeather | 5 | 4 | 4 | 4 | 4 | 2 | **OPCIONAL** |
| Storm Glass | 3 | 4 | 3 | 4 | 3 | 3 | **OPCIONAL** |
| AQICN | 3 | 3 | 3 | 4 | 3 | 4 | **OPCIONAL** |
| US Weather (NOAA) | 5 | 3 | 3 | 3 | 4 | 5 | **OPCIONAL** |
| wttr.in | 4 | 3 | 2 | 5 | 4 | 5 | **OPCIONAL** |

## 27. Dados Publicos & Governamentais

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| data.gov | 5 | 4 | 3 | 3 | 4 | 5 | **IMPORTANTE** |
| IBGE | 5 | 3 | 3 | 3 | 3 | 5 | **IMPORTANTE** |
| NASA | 5 | 4 | 3 | 4 | 5 | 5 | **IMPORTANTE** |
| dados.gov.br | 5 | 3 | 3 | 3 | 3 | 5 | **OPCIONAL** |
| CEIS/CNEP | 5 | 2 | 3 | 2 | 2 | 5 | **OPCIONAL** |
| BCB | 5 | 3 | 3 | 3 | 3 | 5 | **OPCIONAL** |
| SEC | 5 | 3 | 3 | 2 | 3 | 5 | **OPCIONAL** |
| FDA | 5 | 4 | 3 | 3 | 4 | 5 | **OPCIONAL** |
| World Bank | 5 | 4 | 3 | 3 | 4 | 5 | **OPCIONAL** |
| REST Countries | 4 | 4 | 3 | 5 | 3 | 5 | **OPCIONAL** |

## 28. Finance & Investimentos

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Alpha Vantage | 4 | 5 | 4 | 5 | 4 | 4 | **ESSENCIAL** |
| Finnhub | 4 | 5 | 4 | 5 | 3 | 4 | **ESSENCIAL** |
| CoinGecko | 5 | 5 | 4 | 5 | 5 | 4 | **ESSENCIAL** |
| Yahoo Finance | 5 | 3 | 3 | 4 | 5 | 5 | **IMPORTANTE** |
| IEX Cloud | 4 | 5 | 4 | 5 | 3 | 3 | **IMPORTANTE** |
| Binance | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Marketstack | 3 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Fixer.io | 4 | 3 | 3 | 5 | 3 | 4 | **OPCIONAL** |
| Mercado Bitcoin | 4 | 3 | 4 | 3 | 3 | 3 | **OPCIONAL** |

## 29. Comercio & E-commerce

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Shopify | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| WooCommerce | 5 | 4 | 4 | 4 | 5 | 5 | **IMPORTANTE** |
| MercadoLibre | 5 | 4 | 5 | 4 | 4 | 3 | **IMPORTANTE** |
| Amazon SP-API | 5 | 4 | 5 | 3 | 5 | 3 | **IMPORTANTE** |
| eBay | 5 | 5 | 5 | 4 | 5 | 3 | **OPCIONAL** |
| Etsy | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Magento | 5 | 4 | 5 | 3 | 5 | 2 | **OPCIONAL** |

## 30. Transporte & Logistica

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Google Maps Directions | 5 | 5 | 5 | 5 | 5 | 2 | **ESSENCIAL** |
| Aftership | 4 | 5 | 4 | 5 | 4 | 3 | **ESSENCIAL** |
| FedEx | 5 | 4 | 5 | 3 | 5 | 3 | **IMPORTANTE** |
| UPS | 5 | 4 | 5 | 3 | 5 | 3 | **IMPORTANTE** |
| DHL | 5 | 4 | 5 | 3 | 5 | 3 | **IMPORTANTE** |
| Uber | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| Correios | 5 | 3 | 4 | 3 | 3 | 4 | **IMPORTANTE** |
| GraphHopper | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| BlaBlaCar | 4 | 3 | 3 | 3 | 3 | 4 | **OPCIONAL** |
| 99 | 4 | 3 | 4 | 3 | 3 | 3 | **EXPERIMENTAL** |
---

## 31. Saude & Fitness

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Fitbit | 5 | 5 | 5 | 4 | 5 | 4 | **IMPORTANTE** |
| Strava | 4 | 5 | 5 | 5 | 5 | 4 | **IMPORTANTE** |
| Google Fit | 5 | 5 | 5 | 4 | 5 | 5 | **IMPORTANTE** |
| Apple HealthKit | 5 | 5 | 5 | 3 | 5 | 5 | **OPCIONAL** |
| OpenFDA | 5 | 4 | 3 | 3 | 4 | 5 | **OPCIONAL** |
| WHO | 5 | 3 | 3 | 2 | 4 | 5 | **OPCIONAL** |

## 32. Desenvolvimento & DevOps

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| GitHub | 5 | 5 | 5 | 5 | 5 | 5 | **ESSENCIAL** |
| GitLab | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| Vercel | 4 | 5 | 4 | 5 | 4 | 4 | **ESSENCIAL** |
| Netlify | 4 | 5 | 4 | 5 | 4 | 4 | **IMPORTANTE** |
| Docker Hub | 5 | 5 | 5 | 5 | 5 | 4 | **IMPORTANTE** |
| CircleCI | 5 | 5 | 5 | 4 | 5 | 3 | **IMPORTANTE** |
| PagerDuty | 5 | 5 | 5 | 4 | 5 | 2 | **IMPORTANTE** |
| Bitbucket | 5 | 5 | 5 | 4 | 5 | 4 | **OPCIONAL** |
| npm | 5 | 4 | 4 | 5 | 5 | 5 | **OPCIONAL** |
| Travis CI | 5 | 4 | 4 | 4 | 4 | 3 | **OPCIONAL** |
| Heroku | 5 | 4 | 4 | 5 | 5 | 3 | **OPCIONAL** |
| Statuspage | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |

## 33. URL Shorteners

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Bitly | 5 | 5 | 4 | 5 | 5 | 3 | **IMPORTANTE** |
| TinyURL | 5 | 3 | 3 | 5 | 5 | 4 | **OPCIONAL** |
| Rebrandly | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| CleanURI | 3 | 3 | 3 | 5 | 2 | 5 | **OPCIONAL** |
| Kutt | 3 | 3 | 3 | 4 | 3 | 5 | **EXPERIMENTAL** |

## 34. Test Data & Mock APIs

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| JSONPlaceholder | 5 | 3 | 2 | 5 | 5 | 5 | **IMPORTANTE** |
| Mockaroo | 4 | 4 | 3 | 5 | 3 | 4 | **IMPORTANTE** |
| DummyJSON | 4 | 3 | 2 | 5 | 3 | 5 | **OPCIONAL** |
| FakeStoreAPI | 4 | 3 | 2 | 5 | 3 | 5 | **OPCIONAL** |
| RandomUser | 5 | 3 | 2 | 5 | 4 | 5 | **OPCIONAL** |
| FakerAPI | 3 | 3 | 2 | 5 | 2 | 5 | **OPCIONAL** |
| Postman Echo | 5 | 4 | 2 | 5 | 5 | 5 | **OPCIONAL** |
| WireMock | 5 | 5 | 3 | 4 | 4 | 5 | **OPCIONAL** |

## 35. Midia & Entretenimento

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Spotify | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| YouTube | 5 | 5 | 5 | 5 | 5 | 4 | **ESSENCIAL** |
| TMDB | 5 | 5 | 4 | 5 | 5 | 5 | **ESSENCIAL** |
| IMDb | 5 | 4 | 4 | 4 | 5 | 3 | **IMPORTANTE** |
| Deezer | 4 | 4 | 4 | 5 | 3 | 5 | **OPCIONAL** |
| Vimeo | 5 | 5 | 5 | 4 | 4 | 3 | **OPCIONAL** |
| TheTVDB | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Trakt | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Tidal | 4 | 4 | 4 | 4 | 3 | 3 | **OPCIONAL** |
| Genius | 4 | 4 | 4 | 5 | 3 | 4 | **OPCIONAL** |

## 36. Esportes

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| API-Football | 4 | 5 | 4 | 5 | 4 | 3 | **IMPORTANTE** |
| TheSportsDB | 4 | 4 | 3 | 5 | 4 | 4 | **IMPORTANTE** |
| balldontlie | 3 | 4 | 3 | 5 | 3 | 5 | **OPCIONAL** |
| Sportradar | 5 | 5 | 5 | 3 | 4 | 1 | **OPCIONAL** |
| ESPN API | 5 | 3 | 3 | 4 | 5 | 5 | **OPCIONAL** |
| OpenF1 | 3 | 3 | 3 | 4 | 3 | 5 | **OPCIONAL** |
| Ergast F1 | 4 | 3 | 3 | 4 | 3 | 5 | **EXPERIMENTAL** |

## 37. Noticias & Content

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| NewsAPI | 5 | 5 | 4 | 5 | 5 | 4 | **ESSENCIAL** |
| Guardian | 5 | 5 | 4 | 5 | 4 | 5 | **IMPORTANTE** |
| NYTimes | 5 | 5 | 4 | 4 | 5 | 4 | **IMPORTANTE** |
| GNews | 3 | 4 | 3 | 5 | 3 | 4 | **OPCIONAL** |
| Currents | 3 | 3 | 3 | 4 | 2 | 4 | **OPCIONAL** |
| Mediastack | 3 | 3 | 3 | 4 | 2 | 4 | **EXPERIMENTAL** |

## 38. Veiculos & Automotive

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| NHTSA | 5 | 3 | 3 | 4 | 3 | 5 | **IMPORTANTE** |
| Smartcar | 4 | 5 | 5 | 4 | 3 | 3 | **IMPORTANTE** |
| Mercedes-Benz | 5 | 4 | 5 | 3 | 4 | 3 | **OPCIONAL** |
| Kelley Blue Book | 5 | 3 | 3 | 3 | 4 | 3 | **OPCIONAL** |
| CarVector | 2 | 3 | 3 | 3 | 2 | 3 | **EXPERIMENTAL** |
| RevCarData | 2 | 2 | 2 | 2 | 2 | 3 | **EXPERIMENTAL** |

## 39. Fotografia & Imagens

| API | Mat | Doc | Seg | Fac | Com | Custo | Classificacao |
|-----|-----|-----|-----|-----|-----|-------|---------------|
| Cloudinary | 5 | 5 | 5 | 5 | 5 | 3 | **ESSENCIAL** |
| Unsplash | 5 | 5 | 4 | 5 | 5 | 5 | **ESSENCIAL** |
| Pexels | 4 | 5 | 4 | 5 | 4 | 5 | **IMPORTANTE** |
| Pixabay | 4 | 4 | 4 | 5 | 4 | 5 | **IMPORTANTE** |
| Imgur | 5 | 4 | 4 | 5 | 5 | 4 | **OPCIONAL** |
| Screenshotlayer | 4 | 3 | 3 | 5 | 3 | 4 | **OPCIONAL** |
| PlaceKitten | 3 | 2 | 2 | 5 | 3 | 5 | **OPCIONAL** |
| Lorem Picsum | 3 | 2 | 2 | 5 | 3 | 5 | **OPCIONAL** |
---

## Resumo Estatistico

### Por Classificacao

| Classificacao | Quantidade | % |
|---------------|------------|---|
| **ESSENCIAL** | 52 | 28% |
| **IMPORTANTE** | 58 | 31% |
| **OPCIONAL** | 62 | 33% |
| **EXPERIMENTAL** | 15 | 8% |
| **TOTAL** | **187** | **100%** |

### Por Dominio (Top 10 mais APIs ESSENCIAIS)

| Dominio | ESSENCIAL | IMPORTANTE | OPCIONAL | EXPERIMENTAL |
|---------|-----------|------------|----------|--------------|
| LLM | 4 | 4 | 2 | 0 |
| Redes Sociais | 4 | 6 | 8 | 1 |
| Comunicacao | 4 | 2 | 2 | 1 |
| IA & ML | 3 | 3 | 2 | 1 |
| Pagamentos | 3 | 3 | 2 | 0 |
| Desenvolvimento | 3 | 4 | 5 | 0 |
| Mapas | 2 | 3 | 4 | 0 |
| Email | 2 | 4 | 3 | 0 |
| Storage | 3 | 3 | 2 | 0 |
| Seguranca | 3 | 2 | 4 | 1 |

### APIs com Free Tier Generoso

| API | Free Tier | Observacoes |
|-----|-----------|-------------|
| OpenAI |  credito | Novos usuarios |
| Groq | Gratuito | Rate limits altos |
| DeepSeek |  credito | Modelos open-source |
| Hugging Face | Gratuito | Inference API |
| Telegram Bot | Gratuito | Sem limites |
| Discord | Gratuito | Bots |
| GitHub | Gratuito | Repositorios publicos |
| Supabase | 500MB | Postgres + Realtime |
| Vercel | 100GB | Frontend hosting |
| Netlify | 100GB | Static hosting |
| Cloudflare | Gratuito | CDN basico |
| Open-Meteo | Gratuito | Weather API |
| wttr.in | Gratuito | Weather terminal |
| JSONPlaceholder | Gratuito | Fake REST API |
| OpenStreetMap | Gratuito | Map data |
| Nominatim | Gratuito | Geocoding |
| TMDB | Gratuito | Movie/TV data |
| HackerNews | Gratuito | Tech news |

### Top 20 APIs para Fase 1 (ESSENCIAIS)

| # | API | Dominio | Justificativa |
|---|-----|---------|---------------|
| 1 | OpenAI | LLM | Padrado da industria |
| 2 | Anthropic | LLM | Claude, foco seguranca |
| 3 | Google Gemini | LLM | Google ecosystem |
| 4 | Groq | LLM | Ultra-rapido |
| 5 | Stripe | Pagamentos | Lider global |
| 6 | PayPal | Pagamentos | Trusted brand |
| 7 | Auth0 | Auth | Identity platform |
| 8 | Firebase Auth | Auth | Google ecosystem |
| 9 | Google Maps | Mapas | Lider absoluto |
| 10 | SendGrid | Email | Email delivery |
| 11 | Slack | Comunicacao | Team messaging |
| 12 | Discord | Comunicacao | Community |
| 13 | Telegram | Comunicacao | Bot platform |
| 14 | GitHub | DevOps | Code hosting |
| 15 | Cloudflare | CDN | CDN + Security |
| 16 | Datadog | Monitoramento | Observability |
| 17 | Sentry | Monitoramento | Error tracking |
| 18 | Shopify | E-commerce | Platform leader |
| 19 | DocuSign | Documentos | E-signatures |
| 20 | NewsAPI | Noticias | News aggregation |

---

*Matriz Tecnica gerada pela Sprint 11.2 — API Technical Evaluation*
