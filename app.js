const mainDiv = document.querySelector(".main");
const headEle = document.querySelector("h1");
const dvButtons = document.querySelector(".dvBtns");
const MainInstructions = document.querySelector(".instructions");
const PuzzleInstructions = document.querySelector(".puzInstructions");
const url = `${window.location.origin}`;
let currclue = 1;
let next = 0;
let guess = '';
let clickedclue = 0;

fnInitData();

function fnInitData() {
    mainDiv.innerHTML = '';
    mainDiv.style.display = 'grid';
    mainDiv.style.gridTemplateColumns = 'repeat(3, 1fr)';
    mainDiv.style.gridTemplateRows = 'repeat(1, 1fr)';
    mainDiv.style.gridGap = '10px';

    for (let i = 0; i < 3; i++) {
        const box = document.createElement("div");
        box.classList.add("grid-box");
        box.dataset.clueid = i + 1;
        box.textContent = 'Puzzle ' + (i + 1);
        box.style.width = '100px';
        box.style.height = '100px';
        box.style.display = 'flex';
        box.style.justifyContent = 'center';
        box.style.alignItems = 'center';
        box.style.border = '1px solid black';
        box.style.cursor = 'pointer';
        box.style.backgroundColor = 'lightgreen';
        box.style.pointerEvents = 'auto';

        mainDiv.appendChild(box);
    }

    document.querySelectorAll(".grid-box").forEach((box) => {
        box.addEventListener("click", () => {
            clickedclue = box.dataset.clueid;
            fnCreateGrid(box.dataset.clueid);
        });
    });
}

function fnCreateButtons() {
    const resetBtn = document.createElement("button");
    const submitBtn = document.createElement("button");
    resetBtn.classList.add("btn", "navBtn");
    submitBtn.classList.add("btn", "navBtn");

    resetBtn.textContent = "Reset";
    submitBtn.textContent = "Submit";

    resetBtn.addEventListener("click", () => {
        if (parseInt(clickedclue, 10) === 3) {
            resetMagicSquare();
        } else {
            document.querySelectorAll(".key").forEach((div) => {
                div.textContent = '';
                next = 0;
                div.classList.remove("correct", "incorrect");
            });
        }
    });

    submitBtn.addEventListener("click", () => {
        guess = '';
        document.querySelectorAll(".key").forEach((div) => {
            guess += div.textContent;
        });
        if (parseInt(clickedclue, 10) === 3) {
            validateMagicSquare(5);
        } else {
            fnCheckClue(guess);
        }
    });

    dvButtons.innerHTML = '';
    dvButtons.appendChild(resetBtn);
    dvButtons.appendChild(submitBtn);
}

function resetMagicSquare() {
    const colCount = parseInt(mainDiv.dataset.colcount, 10);
    const arrNums = Array.from(document.querySelectorAll('.numDiv')).map(div => parseInt(div.dataset.val, 10));
    fnCreateMagicSquare(arrNums, [], { width: '40px', height: '40px' }, colCount);
}

function fnCreateGrid(indxClue) {
    mainDiv.innerHTML = '<div></div>';

    const puzDiv = mainDiv.querySelector('div');
    const hintText = document.createElement('p');

    axios.get(`${url}/cluemeta/${indxClue}`)
        .then((response) => {
            const data = response.data;
            puzDiv.style.width = 50;
            puzDiv.style.height = data.maindiv.height;
            puzDiv.dataset.colcount = data.colcount; // Store colCount in data attribute

            if (indxClue == 3) {
                fnCreateMagicSquare(data.arrnums, data.hints, data.childdiv, data.colcount);
                hintText.textContent = data.hints;
            } else {
                fnCreateNumberPuzzle(data.arrnums, data.hints, data.childdiv, data.colcount);
                hintText.textContent = "Figure out the number and enter it in the boxes.";
            }
        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });

    headEle.textContent = `Puzzle ${clickedclue}`;

    dvButtons.style.display = 'block';
    MainInstructions.style.display = 'none';
    PuzzleInstructions.style.display = 'block';

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back';
    backBtn.classList.add('btn', 'shorter');
    backBtn.style.display = 'block';
    backBtn.style.marginTop = '10px';
    headEle.insertAdjacentElement('afterend', backBtn);

    backBtn.addEventListener('click', () => {
        fnInitData();
        backBtn.remove();
        dvButtons.style.display = 'none';
        headEle.textContent = 'Click a Puzzle to solve!';
        MainInstructions.style.display = 'block';
        PuzzleInstructions.style.display = 'none';
    });

    PuzzleInstructions.innerHTML = '';

    const hintDiv = document.createElement("div");
    hintDiv.classList.add("hint");
    hintDiv.appendChild(hintText);
    PuzzleInstructions.appendChild(hintDiv);
}

