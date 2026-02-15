# NG Reports

Engineering final project - Intelligent error reporting system for Angular 18+.

Full-Stack application to collect and analyze reports with library to easily integrate any Angular 18+ application with
API.
Each report is automatically analyzed by AI that gives usefull hints about report and report severity.
Reports doesn't just collect user feedback, they collect all logs from application, routes, user interactions and
browser environment to provide developers with all information necessary to re-create or immediately identify the issue.

## Requirements

- OS: Ubuntu LTS
- RAM: Min 2-4 GB
- Disk: Min 30 GB - more if you want to use NG Reports to collect reports for many months from many projects

Windows is supported only for dev environment.
Any production setup on Windows machines is not supported by default.

## Installation

### Dev Environment

#### Linux

Open terminal, stay in project root directory.

1. Run `./scripts/install.sh` to install all dependencies.
2. Run `./scripts/post-install.sh` to setup database directories and config.
3. Run `./scripts/start-mongo.sh` to start database.
4. To run env in dev mode, just start `pnpm run dev`.

#### Windows

1. Install MongoDB Server.
2. Install NodeJS and NPM.
3. Install PNPM Package Manager.
4. Install globally @angular/cli and @nestjs/cli.
5. Run `pnpm run dev`.

### Prod Environment

Prod environment is configured to run only on Linux system.

1. Copy repository files into Linux machine / VPS.
2. Move into project root directory and stay here.
3. Run `./scripts/install.sh`.
4. Run `./scripts/post-install.sh`.
5. Run `./scripts/start-install.sh`, you can add this into CRON table.
6. Run `./scripts/start.sh`, you can add this into CRON table.
7. Add database port into UFW (`sudo ufw deny 27017`).

## Configuration

### API

File: `./apps/api/ng-reports.config.json`

|                  Property |       Default value       | Description                                                             |
|--------------------------:|:-------------------------:|-------------------------------------------------------------------------|
|               databaseUrl | mongodb://localhost:27017 | MongoDB database URL                                                    |
|                  panelUrl |   http://localhost:4300   | System panel URL                                                        |
|                      http |            {}             | HTTP Server options                                                     |
|              http.enabled |           true            | Enable HTTP Server                                                      |
|                 http.port |           3333            | HTTP Server Port                                                        |
|                     https |            {}             | HTTPS Server options                                                    |
|             https.enabled |           false           | Enable HTTPS Server                                                     |
|                https.port |            443            | HTTPS Server Port                                                       |
|      https.privateKeyPath |            ""             | Path to SSL certificate private key                                     |
|            https.certPath |            ""             | Path to SSL certificate certificate                                     |
|              defaultAdmin |            {}             | Default system admin account                                            |
|     defaultAdmin.username |           admin           | Default system admin username                                           |
|     defaultAdmin.password |           admin           | Default system admin password                                           |
|                       jwt |            {}             | JWT token settings                                                      |
|                jwt.secret |            "*"            | JWT Token secret, you MUST change this value for production deployments |
|      jwt.expiresInMinutes |            10             | JWT Token expiration time in minutes                                    |
|                 googleAPI |            {}             | Google Gemini API settings                                              |
| googleAPI.generativeAiKey |            "*"            | Gemini API Key                                                          |                                                          |
|           googleAPI.model | "gemini-3-flash-preview"  | Gemini model to process reports                                         |

#### How to get Gemini API Key?

1. Follow instructions from https://support.google.com/googleapi/answer/6158862?hl=en
2. https://console.cloud.google.com/apis/credentials?project=<project-name>
3. Insert API Key into `ng-reports.config.json` `googleAPI.generativeAiKey` field.

### Panel

File: `./apps/client-host/config.json`

|            Property | Default value | Description                                                                 |
|--------------------:|:-------------:|-----------------------------------------------------------------------------|
|                port |     5000      | Front-End host port                                                         |
|   clearRequireCache |     true      | Clear require cache from Node.js after startup - reduces usage of resources |
|                cors |     null      | {}                                                                          |
|         cors.origin |   string[]    | CORS configuration                                                          |
|        cors.methods |   string[]    | CORS allowed methods list                                                   |
| cors.allowedHeaders |   string[]    | CORS allowed headers list                                                   |
| cors.exposedHeaders |   string[]    | CORS allowed exposed headers list                                           |
|    cors.credentials |    boolean    | CORS enable credentials                                                     |

### System

1. Sign-in as admin into NG Reports panel.
2. Navigate to `System Config` view.

You can manage system functionalities from here, from data retention, API cors settings to AI settings and context.

## Usage

Sign-in as at least developer-role account and navigate to `Developers` view.
In this view you can find all information on how to install, configure and use NG Reports Angular library.