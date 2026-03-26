import Dashboard from "./pages/Dashboard"

const TEST_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzM3NzE4NzgsImV4cCI6MTc3NDM3NjY3OH0.vdQvaGyAn5PFV3Q3cUTiSI-TDhAd7xspCDRbCq-5ip4"

export default function App() {
  return <Dashboard token={TEST_TOKEN} onLogout={() => {}} />
}