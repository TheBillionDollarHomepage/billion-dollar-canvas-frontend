import { BodyLayout } from "../components/layout/BodyLayout";
import { Header } from "../components/layout/Header";
import { EthereumProvider } from "../context/EthereumContext";
import { TheGraphProvider } from "../context/TheGraphContext";
import "../styles/globals.css";

function App({ Component, pageProps }) {
  return (
    <EthereumProvider>
      <TheGraphProvider>
        <BodyLayout id="app-root">
          <Header />
          <Component {...pageProps} />
        </BodyLayout>
      </TheGraphProvider>
    </EthereumProvider>
  );
}

export default App;
