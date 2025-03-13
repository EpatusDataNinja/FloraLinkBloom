export const printStyles = `
  @media print {
    .sidebar-wrapper,
    .header,
    .dashboard-sidebar,
    .print-button,
    .filter-section {
      display: none !important;
    }

    .dashboard-main {
      margin-left: 0 !important;
      padding: 0 !important;
    }

    .dashboard-content {
      box-shadow: none !important;
      padding: 0 !important;
    }

    .report-container {
      padding: 0 !important;
    }

    body {
      background: white !important;
    }

    @page {
      margin: 2cm;
    }

    .no-print {
      display: none !important;
    }

    .print-only {
      display: block !important;
    }

    .print-break-after {
      page-break-after: always;
    }

    .print-break-before {
      page-break-before: always;
    }

    .print-avoid-break {
      page-break-inside: avoid;
    }

    /* Ensure charts and tables are not cut off */
    canvas {
      max-width: 100% !important;
      height: auto !important;
    }

    table {
      page-break-inside: avoid;
    }

    /* Header styling for each printed page */
    .print-header {
      position: running(header);
      width: 100%;
      text-align: center;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }

    /* Footer styling for each printed page */
    .print-footer {
      position: running(footer);
      width: 100%;
      text-align: center;
      padding: 10px;
      border-top: 1px solid #ddd;
    }

    /* Report title styling */
    .report-title {
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 20px;
    }

    /* Report metadata styling */
    .report-metadata {
      margin-bottom: 30px;
      font-size: 12px;
    }

    /* Table styling for print */
    .table {
      font-size: 12px;
      width: 100%;
      border-collapse: collapse;
    }

    .table th,
    .table td {
      border: 1px solid #ddd;
      padding: 8px;
    }

    /* Chart containers */
    .chart-container {
      margin: 20px 0;
      page-break-inside: avoid;
    }

    /* Summary sections */
    .summary-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #ddd;
      page-break-inside: avoid;
    }

    /* Additional styles for better print layout */

    /* Hide dashboard elements when printing */
    .dashboard-layout header,
    .dashboard-sidebar,
    .mobile-sidebar,
    .btn-print,
    .filters-section {
      display: none !important;
    }

    /* Reset dashboard layout for printing */
    .dashboard-main {
      margin-left: 0 !important;
      padding: 0 !important;
    }

    /* Improve chart readability */
    .chart-container {
      background-color: white !important;
      margin: 30px 0 !important;
      padding: 15px !important;
      box-shadow: none !important;
    }

    /* Enhance table readability */
    .table thead th {
      background-color: #f8f9fa !important;
      color: #000 !important;
      font-weight: bold !important;
    }

    .table tbody tr:nth-child(even) {
      background-color: #f8f9fa !important;
    }

    /* Add page numbers */
    @page {
      @bottom-right {
        content: "Page " counter(page) " of " counter(pages);
      }
    }

    /* Improve text readability */
    p, span, td, th {
      color: #000 !important;
      font-size: 11pt !important;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #000 !important;
      page-break-after: avoid !important;
    }

    /* Handle long URLs and text */
    a {
      word-wrap: break-word;
      color: #000 !important;
      text-decoration: none !important;
    }

    /* Ensure images print properly */
    img {
      max-width: 100% !important;
      page-break-inside: avoid !important;
    }

    /* Grid system adjustments */
    .row {
      display: block !important;
      page-break-inside: avoid !important;
    }

    .col {
      width: 100% !important;
      float: none !important;
      page-break-inside: avoid !important;
    }

    /* Date range and filter summary */
    .report-filters-summary {
      border: 1px solid #ddd;
      padding: 10px;
      margin-bottom: 20px;
      page-break-inside: avoid;
      background-color: #f8f9fa !important;
    }

    /* Watermark for draft/preview reports */
    .report-draft::before {
      content: "DRAFT";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      color: rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }

    /* Logo positioning */
    .report-logo {
      max-height: 50px !important;
      margin-bottom: 20px !important;
    }

    /* Signature section */
    .signature-section {
      margin-top: 50px;
      page-break-inside: avoid;
      display: flex;
      justify-content: space-between;
    }

    .signature-box {
      border-top: 1px solid #000;
      width: 200px;
      text-align: center;
      padding-top: 5px;
    }

    /* QR Code section for report verification */
    .report-qr {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 100px !important;
      height: 100px !important;
    }

    /* Critical information highlighting */
    .highlight-critical {
      background-color: #fff3cd !important;
      padding: 2px 5px;
    }

    /* Report metadata enhancements */
    .report-metadata {
      display: grid;
      grid-template-columns: auto auto;
      gap: 10px;
      font-size: 10pt !important;
      color: #666 !important;
    }

    /* Ensure last page footer space */
    .report-content::after {
      content: "";
      display: block;
      height: 100px;
    }
  }
`;