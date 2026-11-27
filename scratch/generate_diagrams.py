import os

output_dir = r"c:\PROJECTS\CAPSTONE\report_assets"
os.makedirs(output_dir, exist_ok=True)

svg1 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 500" width="1100" height="500" style="background:white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
    <filter id="shadow" x="-3%" y="-3%" width="106%" height="108%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- Top Row Boxes -->
  <!-- Box 1: Multi-Container Ingestion -->
  <g filter="url(#shadow)">
    <rect x="40" y="50" width="280" height="150" rx="16" ry="16" fill="#eef6ff" stroke="#2563eb" stroke-width="2.5"/>
    <text x="180" y="105" text-anchor="middle" font-size="18" font-weight="700" fill="#1e3a8a">Multi-Container Ingestion</text>
    <text x="180" y="135" text-anchor="middle" font-size="13" fill="#3b82f6">Docker Socket (/var/run/docker.sock)</text>
    <text x="180" y="155" text-anchor="middle" font-size="13" fill="#3b82f6">cgroups Metrics &amp; Team Metadata</text>
  </g>

  <!-- Box 2: Telemetry Normalization Layer -->
  <g filter="url(#shadow)">
    <rect x="410" y="50" width="280" height="150" rx="16" ry="16" fill="#f0fdf4" stroke="#16a34a" stroke-width="2.5"/>
    <text x="550" y="100" text-anchor="middle" font-size="17" font-weight="700" fill="#14532d">Telemetry Normalization</text>
    <text x="550" y="125" text-anchor="middle" font-size="17" font-weight="700" fill="#14532d">&amp; Smoothing Layer</text>
    <text x="550" y="150" text-anchor="middle" font-size="13" fill="#15803d">Limit-Aligned Scaling (0.95/2 = 47.5%)</text>
    <text x="550" y="170" text-anchor="middle" font-size="13" fill="#15803d">EMA Jitter Mitigation Filter (&#945; = 0.4)</text>
  </g>

  <!-- Box 3: Failure & Drift Monitor -->
  <g filter="url(#shadow)">
    <rect x="780" y="50" width="280" height="150" rx="16" ry="16" fill="#f0fdf4" stroke="#15803d" stroke-width="2.5"/>
    <text x="920" y="105" text-anchor="middle" font-size="18" font-weight="700" fill="#14532d">Anomaly &amp; Waste Monitor</text>
    <text x="920" y="135" text-anchor="middle" font-size="13" fill="#15803d">&lt;20% Idle Workload Classifier</text>
    <text x="920" y="155" text-anchor="middle" font-size="13" fill="#15803d">State-Drift &amp; Degraded Recovery</text>
  </g>

  <!-- Bottom Row Boxes -->
  <!-- Box 4: O2 Reference Baseline Engine -->
  <g filter="url(#shadow)">
    <rect x="40" y="280" width="280" height="150" rx="16" ry="16" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
    <text x="180" y="335" text-anchor="middle" font-size="18" font-weight="700" fill="#1e293b">O2 Reference Baseline</text>
    <text x="180" y="365" text-anchor="middle" font-size="13" fill="#475569">Raw Host-Relative CPU/Mem Signals</text>
    <text x="180" y="385" text-anchor="middle" font-size="13" fill="#475569">Unfiltered Telemetry Oracle</text>
  </g>

  <!-- Box 5: O3 FinOps Analytics Engine -->
  <g filter="url(#shadow)">
    <rect x="410" y="280" width="280" height="150" rx="16" ry="16" fill="#fffbeb" stroke="#d97706" stroke-width="2.5"/>
    <text x="550" y="335" text-anchor="middle" font-size="18" font-weight="700" fill="#78350f">O3 FinOps Cost Engine</text>
    <text x="550" y="365" text-anchor="middle" font-size="13" fill="#b45309">Team Attribution (Platform, Growth, Infra)</text>
    <text x="550" y="385" text-anchor="middle" font-size="13" fill="#b45309">INR (&#8377;) Right-Sizing Savings Engine</text>
  </g>

  <!-- Box 6: Executive Dashboard & Audit -->
  <g filter="url(#shadow)">
    <rect x="780" y="280" width="280" height="150" rx="16" ry="16" fill="#faf5ff" stroke="#7c3aed" stroke-width="2.5"/>
    <text x="920" y="335" text-anchor="middle" font-size="18" font-weight="700" fill="#4c1d95">Evaluation &amp; Telemetry</text>
    <text x="920" y="365" text-anchor="middle" font-size="13" fill="#6d28d9">AC-1..AC-4 Acceptance Harness</text>
    <text x="920" y="385" text-anchor="middle" font-size="13" fill="#6d28d9">KPI-1..KPI-6 &amp; NT-1..NT-5 Suite</text>
  </g>

  <!-- Connecting Arrows -->
  <!-- Box 1 -> Box 2 (FR-1) -->
  <path d="M 320 125 L 406 125" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="365" y="115" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">FR-1</text>

  <!-- Box 2 -> Box 3 (FR-4) -->
  <path d="M 690 125 L 776 125" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="735" y="115" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">FR-4</text>

  <!-- Box 1 -> Box 4 (FR-2) -->
  <path d="M 180 200 L 180 276" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="155" y="245" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">FR-2</text>

  <!-- Box 4 -> Box 5 (Baseline) -->
  <path d="M 320 355 L 406 355" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="365" y="345" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">Baseline</text>

  <!-- Box 2 -> Box 5 (Normalized Stream) -->
  <path d="M 550 200 L 550 276" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="635" y="245" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">Normalized Limits</text>

  <!-- Box 5 -> Box 6 (FR-3) -->
  <path d="M 690 355 L 776 355" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="735" y="345" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">FR-3</text>

  <!-- Box 3 -> Box 6 (NT-1..5) -->
  <path d="M 920 200 L 920 276" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="975" y="245" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">NT-1..5</text>
</svg>"""

with open(os.path.join(output_dir, "figure_4_1_topology.svg"), "w", encoding="utf-8") as f:
    f.write(svg1)


svg2 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 500" width="1100" height="500" style="background:white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#334155"/>
    </marker>
    <filter id="shadow" x="-3%" y="-3%" width="106%" height="108%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- Left: AC-3 Evidence -->
  <g filter="url(#shadow)">
    <rect x="40" y="175" width="240" height="150" rx="16" ry="16" fill="#eef6ff" stroke="#2563eb" stroke-width="2.5"/>
    <text x="160" y="235" text-anchor="middle" font-size="18" font-weight="700" fill="#1e3a8a">AC-3 Evidence</text>
    <text x="160" y="265" text-anchor="middle" font-size="13" fill="#3b82f6">12 Versioned Microservices</text>
    <text x="160" y="285" text-anchor="middle" font-size="13" fill="#3b82f6">Multi-Team Label Workloads</text>
  </g>

  <!-- Top Center: O2 Baseline Run -->
  <g filter="url(#shadow)">
    <rect x="330" y="60" width="240" height="135" rx="16" ry="16" fill="#f8fafc" stroke="#64748b" stroke-width="2.5"/>
    <text x="450" y="115" text-anchor="middle" font-size="18" font-weight="700" fill="#1e293b">O2 Baseline Run</text>
    <text x="450" y="145" text-anchor="middle" font-size="13" fill="#475569">Unsmoothed Raw Metrics</text>
    <text x="450" y="165" text-anchor="middle" font-size="13" fill="#475569">Host Core Normalization</text>
  </g>

  <!-- Bottom Center: O3 Candidate Run -->
  <g filter="url(#shadow)">
    <rect x="330" y="305" width="240" height="135" rx="16" ry="16" fill="#fffbeb" stroke="#d97706" stroke-width="2.5"/>
    <text x="450" y="360" text-anchor="middle" font-size="18" font-weight="700" fill="#78350f">O3 Candidate Run</text>
    <text x="450" y="390" text-anchor="middle" font-size="13" fill="#b45309">Limit-Normalized + EMA</text>
    <text x="450" y="410" text-anchor="middle" font-size="13" fill="#b45309">INR Multi-Team Attribution</text>
  </g>

  <!-- Middle Center: KPI & Gate Check -->
  <g filter="url(#shadow)">
    <rect x="620" y="175" width="230" height="150" rx="16" ry="16" fill="#f0fdfa" stroke="#0f766e" stroke-width="2.5"/>
    <text x="735" y="235" text-anchor="middle" font-size="18" font-weight="700" fill="#134e4a">KPI &amp; Gate Check</text>
    <text x="735" y="265" text-anchor="middle" font-size="13" fill="#0f766e">KPI-1..KPI-6 Audit</text>
    <text x="735" y="285" text-anchor="middle" font-size="13" fill="#0f766e">AC-1..AC-4 Verification</text>
  </g>

  <!-- Top Right: Negative Campaign -->
  <g filter="url(#shadow)">
    <rect x="880" y="60" width="200" height="135" rx="16" ry="16" fill="#f0fdf4" stroke="#15803d" stroke-width="2.5"/>
    <text x="980" y="115" text-anchor="middle" font-size="16" font-weight="700" fill="#14532d">Negative Campaign</text>
    <text x="980" y="145" text-anchor="middle" font-size="12" fill="#15803d">NT-1 to NT-5 Fault Suite</text>
    <text x="980" y="165" text-anchor="middle" font-size="12" fill="#15803d">Crash &amp; Socket Recovery</text>
  </g>

  <!-- Bottom Right: Release Gate -->
  <g filter="url(#shadow)">
    <rect x="880" y="305" width="200" height="135" rx="16" ry="16" fill="#faf5ff" stroke="#7c3aed" stroke-width="2.5"/>
    <text x="980" y="360" text-anchor="middle" font-size="17" font-weight="700" fill="#4c1d95">Release Gate</text>
    <text x="980" y="390" text-anchor="middle" font-size="12" fill="#6d28d9">Accept / Hold Decision</text>
    <text x="980" y="410" text-anchor="middle" font-size="12" fill="#6d28d9">Right-Sizing Deployment</text>
  </g>

  <!-- Arrows -->
  <!-- AC-3 -> O2 Baseline -->
  <path d="M 280 215 L 326 150" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <!-- AC-3 -> O3 Candidate -->
  <path d="M 280 285 L 326 350" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- O2 Baseline -> KPI Check -->
  <path d="M 570 150 L 616 215" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
  <!-- O3 Candidate -> KPI Check -->
  <path d="M 570 350 L 616 285" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- KPI Check -> Negative Campaign -->
  <path d="M 825 215 L 876 150" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>

  <!-- Negative Campaign -> Release Gate -->
  <path d="M 980 195 L 980 301" stroke="#334155" stroke-width="2" marker-end="url(#arrow)"/>
</svg>"""

with open(os.path.join(output_dir, "figure_4_2_validation.svg"), "w", encoding="utf-8") as f:
    f.write(svg2)

print("Both SVG diagrams successfully written.")
