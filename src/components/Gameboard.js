import React from "react";
import GridPosition from "./GridPosition";
import '../App.css'; 

function Gameboard({
        player, 
        switchPlayer, 
        currentPlayer, 
        gameStarted, 
        shipToPlace, 
        onHover,
        isHovering,
        placeShip,
        cpuIsHovering,
        cpuShips,
        setText,
        cpuBoard,
        setCpuBoard,
        gameOver,
        gameWon
    }) {

    const grid = () => {
        let board = []
        for(let i = 0; i < 10; i++){
            for( let j = 0; j < 10; j++){
                if (player === "Player"){
                    board.push(
                        <GridPosition 
                            board={player}
                            coords={(j+(i*10))}
                            placeShip={placeShip}
                            switchPlayer={switchPlayer}
                            currentPlayer={currentPlayer}
                            gameStarted={gameStarted}
                            shipToPlace={shipToPlace}
                            key={`${j} ${i}`} 
                            handleHover={onHover}
                            isHovering={isHovering}
                            gameWon={gameWon}
                        />)
                } else if (player === "Computer"){
                    board.push(
                        <GridPosition 
                            board={player}
                            coords={(j+(i*10))}
                            placeShip={placeShip}
                            switchPlayer={switchPlayer}
                            currentPlayer={currentPlayer}
                            gameStarted={gameStarted}
                            shipToPlace={shipToPlace}
                            key={`${j} ${i}`} 
                            handleHover={onHover}
                            cpuIsHovering={cpuIsHovering}
                            cpuShips={cpuShips} 
                            setText={setText}
                            setCpuBoard={setCpuBoard}
                            cpuBoard={cpuBoard}  
                            gameOver={gameOver}
                            gameWon={gameWon}
                        />)
                }
            }
        }
        return board
    }

    return(
        <div>
            <span className="board-name">{player}'s board</span>
            <div className={`game-board ${player}-board`}>{ grid() }</div>
        </div>
    )
}

export default Gameboard;