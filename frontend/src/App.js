import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import VehicleSearch from "./pages/VehicleSearch";
import Return from "./pages/Return";
import RentalHistory from "./pages/RentalHistory";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MyPage from "./pages/MyPage";
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehiclesearch" element={<VehicleSearch />} />
          <Route path="/return" element={<Return />} />
          <Route path="/rentalhistory" element={<RentalHistory />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
