import { Contract } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Head from "next/head";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAccount, useBlockNumber, useProvider, useSigner } from "wagmi";
import { Web3Storage } from "web3.storage";
import { Input } from "../components/core/Input";
import { Modal } from "../components/layout/Modal";
import billionDollarCanvasAbi from "../contracts/BillionDollarCanvas.abi.json";
import { usePixels } from "../hooks/usePixels";
import { shadeColor } from "../utils/shadeColor";

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
  border: 1px solid grey;
  height: 96px;
  width: 96px;
  cursor: pointer;
  overflow: hidden;

  &:hover {
    border: 1px solid red;
  }

  img {
    object-fit: cover;
    max-height: 100%;
    min-width: 96px;
  }
`;

const PIXEL_COLORS = ["#F8D7E8", "#BAD5F0", "#D6EFF6", "#F8EFE6"].map((v) =>
  shadeColor(v, 15)
);

console.log("colors", PIXEL_COLORS);

const Pixel = ({ id }) => {
  const { address } = useAccount();
  const [show, setShow] = useState();
  const [tokenUri, setTokenUri] = useState();
  const [price, setPrice] = useState();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [pixels, loading, error] = useContext(PixelsContext);
  const [pixelPrice, setPixelPrice] = useState();
  const [imageUri, setImageUri] = useState();
  const [uploadingToIpfs, setUploadingToIpfs] = useState(false);

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
    setUploadingToIpfs(true);

    const storage = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN,
    });

    const metadata = {
      image: tokenUri,
      description: "harberger taxed pixel :lmeow:",
      name: "Pixel " + id,
    };

    const blob = new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    });

    const cid = await storage.put([new File([blob], "metadata.json")]);
    console.log("stored token metadata with cid:", cid);

    const finalisedTokenUri = "https://ipfs.io/ipfs/" + cid + "/metadata.json";
    const tx = await canvas.setCanvasURI(id, finalisedTokenUri);
    setUploadingToIpfs(false);

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

  useEffect(() => {
    const fetchImageUri = async () => {
      if (pixel.tokenUri) {
        console.log("fetching:", pixel.tokenUri);
        fetch(pixel.tokenUri)
          .then((v) => v.json())
          .then((r) => setImageUri(r.image));
      }
    };

    fetchImageUri();
  }, [loading, pixel.tokenUri]);

  const pixelColor = useMemo(() => {
    return PIXEL_COLORS[Math.floor(Math.random() * PIXEL_COLORS.length)];
  }, []);

  return (
    <>
      <PixelContainer
        onClick={() => setShow(true)}
        style={{
          backgroundColor: pixelColor,
        }}
      >
        {imageUri && <img src={imageUri} />}
      </PixelContainer>

      {show && (
        <Modal onClose={() => setShow(false)}>
          <div className="pixel-modal">
            {imageUri && <img src={imageUri} />}

            {pixel.owner && <p>Owner: {pixel.owner}</p>}
            <p>Harberger tax price: {formatEther(pixelPrice || "0")} ETH</p>
            {pixel.tokenUri && <a href={pixel.tokenUri}>IPFS link</a>}

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

                {uploadingToIpfs && <p>Uploading to ipfs...</p>}

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
            <Pixel id={i} key={i} />
          ))}
        </Container>
      </PixelsContext.Provider>
    </div>
  );
}
