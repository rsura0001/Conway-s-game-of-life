import { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {

  // all states 

  const [row, setRow] = useState(100);
  const [col, setCol] = useState(100);
  const [liveColour, setLiveColour] = useState("#000");
  const [deadColour, setDeadColour] = useState("#ffffff");
  const [generation, setgeneration] = useState(0)
  const [intervalTime, setIntervalTime] = useState(300);
  const [board, setBoard] = useState(() => generateBoard(row, col));
  const [running, setRunning] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const [form, setForm] = useState({
    tempRow: row,
    tempCol: col,
    tempInterval: intervalTime,
    tempLiveColour: liveColour,
    tempDeadColour: deadColour

  })


  // dummy api response 

  let apiResponse = {
    size: {
      width: 50,
      height: 50,
    },
    livingcell: [
      { x: 10, y: 10 },
      { x: 11, y: 10 },
      { x: 12, y: 10 },
      { x: 13, y: 10 },
      { x: 14, y: 10 },
      { x: 20, y: 15 },
      { x: 21, y: 15 },
      { x: 22, y: 15 },
      { x: 22, y: 16 },
      { x: 22, y: 17 },
      { x: 30, y: 30 },
      { x: 31, y: 30 },
      { x: 32, y: 30 },
    ],
  };


  const { tempRow, tempCol, tempInterval, tempLiveColour, tempDeadColour } = form;

  function onChange(e) {
    setForm(prevForm => ({ ...prevForm, [e.target.name]: e.target.value }))
  }


  function generateBoard(rows, cols, livingCells = []) {
    const newBoard = [];
    if (livingCells.length > 0) {
      for (let i = 0; i < rows; i++) {
        newBoard.push(Array.from(Array(cols), () => 0));
      }
      livingCells.forEach(({ x, y }) => {
        if (x < rows && y < cols) {
          newBoard[x][y] = 1;
        }
      });
    }
    else {
      for (let i = 0; i < rows; i++) {
        newBoard.push(Array.from(Array(cols), () => Math.random() < 0.25 ? 1 : 0));
      }
    }
    return newBoard;
  }

  const countLiveNeighbors = (board, x, y) => {

    let liveNeighbors = 0;
    // if (((x + 0) > 0 && (x + 0) < row) && ((y + 1) > 0 && (y + 1) < col)) liveNeighbors += board[x + 0][y + 1]
    // if (((x + 1) > 0 && (x + 1) < row) && ((y + 0) > 0 && (y + 0) < col)) liveNeighbors += board[x + 1][y + 0]
    // if (((x + 0) > 0 && (x + 0) < row) && ((y - 1) > 0 && (y - 1) < col)) liveNeighbors += board[x + 0][y - 1]
    // if (((x - 1) > 0 && (x - 1) < row) && ((y + 0) > 0 && (y + 0) < col)) liveNeighbors += board[x - 1][y + 0]
    // if (((x + 1) > 0 && (x + 1) < row) && ((y + 1) > 0 && (y + 1) < col)) liveNeighbors += board[x + 1][y + 1]
    // if (((x + 1) > 0 && (x + 1) < row) && ((y - 1) > 0 && (y - 1) < col)) liveNeighbors += board[x + 1][y - 1]
    // if (((x - 1) > 0 && (x - 1) < row) && ((y + 1) > 0 && (y + 1) < col)) liveNeighbors += board[x - 1][y + 1]
    // if (((x - 1) > 0 && (x - 1) < row) && ((y - 1) > 0 && (y - 1) < col)) liveNeighbors += board[x - 1][y - 1]
    const neighbors = [
      [0, 1], [1, 0], [0, -1], [-1, 0],
      [1, 1], [1, -1], [-1, 1], [-1, -1],
    ];

    neighbors.forEach(([dx, dy]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < row && ny < col) {
        liveNeighbors += board[nx][ny];
      }
    });
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
    setgeneration(prev => prev + 1)
  }, [row, col]);

 

  const drawBoard = (ctx, board, cellSize, liveColour, deadColour) => {
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        ctx.fillStyle = cell ? liveColour : deadColour;
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      });
    });
  };

  const handleConfigSubmit = (e) => {
    e.preventDefault();
    setRow(Number(tempRow));
    setCol(Number(tempCol));
    setLiveColour(tempLiveColour);
    setDeadColour(tempDeadColour);
    setIntervalTime(Number(tempInterval));
    const newBoard = generateBoard(Number(tempRow), Number(tempCol))
    setBoard(newBoard);
    setRunning(false)
    setgeneration(0);
    setShowConfig(false);
  };

  const handleOpenConfig = () => {
    setForm({
      tempRow: row,
      tempCol: col,
      tempInterval: intervalTime,
      tempLiveColour: liveColour,
      tempDeadColour: deadColour,
    });
    setShowConfig(true);
  };





  
