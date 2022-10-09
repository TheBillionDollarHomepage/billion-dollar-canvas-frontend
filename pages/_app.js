import { BodyLayout } from "../components/layout/BodyLayout";
import { Header } from "../components/layout/Header";
import { EthereumProvider } from "../context/EthereumContext";
import { TheGraphProvider } from "../context/TheGraphContext";
import { LivepeerProvider } from "../context/LivePeerContext";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  return (
    <EthereumProvider>
      <LivepeerProvider>
        <TheGraphProvider>
          <BodyLayout id="app-root">
            <Header />
            <Component {...pageProps} />
          </BodyLayout>
        </TheGraphProvider>
      </LivepeerProvider>
    </EthereumProvider>
  );
}

export default App;
