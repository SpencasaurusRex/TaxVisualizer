let singleStandardDeduction = 12000;
let singleBrackets = {
    0: [9525, .10],
    1: [38700, .12],
    2: [82500, .22],
    3: [157500, .24],
    4: [200000,.32],
    5: [500000, .35],
    6: [1000000, .37]
}

let marriedStandardDeduction = 24000;
let marriedBrackets = {
    0: [19050, .10],
    1: [77440, .12],
    2: [165000, .22],
    3: [315000, .24],
    4: [400000, .32],
    5: [600000, .35],
    6: [1000000, .37]
}

let salaryRange = 200000;
let taxRange = 50000;
let marginBottom = 100;

function setup() {
    let cnv = createCanvas(800, 800);
    cnv.mouseWheel(scroll);
    frameRate(50);
}

function scroll(event) {
    salaryRange = min(salaryRange + event.deltaY * salaryRange * .1, 1000000);
    salaryRange = max(salaryRange, 50000);
    taxRange = calculateTaxesDue(salaryRange, false);
}

function taxAmountToY(taxAmount) {
    let effectiveHeight = height - marginBottom;
    return effectiveHeight - (taxAmount * effectiveHeight / taxRange);
}

function drawSalaries(married) {
    let lastX = 0;
    let lastY = height - marginBottom;
    let effectiveHeight = height - marginBottom;
    for (let salary = 0; salary < salaryRange; salary+= 200) {
        let x = salary / salaryRange * width;
        let y = taxAmountToY(calculateTaxesDue(salary, married));
        line(lastX, lastY, x, y);
        lastX = x;
        lastY = y;
    }
}

function drawBrackets(married) {
    let brackets = married ? marriedBrackets : singleBrackets;
    let standardDeduction = married ? marriedStandardDeduction : singleStandardDeduction;
    for (let bracketIndex in brackets) {
        let x = width * (brackets[bracketIndex][0] + standardDeduction) / salaryRange;
        stroke(married ? 255 : 0, 0, 0);
        line(x, 0, x, height - marginBottom);

        for (let tick = 5000; tick < taxRange; tick += 5000) {
            let y = taxAmountToY(tick);
            line(x - 5, y, x + 5, y);
        }

        noStroke();
        fill(married ? 255 : 0, 0, 0);
        text(brackets[bracketIndex][0] + standardDeduction, x, height - marginBottom + 10);
    }
}

function draw() {
    background(255);
    stroke(0);
    drawBrackets(false);
    stroke(0);
    drawSalaries(false);

    stroke(0);
    drawBrackets(true);
    stroke(255, 0, 0);
    drawSalaries(true);

    noStroke();
    let mouseSalary = mouseX / width * salaryRange;
    let mouseTaxDueSingle = calculateTaxesDue(mouseSalary, false);
    let mouseTaxDueMarried = calculateTaxesDue(mouseSalary, true);
    
    fill(0);
    text("Salary: " + mouseSalary.toFixed(0), 20, height - marginBottom + 20);
    fill(255,0,0);
    text("Married tax: " + mouseTaxDueMarried.toFixed(0), 20, height - marginBottom + 40);
    fill(0);
    text("Single tax: " + mouseTaxDueSingle.toFixed(0), 20, height - marginBottom + 60);
    text("Savings: " + (mouseTaxDueSingle - mouseTaxDueMarried).toFixed(0), 20, height - marginBottom + 80);

    stroke(0);
    line(mouseX, taxAmountToY(mouseTaxDueMarried), mouseX, taxAmountToY(mouseTaxDueSingle));
}

function calculateTaxesDue(salary, married) {
    let brackets = married ? marriedBrackets : singleBrackets;
    salary -= married ? marriedStandardDeduction : singleStandardDeduction;
    if (salary < 0) return 0;

    let totalTaxesDue = 0;
    for (let bracketIndex in brackets) {
        let bracketCeiling = brackets[bracketIndex][0];
        let taxRate = brackets[bracketIndex][1];
        let previousCeiling = 0;
        if (bracketIndex > 0) {
            previousCeiling = brackets[bracketIndex - 1][0];
        }
        if (salary >= bracketCeiling) {
            totalTaxesDue += (bracketCeiling - previousCeiling) * taxRate;
        }
        else {
            totalTaxesDue += (salary - previousCeiling) * taxRate;
            break;
        }
    }
    return totalTaxesDue;
}