import { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [row, setRow] = useState(30);
  const [col, setCol] = useState(30);
  const [liveColour, setLiveColour] = useState("#000000");
  const [deadColour, setDeadColour] = useState("#ffffff");
  const [intervalTime, setIntervalTime] = useState(1000);
  const [board, setBoard] = useState(() => generateBoard(row, col));
  const [running, setRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);





  function generateBoard(rows, cols) {
    const newBoard = [];
    for (let i = 0; i < rows; i++) {
      newBoard.push(Array.from(Array(cols), () => Math.random() < 0.25 ? 1 : 0));
    }
    return newBoard;
  }

  const countLiveNeighbors = (board, x, y) => {

    let liveNeighbors = 0;

    // directions.forEach(([dx, dy]) => {
    //   const newX = x + dx;
    //   const newY = y + dy;
    //   if (newX >= 0 && newX < row && newY >= 0 && newY < col) {
    //     liveNeighbors += board[newX][newY];
    //   }
    // });

    if (((x + 0) > 0 && (x + 0) < row) && ((y + 1) > 0 && (y + 1) < col)) liveNeighbors += board[x + 0][y + 1]
    if (((x + 1) > 0 && (x + 1) < row) && ((y + 0) > 0 && (y + 0) < col)) liveNeighbors += board[x + 1][y + 0]
    if (((x + 0) > 0 && (x + 0) < row) && ((y - 1) > 0 && (y - 1) < col)) liveNeighbors += board[x + 0][y - 1]
    if (((x - 1) > 0 && (x - 1) < row) && ((y + 0) > 0 && (y + 0) < col)) liveNeighbors += board[x - 1][y + 0]
    if (((x + 1) > 0 && (x + 1) < row) && ((y + 1) > 0 && (y + 1) < col)) liveNeighbors += board[x + 1][y + 1]
    if (((x + 1) > 0 && (x + 1) < row) && ((y - 1) > 0 && (y - 1) < col)) liveNeighbors += board[x + 1][y - 1]
    if (((x - 1) > 0 && (x - 1) < row) && ((y + 1) > 0 && (y + 1) < col)) liveNeighbors += board[x - 1][y + 1]
    if (((x - 1) > 0 && (x - 1) < row) && ((y - 1) > 0 && (y - 1) < col)) liveNeighbors += board[x - 1][y - 1]
    // const directions = [
    //   [0, 1], [1, 0], [0, -1], [-1, 0],
    //   [1, 1], [1, -1], [-1, 1], [-1, -1],
    // ];
    return liveNeighbors;
  };

  const simulate = useCallback(() => {
    setBoard((prevBoard) => {
      return prevBoard.map((rowArr, i) =>
        rowArr.map((cell, j) => {
          const liveNeighbors = countLiveNeighbors(prevBoard, i, j);

          if (cell === 1 && (liveNeighbors < 2 || liveNeighbors > 3)) {
            return 0;
          }
          if (cell === 0 && liveNeighbors === 3) {
            return 1;
          }
          return cell;
        })
      );
    });
  }, [row, col]);

  useEffect(() => {
    if (!running) return;

    const intervalId = setInterval(simulate, intervalTime);
    console.log("component is render ?");
    return () => clearInterval(intervalId);

  }, [running, simulate, intervalTime]);

  const handleConfigSubmit = () => {
    setBoard(generateBoard(row, col));
    setShowConfig(false);
  };

  return (
    <div className="p-4">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${col}, 15px)`,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        {board.map((row, i) =>
          row.map((cell, k) => (
            <div
              key={`${i}-${k}`}
              style={{
                width: 20,
                height: 20,
                backgroundColor: cell ? liveColour : deadColour,
                border: "2px solid black"
              }}
            ></div>
          ))
        )}
      </div>

      <div className="mt-4 space-x-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setRunning(true)}
        >
          Start
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => setRunning(false)}
        >
          Stop
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          onClick={simulate}
        >
          Simulate One Step
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => setShowConfig(true)}
        >
          Config
        </button>
      </div>

      {showConfig && (
        <div onClick={() => { setShowConfig(false) }} className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-16 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Configuration</h2>
            <form>
              <div className="mb-4">
                <label className="block mb-2">Grid Height (rows):</label>
                <input
                  type="number"
                  className="border rounded w-full p-2"
                  value={row}
                  onChange={(e) => setRow(Number(e.target.value))}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Grid Width (columns):</label>
                <input
                  type="number"
                  className="border rounded w-full p-2"
                  value={col}
                  onChange={(e) => setCol(Number(e.target.value))}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Live Cell Color:</label>
                <input
                  type="color"
                  className="w-full h-10 border rounded"
                  value={liveColour}
                  onChange={(e) => setLiveColour(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Dead Cell Color:</label>
                <input
                  type="color"
                  className="w-full h-10 border rounded"
                  value={deadColour}
                  onChange={(e) => setDeadColour(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Interval (ms):</label>
                <input
                  type="number"
                  className="border rounded w-full p-2"
                  value={intervalTime}
                  onChange={(e) => setIntervalTime(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setShowConfig(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleConfigSubmit}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
