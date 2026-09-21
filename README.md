# FinOps Cloud-Cost Optimisation Dashboard

A real-time cloud financial management (FinOps) dashboard that monitors resource utilization across running Docker containers, detects cloud cost waste due to resource over-provisioning, and provides actionable right-sizing recommendations to reduce monthly cloud expenditure in **₹ (INR)**.

---

## 🚀 Problem Statement & Value Proposition

In cloud-native software engineering, teams frequently **over-provision container resources** — requesting far more CPU cores and Memory gigabytes than their microservices actually consume. This results in significant cloud waste with zero operational visibility.

This project addresses cloud waste by querying **REAL telemetry** from live running Docker containers via the **Docker Engine API**, comparing actual CPU/Memory metrics against declared `docker-compose.yml` limits, flagging wasteful workloads operating at `< 20%` utilization, and calculating exact right-sized cost savings in **₹ (INR)**.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Host Machine / Docker Engine                          │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ 12 Microservices (Payments, Platform, Growth, Infra Teams)            │  │
│  │  - 60% Idle Containers (busybox sleep infinity)                       │  │
│  │  - 40% Active Containers (alpine math load loops)                     │  │
│  └──────────────────────────────────┬────────────────────────────────────┘  │
│                                     │ /var/run/docker.sock                  │
│                                     ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ FinOps Backend Container (Node.js + Express)                          │  │
│  │  - Dockerode Service: Polls container.stats({stream: false}) every 2s  │  │
│  │  - Waste Detector: Flags <20% usage, computes 20% safety right-sizing │  │
│  │  - SQLite Database (better-sqlite3): Stores 30-day historical trend   │  │
│  └──────────────────┬─────────────────────────────────┬──────────────────┘  │
│                     │ Socket.io (Real-Time)           │ REST API (/api/*)   │
│                     ▼                                 ▼                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ FinOps Frontend Container (React + Vite + Recharts + Tailwind)        │  │
│  │  - Tab 1: Live Data Source (Real-time telemetry table with highlight) │  │
│  │  - Tab 2: Cost & Waste Dashboard (Summary cards, Charts, Waste table) │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.io, `dockerode` (Docker Engine API client), `better-sqlite3` (SQLite DB)
- **Frontend**: React (Vite), Recharts (data visualizations), Axios, Socket.io Client, Tailwind CSS, Lucide Icons
- **Container Orchestration**: Docker, Docker Compose, Nginx (multi-stage production reverse proxy)

---

## ⚡ Quick Start Guide

### Prerequisites
- Docker Desktop installed and running on your system.

### Running the Complete Stack

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:/PROJECTS/CAPSTONE
   ```

2. **Launch all containers via Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the Dashboard**:
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API & Sockets**: [http://localhost:5000](http://localhost:5000)

---

## 🔍 How to Verify Data Authenticity for Mentor Demo

To prove to your mentor that the telemetry data is **REAL** and not synthesized:

1. Open **Docker Desktop** on your machine and navigate to the **Containers** tab.
2. Open the web app in your browser at `http://localhost:3000` and select **Tab 1: "Live Data Source"**.
3. Observe the live CPU % and Memory (MB) columns updating every 2 seconds.
4. Compare the numbers for any service (e.g., `payment-gateway` or `checkout-service`) directly against Docker Desktop's resource graphs.
5. **Conclusion**: The numbers match exactly because both Docker Desktop and this FinOps application query the identical underlying **Docker Engine API** via `/var/run/docker.sock`.

---

## 💡 Real-World Enterprise Equivalent (OpenCost & Kubecost)

Production enterprise FinOps platforms like **OpenCost** and **Kubecost** operate on the exact same principles:
- **Kubernetes / OpenCost**: Compares declared pod resource requests (`requests.cpu`, `requests.memory`) against live usage metrics pulled from `metrics-server` or Prometheus.
- **This Project**: Applies the same core FinOps logic at the **Docker Engine level**, comparing declared container limits in `docker-compose.yml` against live `dockerode` telemetry.

Because Docker containerization is the foundation of Kubernetes and cloud-native infrastructure, this project demonstrates production-grade cloud financial engineering principles.

---

## 📊 Summary of Microservices Monitored

| Container Name | Team | Declared CPU Limit | Declared Memory Limit | Hourly Cost (₹) | Utilization Profile |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `checkout-service` | Payments | 0.50 Cores | 256 MB | ₹12.50/hr | Idle (Wasteful) |
| `payment-gateway` | Payments | 1.00 Cores | 512 MB | ₹25.00/hr | Active (Efficient) |
| `user-auth` | Platform | 0.50 Cores | 256 MB | ₹10.00/hr | Idle (Wasteful) |
| `api-gateway` | Platform | 2.00 Cores | 1024 MB | ₹48.00/hr | Active (Efficient) |
| `inventory-api` | Platform | 0.50 Cores | 256 MB | ₹15.00/hr | Idle (Wasteful) |
| `search-service` | Platform | 1.50 Cores | 512 MB | ₹32.00/hr | Active (Efficient) |
| `notification-worker` | Growth | 0.50 Cores | 256 MB | ₹11.00/hr | Idle (Wasteful) |
| `email-service` | Growth | 0.25 Cores | 128 MB | ₹8.00/hr | Idle (Wasteful) |
| `recommendation-engine` | Growth | 2.00 Cores | 1024 MB | ₹50.00/hr | Active (Efficient) |
| `cache-warmer` | Growth | 0.50 Cores | 256 MB | ₹14.00/hr | Idle (Wasteful) |
| `log-aggregator` | Infra | 0.50 Cores | 256 MB | ₹18.00/hr | Idle (Wasteful) |
| `metrics-collector` | Infra | 1.00 Cores | 512 MB | ₹22.00/hr | Active (Efficient) |
