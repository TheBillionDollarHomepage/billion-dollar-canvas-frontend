import { Contract } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Head from "next/head";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { useAccount, useBlockNumber, useSigner } from "wagmi";
import { Input } from "../components/core/Input";
import { Modal } from "../components/layout/Modal";
import billionDollarCanvasAbi from "../contracts/BillionDollarCanvas.abi.json";
import { usePixels } from "../hooks/usePixels";

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
`;

const PixelContainer = styled.div`
  border: 1px solid black;
  height: 96px;
  width: 96px;
  cursor: pointer;

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
  const [pixel, setPixel] = useState({});
  const [show, setShow] = useState();
  const [tokenUri, setTokenUri] = useState();
  const [price, setPrice] = useState();
  const { data: signer } = useSigner();

  useEffect(() => {
    const getPixel = async () => {
      const pixel = {
        // owner: "0x49d5199959DD8897F133e303DA6B179bb1C592Ce",
        // tokenUri: "https://www.miladymaker.net/milady/2.png",
        // price: parseEther("0.1"),
        // state: PixelState.NOT_MINTED,
      };

      setPixel(pixel);
    };

    getPixel();
  }, []);

  const buyPixel = async () => {
    // submit transaction to buy pixel
    const canvas = new Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
      billionDollarCanvasAbi,
      signer
    );

    const tx = await canvas.buy(id, "", parseEther("0.01"), {
      value: parseEther("0.000001"),
    });

    await tx.wait();

    alert("Bought pixel");
  };

  const updatePixel = async () => {
    // submit transaction to update pixel parameters
  };

  return (
    <>
      <PixelContainer onClick={() => setShow(true)}>
        {pixel.tokenUri && <img src={pixel.tokenUri} />}
      </PixelContainer>

      {show && (
        <Modal onClose={() => setShow(false)}>
          <div className="pixel-modal">
            {pixel.tokenUri && <img src={pixel.tokenUri} />}

            <p>Owner: {pixel.owner}</p>
            <p>Price: {formatEther(pixel.price || "0")} ETH</p>
            <p>State: {pixel.state}</p>

            {address === pixel.owner && (
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

                <div className="input-and-label">
                  <label htmlFor="data-uri">Price (ETH)</label>
                  <Input
                    id="data-uri"
                    placeholder="Enter ETH amount..."
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </>
            )}

            {address === pixel.owner ? (
              <button onClick={() => updatePixel()}>Update Pixel</button>
            ) : (
              <button onClick={() => buyPixel()}>Buy Pixel</button>
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

  console.log("pixels", pixels);

  useEffect(() => {}, [blockNumber]);

  return (
    <div>
      <Head>
        <title>Canvas</title>
      </Head>

      <Container>
        {new Array(70).fill(0).map((v, i) => (
          <Pixel id={i} />
        ))}
      </Container>
    </div>
  );
}
