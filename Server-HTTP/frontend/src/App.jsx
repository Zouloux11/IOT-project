
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Toaster } from '@/components/ui/toaster';
import IoTDashboard from '@/pages/IoTDashboard';


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IoTDashboard />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;