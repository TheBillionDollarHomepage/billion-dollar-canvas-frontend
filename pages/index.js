import { Contract } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Head from "next/head";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { useAccount, useBlockNumber, useProvider, useSigner } from "wagmi";
import { Web3Storage } from "web3.storage";
import { Input } from "../components/core/Input";
import { TextArea } from "../components/core/TextArea";
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

  .show-more {
    cursor: pointer;
    color: green;
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
  }
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
  const [file, setFile] = useState();
  const [price, setPrice] = useState();
  const { data: signer } = useSigner();
  const provider = useProvider();
  const [pixels, loading, error] = useContext(PixelsContext);
  const [pixelPrice, setPixelPrice] = useState();
  const [metadata, setMetadata] = useState({});
  const [uploadingToIpfs, setUploadingToIpfs] = useState(false);
  const [showMore, setShowMore] = useState();
  const [description, setDescription] = useState();
  const [name, setName] = useState();

  console.log("metadat", metadata);

  const pixel = pixels?.find((v) => v.id == id) || {};

  const canvas = new Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    billionDollarCanvasAbi,
    signer || provider
  );

  const uploadToIpfs = async () => {
    setUploadingToIpfs(true);

    const storage = new Web3Storage({
      token: process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN,
    });

    let image = metadata.image;
    if (file) {
      const fileCid = await storage.put([file]);
      image = "https://ipfs.io/ipfs/" + fileCid + "/" + file.name;
      console.log("File", fileCid, file);
    }

    const newMetadata = {
      image,
      description: description || pixel.description,
      name: name || pixel.name || "Pixel " + id,
    };

    console.log("metadata", newMetadata);

    const blob = new Blob([JSON.stringify(newMetadata)], {
      type: "application/json",
    });

    const cid = await storage.put([new File([blob], "metadata.json")]);
    console.log("stored token metadata with cid:", cid);
    setUploadingToIpfs(false);

    const finalisedTokenUri = "https://ipfs.io/ipfs/" + cid + "/metadata.json";

    return finalisedTokenUri;
  };

  const buyPixel = async () => {
    const finalisedTokenUri = file && uploadToIpfs();

    const tx = await canvas.buy(
      id,
      finalisedTokenUri || pixel.tokenUri,
      parseEther(price || pixelPrice),
      {
        value: pixelPrice,
      }
    );

    await tx.wait();

    alert("Bought pixel");
  };

  const updateDataUri = async () => {
    const finalisedTokenUri = uploadToIpfs();
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
    const fetchMetadata = async () => {
      if (pixel.tokenUri) {
        console.log("fetching:", pixel.tokenUri);
        fetch(pixel.tokenUri)
          .then((v) => v.json())
          .then((r) => setMetadata(r));
      }
    };

    fetchMetadata();
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
        {metadata.image && <img src={metadata.image} />}
      </PixelContainer>

      {show && (
        <Modal onClose={() => setShow(false)}>
          <div className="pixel-modal">
            {metadata.image && <img src={metadata.image} />}

            {metadata.name && <b>{metadata.name}</b>}
            {metadata.description && <p>{metadata.description}</p>}
            {pixel.owner && <p>Owner: {pixel.owner}</p>}
            <p>Harberger tax price: {formatEther(pixelPrice || "0")} ETH</p>
            {pixel.tokenUri && <a href={pixel.tokenUri}>IPFS link</a>}

            {pixel.owner && (
              <a
                href={`https://testnets.opensea.io/assets/goerli/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}/${id}`}
              >
                Opensea link
              </a>
            )}

            <div className="show-more" onClick={() => setShowMore(!showMore)}>
              {address && address.toLowerCase() === pixel.owner
                ? "Edit pixel"
                : "Buy pixel"}
            </div>

            {showMore && (
              <>
                <div className="input-and-label">
                  <label htmlFor="data-uri">Name</label>
                  <Input
                    id="data-uri"
                    placeholder="Enter name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text-area"
                  />
                </div>

                <div className="input-and-label">
                  <label htmlFor="data-uri">Description</label>
                  <TextArea
                    id="data-uri"
                    placeholder="Enter description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    type="text-area"
                  />
                </div>

                <div className="input-and-label">
                  <label htmlFor="file-upload">File upload</label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>

                {address && address.toLowerCase() === pixel.owner && (
                  <button onClick={() => updateDataUri()}>
                    Update metadata
                  </button>
                )}

                {uploadingToIpfs && <p>Uploading to ipfs...</p>}

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

                {address && address.toLowerCase() === pixel.owner && (
                  <button onClick={() => updatePrice()}>Update price</button>
                )}

                {address?.toLowerCase() !== pixel.owner && (
                  <button onClick={() => buyPixel()}>Buy pixel</button>
                )}
              </>
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
