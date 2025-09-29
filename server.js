const { error } = require('console');
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

const studentData = {
    id: 1728794,
    name: 'Tyler Lee'
};

function simulateApiCall(callback) {
    setTimeout(() => {
        callback(null, studentData);
    }, 1000);
}

function simulateApiCallWithPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(studentData);
        }, 1000);
    });
}

function simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function readFileAsync() {
    try {
        var data = await fs.readFile('data.txt', 'utf8');
        return data;
    } catch (error) {
        throw new Error('Error reading file: ' + error.message);
    }
}


app.get('/callback', (req, res) => {
    simulateApiCall((error, data) => {
        if (error) {
            return res.status(500).json({error: 'Callback Error'});
        }
        res.json({method: 'callback', data});
    });
});

app.get('/promise', (req, res) => {
    simulateApiCallWithPromise()
    .then(data => {
        res.json({method: 'promise', data});
    })
    .catch(error => {
        res.status(500).json({error: 'Promise Error'});
    });
});

app.get('/async', async (_req, res) => {
    try {
        const fileContent = await readFileAsync();
        res.json({method: 'file-read', data: fileContent});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/file', async function(req, res) {
    try {
        var fileContent = await readFileAsync();
        res.json({
            method: 'file-read',
            data: fileContent,
            message: 'File read successfully'
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

app.get('/chain', async (req, res) => {
    try {
        console.log('Step 1: Starting login process');
        await simulateDelay(1000);
        console.log('Step 1: Login Sucessful');

        console.log('Step 2: Fetching User Data');
        await simulateDelay(1500);
        const userData = await simulateApiCallWithPromise();
        console.log('User Data fetched', userData);

        console.log('Step 3: Rendering UI');
        await simulateDelay(500);
        console.log('Rendered UI');

        res.json({
            "steps" : [
                "Login Complete",
                "Fetched user data",
                "Rendered UI"
            ]
        });
    } catch (error) {
        console.error('Chain error: ', error);
        res.status(500).json({error: 'Chained failed'});
    }
});

app.use((req, res) => {
    res.status(404).json({error: 'Endpoint not found'});
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: 'something went wrong'});
});

app.listen(PORT, () =>{
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  /callback - Callback Implementation');
    console.log('  /promise  - Promise Implementation ');
    console.log('  /async    - Async/await Implementation');
    console.log('  /file     - File reading Implementation');
    console.log('  /chain    - Chained Operations');
});

module.exports = app;