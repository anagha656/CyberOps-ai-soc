import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from './components/layout/AppShell'
import { SocProvider } from './context/SocContext'
import { AgentsPage } from './pages/AgentsPage'
import { AssetsPage } from './pages/AssetsPage'
import { DashboardPage } from './pages/DashboardPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { InvestigationsPage } from './pages/InvestigationsPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ThreatIntelPage } from './pages/ThreatIntelPage'

export default function App() {
  return (
    <SocProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="incidents" element={<IncidentsPage />} />
            <Route path="investigations" element={<InvestigationsPage />} />
            <Route path="investigations/:incidentId" element={<InvestigationsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="intelligence" element={<ThreatIntelPage />} />
            <Route path="assets" element={<AssetsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: '#0b1220',
            border: '1px solid rgba(34,211,238,0.2)',
            color: '#e2e8f0',
          },
        }}
      />
    </SocProvider>
  )
}
