import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";
import UrlForm from "./components/UrlForm";
import Analytics from "./components/Analytics";
import Features from "./components/Features";
import TopAnalytics from "./components/TopAnalytics";
import Footer from "./components/Footer";

// We wrap the app content in a component that can use hooks
const AppContent = () => {
  const navigate = useNavigate();

  return (
    <div className="app-wrapper">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div
              className="brand-mark"
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              🔗
            </div>
            <div>
              <div className="brand-title" onClick={() => navigate("/")}>ScaleURL</div>
              <div className="brand-sub">URL Shortener</div>
            </div>
          </div>
          <nav className="top-actions">
            <Link to="/features" className="btn btn-ghost">
              Features
            </Link>
            <Link to="/analytics" className="btn btn-ghost">
              Analytics
            </Link>
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <div className="left-panel">
                  <UrlForm />
                </div>
                <div className="right-panel">
                  <Analytics />
                </div>
              </>
            }
          />
          <Route path="/features" element={<Features />} />
          <Route path="/analytics" element={<TopAnalytics />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