function fnCreateNumberPuzzle(arrNums, hints, childDiv, colCount) {
    mainDiv.innerHTML = '';
    mainDiv.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
    mainDiv.style.gridTemplateRows = 'auto';

    let r = 0;
    arrNums.forEach((num, i) => {
        const div = document.createElement("div");
        div.classList.add("numDiv");
        div.style.width = childDiv.width;
        div.style.height = childDiv.height;

        if (i % colCount === 0) {
            r++;
        }

        div.classList.add("row" + r);
        div.title = hints[r - 1];
        div.textContent = num;

        div.addEventListener("click", () => {
            const nextDiv = document.querySelector(".cel" + next);

            if (next === 0) {
                document.querySelectorAll(".key").forEach((keyDiv) => {
                    keyDiv.textContent = '';
                });
            }

            nextDiv.textContent = div.textContent;
            next = (next === colCount - 1) ? 0 : next + 1;
        });

        div.addEventListener("mouseover", (d) => {
            document.querySelectorAll(d.target.classList[1]).forEach((rowDiv) => {
                rowDiv.classList.add("hover");
            });
        });

        div.addEventListener("mouseout", () => {
            document.querySelectorAll(".row" + r).forEach((rowDiv) => {
                rowDiv.classList.remove("hover");
            });
        });

        mainDiv.appendChild(div);
    });

    for (let i = 0; i < colCount; i++) {
        const div = document.createElement("div");
        div.classList.add("key", `cel${i}`);
        div.dataset.col = i;
        div.style.width = childDiv.width;
        div.style.height = childDiv.height;

        div.addEventListener("click", () => {
            div.textContent = '';
            next = parseInt(div.dataset.col);
        });

        mainDiv.appendChild(div);
    }

    fnCreateButtons();
}

