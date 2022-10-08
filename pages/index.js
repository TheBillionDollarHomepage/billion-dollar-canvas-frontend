import { Contract } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Head from "next/head";
import { createContext, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { useAccount, useBlockNumber, useProvider, useSigner } from "wagmi";
import { Input } from "../components/core/Input";
import { Modal } from "../components/layout/Modal";
import billionDollarCanvasAbi from "../contracts/BillionDollarCanvas.abi.json";
import { usePixels } from "../hooks/usePixels";

const PixelsContext = createContext([]);

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;

  .pixel-modal {
    display: grid;
    row-gap: 8px;

    img {
      height: 200px;
    }
  }

  margin-bottom: 48px;
`;

const PixelContainer = styled.div`
  border: 1px solid black;
  height: 96px;
  width: 96px;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    background-color: grey;
  }

  img {
    height: 96px;
  }
`;

const PixelState = {
  NOT_MINTED: "Not minted",
  MINTED: "Minted",
};

const Pixel = ({ id }) => {
  const { address } = useAccount();
  const [show, setShow] = useState();
  const [tokenUri, setTokenUri] = useState();
  const [price, setPrice] = useState();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [pixels, loading, error] = useContext(PixelsContext);
  const [pixelPrice, setPixelPrice] = useState();

  const pixel = pixels?.find((v) => v.id == id) || {};

  const canvas = new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    billionDollarCanvasAbi,
    signer || provider
  );

  const buyPixel = async () => {
    // submit transaction to buy pixel
    const tx = await canvas.buy(id, pixel.tokenUri || "", pixelPrice, {
      value: pixelPrice,
    });
    await tx.wait();

    alert("Bought pixel");
  };

  const updateDataUri = async () => {
    const tx = await canvas.setCanvasURI(id, tokenUri);
    await tx.wait();

    alert("Set new canvas URI");
  };

  const updatePrice = async () => {
    const tx = await canvas.setPrice(id, parseEther(price));
    await tx.wait();

    alert("Set new price");
  };

  useEffect(() => {
    const getPixelPrice = async () => {
      if (!pixel.price) {
        const price = await canvas.priceOf(id);
        setPixelPrice(price);
      } else {
        setPixelPrice(pixel.price);
      }
    };

    getPixelPrice();
  }, [loading]);

  return (
    <>
      <PixelContainer onClick={() => setShow(true)}>
        {pixel.tokenUri && <img src={pixel.tokenUri} />}
      </PixelContainer>

      {show && (
        <Modal onClose={() => setShow(false)}>
          <div className="pixel-modal">
            {pixel.tokenUri && <img src={pixel.tokenUri} />}

            {pixel.owner && <p>Owner: {pixel.owner}</p>}
            <p>Harberger tax price: {formatEther(pixelPrice || "0")} ETH</p>

            {address && address.toLowerCase() === pixel.owner && (
              <>
                <div className="input-and-label">
                  <label htmlFor="data-uri">Data URI</label>
                  <Input
                    id="data-uri"
                    placeholder="Enter data URI..."
                    value={tokenUri}
                    onChange={(e) => setTokenUri(e.target.value)}
                  />
                </div>

                <button onClick={() => updateDataUri()}>Update data URI</button>

                <div className="input-and-label">
                  <label htmlFor="data-uri">Harberger tax price (ETH)</label>
                  <Input
                    id="data-uri"
                    placeholder="Enter ETH amount..."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                  />
                </div>

                <button onClick={() => updatePrice()}>Update price</button>
              </>
            )}

            {address?.toLowerCase() !== pixel.owner && (
              <button onClick={() => buyPixel()}>Buy pixel</button>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default function Home() {
  const { data: blockNumber } = useBlockNumber();
  const [pixels, loading, error] = usePixels();

  useEffect(() => {}, [blockNumber]);

  return (
    <div>
      <Head>
        <title>Canvas</title>
      </Head>

      <PixelsContext.Provider value={[pixels, loading, error]}>
        <Container>
          {new Array(70).fill(0).map((v, i) => (
            <Pixel id={i} />
          ))}
        </Container>
      </PixelsContext.Provider>
    </div>
  );
}
