# 🏗️ PROPUESTA DE IMPLEMENTACIÓN
## Microservicio de Seguridad y Autenticación - msseguridad

---

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autor:** Equipo de Arquitectura  
**Estado:** Propuesta Técnica  

---

## 📑 ÍNDICE

1. [Visión General](#1-visión-general)
2. [Arquitectura de Negocio](#2-arquitectura-de-negocio)
3. [Arquitectura Técnica](#3-arquitectura-técnica)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Herramientas de Construcción](#5-herramientas-de-construcción)
6. [Ciclo de Vida de Software](#6-ciclo-de-vida-de-software)
7. [DevOps y Operaciones](#7-devops-y-operaciones)
8. [Plan de Implementación](#8-plan-de-implementación)

---

## 1. VISIÓN GENERAL

### 1.1 Objetivo del Proyecto

Implementar un **microservicio de seguridad y autenticación** robusto, escalable y compatible con estándares OAuth2/OIDC, que sirva como pilar de seguridad para todo el ecosistema de aplicaciones.

### 1.2 Principios Arquitectónicos

| Principio | Descripción |
|-----------|-------------|
| **Seguridad por Diseño** | Cada componente considera seguridad desde su concepción |
| **Zero Trust** | Nunca confiar, siempre verificar |
| **Least Privilege** | Mínimos privilegios necesarios |
| **Defense in Depth** | Múltiples capas de seguridad |
| **Stateless** | Servicio sin estado para escalabilidad horizontal |
| **API-First** | Diseño orientado a APIs RESTful |

### 1.3 Stakeholders y Expectativas

```
┌─────────────────────────────────────────────────────────────────┐
│                     MAPA DE STAKEHOLDERS                        │
└─────────────────────────────────────────────────────────────────┘

Desarrolladores                          Usuarios Finales
├── APIs claras y documentadas         ├── Experiencia simple
├── SDKs disponibles                     ├── Seguridad transparente
├── Logs de debug útiles               └── Acceso rápido

Administradores                        Auditores/Legal
├── Dashboard de gestión               ├── Logs inmutables
├── Alertas de seguridad               ├── Cumplimiento GDPR/SOC2
└── Reportes de auditoría                └── Retención garantizada

DevOps/SRE                             Ejecutivos
├── Monitoreo completo                 ├── ROI en seguridad
├── Auto-healing                         ├── Reducción de riesgo
└── Deployments sin downtime             └── Escalabilidad garantizada
```

---

## 2. ARQUITECTURA DE NEGOCIO

### 2.1 Contexto de Negocio

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA DE APLICACIONES                   │
└─────────────────────────────────────────────────────────────────┘

        ┌─────────────┐
        │  Web App    │────────────┐
        │  (SPA)      │            │
        └─────────────┘            │
                                   │
        ┌─────────────┐            │     ┌─────────────────────┐
        │ Mobile App  │────────────┼────▶│                     │
        │ (iOS/And)   │            │     │   msseguridad       │
        └─────────────┘            │     │                     │
                                   │     │  • Autenticación    │
        ┌─────────────┐            │     │  • Autorización     │
        │  API Public │────────────┘     │  • OAuth2/OIDC      │
        │  (Terceros) │                  │  • MFA              │
        └─────────────┘                  │  • Auditoría        │
                                         └──────────┬──────────┘
                                                    │
                       ┌────────────────────────────┼────────────────────────────┐
                       │                            │                            │
                       ▼                            ▼                            ▼
                ┌─────────────┐              ┌─────────────┐              ┌─────────────┐
                │ Microserv   │              │ Microserv   │              │ Microserv   │
                │  A          │              │  B          │              │  C          │
                │  (Ventas)   │              │  (Compras)  │              │  (RRHH)     │
                └─────────────┘              └─────────────┘              └─────────────┘
```

### 2.2 Capacidades de Negocio

```
┌─────────────────────────────────────────────────────────────────┐
│                  CAPACIDADES DE NEGOCIO                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │  GESTIÓN DE         │
                    │  IDENTIDAD          │
                    │                     │
                    │ • Registro          │
                    │ • Perfiles          │
                    │ • Datos personales  │
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
    ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
    │ AUTENTICACIÓN │  │ AUTORIZACIÓN  │  │  GOBIERNO     │
    │               │  │               │  │               │
    │ • Login/Logout│  │ • Roles       │  │ • Auditoría   │
    │ • MFA         │  │ • Permisos    │  │ • Reportes    │
    │ • Tokens      │  │ • Scopes      │  │ • Cumplimiento│
    │ • Sesiones    │  │ • Delegación  │  │ • Alertas     │
    └───────────────┘  └───────────────┘  └───────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  INTEGRACIÓN        │
                    │  FEDERADA           │
                    │                     │
                    │ • OAuth2            │
                    │ • OIDC              │
                    │ • SSO               │
                    │ • Social Login      │
                    └─────────────────────┘
```

### 2.3 Procesos de Negocio

#### Proceso: Onboarding de Usuario

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  START  │───▶│Registro │───▶│  Email  │───▶│ Activar │───▶│Asignar  │
│         │    │         │    │  Verify │    │  Cuenta │    │Rol Def. │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └────┬────┘
                                                                  │
                                                                  ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────────────┐
│   END   │◀───│ Acceso  │◀───│ Opcional│◀───│  Completar      │
│         │    │ App     │    │   MFA   │    │  Perfil         │
└─────────┘    └─────────┘    └─────────┘    └─────────────────┘
```

#### Proceso: Autenticación Segura

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Login  │───▶│Validar  │───▶│¿Bloqueo?│───▶│ ¿MFA    │───▶│Generar  │
│         │    │Password │    │         │    │Activo?  │    │Tokens   │
└─────────┘    └─────────┘    └────┬────┘    └────┬────┘    └────┬────┘
                                   │              │              │
                         ┌─────────┘              │              │
                         ▼                         ▼              ▼
                   ┌─────────┐              ┌─────────┐      ┌─────────┐
                   │ Rechazar│              │Verificar│      │ Sesión  │
                   │ + Log   │              │   MFA   │      │ Activa  │
                   └─────────┘              └─────────┘      └─────────┘
```

### 2.4 Entidades de Negocio

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODELO DE DOMINIO                            │
└─────────────────────────────────────────────────────────────────┘

┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│    USER       │────────▶│     ROLE      │────────▶│  PERMISSION   │
│               │ 1    *  │               │  *    * │               │
│ - id          │         │ - id          │         │ - id          │
│ - email       │         │ - name        │         │ - resource    │
│ - password    │         │ - slug        │         │ - action      │
│ - status      │         │ - hierarchy   │         │ - slug        │
│ - mfaEnabled  │         │ - isDefault   │         │ - conditions  │
└───────┬───────┘         └───────────────┘         └───────────────┘
        │
        │ 1                      ┌───────────────┐
        │                        │ REFRESH_TOKEN │
        ├───────────────────────▶│               │
        │ 1                  *   │ - id          │
        │                        │ - tokenHash   │
        ├───────────────────────▶│ - familyId    │
        │ 1                  *   │ - expiresAt     │
        │                        │ - isRevoked   │
        ├───────────────────────▶│ - metadata    │
        │ 1                  *   └───────────────┘
        │
        │                        ┌───────────────┐
        ├───────────────────────▶│ USER_SESSION  │
        │ 1                  *   │               │
        │                        │ - id          │
        │                        │ - ip          │
        │                        │ - userAgent   │
        │                        │ - isActive    │
        │                        │ - expiresAt   │
        │                        └───────────────┘
        │
        │                        ┌───────────────┐
        ├───────────────────────▶│   AUDIT_LOG   │
        │ 1                  *   │               │
        │                        │ - id          │
        │                        │ - action      │
        │                        │ - resource    │
        │                        │ - timestamp   │
        │                        │ - ip          │
        │                        └───────────────┘
        │
        │                        ┌───────────────┐
        └───────────────────────▶│ MFA_BACKUP    │
                             *   │   _CODE       │
                                 │               │
                                 │ - id          │
                                 │ - codeHash    │
                                 │ - usedAt      │
                                 └───────────────┘
```

---

## 3. ARQUITECTURA TÉCNICA

### 3.1 Vista de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA EN CAPAS                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER (Interfaces)                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │ REST API    │  │  Middleware  │  │   WebSocket         │     │
│  │ Controllers │  │  Auth/Rate   │  │   (Real-time)       │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER (Casos de Uso)                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │   Auth      │  │   User Mgmt  │  │   OAuth2/OIDC       │     │
│  │   Service   │  │   Service    │  │   Service           │     │
│  ├─────────────┤  ├──────────────┤  ├─────────────────────┤     │
│  │   MFA       │  │   Audit      │  │   Token             │     │
│  │   Service   │  │   Service    │  │   Service           │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│  DOMAIN LAYER (Lógica de Negocio)                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │   User      │  │   Token      │  │   Permission        │     │
│  │   Entity    │  │   Entity     │  │   Entity            │     │
│  ├─────────────┤  ├──────────────┤  ├─────────────────────┤     │
│  │   Password  │  │   JWT        │  │   Session           │     │
│  │   VO        │  │   Value Obj  │  │   Value Obj         │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER (Adapters)                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │   MySQL     │  │   Redis      │  │   Email             │     │
│  │   Adapter   │  │   Adapter    │  │   Adapter           │     │
│  ├─────────────┤  ├──────────────┤  ├─────────────────────┤     │
│  │   Argon2    │  │   JWT        │  │   Logger            │     │
│  │   Adapter   │  │   Adapter    │  │   Adapter           │     │
│  ├─────────────┤  ├──────────────┤  ├─────────────────────┤     │
│  │   TOTP      │  │   Cache      │  │   Event Bus         │     │
│  │   Adapter   │  │   Adapter    │  │   Adapter           │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECUENCIA DE REQUEST                         │
└─────────────────────────────────────────────────────────────────┘

     Cliente              API Gateway           Auth Service         Data Layer
        │                      │                      │                  │
        │ POST /auth/login     │                      │                  │
        │────────────────────▶│                      │                  │
        │                      │ Rate Limit Check     │                  │
        │                      │──────────┐           │                  │
        │                      │◀─────────┘           │                  │
        │                      │    Route to Service  │                  │
        │                      │─────────────────────▶│                  │
        │                      │                      │ Validate Input   │
        │                      │                      │──────────┐       │
        │                      │                      │◀─────────┘       │
        │                      │                      │    Check User      │
        │                      │                      │─────────────────▶│
        │                      │                      │◀─────────────────│
        │                      │                      │ Verify Password    │
        │                      │                      │ Argon2id verify    │
        │                      │                      │    Check MFA       │
        │                      │                      │ (if enabled)       │
        │                      │                      │─────────────────▶│
        │                      │                      │◀─────────────────│
        │                      │                      │ Generate Tokens    │
        │                      │                      │ (JWT RS256)        │
        │                      │                      │    Store Refresh   │
        │                      │                      │─────────────────▶│
        │                      │                      │◀─────────────────│
        │                      │                      │    Log Event       │
        │                      │                      │ (async)            │
        │                      │                      │─────────────────▶│
        │                      │    Return Response   │                  │
        │                      │◀─────────────────────│                  │
        │    Access + Refresh  │                      │                  │
        │◀─────────────────────│                      │                  │
        │                      │                      │                  │
```

### 3.3 Diagrama de Despliegue

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DE DESPLIEGUE                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         KUBERNETES CLUSTER                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      INGRESS (nginx)                         ││
│  │              TLS termination, routing                        ││
│  └───────────────────────────┬─────────────────────────────────┘│
│                              │                                   │
│  ┌───────────────────────────┴─────────────────────────────────┐│
│  │              SERVICE MESH (Istio/Linkerd) - opcional       ││
│  │              mTLS, traffic management                       ││
│  └───────────────────────────┬─────────────────────────────────┘│
│                              │                                   │
│  ┌───────────────────────────┴─────────────────────────────────┐│
│  │              msseguridad PODS (HPA: 3-10 replicas)          ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       ││
│  │  │  Pod 1      │  │  Pod 2      │  │  Pod 3      │       ││
│  │  │  Node.js    │  │  Node.js    │  │  Node.js    │  ...  ││
│  │  │  Express    │  │  Express    │  │  Express    │       ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘       ││
│  └─────────────────────────────────────────────────────────────┘│
│                              │                                   │
│  ┌───────────────────────────┼─────────────────────────────────┐│
│  │                           │         DATA LAYER              ││
│  │  ┌─────────────────────┐  │  ┌─────────────────────┐        ││
│  │  │   MySQL Primary     │◀─┼──│   MySQL Replica     │        ││
│  │  │   (StatefulSet)     │  │  │   (Read replicas)   │        ││
│  │  └─────────────────────┘  │  └─────────────────────┘        ││
│  │  ┌─────────────────────┐  │  ┌─────────────────────┐        ││
│  │  │   Redis Cluster     │  │  │   Redis Sentinel    │        ││
│  │  │   (Sessions/Cache)  │  │  │   (High Availability) │        ││
│  │  └─────────────────────┘  │  └─────────────────────┘        ││
│  └───────────────────────────┴─────────────────────────────────┘│
│                                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              OBSERVABILITY STACK                            ││
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   ││
│  │  │ Prometheus  │  │   Grafana   │  │    ELK / Loki       │   ││
│  │  │ (Metrics)   │  │ (Dashboards)│  │    (Logs)           │   ││
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│              EXTERNAL SERVICES                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │   SMTP      │  │   Vault     │  │   SonarQube         │    │
│  │  (Email)    │  │  (Secrets)  │  │  (Code Quality)      │    │
│  └─────────────┘  └─────────────┘  └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Arquitectura de Seguridad

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPAS DE SEGURIDAD                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CAPA 1: PERIMETER                                              │
│  • WAF (CloudFlare/AWS WAF)                                    │
│  • DDoS Protection                                               │
│  • Bot Detection                                                 │
│  • Geo-blocking (opcional)                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 2: NETWORK                                                │
│  • VPC / Private Subnets                                       │
│  • Network Policies (Kubernetes)                                 │
│  • Service Mesh mTLS                                           │
│  • Firewall rules                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 3: APPLICATION                                            │
│  • HTTPS / TLS 1.3                                               │
│  • Rate Limiting                                                 │
│  • Input Validation                                              │
│  • Authentication & Authorization                              │
│  • CORS policies                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 4: DATA                                                   │
│  • Encryption at Rest (AES-256)                                  │
│  • Encryption in Transit (TLS)                                   │
│  • Field-level encryption (PII)                                  │
│  • Backup encryption                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAPA 5: MONITORING                                             │
│  • Audit Logging                                                 │
│  • Intrusion Detection                                           │
│  • Anomaly Detection                                             │
│  • Alerting & Response                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. STACK TECNOLÓGICO

### 4.1 Stack Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACK TECNOLÓGICO COMPLETO                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  RUNTIME & LENGUAJE                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │  Node.js 20 │  │  TypeScript  │  │  ts-node / tsx      │     │
│  │  (LTS)      │  │  5.x         │  │  (dev runtime)      │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│  FRAMEWORK & MIDDLEWARE                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │  Express.js │  │  Helmet      │  │  express-rate-limit│     │
│  │  4.x        │  │  (security)  │  │  (throttling)       │     │
│  ├─────────────┤  ├──────────────┤  ├─────────────────────┤     │
│  │  CORS       │  │  compression │  │  express-validator  │     │
│  │             │  │              │  │  / Joi              │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│  BASE DE DATOS                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │  MySQL 8.0  │  │  TypeORM     │  │  Redis 7            │     │
│  │  (Primary)  │  │  0.3.x       │  │  (Cache/Sessions)   │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│  SEGURIDAD                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │  Argon2id   │  │  jsonwebtoken│  │  speakeasy          │     │
│  │  (passwords)│  │  / jose      │  │  (TOTP)             │     │
│  ├─────────────┤  ├──────────────┤  ├─────────────────────┤     │
│  │  crypto     │  │  node-rsa    │  │  passport.js        │     │
│  │  (native)   │  │  (keys)      │  │  (oauth strategy)   │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
├─────────────────────────────────────────────────────────────────┤
│  UTILIDADES                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │  Winston    │  │  dotenv      │  │  uuid               │     │
│  │  (logging)  │  │  (config)    │  │  (ids)              │     │
│  ├─────────────┤  ├──────────────┤  ├─────────────────────┤     │
│  │  date-fns   │  │  nodemailer  │  │  class-validator    │     │
│  │  (dates)    │  │  (email)     │  │  (DTOs)             │     │
│  └─────────────┘  └──────────────┘  └─────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Justificación del Stack

| Tecnología | Alternativas | Decisión | Justificación |
|------------|--------------|----------|---------------|
| **Node.js** | Deno, Bun | Node.js 20 LTS | Madurez, ecosistema, soporte enterprise |
| **TypeScript** | JavaScript | TypeScript 5.x | Tipado estático, mejor DX, menos bugs |
| **Express** | Fastify, Koa, NestJS | Express 4.x | Maduro, amplia comunidad, familiaridad equipo |
| **MySQL** | PostgreSQL, MongoDB | MySQL 8.0 | Requerimiento del cliente, JSON support, performance |
| **TypeORM** | Prisma, Sequelize, Knex | TypeORM | Decoradores, migrations, relaciones complejas |
| **Redis** | Memcached | Redis 7 | Estructuras de datos, TTL nativo, pub/sub |
| **Argon2id** | bcrypt, scrypt | Argon2id | Ganador Password Hashing Competition, OWASP recomendado |
| **JWT (RS256)** | HS256, ES256 | RS256 | Asimétrico, separación de firmado/verificación |

### 4.3 Dependencias package.json

```json
{
  "name": "msseguridad",
  "version": "1.0.0",
  "description": "Microservicio de seguridad y autenticación",
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    
    "typeorm": "^0.3.17",
    "mysql2": "^3.6.5",
    "ioredis": "^5.3.2",
    
    "argon2": "^0.31.2",
    "jose": "^5.1.3",
    "jsonwebtoken": "^9.0.2",
    "speakeasy": "^2.0.0",
    "qrcode": "^1.5.3",
    "node-rsa": "^1.1.1",
    
    "passport": "^0.6.0",
    "passport-oauth2": "^1.7.0",
    "passport-jwt": "^4.0.1",
    
    "joi": "^17.11.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.1",
    
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "uuid": "^9.0.1",
    "date-fns": "^3.0.0",
    "nodemailer": "^6.9.7",
    "dotenv": "^16.3.1",
    "reflect-metadata": "^0.1.13",
    "config": "^3.3.9"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/uuid": "^9.0.7",
    "@types/passport": "^1.0.16",
    "@types/joi": "^17.9.12",
    "@types/config": "^3.3.3",
    
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "tsx": "^4.6.2",
    "nodemon": "^3.0.2",
    
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2",
    "jest-mock-extended": "^3.0.5",
    
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "eslint-plugin-security": "^2.1.0",
    "eslint-plugin-node": "^11.1.0",
    
    "prettier": "^3.1.1",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    
    "@commitlint/cli": "^18.4.3",
    "@commitlint/config-conventional": "^18.4.3"
  }
}
```

---

## 5. HERRAMIENTAS DE CONSTRUCCIÓN

### 5.1 IDE y Desarrollo

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTORNO DE DESARROLLO                        │
└─────────────────────────────────────────────────────────────────┘

Editor: VS Code
├── Extensiones
│   ├── ESLint (linting en tiempo real)
│   ├── Prettier (formateo automático)
│   ├── TypeScript Importer
│   ├── REST Client (testing APIs)
│   ├── Thunder Client (alternativa Postman)
│   ├── Docker (gestión de contenedores)
│   └── Database Client (conexión MySQL/Redis)
│
├── Settings
│   ├── Format on save: true
│   ├── ESLint auto-fix on save: true
│   ├── Tab size: 2
│   └── TypeScript strict mode
│
└── Snippets personalizados para proyectos
```

### 5.2 Control de Calidad de Código

| Herramienta | Propósito | Integración |
|-------------|-----------|-------------|
| **ESLint** | Linting TypeScript/JavaScript | Pre-commit, CI |
| **Prettier** | Formateo consistente | Pre-commit, IDE |
| **TypeScript** | Type checking | Build, CI |
| **Husky** | Git hooks | Pre-commit |
| **lint-staged** | Lint solo archivos staged | Pre-commit |
| **Commitlint** | Conventional commits | Commit-msg hook |

### 5.3 Herramientas de Testing

```
┌─────────────────────────────────────────────────────────────────┐
│                    PIRÁMIDE DE TESTING                            │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │    E2E Tests        │  ← Supertest + Jest
                    │    (Few)            │     Flujos completos
                    │    ~10 tests        │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │  Integration Tests  │  ← TestContainers
                    │  (Some)             │     + Jest
                    │  ~50 tests          │     APIs + DB
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │    Unit Tests       │  ← Jest + mocks
                    │    (Many)           │     Services
                    │    ~200 tests       │     Domain
                    └─────────────────────┘

Cobertura Objetivo:
├── Líneas: 80%
├── Funciones: 80%
├── Branches: 70%
└── Statements: 80%
```

### 5.4 Seguridad en el Desarrollo

| Herramienta | Tipo | Propósito | Fase |
|-------------|------|-----------|------|
| **eslint-plugin-security** | SAST | Detectar patrones inseguros | Desarrollo |
| **npm audit** | SCA | Vulnerabilidades en deps | CI/CD |
| **Snyk** | SCA/SAST | Análisis continuo de seguridad | CI/CD |
| **Semgrep** | SAST | Reglas personalizadas de seguridad | CI/CD |
| **SonarQube** | SAST | Calidad y seguridad de código | CI/CD |
| **Trivy** | SCA/Container | Escaneo de imágenes Docker | CI/CD |
| **OWASP ZAP** | DAST | Testing dinámico | Staging |
| **GitLeaks** | Secrets | Detección de secretos | Pre-commit |
| **TruffleHog** | Secrets | Búsqueda de credenciales | CI/CD |

---

## 6. CICLO DE VIDA DE SOFTWARE

### 6.1 Metodología: Scrum + DevSecOps

```
┌─────────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DEVSECOPS                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│  PLAN   │──▶│  CODE   │──▶│  BUILD  │──▶│  TEST   │──▶│  SECURE │
│         │   │         │   │         │   │         │   │         │
│ • Req   │   │ • Dev   │   │ • Lint  │   │ • Unit  │   │ • SAST  │
│ • Arch  │   │ • Peer  │   │ • Comp  │   │ • Int   │   │ • DAST  │
│ • Sprints│  │  review │   │ • Image │   │ • E2E   │   │ • SCA   │
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
     │                                                    │
     │         ┌─────────┐   ┌─────────┐   ┌─────────┐   │
     └────────▶│ DEPLOY  │◀──│ RELEASE │◀──│ PACKAGE │◀──┘
               │         │   │         │   │         │
               │ • K8s   │   │ • Tag   │   │ • Image │
               │ • Blue  │   │ • Notes │   │ • SBOM  │
               │   /Green│   │ • Comms │   │         │
               └─────────┘   └─────────┘   └─────────┘
                     │
                     ▼
               ┌─────────┐   ┌─────────┐
               │ OPERATE │──▶│ MONITOR │
               │         │   │         │
               │ • Run   │   │ • Logs  │
               │ • Scale │   │ • Met   │
               │ • Backup│   │ • Alert │
               └─────────┘   └─────────┘
```

### 6.2 Flujo de Trabajo Git

```
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB FLOW (Simplificado)                   │
└─────────────────────────────────────────────────────────────────┘

main (protegida)
  │
  │  1. Crear feature branch
  ├── feature/REQ-123-login-mfa
  │     │
  │     │ 2. Desarrollo + commits
  │     │ • feat: add MFA service
  │     │ • test: add MFA unit tests
  │     │ • docs: update API spec
  │     │
  │     │ 3. Pre-commit hooks
  │     │ • ESLint ✓
  │     │ • Prettier ✓
  │     │ • Tests staged ✓
  │     │ • Commitlint ✓
  │     │
  │     │ 4. Push + PR
  │     ├──▶ Pull Request
  │           │
  │           │ 5. CI/CD Pipeline
  │           │ • Build ✓
  │           │ • Tests ✓
  │           │ • Security scans ✓
  │           │ • SonarQube ✓
  │           │
  │           │ 6. Code Review
  │           │ • Aprobación required
  │           │ • No security issues
  │           │
  │◀──────────┘ 7. Merge squash
  │
  │ 8. Deploy automático (staging)
  │
  └── tag: v1.2.0 ──▶ Deploy producción
```

### 6.3 Pipeline CI/CD

```yaml
# .github/workflows/cicd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ───────────────────────────────────────────────
  # FASE 1: CODE QUALITY
  # ───────────────────────────────────────────────
  lint-and-format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run typecheck

  # ───────────────────────────────────────────────
  # FASE 2: SECURITY SCANS (SAST + SCA)
  # ───────────────────────────────────────────────
  security-scan:
    runs-on: ubuntu-latest
    needs: lint-and-format
    steps:
      - uses: actions/checkout@v4
      
      # npm audit
      - name: Run npm audit
        run: npm audit --audit-level=moderate
      
      # Snyk
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      # Semgrep
      - name: Run Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/owasp-top-ten
            p/cwe-top-25
            p/nodejs
            p/typescript
      
      # Secret scanning
      - name: Run GitLeaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # ───────────────────────────────────────────────
  # FASE 3: TESTING
  # ───────────────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    needs: security-scan
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      # Unit tests
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      
      # Integration tests
      - name: Run integration tests
        run: npm run test:integration
        env:
          DB_HOST: localhost
          DB_PORT: 3306
          REDIS_HOST: localhost
      
      # Upload coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # ───────────────────────────────────────────────
  # FASE 4: SONARQUBE ANALYSIS
  # ───────────────────────────────────────────────
  sonarqube:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        with:
          scanMetadataReportFile: .scannerwork/report-task.txt
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

  # ───────────────────────────────────────────────
  # FASE 5: BUILD & PACKAGE
  # ───────────────────────────────────────────────
  build:
    runs-on: ubuntu-latest
    needs: [test, sonarqube]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      # Build Docker image
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build image
        run: docker build -t msseguridad:${{ github.sha }} .
      
      # Scan Docker image
      - name: Scan image with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'msseguridad:${{ github.sha }}'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      # Generate SBOM
      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          image: 'msseguridad:${{ github.sha }}'

  # ───────────────────────────────────────────────
  # FASE 6: DEPLOY STAGING
  # ───────────────────────────────────────────────
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Deploy to Staging
        run: |
          echo "Deploying to staging..."
          # kubectl apply -f k8s/staging/

  # ───────────────────────────────────────────────
  # FASE 7: DEPLOY PRODUCTION
  # ───────────────────────────────────────────────
  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          echo "Deploying to production..."
          # kubectl apply -f k8s/production/
```

### 6.4 Estrategia de Versionado

| Versión | Formato | Ejemplo | Significado |
|---------|---------|---------|-------------|
| **Major** | X.0.0 | 2.0.0 | Cambios breaking (API v2) |
| **Minor** | x.Y.0 | 1.3.0 | Nuevas features, compatible |
| **Patch** | x.y.Z | 1.3.2 | Bug fixes, seguridad |

**Conventional Commits:**
```
feat: add MFA support
fix: resolve token rotation bug
docs: update API documentation
test: add integration tests for OAuth
refactor: improve password validation
security: fix JWT algorithm confusion
chore: update dependencies
```

---

## 7. DEVOPS Y OPERACIONES

### 7.1 Infraestructura como Código

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRAESTRUCTURA (Terraform)                  │
└─────────────────────────────────────────────────────────────────┘

infrastructure/
├── modules/
│   ├── kubernetes/         # GKE/EKS/AKS
│   ├── mysql/              # Cloud SQL
│   ├── redis/              # Memorystore
│   ├── networking/         # VPC, subnets
│   └── monitoring/         # Prometheus/Grafana
│
├── environments/
│   ├── development/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/
│   └── production/
│
└── global/
    └── dns.tf              # Cloud DNS
```

### 7.2 Orquestación con Kubernetes

```yaml
# k8s/base/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: msseguridad
  labels:
    app: msseguridad
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: msseguridad
  template:
    metadata:
      labels:
        app: msseguridad
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: msseguridad
          image: msseguridad:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              name: http
          env:
            - name: NODE_ENV
              value: "production"
            - name: DB_HOST
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: host
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: msseguridad-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: msseguridad
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### 7.3 Monitoreo y Observabilidad

```
┌─────────────────────────────────────────────────────────────────┐
│                    STACK DE OBSERVABILIDAD                    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐      ┌─────────────┐      ┌─────────────────────┐
│  Prometheus │◀────▶│   Grafana   │      │      AlertManager   │
│  (Metrics)  │      │ (Dashboards)│      │    (Notifications)  │
└──────┬──────┘      └─────────────┘      └─────────────────────┘
       │
       │ Pull metrics
       │
┌──────┴──────────────────────────────────────────────────────────┐
│                    APLICACIÓN (msseguridad)                   │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ prom-client │  │  Winston     │  │  OpenTelemetry      │  │
│  │ (custom)    │  │  (logs)      │  │  (tracing)          │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
       │                              │
       │ Logs                         │ Traces
       ▼                              ▼
┌─────────────────────┐      ┌─────────────────────┐
│   Loki / ELK        │      │   Jaeger / Zipkin   │
│   (Log aggregation) │      │   (Distributed)     │
└─────────────────────┘      └─────────────────────┘
```

**Dashboards Grafana:**
- Overview de servicio (RPS, latencia, errores)
- Métricas de seguridad (login attempts, bloqueos)
- Métricas de negocio (usuarios activos, tokens emitidos)
- Métricas de infraestructura (CPU, memoria, DB connections)

**Alertas:**
| Condición | Severidad | Acción |
|-----------|-----------|--------|
| Error rate > 5% | Critical | PagerDuty |
| Latencia p99 > 1s | Warning | Slack |
| Failed logins > 100/min | Warning | Email security team |
| DB connections > 80% | Warning | Auto-scale |

### 7.4 Estrategia de Backup

| Componente | Frecuencia | Retención | Método |
|------------|------------|-----------|--------|
| MySQL | Diario | 30 días | mysqldump + binlogs |
| MySQL | Cada 6 horas | 7 días | Snapshots volumen |
| Redis | Continuo | N/A | AOF + RDB |
| Configuración | Cada cambio | Infinito | Git + Vault |

---

## 8. PLAN DE IMPLEMENTACIÓN

### 8.1 Roadmap

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROADMAP DE IMPLEMENTACIÓN                    │
└─────────────────────────────────────────────────────────────────┘

Q1 2026 (3 meses)          Q2 2026 (3 meses)          Q3 2026 (2 meses)
┌──────────────────┐      ┌──────────────────┐      ┌──────────┐
│ MVP - Core Auth    │      │ Feature Complete │      │ Hardening│
│                    │      │                  │      │          │
│ • Setup proyecto   │─────▶│ • MFA            │─────▶│ • SOC2   │
│ • Arquitectura     │      │ • OAuth2/OIDC    │      │   prep   │
│ • Modelo datos     │      │ • Admin panel    │      │ • Stress │
│ • Registro/Login   │      │ • Audit logs     │      │   tests  │
│ • JWT básico       │      │ • Rate limiting  │      │ • Pen    │
│ • Tests unit       │      │ • Email service  │      │   testing│
│ • CI/CD            │      │ • Docs completos │      │ • DR     │
│ • Deploy staging   │      │ • Deploy prod    │      │   drills │
└──────────────────┘      └──────────────────┘      └──────────┘
     Sprint 1-6               Sprint 7-12             Sprint 13-16
```

### 8.2 Estimación de Esfuerzo

| Fase | Esfuerzo | Equipo |
|------|----------|--------|
| Setup y arquitectura | 2 semanas | Arquitecto + Tech Lead |
| Core authentication | 4 semanas | 2 Backend devs |
| OAuth2/OIDC | 3 semanas | 2 Backend devs |
| MFA y seguridad | 2 semanas | 2 Backend devs |
| Admin panel | 2 semanas | 1 Full-stack + 1 Backend |
| Testing y QA | 2 semanas | QA + Devs |
| DevOps y deploy | 2 semanas | DevOps + Backend |
| Documentación | 1 semana | Tech Writer + Devs |
| **TOTAL** | **18 semanas** | **4-5 personas** |

### 8.3 Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Complejidad OAuth2 | Media | Alto | Usar librería probada (node-oauth2-server) |
| Performance con escala | Media | Alto | Diseño stateless + cache desde inicio |
| Vulnerabilidad de seguridad | Baja | Crítico | Security by design + pentesting |
| Cambios de requerimientos | Alta | Medio | MVP incremental, feedback temprano |
| Integración con sistemas legacy | Media | Medio | Adaptadores, API gateway |

### 8.4 Checklist de Entrega

**Funcional:**
- [ ] Todas las APIs documentadas (OpenAPI)
- [ ] Tests unitarios > 80% cobertura
- [ ] Tests de integración pasando
- [ ] Tests E2E pasando
- [ ] No vulnerabilities críticas/alta

**Seguridad:**
- [ ] Pentest externo completado
- [ ] Checklist OWASP ASVS completado
- [ ] Secrets management implementado
- [ ] MFA funcional
- [ ] Audit logging completo

**Operaciones:**
- [ ] Monitoreo configurado
- [ ] Alertas funcionando
- [ ] Runbooks documentados
- [ ] DR probado
- [ ] Backups automatizados

---

*Fin de la Propuesta de Implementación*