// this useEfect is for start and stop and clean up

useEffect(() => {
  if (!running) return;

  const intervalId = setInterval(simulate, intervalTime);
  console.log("component is render ?");
  return () => clearInterval(intervalId);

}, [running, simulate, intervalTime]);


// this useEfect is for generating canva gird 

useEffect(() => {
  const canvas = document.getElementById('boardCanvas');
  const ctx = canvas.getContext('2d');
  drawBoard(ctx, board, 5, liveColour, deadColour);
}, [board, liveColour, deadColour]);


// this usEfect for fatching data from server 

useEffect(() => {
  const fetchData = async () => {
    try {

      const res = await axios.get('https://example.com/api/data');
      const { size: { width, height }, livingcell } = data;

      if (res.data) {
        apiResponse = res.data;
        setRow(width);
        setCol(height);
        setBoard(generateBoard(width, height, livingcell));
      }

    }
    catch (error) {
      console.error('Error fetching board data:', error);
      // alert("api had no data , generating random board")
      // setRow(apiResponse.size.width);
      // setCol(apiResponse.size.height);
      // setBoard(generateBoard(apiResponse.size.width, apiResponse.size.height, apiResponse.livingcell));
    }
  }
  fetchData();
}, [])


  return (

    <div className="containerr">
      {/* <div
            className="board-container"
            style={{
              gridTemplateColumns: repeat(${col}, 5px),
              gridTemplateRows: repeat(${row}, 5px),
            }}
          >
            {board.map((row, i) =>
              row.map((cell, k) => (
                <div
                  key={${i}-${k}}
                  style={{
                    width: "5px",
                    hight: "5px",
                    backgroundColor: cell ? liveColour : deadColour,
                    border: "1px solid black",
                  }}
                ></div>
              ))
            )}
          </div> */}
      <div className="header">
        CONWAY'S LIFE GAME
      </div>

     
      <div className="main-content">
        <div className="outer-container"
          style={{
            width: '580px',  
            height: '520px', 
            overflowX: 'scroll', 
            overflowY: 'scroll', 
            whiteSpace: 'nowrap', 
          }}
        >
          <canvas
            id="boardCanvas"
            width={col * 5} 
            height={row * 5}
            className="border"
          ></canvas>
        </div>

        <div className="sidebar">
          <div className="generation-counter">
            Generation Counter <br /> {generation}
          </div>

          <div className="button-container">
            <div className="button"  style={{ backgroundColor: running ? "red" : "green" ,color:"white"}} 
        onClick={() => setRunning(!running)}>
              {running ? "Stop" : "Start"}
            </div>
            <div className="button" onClick={handleOpenConfig}>
              Configure
            </div>
            <div className="button" onClick={simulate}>
              Quick Next
            </div>
          </div>
        </div>
      </div>



      {showConfig && (
        <div onClick={() => setShowConfig(false)} className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center">
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-16 rounded shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Configuration</h2>
            <form onSubmit={handleConfigSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Grid Height (rows):</label>
                <input
                  type="Number"
                  className="border rounded w-full p-2"
                  value={tempRow}
                  name="tempRow"

                  onChange={onChange}
                />
                <p className="text-sm text-gray-600">Current Value: {row}</p>
              </div>

            <div className="mb-4">
                <label className="block mb-2">Grid Width (columns):</label>
                <input
                  type="Number"
                  className="border rounded w-full p-2"
                  value={tempCol}
                  name='tempCol'

                  onChange={onChange}
                />
                <p className="text-sm text-gray-600">Current Value: {col}</p>
              </div>

              <div className="mb-4 flex items-center">
                <label className="block mb-2 mr-4">Live Cell Color:</label>
                <input
                  type="color" id="color" name="tempLiveColour"

                  value={tempLiveColour}
                  onChange={onChange}

                />
              </div>

              <div className="mb-4 flex items-center">
                <label className="block mb-2 mr-4">Dead Cell Color:</label>
                <input
                  type="color" id="color" name="tempDeadColour"

                  value={tempDeadColour}
                  onChange={onChange}

                />
              </div>

              <div className="mb-4">
                <label className="block mb-2">Interval (ms):</label>
                <input
                  type="number"
                  className="border rounded w-full p-2"
                  value={tempInterval}
                  name='tempInterval'

                  onChange={onChange}
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
                  type='submit'
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