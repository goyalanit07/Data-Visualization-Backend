const express = require("express");
const path = require('path');
const fs = require("fs");
const csv = require("csv-parser");
const { authenticateToken } = require("../utils/authenticateToken");

const router = express.Router();

const dataFile = path.join(__dirname, '..', 'public', 'data.csv');

const parseDate = (dateStr) => {
    if (typeof dateStr !== "string") {
        return null;
    }
    const [day, month, year] = dateStr.split("/").map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return isNaN(parsedDate) ? null : parsedDate;
};

// Endpoint to load and process CSV data with filters
router.get("/filterdata", authenticateToken, (req, res) => {
    const { startDate, endDate, ageGroup, gender } = req.query;
    const results = [];

    fs.createReadStream(dataFile)
        .pipe(csv())
        .on("data", (data) => {
            const entryDate = parseDate(data.Day);
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const isInDateRange = entryDate >= start && entryDate <= end;

            const isAgeValid = !ageGroup || data.Age === ageGroup;
            const isGenderValid = !gender || data.Gender === gender;

            if (isInDateRange && isAgeValid && isGenderValid) {
                results.push(data);
            }
        })
        .on("end", () => {
            res.json({ data: results });
        });
});

router.get("/bar-chart", authenticateToken, (req, res) => {
    const { startDate, endDate, ageGroup, gender } = req.query;
    const featureSums = {};

    fs.createReadStream(dataFile)
        .pipe(csv())
        .on("data", (data) => {

            const entryDate = parseDate(data.Day);
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const isInDateRange = entryDate >= start && entryDate <= end;

            const isAgeValid = !ageGroup || data.Age === ageGroup;
            const isGenderValid = !gender || data.Gender === gender;

            // If the row matches filters, aggregate feature values
            if (isInDateRange && isAgeValid && isGenderValid) {
                ["A", "B", "C", "D", "E", "F"].forEach((feature) => {
                    featureSums[feature] = (featureSums[feature] || 0) + parseInt(data[feature], 10);
                });
            }
        })
        .on("end", () => {
            res.json({ data: featureSums });
        });
});

router.get("/line-chart", authenticateToken, (req, res) => {
    const { startDate, endDate, ageGroup, gender, feature } = req.query;

    if (!feature) {
        return res.status(400).json({ error: "Feature parameter is required" });
    }

    const timeSeriesData = [];

    fs.createReadStream(dataFile)
        .pipe(csv())
        .on("data", (data) => {
            const entryDate = parseDate(data.Day);
            const start = new Date(startDate);
            const end = new Date(endDate);

            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            const isInDateRange = entryDate >= start && entryDate <= end;

            const isAgeValid = !ageGroup || data.Age === ageGroup;
            const isGenderValid = !gender || data.Gender === gender;

            // If the row matches filters, add data to the time-series array
            if (isInDateRange && isAgeValid && isGenderValid) {
                timeSeriesData.push({ date: data.Day, value: parseInt(data[feature], 10) });
            }
        })
        .on("end", () => {
            res.json({ data: timeSeriesData });
        });
});

module.exports = router;