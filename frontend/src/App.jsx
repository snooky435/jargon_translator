// App = the frame around every page: the header on top, the current page below.
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import StockTicker from "./components/StockTicker.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Dictionary from "./pages/Dictionary.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <StockTicker />
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Show a different page depending on the URL */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
