<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html lang="en">
      <head>
        <title>XML Sitemap | Origintra Exim - Indian Spices Exporter</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <style type="text/css">
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f8fafc;
            color: #0f172a;
            line-height: 1.5;
            padding: 2rem 1rem;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          header {
            background: #0a1c3e;
            color: #ffffff;
            padding: 2.25rem 2rem;
            border-radius: 1rem;
            box-shadow: 0 10px 25px -5px rgba(10, 28, 62, 0.2);
            margin-bottom: 2rem;
          }
          .brand-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: -0.025em;
          }
          .badge-sitemap {
            background: rgba(56, 189, 248, 0.15);
            color: #38bdf8;
            border: 1px solid rgba(56, 189, 248, 0.3);
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          header p {
            color: #94a3b8;
            font-size: 0.925rem;
            max-width: 800px;
          }
          
          /* Featured Home Page Highlight Card */
          .featured-home-card {
            background: #ffffff;
            border: 2px solid #0070e0;
            border-radius: 1rem;
            padding: 1.75rem 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px -10px rgba(0, 112, 224, 0.15);
            position: relative;
            overflow: hidden;
          }
          .featured-home-card::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0070e0, #38bdf8, #10b981);
          }
          .featured-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 0.75rem;
          }
          .featured-tag::before {
            content: "★";
            color: #059669;
          }
          .featured-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: #0a1c3e;
            margin-bottom: 0.35rem;
          }
          .featured-url {
            font-size: 1rem;
            color: #0070e0;
            text-decoration: none;
            font-weight: 600;
            word-break: break-all;
          }
          .featured-url:hover {
            text-decoration: underline;
          }
          .featured-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #f1f5f9;
            font-size: 0.85rem;
            color: #64748b;
          }
          .featured-meta strong {
            color: #0f172a;
          }

          /* Summary Stats */
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
          }
          .stat-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.75rem;
            padding: 1.25rem;
          }
          .stat-label {
            font-size: 0.75rem;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: #0a1c3e;
            margin-top: 0.25rem;
          }

          /* Table Styles */
          .table-wrapper {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.875rem;
          }
          thead {
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
          }
          th {
            padding: 0.875rem 1rem;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
          }
          tbody tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.15s;
          }
          tbody tr:hover {
            background: #f8fafc;
          }
          tbody tr.home-row {
            background: #f0fdf4;
            font-weight: 600;
          }
          tbody tr.home-row:hover {
            background: #dcfce7;
          }
          td {
            padding: 0.875rem 1rem;
            vertical-align: middle;
          }
          td a {
            color: #0070e0;
            text-decoration: none;
            word-break: break-all;
          }
          td a:hover {
            text-decoration: underline;
          }
          .priority-pill {
            display: inline-block;
            padding: 0.2rem 0.55rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            text-align: center;
          }
          .priority-10 {
            background: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
          }
          .priority-09 {
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
          }
          .priority-08 {
            background: #f0fdfa;
            color: #0d9488;
            border: 1px solid #99f6e4;
          }
          .priority-low {
            background: #f1f5f9;
            color: #64748b;
          }
          .changefreq {
            color: #475569;
            text-transform: capitalize;
          }
          .lastmod {
            color: #64748b;
            font-variant-numeric: tabular-nums;
          }
          .image-count {
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            background: #f1f5f9;
            color: #475569;
            padding: 0.15rem 0.5rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
          }
          footer {
            margin-top: 2rem;
            text-align: center;
            color: #94a3b8;
            font-size: 0.8rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <div class="brand-row">
              <h1>Origintra Exim — XML Sitemap</h1>
              <span class="badge-sitemap">Google &amp; Bing Compliant</span>
            </div>
            <p>
              Official search engine index for Origintra Exim (Government of India Spices Board &amp; APEDA certified spices exporter). Generated for optimal search crawler indexing and rich snippet discovery.
            </p>
          </header>

          <!-- Featured Home Page Highlight Card -->
          <xsl:for-each select="//*[local-name()='url'][1]">
            <div class="featured-home-card">
              <span class="featured-tag">Primary Landing &amp; Commercial Gateway</span>
              <div class="featured-title">Home Page — Highest Priority (1.00)</div>
              <div>
                <a class="featured-url">
                  <xsl:attribute name="href">
                    <xsl:value-of select="*[local-name()='loc']"/>
                  </xsl:attribute>
                  <xsl:value-of select="*[local-name()='loc']"/>
                </a>
              </div>
              <div class="featured-meta">
                <div>Priority: <strong>1.00 (Maximum)</strong></div>
                <div>Change Frequency: <strong><xsl:value-of select="*[local-name()='changefreq']"/></strong></div>
                <div>Last Updated: <strong><xsl:value-of select="*[local-name()='lastmod']"/></strong></div>
                <div>Indexed Images: <strong><xsl:value-of select="count(*[local-name()='image'])"/> Rich Visuals</strong></div>
              </div>
            </div>
          </xsl:for-each>

          <!-- Summary Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Indexed URLs</div>
              <div class="stat-value"><xsl:value-of select="count(//*[local-name()='url'])"/></div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Total Indexed Images</div>
              <div class="stat-value"><xsl:value-of select="count(//*[local-name()='image'])"/></div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Top Priority URLs (≥ 0.90)</div>
              <div class="stat-value"><xsl:value-of select="count(//*[local-name()='url'][*[local-name()='priority'] &gt;= 0.90])"/></div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Primary Canonical Host</div>
              <div class="stat-value" style="font-size: 1.1rem; line-height: 2.2rem; color: #0070e0;">origintra.com</div>
            </div>
          </div>

          <!-- All URLs Table -->
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 45%;">URL Location</th>
                  <th style="width: 15%; text-align: center;">Priority</th>
                  <th style="width: 15%;">Change Frequency</th>
                  <th style="width: 15%;">Last Modified</th>
                  <th style="width: 10%; text-align: center;">Images</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="//*[local-name()='url']">
                  <tr>
                    <xsl:if test="position() = 1">
                      <xsl:attribute name="class">home-row</xsl:attribute>
                    </xsl:if>
                    <td>
                      <a>
                        <xsl:attribute name="href">
                          <xsl:value-of select="*[local-name()='loc']"/>
                        </xsl:attribute>
                        <xsl:value-of select="*[local-name()='loc']"/>
                      </a>
                      <xsl:if test="position() = 1">
                        <span style="margin-left: 0.5rem; font-size: 0.7rem; background: #059669; color: #fff; padding: 0.15rem 0.45rem; border-radius: 9999px; text-transform: uppercase;">Home</span>
                      </xsl:if>
                    </td>
                    <td style="text-align: center;">
                      <xsl:choose>
                        <xsl:when test="*[local-name()='priority'] = '1.0' or *[local-name()='priority'] = '1.00'">
                          <span class="priority-pill priority-10">1.00 Highest</span>
                        </xsl:when>
                        <xsl:when test="*[local-name()='priority'] &gt;= 0.90">
                          <span class="priority-pill priority-09"><xsl:value-of select="*[local-name()='priority']"/></span>
                        </xsl:when>
                        <xsl:when test="*[local-name()='priority'] &gt;= 0.80">
                          <span class="priority-pill priority-08"><xsl:value-of select="*[local-name()='priority']"/></span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span class="priority-pill priority-low"><xsl:value-of select="*[local-name()='priority']"/></span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                    <td class="changefreq"><xsl:value-of select="*[local-name()='changefreq']"/></td>
                    <td class="lastmod"><xsl:value-of select="*[local-name()='lastmod']"/></td>
                    <td style="text-align: center;">
                      <xsl:choose>
                        <xsl:when test="count(*[local-name()='image']) &gt; 0">
                          <span class="image-count">
                            <xsl:value-of select="count(*[local-name()='image'])"/>
                          </span>
                        </xsl:when>
                        <xsl:otherwise>
                          <span style="color: #cbd5e1;">—</span>
                        </xsl:otherwise>
                      </xsl:choose>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <footer>
            <p>© 2026 Origintra Exim. All rights reserved. | <a href="https://www.origintra.com" style="color: #0070e0; text-decoration: none;">Visit Website</a></p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