function fnCreateMagicSquare(arrNums, hints, childDiv, colCount) {
    mainDiv.innerHTML = '';
    mainDiv.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`;
    mainDiv.style.gridTemplateRows = `repeat(${colCount}, 1fr)`;

    arrNums.forEach((num, i) => {
        const row = Math.floor(i / colCount);
        const col = i % colCount;

        const div = document.createElement("div");
        div.classList.add("numDiv");
        div.style.width = childDiv.width;
        div.style.height = childDiv.height;
        div.textContent = num;
        div.dataset.val = num;
        div.draggable = true;

        div.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.textContent);
            e.target.classList.add("dragging");
        });

        div.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.target.classList.add("drag-over");
        });

        div.addEventListener("dragleave", (e) => {
            e.target.classList.remove("drag-over");
        });

        div.addEventListener("drop", (e) => {
            e.preventDefault();
            const draggedText = e.dataTransfer.getData("text/plain");
            const targetText = e.target.textContent;

            const draggedDiv = document.querySelector(".dragging");
            const draggedData = draggedDiv.dataset.val;
            const targetData = e.target.dataset.val;
            draggedDiv.textContent = targetText;
            draggedDiv.dataset.val = targetData;
            e.target.textContent = draggedText;
            e.target.dataset.val = draggedData;

            draggedDiv.classList.remove("dragging");
            e.target.classList.remove("drag-over");
        });

        div.addEventListener("mouseover", () => {
            showSum(row, col, colCount);
        });

        div.addEventListener("mouseout", () => {
            hideSum();
        });

        mainDiv.appendChild(div);
    });

    const validateBtn = document.createElement("button");
    validateBtn.classList.add("btn", "navBtn");
    validateBtn.textContent = "Validate";
    validateBtn.addEventListener("click", () => {
        const colCount = parseInt(mainDiv.dataset.colcount, 10); // Retrieve colCount from data attribute
        validateMagicSquare(colCount);
    });
    dvButtons.appendChild(validateBtn);

    fnCreateButtons();
}

function validateMagicSquare(colCount) {
    const { rows, cols, diag1Sum, diag2Sum } = checkSums(colCount);
    const targetSum = 65; // The target sum for each row, column, and diagonal

    const isValid = rows.every(sum => sum === targetSum) &&
                    cols.every(sum => sum === targetSum) &&
                    diag1Sum === targetSum &&
                    diag2Sum === targetSum;

    if (isValid) {
        alert("Congratulations! The magic square is correct.");
    } else {
        const invalidRows = rows.map((sum, index) => sum !== targetSum ? `Row ${index + 1}` : '').filter(Boolean);
        const invalidCols = cols.map((sum, index) => sum !== targetSum ? `Column ${index + 1}` : '').filter(Boolean);
        const invalidDiags = [];
        if (diag1Sum !== targetSum) invalidDiags.push('Diagonal 1');
        if (diag2Sum !== targetSum) invalidDiags.push('Diagonal 2');

        const invalidParts = [...invalidRows, ...invalidCols, ...invalidDiags].join(', ');
        alert(`The magic square is incorrect. Please check the following: ${invalidParts}`);
    }
}

function checkSums(colCount) {
    const rows = Array.from({ length: colCount }, () => 0);
    const cols = Array.from({ length: colCount }, () => 0);
    let diag1Sum = 0;
    let diag2Sum = 0;

    document.querySelectorAll('.numDiv').forEach((div, index) => {
        const r = Math.floor(index / colCount);
        const c = index % colCount;
        const num = parseInt(div.dataset.val, 10);

        rows[r] += num;
        cols[c] += num;
        if (r === c) diag1Sum += num;
        if (r + c === colCount - 1) diag2Sum += num;
    });

    return { rows, cols, diag1Sum, diag2Sum };
}

function showSum(row, col, colCount) {
    const { rows, cols, diag1Sum, diag2Sum } = checkSums(colCount);

    const sumDiv = document.createElement("div");
    sumDiv.classList.add("sumDiv");
    sumDiv.style.position = "absolute";
    sumDiv.style.top = "10px";
    sumDiv.style.right = "10px";
    sumDiv.style.backgroundColor = "lightyellow";
    sumDiv.style.padding = "5px";
    sumDiv.style.border = "1px solid #000";
    sumDiv.style.zIndex = "1000";

    if (row === col && row + col === colCount - 1) {
        sumDiv.textContent = `Row Sum: ${rows[row]}, Col Sum: ${cols[col]}, Diag1 Sum: ${diag1Sum}, Diag2 Sum: ${diag2Sum}`;
    } else if (row === col) {
        sumDiv.textContent = `Row Sum: ${rows[row]}, Col Sum: ${cols[col]}, Diag1 Sum: ${diag1Sum}`;
    } else if (row + col === colCount - 1) {
        sumDiv.textContent = `Row Sum: ${rows[row]}, Col Sum: ${cols[col]}, Diag2 Sum: ${diag2Sum}`;
    } else {
        sumDiv.textContent = `Row Sum: ${rows[row]}, Col Sum: ${cols[col]}`;
    }

    document.body.appendChild(sumDiv);
}

function hideSum() {
    const sumDiv = document.querySelector(".sumDiv");
    if (sumDiv) {
        document.body.removeChild(sumDiv);
    }
}

function fnCheckClue(guess) {
    axios.get(`${url}/answer/${clickedclue}/${guess}`)
        .then((response) => {
            if (response.data.ans) {
                document.querySelectorAll(".key").forEach((div) => {
                    div.classList.add("correct");
                    div.classList.remove("incorrect");
                });
                alert("Correct answer!"); // Show alert
            } else {
                document.querySelectorAll(".key").forEach((div) => {
                    div.classList.remove("correct");
                    div.classList.add("incorrect");
                });
            }
        })
        .catch((error) => {
            console.error("Error checking answer:", error);
        });
}
