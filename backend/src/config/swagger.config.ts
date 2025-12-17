import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

/**
 * Custom CSS theme for Swagger UI matching LineUp frontend
 */
const customCss = `
  /* LineUp Theme for Swagger UI */
  
  /* Top bar styling */
  .swagger-ui .topbar {
    background-color: #3A5A6A; /* dark-cyan-blue */
    padding: 10px 0;
  }
  .swagger-ui .topbar-wrapper img {
    content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 30"><text x="0" y="22" fill="%23FFCF70" font-family="system-ui" font-weight="bold" font-size="20">LineUp</text></svg>');
  }
  
  /* Info section enhanced */
  .swagger-ui .info {
    margin: 30px 0;
  }
  .swagger-ui .info hgroup.main {
    margin-bottom: 20px;
  }
  .swagger-ui .info .title {
    font-size: 36px;
    font-weight: 700;
  }
  .swagger-ui .info .title small.version-stamp {
    background-color: #3A5A6A;
    border-radius: 20px;
    padding: 4px 12px;
  }
  .swagger-ui .info .description {
    font-size: 16px;
    line-height: 1.6;
    color: #555;
  }
  .swagger-ui .info .description p {
    margin-bottom: 12px;
  }
  .swagger-ui .topbar .download-url-wrapper .select-label select {
    border-color: #FFCF70;
  }
  .swagger-ui .topbar a {
    max-width: 180px;
  }
  
  /* Primary accent color - crocus yellow */
  .swagger-ui .btn.authorize {
    background-color: #FFCF70;
    border-color: #FFCF70;
    color: #1a1a1a;
  }
  .swagger-ui .btn.authorize:hover {
    background-color: #e6ba64;
    border-color: #e6ba64;
  }
  .swagger-ui .btn.authorize svg {
    fill: #1a1a1a;
  }
  
  /* Execute button */
  .swagger-ui .btn.execute {
    background-color: #FFCF70;
    border-color: #FFCF70;
    color: #1a1a1a;
  }
  .swagger-ui .btn.execute:hover {
    background-color: #e6ba64;
  }
  
  /* Try it out button */
  .swagger-ui .btn.try-out__btn {
    border-color: #3A5A6A;
    color: #3A5A6A;
  }
  .swagger-ui .btn.try-out__btn:hover {
    background-color: #3A5A6A;
    color: white;
  }
  
  /* Cancel button */
  .swagger-ui .btn.cancel {
    border-color: #6b6b6b;
    color: #6b6b6b;
  }
  
  /* Info section */
  .swagger-ui .info .title {
    color: #1a1a1a;
  }
  .swagger-ui .info a {
    color: #3A5A6A;
  }
  
  /* Operations */
  .swagger-ui .opblock.opblock-get .opblock-summary-method {
    background-color: #3A5A6A;
  }
  .swagger-ui .opblock.opblock-get .opblock-summary {
    border-color: #3A5A6A;
  }
  .swagger-ui .opblock.opblock-get {
    border-color: #3A5A6A;
    background: rgba(58, 90, 106, 0.1);
  }
  
  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background-color: #4a7c59;
  }
  .swagger-ui .opblock.opblock-post .opblock-summary {
    border-color: #4a7c59;
  }
  .swagger-ui .opblock.opblock-post {
    border-color: #4a7c59;
    background: rgba(74, 124, 89, 0.1);
  }
  
  .swagger-ui .opblock.opblock-put .opblock-summary-method {
    background-color: #FFCF70;
    color: #1a1a1a;
  }
  .swagger-ui .opblock.opblock-put .opblock-summary {
    border-color: #FFCF70;
  }
  .swagger-ui .opblock.opblock-put {
    border-color: #FFCF70;
    background: rgba(255, 207, 112, 0.1);
  }
  
  .swagger-ui .opblock.opblock-delete .opblock-summary-method {
    background-color: #c44;
  }
  .swagger-ui .opblock.opblock-delete .opblock-summary {
    border-color: #c44;
  }
  .swagger-ui .opblock.opblock-delete {
    border-color: #c44;
    background: rgba(204, 68, 68, 0.1);
  }
  
  /* Tags */
  .swagger-ui .opblock-tag {
    color: #1a1a1a;
    border-bottom: 1px solid #f0f0f0;
  }
  .swagger-ui .opblock-tag:hover {
    background: rgba(255, 207, 112, 0.1);
  }
  
  /* Models */
  .swagger-ui section.models {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
  }
  .swagger-ui section.models h4 {
    color: #1a1a1a;
  }
  .swagger-ui .model-box {
    background: #fafafa;
  }
  
  /* Response codes */
  .swagger-ui .responses-inner h4 {
    color: #1a1a1a;
  }
  .swagger-ui table.responses-table .response-col_status {
    color: #3A5A6A;
  }
  
  /* Schema */
  .swagger-ui .prop-type {
    color: #3A5A6A;
  }
  
  /* Parameter */
  .swagger-ui .parameter__name.required::after {
    color: #c44;
  }
  
  /* Links */
  .swagger-ui a.nostyle {
    color: #3A5A6A;
  }
  
  /* Scrollbar */
  .swagger-ui ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .swagger-ui ::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 4px;
  }
  .swagger-ui ::-webkit-scrollbar-thumb {
    background: #3A5A6A;
    border-radius: 4px;
  }
  .swagger-ui ::-webkit-scrollbar-thumb:hover {
    background: #2d4754;
  }
  
  /* Modal */
  .swagger-ui .dialog-ux .modal-ux-header h3 {
    color: #1a1a1a;
  }
  .swagger-ui .dialog-ux .modal-ux {
    border-radius: 12px;
  }
  .swagger-ui .auth-btn-wrapper .btn-done {
    background-color: #FFCF70;
    color: #1a1a1a;
  }
`;

/**
 * Swagger UI configuration options
 */
export const swaggerOptions = {
  customCss,
  customSiteTitle: "LineUp API Documentation",
  customfavIcon: "/favicon.ico",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

/**
 * Setup Swagger UI middleware for the Express app
 * @param app Express application instance
 * @param docsPath Path where docs will be served (default: "/docs")
 * @param swaggerJsonPath Path to swagger.json file
 */
export function setupSwagger(
  app: import("express").Application,
  docsPath: string = "/docs",
  swaggerJsonPath: string
): void {
  try {
    const swaggerDocument = JSON.parse(
      fs.readFileSync(swaggerJsonPath, "utf8")
    );
    app.use(
      docsPath,
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, swaggerOptions)
    );
  } catch (err) {
    console.error("Unable to load swagger.json:", err);
  }
}
