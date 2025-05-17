import ScratchCard from "./ScratchCard";
import { useState, useEffect } from "react";
import "./ScratchCards.css";
import mochilaSupervielle from "../assets/mochila-supervielle.png";
import supervielleMineriaLogo from "../assets/sup-mineria-logo.png";
// import supervielleMineriaPurple from "../assets/sup-mineria-logo-purple.png";
// import supervielleMineriaWhite from "../assets/sup-mineria-logo-white.png";

import { supabase } from "../supaBaseClient";

import FireworksEffect from "../Effects/Fireworks";
import ConfettiEffect from "../Effects/ConfettiEffect";
import Swal from "sweetalert2";
import useSound from "../hooks/useSound";

// sounds
import ScratchSound from "../assets/sounds/scratch-sound-3.mp3";
import FireworksSound from "../assets/sounds/fireworks-sound-280715.mp3";
import WinnerSound from "../assets/sounds/winner-alert2.wav";

// Icons
import { GrPowerReset } from "react-icons/gr";
import { RiHomeLine } from "react-icons/ri";

export default function ScratchCardsPage() {
  const fireworksSound = useSound(FireworksSound);
  const winnerSound = useSound(WinnerSound);
  const scratchSound = useSound(ScratchSound, { loop: true });

  const handleScratchStart = () => {
    scratchSound.play();
  };

  const handleScratchEnd = () => {
    scratchSound.stop();
  };


  const generateRandomLogos = () => {
  const result = [];
  const random = Math.random();

  if (random < 0.05) {
    // 🎉 5% chance de premio mayor: 3 mochilas
    for (let i = 0; i < 3; i++) {
      result.push({ id: crypto.randomUUID(), type: "mochila" });
    }
  } else if (random < 0.35) {
    // 🎁 30% chance de 2 mochilas y 1 "no prize"
    const positions = [0, 1, 2];
    const mochilaPositions = [];

    // Elegimos 2 posiciones únicas para la mochila
    while (mochilaPositions.length < 2) {
      const index = positions.splice(Math.floor(Math.random() * positions.length), 1)[0];
      mochilaPositions.push(index);
    }

    for (let i = 0; i < 3; i++) {
      result.push({
        id: crypto.randomUUID(),
        type: mochilaPositions.includes(i) ? "mochila" : "no prize",
      });
    }
  } else {
    // ✅ 65% chance de 1 mochila y 2 "no prize"
    const mochilaIndex = Math.floor(Math.random() * 3);
    for (let i = 0; i < 3; i++) {
      result.push({
        id: crypto.randomUUID(),
        type: i === mochilaIndex ? "mochila" : "no prize",
      });
    }
  }

  return result;
};


  const [logoSet, setLogoSet] = useState(generateRandomLogos());
  const [revealed, setRevealed] = useState([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const updatePrizeStock = async () => {
    const { data, error } = await supabase
      .from("Prizes")
      .select("stock")
      .eq("prize", "mochila")
      .single();

    if (error || !data) {
      console.error("Error obteniendo stock:", error);
      return;
    }

    const nuevoStock = data.stock - 1;

    await supabase
      .from("Prizes")
      .update({ stock: nuevoStock })
      .eq("prize", "mochila");
  };

  useEffect(() => {
    if (revealed.length === 3) {
      const [a, b, c] = revealed;
      if (a === "mochila" && b === "mochila" && c === "mochila") {
        updatePrizeStock();
        setShowConfetti(true);
        setShowFireworks(true);
        setTimeout(() => setShowFireworks(false), 10000);

        winnerSound.play();
        setTimeout(() => {
          fireworksSound.play();
        }, 400);

        Swal.fire({
          title: "¡Ganaste!",
          text: "Una mochila exclusiva",
          imageUrl: mochilaSupervielle,
          imageHeight: 300,
          imageAlt: "Imagen del premio",
          confirmButtonText: "Reclamar premio",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/"; // Redirige a la home
          }
        });
      } else {
        Swal.fire({
          title: "¡Suerte la próxima!",
          text: "Seguí participando",
          confirmButtonText: "Regresar al inicio",
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = "/"; // Redirige a la home
          }
        });
      }
    }
  }, [revealed]);

  const handleReveal = (logo) => {
    setRevealed((prev) => [...prev, logo.type]);
  };

  const handleRestart = () => {
    setRevealed([]);
    setLogoSet(generateRandomLogos());
  };

  const handleBackButton = () => {
    window.location.href = "/";
  };

  return (
    <div className="scratch-cards-page">
      {showFireworks && <FireworksEffect />}
      {showConfetti && <ConfettiEffect duration={10000} />}
      <div className="scratch-cards-title">
        <img
          src={supervielleMineriaLogo}
          alt="Supervielle Mineria"
          className="supervielle-mineria-logo"
        />
        <p className="subtitle">¡Raspá y podés ganar una mochila!</p>
      </div>
      <div className="scratch-cards-container">
        {logoSet.map((logo) => (
          
            <ScratchCard
              key={logo.id}
              brushSize={10}
              threshold={15}
              // coverColor="#d2b9b9"
              coverColor="white"
              coverImage={supervielleMineriaLogo}
              onComplete={() => handleReveal(logo)}
              onScratchStart={handleScratchStart}
              onScratchEnd={handleScratchEnd}
              content={
                logo.type === "mochila" ? (
                  <img
                    src={mochilaSupervielle}
                    alt="Mochila"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      color: "var(--main-red)",
                      // backgroundColor: "#ff66cc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      // borderRadius: "16px",
                    }}
                  >
                    <p className="scratch-cards-text">Seguí participando</p>
                  </div>
                )
              }
            />
          
        ))}
      </div>
      <div className="buttons-container">
        <button className="reset-button" onClick={handleRestart}>
          {" "}
          <GrPowerReset clasName="fa-icon" /> Reiniciar
        </button>
        <button className="back-button" onClick={handleBackButton}>
          {" "}
          <RiHomeLine clasName="fa-icon" /> Inicio
        </button>
      </div>
    </div>
  );
}
