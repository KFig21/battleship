import "./App.css";
import Header from "./components/Header";
import Gameboard from "./components/Gameboard";
import ShipData from "./data/ShipData";
import CpuShipData from "./data/CpuShipData";
import Notification from "./components/Notification";
import React, { useEffect, useState } from "react";

function App() {
  const [turn, setTurn] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState("Player");
  const [boardReady, setBoardReady] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [ships, setShips] = useState([]);
  const [shipToPlaceIndex, setShipToPlaceIndex] = useState(0);
  const [shipToPlace, setShipToPlace] = useState(ShipData[shipToPlaceIndex]);
  const [isHovering, setIsHovering] = useState([]);
  const [playerBoard, setPlayerBoard] = useState([]);
  const [cpuReady, setCpuReady] = useState(false);
  const [cpuShips, setCpuShips] = useState([]);
  const [cpuShipToPlaceIndex, setCpuShipToPlaceIndex] = useState(0);
  const [cpuShipToPlace, setCpuShipToPlace] = useState(
    CpuShipData[cpuShipToPlaceIndex]
  );
  const [cpuIsHovering, setCpuIsHovering] = useState([]);
  const [cpuBoard, setCpuBoard] = useState([]);
  const [onTarget, setOnTarget] = useState(false);
  const [targetValue, setTargetValue] = useState([]);
  const [text, setText] = useState(`Place your ${shipToPlace.shipId}!`);
  const [isVertical, setIsVertical] = useState(false);
  const [axis, setAxis] = useState("Vertical");
  const notification = document.getElementById("notification");

  const switchPlayer = () => {
    setCurrentPlayer(currentPlayer === "Player" ? "Computer" : "Player");
    setTurn((prev) => prev + 1);
  };

  useEffect(() => {
    if (gameWon) return;
    if (currentPlayer === "Computer") {
      setTimeout(() => cpuTurn(), 2000);
    }
  }, [currentPlayer]);

  const cpuTurn = () => {
    if (gameWon) return;
    let attack = "";
    console.log("onTarget", onTarget);
    // checks if on target (if any ships are hit)
    if (!onTarget) {
      attack = findRandomTarget();
    } else if (onTarget) {
      // checks for preffered targets
      let preferredTargets = getPreferredTargets();
      if (preferredTargets.length > 0) {
        let preferredIndex = Math.floor(
          Math.random() * preferredTargets.length
        );
        attack = preferredTargets[preferredIndex];
        // checks to see if any of the preferred targets are valid
        while (playerBoard.includes(attack) && preferredTargets.length > 0) {
          // if the selected preferred target isnt valid it removes it from the array and selects another
          preferredTargets.splice(preferredIndex, 1);
          preferredIndex = Math.floor(Math.random() * preferredTargets.length);
          attack = preferredTargets[preferredIndex];
          // when multiple boats are stacked next to each other, the AI can get confused as to where its able to attack. In certain situations it may think its on target but prefferedTargets() is returning nothing. Therefore, if it is still on target without any preferred targets, it will still return an adjacent target
          if (onTarget && attack === undefined) {
            console.log(
              "Player boats have been stacked next to each other, keep firing on adjacent targets!"
            );
            let targets = getTargets(targetValue);
            let index = Math.floor(Math.random() * targets.length);
            attack = targets[index];
            while (playerBoard.includes(attack)) {
              index = Math.floor(Math.random() * targets.length);
              attack = targets[index];
            }
          }
        }
      } else {
        //if there are no preferred targets it selects a random target that is adjacent to a cell that is marked as a hit
        let targets = getTargets(targetValue);
        let index = Math.floor(Math.random() * targets.length);
        attack = targets[index];
        while (playerBoard.includes(attack)) {
          index = Math.floor(Math.random() * targets.length);
          attack = targets[index];
        }
      }
    }

    console.log("attack: " + attack);
    console.log("----------------");
    setPlayerBoard((currentBoard) => [...currentBoard, attack]);
    for (let i = 0; i < ships.length; i++) {
      for (let j = 0; j < ships[i].coords.length; j++) {
        if (ships[i].coords[j] === attack) {
          document.getElementById(`Player-${attack}`).style.backgroundColor =
            "var(--alertRed)";
          ships[i].health--;
          setText(`Attack Status: You've been HIT! [${attack}]`);
          notification.style.color = "var(--alertRed)";
          setTargetValue((prev) => [...prev, attack]);
          console.log("adding targets: " + attack);
          setOnTarget(true);
          if (ships[i].health === 0) {
            ships[i].status = "sunk";
            setText(`Attack Status: HIT! They sunk your ${ships[i].shipId}!`);
            notification.style.color = "var(--alertRed)";
            checkIfOnTarget(ships[i]);
            for (let k = 0; k < ships[i].size; k++) {
              document.getElementById(
                `Player-${ships[i].coords[k]}`
              ).style.backgroundColor = "darkred";
            }
          }
          if (ships.every((ship) => ship.status === "sunk")) {
            gameOver("Computer");
          }
          switchPlayer();
          return;
        }
      }
    }
    setText(`Attack Status: CPU MISS! [${attack}]`);
    notification.style.color = "var(--primary-light)";
    document.getElementById(`Player-${attack}`).style.backgroundColor =
      "var(--miss)";
    switchPlayer();
    return;
  };

  const checkIfOnTarget = (ship) => {
    console.log("check if on target: " + ship.shipId);
    let leftoverTargets = targetValue;
    for (let i = 0; i < ship.coords.length; i++) {
      if (leftoverTargets.includes(ship.coords[i])) {
        const index = targetValue.indexOf(ship.coords[i]);
        leftoverTargets.splice(index, 1);
        console.log("removing targets: " + ship.coords[i]);
        console.log("leftover targets: " + leftoverTargets);
      }
    }
    setTargetValue(leftoverTargets);
    if (targetValue.length === 0) {
      setOnTarget(false);
      setTargetValue([]);
    }
    return;
  };

  const findRandomTarget = () => {
    let target = Math.floor(Math.random() * 100);
    while (playerBoard.includes(target)) {
      target = Math.floor(Math.random() * 100);
    }
    return target;
  };

  const getTargets = (targs) => {
    console.log("targetvalue in getTargets: " + targetValue);
    let targets = [];
    for (let i = 0; i < targs.length; i++) {
      // top left corner = 0
      if (targs[i] === 0) {
        targets.push(1);
        targets.push(10);
        // bottom right corner = 99
      } else if (targs[i] === 99) {
        targets.push(89);
        targets.push(98);
        // top right corner = 9
      } else if (targs[i] === 9) {
        targets.push(8);
        targets.push(19);
        // bottom left corner = 90
      } else if (targs[i] === 90) {
        targets.push(80);
        targets.push(91);
        // top row, not including 0 or 9
      } else if (targs[i] < 9) {
        targets.push(targs[i] - 1);
        targets.push(targs[i] + 1);
        targets.push(targs[i] + 10);
        // bottom row, not including 90 or 99
      } else if (targs[i] > 90) {
        targets.push(targs[i] - 1);
        targets.push(targs[i] + 1);
        targets.push(targs[i] - 10);
        // left side, not including 0 or 90
      } else if (targs % 10 === 0) {
        targets.push(targs[i] + 1);
        targets.push(targs[i] - 10);
        targets.push(targs[i] + 10);
        // right side, not including 9 or 99
      } else if ((targs[i] + 1) % 10 === 0) {
        targets.push(targs[i] - 1);
        targets.push(targs[i] - 10);
        targets.push(targs[i] + 10);
        // remaining
      } else {
        targets.push(targs[i] - 1);
        targets.push(targs[i] + 1);
        targets.push(targs[i] - 10);
        targets.push(targs[i] + 10);
      }
    }
    if (targets.every((target) => playerBoard.includes(target))) {
      targets = findRandomTarget();
    }
    return targets;
  };

  const getPreferredTargets = () => {
    if (targetValue.length < 2) return [];
    const preferredTargets = [];
    for (let i = 0; i < targetValue.length; i++) {
      for (let j = 0; j < targetValue.length; j++) {
        // 2 hits horizontally next to each other
        if (targetValue[i] === targetValue[j] + 1) {
          // check if targetValue is a right-side edge case
          if (targetValue[i] + (1 % 10) !== 0) {
            preferredTargets.push(targetValue[i] + 1);
          }
          // check if targetValue is a left-side edge case
          if (targetValue[j] % 10 !== 0) {
            preferredTargets.push(targetValue[j] - 1);
          }
        }
        // 2 hits vertically next to each other
        if (targetValue[i] === targetValue[j] + 10) {
          // check if targetValue is a bottom-side edge case
          if (targetValue[i] + 10 < 100) {
            preferredTargets.push(targetValue[i] + 10);
          }
          // check if targetValue is a top-side edge case
          if (targetValue[j] - 10 >= 0) {
            preferredTargets.push(targetValue[j] - 10);
          }
        }
      }
    }
    console.log("preferredTargets: " + preferredTargets);
    return preferredTargets;
  };

  const startGame = () => {
    if (boardReady && !gameWon) {
      setGameStarted(true);
    } else if (gameWon) {
      refresh();
    }
  };

  const handleHoverEffects = (coords) => {
    if (gameStarted) return;
    const ship = shipToPlace;
    const coordinates = [coords];
    const movement = isVertical ? 10 : 1;
    if (isVertical) {
      for (let i = 1; i < ship.size; i++) {
        coordinates.push(parseInt(coords) + parseInt(i * movement));
      }
    } else {
      for (let i = 1; i < ship.size && (coords + i) % 10 !== 0; i++) {
        coordinates.push(parseInt(coords) + parseInt(i * movement));
      }
    }
    setIsHovering(coordinates);
  };

  const placeShip = (coords) => {
    const ship = shipToPlace;
    const movement = isVertical ? 10 : 1;
    const coordinates = [coords];
    for (let i = 1; i < ship.size; i++) {
      coordinates.push(parseInt(coords) + parseInt(i * movement));
    }
    if (validateShip(coordinates, "Player")) {
      setShips((currentShips) => {
        return [...currentShips, ship];
      });
      ship.coords = coordinates;
      for (let i = 0; i < coordinates.length; i++) {
        let coordId = coordinates[i];
        document.getElementById(`Player-${coordId}`).style.backgroundColor =
          "var(--ship)";
      }
      setShipToPlaceIndex((prev) => parseInt(prev + 1));
    } else {
      return;
    }
  };

  const validateShip = (coords, player) => {
    let start = coords[0];
    let end = coords[coords.length - 1];
    // check for edges
    if (end >= 100 || start % 10 > end % 10) return false;
    //check for other ships
    let checkShips = player === "Player" ? ships : cpuShips;
    for (let i = 0; i < coords.length; i++) {
      if (checkShips.some((ship) => ship.coords.includes(coords[i]))) {
        return false;
      }
    }
    return true;
  };

  // sets the next ship to place
  useEffect(() => {
    if (!gameStarted) {
      if (shipToPlaceIndex < 5) {
        setShipToPlace(ShipData[shipToPlaceIndex]);
        setText(`Place your ${shipToPlace.shipId}!`);
      } else {
        setGameStarted(true);
        setIsHovering([]);
        setText("Launch an attack!");
      }
    }
  });

  // set cpu board
  useEffect(() => {
    if (gameStarted && !cpuReady) {
      if (cpuShips.length <= 5) {
        setCpuShipToPlace(CpuShipData[cpuShipToPlaceIndex]);
        placeCPUship();
      } else {
        setCpuReady(true);
        // show cpu ship location, delete when done
        // for(let i = 0; i < cpuShips.length; i++){
        //   for(let j = 0; j < cpuShips[i].coords.length; j++){
        //     let coordId = cpuShips[i].coords[j];
        //     document.getElementById(`Computer-${coordId}`).style.backgroundColor = "grey";
        //   }
        // }
      }
    }
  });

  // if cpu tries to place an invalid ship
  const tryAgain = () => {
    placeCPUship();
  };

  const placeCPUship = () => {
    let ship = cpuShipToPlace;
    let coordinate = Math.floor(Math.random() * 98);
    const axisArr = [1, 10];
    const increment = axisArr[Math.floor(Math.random() * 2)];
    const coordinates = [coordinate];
    for (let j = 1; j < cpuShipToPlace.size; j++) {
      coordinates.push(coordinate + j * increment);
    }
    if (validateShip(coordinates, "Computer")) {
      setCpuShips((currentShips) => {
        return [...currentShips, ship];
      });
      ship.coords = coordinates;
    } else {
      tryAgain();
      return;
    }
    setCpuShipToPlaceIndex((prev) => parseInt(prev + 1));
  };

  const cpuHandleHoverEffects = (coords) => {
    if (!cpuReady) return;
    const target = [coords];
    setCpuIsHovering(target);
  };

  const changeAxis = () => {
    setAxis(axis === "Vertical" ? "Horizontal" : "Vertical");
    setIsVertical(isVertical === false ? true : false);
  };

  const gameOver = (player) => {
    setText(`Game over! ${player} wins!`);
    if (player === "Computer") {
      notification.style.color = "var(--alertRed)";
    }
    setGameWon(true);
  };

  const refresh = () => {
    window.location.reload();
    notification.style.color = "var(--primary-light)";
  };

  return (
    <div className="App">
      <Header />
      <Notification
        turn={turn}
        startGame={startGame}
        text={text}
        shipToPlace={shipToPlace}
      />
      <div className="boards-container">
        <Gameboard
          player="Player"
          switchPlayer={switchPlayer}
          currentPlayer={currentPlayer}
          gameStarted={gameStarted}
          setBoardReady={setBoardReady}
          setGameWon={setGameWon}
          shipToPlace={shipToPlace}
          setShipToPlace={setShipToPlace}
          onHover={handleHoverEffects}
          isHovering={isHovering}
          placeShip={placeShip}
        />
        {gameStarted && (
          <Gameboard
            player="Computer"
            switchPlayer={switchPlayer}
            currentPlayer={currentPlayer}
            gameStarted={gameStarted}
            setBoardReady={setBoardReady}
            setGameWon={setGameWon}
            cpuIsHovering={cpuIsHovering}
            onHover={cpuHandleHoverEffects}
            cpuShips={cpuShips}
            setText={setText}
            setCpuBoard={setCpuBoard}
            cpuBoard={cpuBoard}
            gameOver={gameOver}
            gameWon={gameWon}
          />
        )}
      </div>
      <div className="lower-container">
        {/* <ShipYard /> */}
        {!gameStarted && (
          <button className="orientation-button" onClick={changeAxis}>
            Set {axis}
          </button>
        )}
        {gameWon && (
          <button className="orientation-button" onClick={startGame}>
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
